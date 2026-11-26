/** Three loads and four receiving marks on the fictional dispatch practice desk. */
export const CIVIC_RECEIVING_MARKS = 4;
type ReceivingMark = 1 | 2 | 3 | 4;
type Tray = readonly [ReceivingMark, ReceivingMark, ReceivingMark];

export const CIVIC_ARRIVAL_TRAYS = {
  red: [1, 1, 4],
  blue: [1, 2, 4],
} as const satisfies Record<string, Tray>;

/** The practice desk takes one load at each mark. Additional loads wait. */
export function civicReceivingLoad(tray: Tray) {
  const occupied = new Set(tray).size;
  return { waiting: tray.length - occupied, free: CIVIC_RECEIVING_MARKS - occupied };
}

/** Every ordered tray has the same weight when marks are chosen independently and uniformly. */
export function civicReceivingArrangements() {
  const loads = CIVIC_ARRIVAL_TRAYS.red.length;
  const all = CIVIC_RECEIVING_MARKS ** loads;
  let separate = 1;
  for (let placed = 0; placed < loads; placed++) separate *= CIVIC_RECEIVING_MARKS - placed;
  return { all, separate, shared: all - separate };
}
