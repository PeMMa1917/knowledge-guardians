/**
 * Communities of Emberford (reputation). Trust grows when the player helps a community and listens
 * to how it knows. Trust never falls, and no community's way of knowing is the 'right' one.
 * Pure rules, no DOM.
 */
import type { CampaignState, Community } from './types';
import { check } from './rules';

export const TRUST_RANKS = [
  { from: 0, name: 'Stranger' }, { from: 2, name: 'Known' }, { from: 4, name: 'Trusted' }, { from: 6, name: 'Friend' },
] as const;

export function trustOf(c: Community, s: CampaignState): { pts: number; max: number; got: Community['gains'] } {
  const got = c.gains.filter((g) => check(g.if, s));
  return { pts: got.reduce((n, g) => n + g.pts, 0), max: c.gains.reduce((n, g) => n + g.pts, 0), got };
}

export function rankOf(pts: number): string {
  return [...TRUST_RANKS].reverse().find((r) => pts >= r.from)!.name;
}
