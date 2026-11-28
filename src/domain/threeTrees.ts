/**
 * The Three Trees (chapter 5, Living Forest; audit fix C-004, docs/audit/DRIVE_WEAVE.md).
 *
 * Elian says there is a triangle in the old grove. The player picks three trees. Three trees in a
 * straight line make a line, not a triangle, so the grove pushes back. Then Ayla and Elian show
 * other shapes in the same grove, the player says where the triangle came from (no wrong answer;
 * each view gets a reply, OPEN-001), and two people pace one side from opposite ends and get the
 * same number. The shape was chosen; the distance was not.
 *
 * TOK link: is mathematics invented or discovered? The idea comes from a mathematics lesson in
 * Mika's lesson folder; it is paraphrased and rebuilt for the world (X-017). Content lives in
 * src/content/three-trees.json. Pure rules, no DOM.
 */
import data from '../content/three-trees.json';

export interface Tree { id: string; name: string; x: number; y: number }
export interface OtherShape { who: string; speaker: string; trees: string[]; line: string }
export interface View { id: string; text: string; reply: string }

export const TREES = data.trees as Tree[];
export const OTHERS = data.others as OtherShape[];
export const VIEWS = data.views as View[];

const byId = (id: string, trees: readonly Tree[] = TREES): Tree => {
  const t = trees.find((x) => x.id === id);
  if (!t) throw new Error(`No tree ${id}`);
  return t;
};

/** True when three trees stand in one straight line (zero cross product). */
export function collinear(a: Tree, b: Tree, c: Tree): boolean {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) === 0;
}

export type Shape = 'too-few' | 'line' | 'triangle' | 'four-sided' | 'many-sided';

/** The shape a set of chosen trees makes. */
export function shapeOf(ids: readonly string[], trees: readonly Tree[] = TREES): Shape {
  if (ids.length < 3) return 'too-few';
  const pts = ids.map((id) => byId(id, trees));
  const allInLine = pts.every((p, i) => i < 2 || collinear(pts[0], pts[1], p));
  if (allInLine) return 'line';
  return ids.length === 3 ? 'triangle' : ids.length === 4 ? 'four-sided' : 'many-sided';
}

/** Distance between two trees in whole paces (one grid step is two paces). */
export function paces(a: string, b: string, trees: readonly Tree[] = TREES): number {
  const p = byId(a, trees); const q = byId(b, trees);
  return Math.round(2 * Math.hypot(p.x - q.x, p.y - q.y));
}

/** The sides of a closed shape, in the order chosen. */
export function sides(ids: readonly string[]): [string, string][] {
  return ids.map((id, i) => [id, ids[(i + 1) % ids.length]] as [string, string]);
}
