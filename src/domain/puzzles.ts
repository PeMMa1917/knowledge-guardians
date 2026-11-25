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
 * Grammar and citation have conventions, so these puzzles do have right answers.
 * They are never about contested knowledge. Pure rules, no DOM.
 */
import type { PuzzleRecord } from './types';

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
