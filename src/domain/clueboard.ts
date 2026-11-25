/**
 * Clue board (spec 47 "clue boards and deduction webs", C1 as the practice Showdown board).
 * A corkboard with yarn. The player ties evidence cards to claims before a Showdown:
 *  - red yarn from a card to the opponent's claim challenges it (it cracks a weak link);
 *  - gold yarn from a card to one of the player's own claims supports it.
 * A yarn that fits is taut. A yarn that holds but cannot carry the claim (the claim goes
 * further than the card) sags. A yarn that does not fit falls off, with a reason.
 * A claim with no taut yarn glows gold: an unsupported claim is what the Fray feeds on.
 * Practice only: nothing here changes the Showdown. Pure rules, no DOM.
 */
import type { ShowdownRecord } from './types';

export const OPPONENT = 'opponent';
export type Tone = 'taut' | 'sag' | 'falls';
export interface YarnVerdict { tone: Tone; text: string; cracks: string[] }

export function judgeYarn(sd: ShowdownRecord, claim: string, card: string): YarnVerdict {
  if (claim === OPPONENT) {
    const links = sd.opponentClaim.links.filter((l) => l.weakTo.includes(card));
    const counter = sd.opponentClaim.counterexamples?.find((c) => c.card === card);
    if (!links.length) return { tone: 'falls', cracks: [], text: counter ? counter.why : 'This card does not touch any part of the claim. The yarn falls off.' };
    return { tone: 'taut', cracks: links.map((l) => l.id), text: links.map((l) => `"${l.text}" ${l.cracked}`).join(' ') };
  }
  const c = sd.playerClaims.find((x) => x.id === claim);
  if (!c) throw new Error('Unknown claim');
  const s = c.supports.find((x) => x.card === card);
  if (!s) return { tone: 'falls', cracks: [], text: 'This card does not bear on this claim. The yarn falls off.' };
  if (c.signal) return { tone: 'sag', cracks: [], text: `${s.why} The claim goes further than the card, so the yarn sags. A narrower claim would hold.` };
  return { tone: 'taut', cracks: [], text: s.why };
}

export interface BoardView {
  cracked: string[];
  claims: Record<string, { taut: number; sag: number; glow: boolean }>;
  done: boolean;
}

/** `pins` are the yarns on the board that did not fall off. */
export function viewBoard(sd: ShowdownRecord, pins: { claim: string; card: string }[]): BoardView {
  const cracked = new Set<string>();
  const claims: BoardView['claims'] = {};
  for (const id of [OPPONENT, ...sd.playerClaims.map((c) => c.id)]) claims[id] = { taut: 0, sag: 0, glow: false };
  for (const p of pins) {
    const v = judgeYarn(sd, p.claim, p.card);
    if (v.tone === 'taut') claims[p.claim].taut++;
    if (v.tone === 'sag') claims[p.claim].sag++;
    v.cracks.forEach((x) => cracked.add(x));
  }
  for (const c of sd.playerClaims) claims[c.id].glow = claims[c.id].taut === 0;
  const allCracked = sd.opponentClaim.links.every((l) => cracked.has(l.id));
  // The opponent's claim has no support on this board; it glows until every weak link is cracked.
  claims[OPPONENT].glow = !allCracked;
  const strong = sd.playerClaims.some((c) => !c.signal && claims[c.id].taut >= 2);
  return { cracked: [...cracked], claims, done: allCracked && strong };
}
