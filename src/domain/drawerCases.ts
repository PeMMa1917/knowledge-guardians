/** Six equally weighted openings in the simplified, reusable drawer board. */
export const DRAWER_FACES = ['round', 'round', 'square', 'square', 'round', 'square'] as const;
export const ALL_DRAWER_FACES = (1 << DRAWER_FACES.length) - 1;
export const DRAWER_MASK = 'drawers.checked';

export function flipDrawer(mask: number, face: number): number {
  if (!Number.isInteger(face) || face < 0 || face >= DRAWER_FACES.length) throw new Error('Choose a drawer on the board.');
  return mask | (1 << face);
}

export function drawerReadings(mask: number, face: (typeof DRAWER_FACES)[number]) {
  const boxes = new Set<number>();
  let checked = 0;
  let sameElsewhere = 0;
  for (const [i, reading] of DRAWER_FACES.entries()) {
    if (!(mask & (1 << i)) || reading !== face) continue;
    checked++;
    boxes.add(Math.floor(i / 2));
    // The paired flap is one slot away and still belongs to this box.
    const other = i % 2 === 0 ? i + 1 : i - 1;
    if (DRAWER_FACES[other] === face) sameElsewhere++;
  }
  return { boxes: boxes.size, checked, sameElsewhere };
}
