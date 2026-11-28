/**
 * Two-slot save system (spec 24.1, CORE-008).
 *
 * Slots: Continue and CheckpointRecovery. Shown as "Continue" and
 * "Checkpoint recovery". There is no third slot.
 *
 * Atomic writes: the two slots are stored together as ONE string under ONE key,
 * with a checksum. A single storage write either completes or does not, so a
 * reader sees the old complete pair or the new complete pair, never a mix
 * (spec 24.3, 27.1 "Atomic-save interruption").
 *
 * Permanent credit is stored under a different key (see permanent.ts).
 */
import type { CampaignState, PermanentRecord } from './types';
import { CAMPAIGN_SCHEMA } from './types';
import { validateCampaign } from './validate';
import { migratePermanent, NewerPermanentRecord, newPermanent } from './permanent';
import { newAdventureDiary } from './adventureJournal';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';

export type SaveKind = 'checkpoint' | 'suspend';

export interface SaveEntry {
  kind: SaveKind;
  label: string;          // e.g. "Recruitment complete"
  location: string;       // readable place name
  savedAt: string;        // ISO time
  state: CampaignState;
}

export interface SlotPair {
  revision: number;
  continue: SaveEntry | null;
  recovery: SaveEntry | null;
}

/** Minimal storage interface so tests can use memory and the game can use localStorage. */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

import {KEY_SLOTS, KEY_PERMANENT} from './saveKeys';
export {KEY_SLOTS, KEY_PERMANENT};

export function emptyPair(): SlotPair {
  return { revision: 0, continue: null, recovery: null };
}

// --------------------------------------------------------------------------
// Rotation rules (table in spec 24.1)
// --------------------------------------------------------------------------

export function writeCheckpoint(p: SlotPair, e: SaveEntry): SlotPair {
  const entry = { ...e, kind: 'checkpoint' as const };
  if (!p.continue) return { revision: p.revision + 1, continue: entry, recovery: entry };
  if (p.continue.kind === 'checkpoint') {
    // Preserve the previous Continue checkpoint as the recovery point.
    return { revision: p.revision + 1, continue: entry, recovery: p.continue };
  }
  // Continue is a suspend state: keep the existing stable checkpoint.
  return { revision: p.revision + 1, continue: entry, recovery: p.recovery };
}

export function writeSuspend(p: SlotPair, e: SaveEntry): SlotPair {
  const entry = { ...e, kind: 'suspend' as const };
  if (p.continue && p.continue.kind === 'checkpoint') {
    // First suspend after a checkpoint: protect that checkpoint.
    return { revision: p.revision + 1, continue: entry, recovery: p.continue };
  }
  return { revision: p.revision + 1, continue: entry, recovery: p.recovery };
}

/** Player restores Checkpoint recovery: it becomes the current campaign. */
export function restoreRecovery(p: SlotPair): SlotPair {
  if (!p.recovery) throw new Error('No recovery checkpoint');
  return { revision: p.revision + 1, continue: p.recovery, recovery: p.recovery };
}

// --------------------------------------------------------------------------
// Serialisation, checksum, migration
// --------------------------------------------------------------------------

function checksum(text: string): string {
  // FNV-1a 32-bit. Detects accidental damage; it is not a security measure.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function serialisePair(p: SlotPair): string {
  const body = JSON.stringify(p);
  return JSON.stringify({ format: 'kg-slots', body, sum: checksum(body) });
}

export type LoadResult =
  | { ok: true; pair: SlotPair; migrated: boolean; warning?: string }
  | { ok: false; reason: string };

/**
 * Migrations from older campaign schemas. Each step takes the raw object of
 * version N and returns version N+1. Never mutate the stored string: if a step
 * fails, the original data stays in storage (spec 27.1 "Content migration").
 */
export const MIGRATIONS: Record<number, (s: any) => any> = {
  // Schema 1 (pre-release prototype) used `gold` and an `items` array.
  1: (s) => {
    const inventory: Record<string, number> = {};
    for (const id of (s.items ?? []) as string[]) inventory[id] = (inventory[id] ?? 0) + 1;
    const { gold, items, ...rest } = s;
    void items;
    return { ...rest, schema: 2, marks: Number(gold ?? 0), inventory, notes: [] };
  },
  // Schema 2 (first chapter, first build) had an evidence board. Schema 3 adds
  // the Showdown, the forge billet and the event deck clock (spec v2.10).
  2: (s) => {
    const { board, ...rest } = s;
    void board;
    return {
      ...rest, schema: 3, showdown: null,
      forge: { route: 'none', steels: 0, welded: false, twists: 0, folds: 0, melted: false, cooled: false, cut: false },
      events: { clock: 0, next: 600, seen: [], pending: null },
    };
  },
  // Schema 3 had no pronouns or origin. Schema 4 adds them (spec 35.1).
  // Old saves get they/them and no origin, and the player can change pronouns at any time.
  3: (s) => ({ ...s, schema: 4, player: { ...s.player, pronouns: { subject: 'they', object: 'them', possessive: 'their' }, origin: null } }),
  4: (s) => ({ ...s, schema: 5, adventureDiary: newAdventureDiary(Array.isArray(s.notes) ? s.notes : []) }),
  5: (s) => ({ ...s, schema: 6, adventureDiary: {
    ...newAdventureDiary(Array.isArray(s.notes) ? s.notes : []), ...s.adventureDiary,
  } }),
  // Earlier drafts retain their text and remain undated.
  6: (s) => ({ ...s, schema: 7 }),
};

export function migrateCampaign(raw: any): { state: CampaignState; migrated: boolean } {
  let s = raw;
  let migrated = false;
  if (typeof s?.schema !== 'number') throw new Error('Save has no schema number');
  if (s.schema > CAMPAIGN_SCHEMA) throw new Error(`Save was made by a newer version (schema ${s.schema}). Update the game to open it.`);
  while (s.schema < CAMPAIGN_SCHEMA) {
    const step = MIGRATIONS[s.schema];
    if (!step) throw new Error(`No migration from schema ${s.schema}`);
    s = step(s);
    migrated = true;
  }
  // Facing is cosmetic, but the scene needs a valid direction for interaction.
  if (!['up', 'down', 'left', 'right'].includes(s.facing)) {
    s = { ...s, facing: 'down' };
    migrated = true;
  }
  const problems = validateCampaign(s);
  if (problems.length) throw new Error(`Save is not valid: ${problems.join('; ')}`);
  return { state: s as CampaignState, migrated };
}

export function parsePair(text: string | null): LoadResult {
  if (text === null) return { ok: true, pair: emptyPair(), migrated: false };
  try {
    const outer = JSON.parse(text);
    if (outer?.format !== 'kg-slots' || typeof outer.body !== 'string') return { ok: false, reason: 'Save data has an unknown format.' };
    if (checksum(outer.body) !== outer.sum) return { ok: false, reason: 'Save data is damaged (checksum does not match).' };
    const p = JSON.parse(outer.body);
    if (!p || typeof p !== 'object' || Array.isArray(p)) return { ok: false, reason: 'Save slots have an unknown format.' };
    // Opening either slot can later rewrite the pair. Preserve newer saves for the version that wrote them.
    const newer = [p.continue, p.recovery].map((entry) => entry?.state?.schema)
      .find((schema) => typeof schema === 'number' && schema > CAMPAIGN_SCHEMA);
    if (newer !== undefined) return { ok: false, reason: `Save was made by a newer version (schema ${newer}). Update the game to open it.` };
    let migrated = false;
    const problems: string[] = [];
    const fix = (e: any, name: string): SaveEntry | null => {
      if (e == null) return null;
      try {
        if (!['checkpoint', 'suspend'].includes(e.kind) || typeof e.label !== 'string' || typeof e.location !== 'string'
          || typeof e.savedAt !== 'string' || !Number.isFinite(Date.parse(e.savedAt))) throw new Error('Invalid save details.');
        const r = migrateCampaign(e.state);
        migrated ||= r.migrated;
        return { ...e, state: r.state };
      } catch (err) {
        problems.push(`${name} could not be opened. ${(err as Error).message}`);
        return null;
      }
    };
    const pair = { revision: Number(p.revision) || 0, continue: fix(p.continue, 'Continue'), recovery: fix(p.recovery, 'Checkpoint recovery') };
    const reason = problems.join(' ');
    if (!reason) return { ok: true, pair, migrated };
    if (!pair.continue && !pair.recovery) return { ok: false, reason };
    const available = pair.continue ? 'Continue is available.' : 'Checkpoint recovery is available.';
    return { ok: true, pair, migrated, warning: `${reason} ${available}` };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

// --------------------------------------------------------------------------
// Save service
// --------------------------------------------------------------------------

export class PermanentSaveConflict extends Error {
  constructor(message = 'The learning record changed in another tab. Reopening loads the newer saved record. Keep this tab open if you still need its unsaved progress.') {
    super(message);
  }
}

export class SaveService {
  private knownCampaign: string | null | undefined;
  private knownPermanent: string | null | undefined;
  private learningReadProblem: string | undefined;

  constructor(private store: KeyValueStore) {}

  load(): LoadResult {
    try {
      this.knownCampaign = this.store.get(KEY_SLOTS);
      return parsePair(this.knownCampaign);
    } catch {
      this.knownCampaign = undefined;
      return { ok: false, reason: 'The browser could not read your saved adventure.' };
    }
  }

  /**
   * Write a new pair only if storage still holds the revision we read
   * (revision check, spec 24.3). Returns the stored pair.
   */
  commit(expectedRevision: number, next: SlotPair): SlotPair {
    const text = this.store.get(KEY_SLOTS);
    const current = parsePair(text);
    // A malformed pair can be replaced only when the initial read saw those exact bytes.
    const canWrite = current.ok ? current.pair.revision === expectedRevision : this.knownCampaign === text;
    if (!canWrite || (this.knownCampaign !== undefined && this.knownCampaign !== text)) {
      throw new Error('Save changed in another tab. Reload to continue.');
    }
    const saved = serialisePair(next);
    this.store.set(KEY_SLOTS, saved);
    this.knownCampaign = saved;
    return next;
  }

  get permanentLoadProblem(): string | undefined { return this.learningReadProblem; }

  loadPermanent(): PermanentRecord {
    this.learningReadProblem = undefined;
    let saved: string | null;
    try {
      saved = this.store.get(KEY_PERMANENT);
    } catch {
      this.learningReadProblem = 'The browser could not read your saved learning record. Reopen the game when storage is available. New learning in this tab is unsaved.';
      return newPermanent();
    }
    this.knownPermanent = saved;
    try {
      return saved === null ? newPermanent() : migratePermanent(JSON.parse(saved));
    } catch (error) {
      this.learningReadProblem = error instanceof NewerPermanentRecord
        ? 'Your saved learning record came from a newer game version. Reopen the game in a version that supports it. New learning in this tab is unsaved.'
        : 'Your saved learning record is unreadable. It is still in this browser. New learning in this tab cannot be saved.';
      return newPermanent();
    }
  }

  /** Refuse publication from a tab whose stored consent may have changed. */
  permanentIsCurrent(): boolean {
    try {
      return !this.learningReadProblem && this.knownPermanent !== undefined && this.store.get(KEY_PERMANENT) === this.knownPermanent;
    } catch {
      return false;
    }
  }

  savePermanent(p: PermanentRecord): void {
    if (this.learningReadProblem) throw new PermanentSaveConflict(this.learningReadProblem);
    if (this.knownPermanent !== undefined && this.store.get(KEY_PERMANENT) !== this.knownPermanent) {
      throw new PermanentSaveConflict();
    }
    const next = JSON.stringify(p);
    this.store.set(KEY_PERMANENT, next);
    this.knownPermanent = next;
  }
}

export function memoryStore(init: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...init };
  return { data, get: (k) => (k in data ? data[k] : null), set: (k, v) => { data[k] = v; } };
}

/** Keep the two-slot transaction atomic when a long journal exceeds the browser's text quota. */
export function browserStore(): KeyValueStore {
  const prefix = 'kg-slots-z1:';
  let cache: { stored: string; decoded: string } | undefined;
  return {
    get(key) {
      const stored = window.localStorage.getItem(key);
      if (key !== KEY_SLOTS || !stored?.startsWith(prefix)) return stored;
      if (cache?.stored === stored) return cache.decoded;
      const decoded = strFromU8(unzlibSync(strToU8(atob(stored.slice(prefix.length)), true)));
      cache = { stored, decoded };
      return decoded;
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        if (key === KEY_SLOTS) cache = undefined;
      } catch (error) {
        // Keep permission and unavailable-storage errors visible to the existing save dialog.
        const quota = error instanceof DOMException && ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name);
        if (key !== KEY_SLOTS || !quota) throw error;
        const stored = prefix + btoa(strFromU8(zlibSync(strToU8(value), { level: 1 }), true));
        if (stored.length >= value.length) throw error;
        window.localStorage.setItem(key, stored);
        cache = { stored, decoded: value };
      }
    },
  };
}
