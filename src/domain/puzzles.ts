/**
 * Word puzzles (spec Part I, skill domains GRM and CIT):
 *  - "rounds": Sign-Smith locks. A sign, an order or a note whose punctuation, word
 *    order or pronoun changes what happens. The right correction opens the gate;
 *    a wrong one shows its funny or costly result, and the player tries again.
 *  - "order": a Citation Thread bridge. The player puts citation elements in order
 *    and leaves out what does not belong. A missing or misplaced element leaves a gap.
 *  - "balance": a balance bench. Weights go on the right pan until it balances the load.
 *    A weight that belongs to the thing under test is not a fair check (objectivity
 *    as a shared, independent standard).
 *  - "restore": a restorer's trestle. Look under each layer, choose a method (every
 *    method is allowed, each keeps and loses different layers), then write a label.
 *    Only the label is checked: it must say honestly what was kept and what was lost.
 * Grammar and citation have conventions, so these puzzles do have right answers.
 * They are never about contested knowledge. Pure rules, no DOM.
 */
import type { PuzzleRecord, SightBlock } from './types';

export type RoundResult = { ok: boolean; text: string; solved: boolean };
export type OrderResult = { ok: boolean; text: string; gapAt: number | null };

export function answerRound(p: PuzzleRecord, solvedRounds: number, round: number, index: number): RoundResult {
  if (p.type !== 'rounds') throw new Error('Not a rounds puzzle');
  if (round !== solvedRounds) throw new Error('Solve the rounds in order');
  const r = p.rounds[round];
  const o = r?.options[index];
  if (!o) throw new Error('No such option');
  return { ok: o.ok, text: o.result, solved: o.ok && round === p.rounds.length - 1 };
}

export function checkOrder(p: PuzzleRecord, order: string[]): OrderResult {
  if (p.type !== 'order') throw new Error('Not an order puzzle');
  const tiles = new Map(p.tiles.map((t) => [t.id, t]));
  const w = p.words ?? { stops: 'The thread stops after {n} pieces. Visitors cannot cross.', sags: 'The thread sags', done: 'The citation is complete', notPart: 'is not part of the citation.' };
  for (let i = 0; i < p.answer.length; i++) {
    const got = order[i];
    const want = tiles.get(p.answer[i])!;
    if (got === undefined) return { ok: false, gapAt: i, text: `${w.stops.replace('{n}', String(i))} Missing: the ${want.role}.` };
    if (got !== want.id) {
      const g = tiles.get(got);
      if (g && !p.answer.includes(g.id)) return { ok: false, gapAt: i, text: `"${g.text}" ${w.notPart} ${g.why ?? ''} ${w.sags} here.`.trim() };
      return { ok: false, gapAt: i, text: `${w.sags} at piece ${i + 1}. Here it needs the ${want.role}, not the ${g?.role ?? 'piece you put'}.` };
    }
  }
  if (order.length > p.answer.length) {
    const g = tiles.get(order[p.answer.length]);
    return { ok: false, gapAt: p.answer.length, text: `${w.done} before "${g?.text ?? ''}". ${g?.why ?? 'Leave it out.'}` };
  }
  return { ok: true, gapAt: null, text: p.success };
}

export type WeighResult = RoundResult & { tilt: -1 | 0 | 1 };

/** Tilt of the beam: 1 = the weights' pan sinks, -1 = the load sinks. */
export function tiltOf(load: number, weights: number): -1 | 0 | 1 {
  const d = weights - load;
  return Math.abs(d) < 1e-9 ? 0 : d > 0 ? 1 : -1;
}

export function weighRound(p: PuzzleRecord, solvedRounds: number, round: number, ids: string[]): WeighResult {
  if (p.type !== 'balance') throw new Error('Not a balance puzzle');
  if (round !== solvedRounds) throw new Error('Solve the rounds in order');
  const r = p.rounds[round];
  if (!r) throw new Error('No such round');
  if (new Set(ids).size !== ids.length) throw new Error('Each weight can go on the pan once');
  const ws = ids.map((id) => {
    const w = r.weights.find((x) => x.id === id);
    if (!w) throw new Error('No such weight');
    return w;
  });
  const tilt = tiltOf(r.load.mass, ws.reduce((a, w) => a + w.mass, 0));
  if (!ws.length) return { ok: false, solved: false, tilt, text: 'The right pan is empty. Put weights on it.' };
  const bad = ws.find((w) => w.untrusted);
  if (bad) return { ok: false, solved: false, tilt, text: `${tilt === 0 ? 'The pans balance, but' : 'Before you read the beam:'} you used ${bad.label}. ${bad.untrusted}` };
  if (tilt < 0) return { ok: false, solved: false, tilt, text: `${r.load.label} is heavier. Add weight.` };
  if (tilt > 0) return { ok: false, solved: false, tilt, text: 'The weights are heavier. Take some off.' };
  return { ok: true, solved: round === p.rounds.length - 1, tilt, text: r.success };
}

export type PeelResult = RoundResult & { layer: number };

/** Look under the next layer with the test swab. `peeled` is how many layers are already seen. */
export function peelLayer(p: PuzzleRecord, peeled: number): PeelResult {
  if (p.type !== 'restore') throw new Error('Not a restoration puzzle');
  if (peeled >= p.layers.length) throw new Error('You have seen every layer');
  const l = p.layers[peeled];
  return { ok: true, solved: false, layer: peeled, text: `${l.name}. ${l.text}` };
}

/**
 * Choose a method and a label. `current` is the method already done (or null).
 * An irreversible method cannot be changed later; a reversible one can.
 */
export function restoreWith(p: PuzzleRecord, peeled: number, current: string | null, method: string, label: number): RoundResult {
  if (p.type !== 'restore') throw new Error('Not a restoration puzzle');
  if (peeled < p.layers.length) throw new Error('Look under every layer first');
  const m = p.methods.find((x) => x.id === method);
  if (!m) throw new Error('No such method');
  const cur = current ? p.methods.find((x) => x.id === current) : null;
  if (cur && !cur.reversible && cur.id !== m.id) throw new Error(`${cur.label} cannot be undone`);
  const l = m.labels[label];
  if (!l) throw new Error('No such label');
  if (!l.honest) return { ok: false, solved: false, text: l.why };
  return { ok: true, solved: true, text: `${m.result} ${l.why}`.trim() };
}

/**
 * Line of sight on the puzzle grid, from cell centre to cell centre. The view is blocked
 * when the straight line passes through a block cell (the end cells do not count).
 * Returns the blocking point (in cell units) or null when the view is clear.
 */
export function sightBlock(blocks: SightBlock[], ax: number, ay: number, bx: number, by: number): { x: number; y: number; label: string } | null {
  const x0 = ax + 0.5, y0 = ay + 0.5, x1 = bx + 0.5, y1 = by + 0.5;
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 20);
  for (let i = 1; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
    const cx = Math.floor(x), cy = Math.floor(y);
    if ((cx === ax && cy === ay) || (cx === bx && cy === by)) continue;
    const b = blocks.find((k) => cx >= k.x && cx < k.x + k.w && cy >= k.y && cy < k.y + k.h);
    if (b) return { x, y, label: b.label };
  }
  return null;
}

/** Sort one claim: did the witness see it? The map decides. */
export function judgeSight(p: PuzzleRecord, witness: string, claim: number, saw: boolean): { ok: boolean; text: string } {
  if (p.type !== 'sightlines') throw new Error('Not a sightlines puzzle');
  const w = p.witnesses.find((x) => x.id === witness);
  const c = w?.claims[claim];
  if (!w || !c) throw new Error('No such claim');
  const spot = p.spots.find((s) => s.id === c.spot)!;
  const block = sightBlock(p.blocks, w.x, w.y, spot.x, spot.y);
  const could = !block;
  if (saw !== could) return { ok: false, text: `Look again. Draw ${w.name}'s sightline to ${spot.label}${could ? ': is anything in the way?' : ', and follow it all the way.'}` };
  return { ok: true, text: could ? `Yes. From where ${w.name} stood, nothing blocks the view of ${spot.label}. This is first-hand.` : `Right. ${block!.label} blocks ${w.name}'s view of ${spot.label}. ${c.heard ?? ''}`.trim() };
}

const choose = (n: number, k: number) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/** Panes of a circle cut by every chord between n points in general position: 1 + C(n,2) + C(n,4). */
export function panes(n: number): number { return 1 + choose(n, 2) + choose(n, 4); }

/** Points on a unit circle for the given angles (degrees). */
export function circlePoints(angles: number[]): [number, number][] {
  return angles.map((a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]);
}

/**
 * Chords and crossings of the actual figure, and whether it is in general position
 * (no three chords meet at one point inside). With general position, panes = 1 + chords + crossings.
 */
export function chordFigure(angles: number[]): { chords: number; crossings: number; general: boolean } {
  const pts = circlePoints(angles);
  const chords: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) chords.push([i, j]);
  const hits: [number, number][] = [];
  for (let a = 0; a < chords.length; a++) for (let b = a + 1; b < chords.length; b++) {
    const [i, j] = chords[a], [k, l] = chords[b];
    if (new Set([i, j, k, l]).size < 4) continue;
    const [x1, y1] = pts[i], [x2, y2] = pts[j], [x3, y3] = pts[k], [x4, y4] = pts[l];
    const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(d) < 1e-12) continue;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;
    if (t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9) hits.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
  }
  let general = true;
  for (let a = 0; a < hits.length && general; a++) for (let b = a + 1; b < hits.length; b++)
    if (Math.hypot(hits[a][0] - hits[b][0], hits[a][1] - hits[b][1]) < 1e-3) { general = false; break; }
  return { chords: chords.length, crossings: hits.length, general };
}
