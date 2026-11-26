export const NEAR_RAIL = 18;
export const WIDE_RAIL = 42;
export type Rail = 'near' | 'wide';

/** Only the documented edge changes scale. Other dimensions stay open. */
export function compareRail(span: number, rail: Rail) {
  const aperture = rail === 'near' ? NEAR_RAIL : WIDE_RAIL;
  const scale = Math.min(1, aperture / span);
  return { aperture, scale };
}
