/**
 * The Value Fair (chapter 10 signature game, C-004 with C-006). The player has tokens (never money) to
 * spend on preparing claims for a town meeting. A claim with enough tokens is defended and kept. Two
 * keepers spend theirs differently. What each person defends shows what they value. Pure rules.
 */
import data from '../content/value-fair.json';

export const TOKENS = data.tokens;
export const KEEP = data.keep;
export const CLAIMS = data.claims;
export const OTHERS = data.others as { who: string; bids: Record<string, number>; why: string }[];
export const VALUES = data.values;
const CLASHES = data.clashes;

export type Bids = Record<string, number>;
export const spent = (bids: Bids): number => Object.values(bids).reduce((a, b) => a + b, 0);
export const kept = (bids: Bids): string[] => CLAIMS.filter((c) => (bids[c.id] ?? 0) >= KEEP).map((c) => c.id);
export function clashes(bids: Bids): string[] {
  const k = new Set(kept(bids));
  return CLASHES.filter((x) => k.has(x.a) && k.has(x.b)).map((x) => x.line);
}
/** The claim the player spent most on (the first, on a tie), or null if nothing was spent. */
export function largest(bids: Bids): string | null {
  let best: string | null = null;
  for (const c of CLAIMS) if ((bids[c.id] ?? 0) > (best ? bids[best] : 0)) best = c.id;
  return best;
}
