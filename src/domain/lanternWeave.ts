export const BEAM_WIDTH = 34;
export const BEAM_TRAVEL = { min: BEAM_WIDTH / 2, max: 100 - BEAM_WIDTH / 2 };
export const SIDES = ['left', 'right'] as const;
export type BeamSide = typeof SIDES[number];

/** The beam crosses marks on a fictional projection, measured against the full print. */
export function beamCovers(position: number, mark: number): boolean {
  return Math.abs(position - mark) <= BEAM_WIDTH / 2;
}
