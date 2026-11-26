/**
 * Sefa's Word Tiles: a memory game with TOK words (the glossary). Turn two tiles; a word and its
 * meaning make a pair. Fair randomness: the deal comes from a seed (the run number), never Math.random.
 * Two scores, never XP: moves (precision) and time (speed). Pure rules, no DOM.
 */
export interface Tile { key: string; kind: 'term' | 'meaning'; text: string }

function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(list: T[], r: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** The meaning must not give the word away: the word itself becomes a blank. */
export function hideTerm(text: string, term: string): string {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`\\b${esc}(s|es)?\\b`, 'gi'), '___');
}

/** Deal `pairs` words (term and meaning tiles), shuffled. */
export function dealTiles(words: { id: string; term: string; text: string }[], seed: number, pairs = 6): Tile[] {
  const r = rng(seed + 1);
  const pick = shuffle(words, r).slice(0, Math.min(pairs, words.length));
  return shuffle(pick.flatMap((w) => [{ key: w.id, kind: 'term' as const, text: w.term }, { key: w.id, kind: 'meaning' as const, text: hideTerm(w.text, w.term) }]), r);
}

export const isPair = (a: Tile, b: Tile): boolean => a.key === b.key && a.kind !== b.kind;

/** A rank for precision: a 'move' is turning two tiles. The best possible is one move per pair. */
export function tileRank(moves: number, pairs: number): 'S' | 'A' | 'B' | 'C' {
  return moves <= pairs + 2 ? 'S' : moves <= pairs + 5 ? 'A' : moves <= pairs * 2 + 2 ? 'B' : 'C';
}
/** A rank for speed (seconds). */
export function speedRank(secs: number, pairs: number): 'S' | 'A' | 'B' | 'C' {
  const per = secs / pairs;
  return per <= 6 ? 'S' : per <= 10 ? 'A' : per <= 16 ? 'B' : 'C';
}

/** Today's challenge: one deal for the whole class on one day (fair: everyone gets the same words). */
export function dailySeed(d: Date): number {
  return 100000 + d.getFullYear() * 1000 + (d.getMonth() + 1) * 32 + d.getDate();
}

/** A personal-best ghost: the second at which each pair was made in the player's fastest run. */
export const encodeGhost = (times: number[]): string => times.map((t) => Math.round(t)).join(',');
export const decodeGhost = (v: unknown): number[] => typeof v === 'string' && v ? v.split(',').map(Number).filter((n) => Number.isFinite(n)) : [];
/** How many pairs the ghost had made by this second. */
export const ghostPairs = (ghost: number[], secs: number): number => ghost.filter((t) => t <= secs).length;
