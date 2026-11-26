export const FACING_SITES = ['nexus', 'house'] as const;
export const FACINGS = ['bell', 'door'] as const;
export const CUE_PLANS = ['shared', 'paired'] as const;
export const CUE_BEATS = ['Set', 'Slide', 'Hold', 'Close'] as const;

export type FacingSite = typeof FACING_SITES[number];
export type Facing = typeof FACINGS[number];
export type CuePlan = typeof CUE_PLANS[number];

const lamp = { nexus: -1, house: 1 } as const;
const left = { bell: -1, door: 1 } as const;

export function facingCard(site: FacingSite, facing: Facing): 'left' | 'right' {
  return lamp[site] === left[facing] ? 'left' : 'right';
}

export function facingCueFrame(site: FacingSite, facing: Facing, beats: number, cue?: CuePlan) {
  const direction = cue === 'shared' ? lamp[site] :
    cue === 'paired' && facingCard(site, facing) === 'right' ? -left[facing] : left[facing];
  const offset = beats < 2 ? 0 : direction;
  const mark = offset === 0 ? 'centre mark' : offset === lamp[site] ? 'lamp mark' : 'rail mark';
  return { offset, mark };
}
