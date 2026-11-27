/**
 * The Labyrinth Lens (chapter 14 signature game, C-004). A small island maze seen through three lenses:
 * the planners' plan, the footpaths people walk, and the low-tide chart. The player can step only along a
 * path that the current lens shows. One path on the plan is gone in the world. No lens alone reaches the
 * ferry. There is no score for "nuanced" or "dogmatic" play (OPEN-001). Pure rules.
 */
import data from '../content/labyrinth-lens.json';

export type Pt = [number, number];
export interface Edge { a: Pt; b: Pt; shows: string[]; gone?: string }
export const SIZE = data.size;
export const START = data.start as Pt;
export const GOAL = data.goal as Pt;
export const LENSES = data.lenses;
export const EDGES = data.edges as Edge[];
export const VIEWS = data.views;

const same = (p: Pt, q: Pt) => p[0] === q[0] && p[1] === q[1];
export const edgeBetween = (p: Pt, q: Pt): Edge | undefined => EDGES.find((e) => (same(e.a, p) && same(e.b, q)) || (same(e.a, q) && same(e.b, p)));
export const visible = (lens: string): Edge[] => EDGES.filter((e) => e.shows.includes(lens));

export type Step = { ok: true; to: Pt } | { ok: false; why: 'no-path' | 'gone'; text?: string };
/** Try to step from p in direction d, seeing through lens. */
export function step(p: Pt, d: Pt, lens: string): Step {
  const q: Pt = [p[0] + d[0], p[1] + d[1]];
  const e = edgeBetween(p, q);
  if (!e || !e.shows.includes(lens)) return { ok: false, why: 'no-path' };
  if (e.gone) return { ok: false, why: 'gone', text: e.gone };
  return { ok: true, to: q };
}

/** Can the goal be reached from start using only one lens? (Used to check the puzzle needs several.) */
export function reachable(lenses: string[]): boolean {
  const seen = new Set<string>([START.join()]);
  const queue: Pt[] = [START];
  while (queue.length) {
    const p = queue.shift()!;
    if (same(p, GOAL)) return true;
    for (const e of EDGES) {
      if (e.gone || !e.shows.some((l) => lenses.includes(l))) continue;
      const q = same(e.a, p) ? e.b : same(e.b, p) ? e.a : null;
      if (q && !seen.has(q.join())) { seen.add(q.join()); queue.push(q); }
    }
  }
  return false;
}
