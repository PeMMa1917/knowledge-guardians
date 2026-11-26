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
import { migratePermanent, newPermanent } from './permanent';
import { newAdventureDiary } from './adventureJournal';

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

export const KEY_SLOTS = 'kg.slots';
export const KEY_PERMANENT = 'kg.permanent';

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

export class SaveService {
  constructor(private store: KeyValueStore) {}

  load(): LoadResult {
    return parsePair(this.store.get(KEY_SLOTS));
  }

  /**
   * Write a new pair only if storage still holds the revision we read
   * (revision check, spec 24.3). Returns the stored pair.
   */
  commit(expectedRevision: number, next: SlotPair): SlotPair {
    const current = this.load();
    if (current.ok && current.pair.revision !== expectedRevision) {
      throw new Error('Save changed in another tab. Reload to continue.');
    }
    this.store.set(KEY_SLOTS, serialisePair(next));
    return next;
  }

  loadPermanent(): PermanentRecord {
    const t = this.store.get(KEY_PERMANENT);
    if (!t) return newPermanent();
    try {
      return migratePermanent(JSON.parse(t));
    } catch {
      return newPermanent();
    }
  }

  savePermanent(p: PermanentRecord): void {
    this.store.set(KEY_PERMANENT, JSON.stringify(p));
  }
}

export function memoryStore(init: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...init };
  return { data, get: (k) => (k in data ? data[k] : null), set: (k, v) => { data[k] = v; } };
}

export function browserStore(): KeyValueStore {
  return {
    get: (k) => { try { return window.localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { window.localStorage.setItem(k, v); },
  };
}
