/**
 * The Deep Dive (spec 59): a daily rare-answer challenge. Each day every player gets the same
 * seven prompts (seeded by the date, never random). The player answers each prompt with
 * something they found in play (a card or a finished activity) and picks the facet of it that
 * answers the prompt. A valid answer takes the diver down; a rarer valid answer goes deeper.
 * Rarity is authored (single-player); there is no stored single right answer.
 * Cosmetic and reflective: no XP. Pure rules, no DOM.
 */
import type { AOK, CampaignState, Concept, Condition } from './types';
import { check } from './rules';

export interface DivePrompt { id: string; text: string; tag: string; concept: Concept; aok: AOK }
export interface DiveFacet { tag: string; text: string; rarity: 1 | 2 | 3 }
export interface DiveItem { id: string; name: string; kind: 'card' | 'deed'; if: Condition; facets: DiveFacet[] }

export const DIVE_PER_DAY = 7;
/** Metres for a valid answer, by rarity. */
export const DIVE_DEPTH: Record<1 | 2 | 3, number> = { 1: 10, 2: 25, 3: 45 };
export const DIVE_ZONES: { from: number; name: string }[] = [
  { from: 0, name: 'Sunlit shallows' }, { from: 60, name: 'Twilight water' }, { from: 150, name: 'Midnight deep' }, { from: 250, name: 'The trench' },
];

/** A day key from a date in the player's own time zone, for example 2026-11-25. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number): () => number {
  let a = seed || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * The prompts for one day: the same for everyone on that date. Each set covers at least four
 * concepts and three AOKs (spec 59.4); the first seed that gives such a set is used.
 */
export function dailyPrompts(prompts: DivePrompt[], key: string): DivePrompt[] {
  const n = Math.min(DIVE_PER_DAY, prompts.length);
  for (let k = 0; k < 50; k++) {
    const r = rng(hashStr(`${key}#${k}`));
    const pool = [...prompts];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const pick = pool.slice(0, n);
    if (new Set(pick.map((p) => p.concept)).size >= Math.min(4, n) && new Set(pick.map((p) => p.aok)).size >= Math.min(3, n)) return pick;
  }
  return prompts.slice(0, n);
}

/** The items this player has found so far. */
export function diveItems(items: DiveItem[], s: CampaignState): DiveItem[] {
  return items.filter((i) => check(i.if, s));
}

export interface DiveResult { ok: boolean; metres: number; text: string }
/** Judge one answer: the facet must answer the prompt. Rarer valid answers go deeper. */
export function judgeDive(prompt: DivePrompt, item: DiveItem, facet: number): DiveResult {
  const f = item.facets[facet];
  if (!f) throw new Error('No such facet');
  if (f.tag !== prompt.tag) return { ok: false, metres: 0, text: `That is true of ${item.name}, but it answers a different question. Look at its other sides.` };
  const m = DIVE_DEPTH[f.rarity];
  const word = f.rarity === 3 ? 'A rare dive! Few divers think of this one.' : f.rarity === 2 ? 'A good, less obvious example.' : 'A strong example. Many divers choose it, so it moves you only a little.';
  return { ok: true, metres: m, text: `${word} Down ${m} m.` };
}

/** Saved answers for one day: flag `dive.<day>.<prompt>` = "item:facet". */
export function diveDepth(prompts: DivePrompt[], items: DiveItem[], flags: Record<string, unknown>, key: string): { metres: number; answered: number } {
  let metres = 0, answered = 0;
  for (const p of dailyPrompts(prompts, key)) {
    const v = flags[`dive.${key}.${p.id}`];
    if (typeof v !== 'string') continue;
    const [id, fi] = v.split(':');
    const it = items.find((x) => x.id === id);
    if (!it) continue;
    const r = judgeDive(p, it, Number(fi));
    if (r.ok) { metres += r.metres; answered++; }
  }
  return { metres, answered };
}

export function zoneAt(metres: number): string {
  return [...DIVE_ZONES].reverse().find((z) => metres >= z.from)!.name;
}
