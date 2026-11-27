/**
 * The Copyists' Ladder (chapter 2, Nile archive; audit fix C-004, docs/audit/DRIVE_WEAVE.md).
 *
 * Nasir trains copyists with a word ladder: turn "ship" into "dock", one letter at a time, and every
 * step must be a word on the list. Then the player looks at four ladders, finds patterns, and tests
 * them. Two patterns break (one on the table, one on an old sheet). One can be proved: the player
 * builds an arch of premises (the rules of the game) that makes it true for every ladder. Last, the
 * player says what the proof covers, and sees that the "in the middle" part is still a guess.
 *
 * TOK link: certainty in mathematics. A pattern seen in many cases (induction) is not a proof; a
 * proof from rules (axioms) holds for every case, but only for what it states. The idea comes from a
 * mathematics lesson in Mika's lesson folder; it is paraphrased and rebuilt for the world (X-017).
 * Content lives in src/content/word-ladder.json. Pure rules, no DOM.
 */
import data from '../content/word-ladder.json';

export interface Apprentice { id: string; who: string; ladder: string[] }
export interface Pattern { id: string; text: string; kind: 'word' | 'pair'; word?: string }
export interface Premise { id: string; text: string; needed: boolean; gap?: string; why?: string }
export interface Scope { id: string; text: string; reply: string }

export const START = data.start;
export const END = data.end;
export const WORDS: ReadonlySet<string> = new Set(data.words.split(/\s+/).filter(Boolean));
export const APPRENTICES = data.apprentices as Apprentice[];
export const FIFTH = data.fifth as { who: string; ladder: string[] };
export const PATTERNS = data.patterns as Pattern[];
export const PREMISES = data.premises as Premise[];
export const CHAIN: string = data.chain;
export const SCOPES = data.scope as Scope[];

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

export type StepResult = 'ok' | 'length' | 'not-a-word' | 'same' | 'two-changes' | 'used';

/** Can `next` follow `prev` on a ladder that already holds `used`? */
export function checkStep(prev: string, next: string, used: readonly string[] = [], words: ReadonlySet<string> = WORDS): StepResult {
  const w = next.trim().toLowerCase();
  if (w.length !== prev.length) return 'length';
  if (w === prev) return 'same';
  let diff = 0;
  for (let i = 0; i < w.length; i++) if (w[i] !== prev[i]) diff++;
  if (diff > 1) return 'two-changes';
  if (!words.has(w)) return 'not-a-word';
  if (used.includes(w)) return 'used';
  return 'ok';
}

/** What Nasir says when a step does not fit. */
export function stepText(r: StepResult, word: string): string {
  switch (r) {
    case 'ok': return `"${word}" goes on the ladder.`;
    case 'length': return 'Every rung has four letters.';
    case 'same': return 'That is the word you already have. Change one letter.';
    case 'two-changes': return `"${word}" changes more than one letter. One letter per rung.`;
    case 'not-a-word': return `"${word}" is not on the copyists' list. Every rung must be a word.`;
    case 'used': return `"${word}" is already on your ladder. A ladder that goes round in a circle never arrives.`;
  }
}

/** Words on the list that are one letter away from `w` (a small push when the player is stuck). */
export function neighbours(w: string, words: ReadonlySet<string> = WORDS): string[] {
  const out: string[] = [];
  for (const x of words) if (checkStep(w, x, [], words) === 'ok') out.push(x);
  return out.sort();
}

export const vowelCount = (w: string): number => [...w].filter((ch) => VOWELS.has(ch)).length;
export const hasPair = (ladder: readonly string[]): boolean => ladder.some((w) => vowelCount(w) >= 2);

/** Does a pattern hold on this ladder? */
export function holds(p: Pattern, ladder: readonly string[]): boolean {
  return p.kind === 'pair' ? hasPair(ladder) : ladder.includes(p.word ?? '');
}

/** Is a ladder complete and legal from START to END? */
export function validLadder(ladder: readonly string[], words: ReadonlySet<string> = WORDS): boolean {
  if (ladder[0] !== START || ladder[ladder.length - 1] !== END) return false;
  for (let i = 1; i < ladder.length; i++) if (checkStep(ladder[i - 1], ladder[i], ladder.slice(0, i), words) !== 'ok') return false;
  return true;
}

export type ArchResult = { kind: 'stands' } | { kind: 'loose'; premise: Premise } | { kind: 'gap'; premise: Premise };

/** Test the premises the player chose for the arch. A loose stone is named first, then a gap. */
export function testArch(chosen: readonly string[], premises: readonly Premise[] = PREMISES): ArchResult {
  const loose = premises.find((p) => !p.needed && chosen.includes(p.id));
  if (loose) return { kind: 'loose', premise: loose };
  const gap = premises.find((p) => p.needed && !chosen.includes(p.id));
  if (gap) return { kind: 'gap', premise: gap };
  return { kind: 'stands' };
}
