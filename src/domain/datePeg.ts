export type DateWindow = { first: number; last: number };
export type PegPair = readonly [number, number];

export function sharedWindow(left: DateWindow, right: DateWindow): DateWindow | null {
  const first = Math.max(left.first, right.first);
  const last = Math.min(left.last, right.last);
  return first <= last ? { first, last } : null;
}

export function onDatePeg(window: DateWindow, year: number): boolean {
  return window.first <= year && year <= window.last;
}

/** Probe a shared year and a distinct edge, or one year from each disjoint window. */
export function datePegs(left: DateWindow, right: DateWindow): PegPair {
  const common = sharedWindow(left, right);
  if (!common) return [left.first, right.first];
  const first = Math.min(left.first, right.first);
  const last = Math.max(left.last, right.last);
  return [common.first, first < common.first ? first : last > common.last ? last : last + 1];
}

export function pegYear(year: number): string {
  return year < 0 ? `${-year} BCE` : `${year} CE`;
}

export function pegWindow(window: DateWindow): string {
  return window.first === window.last ? pegYear(window.first) : `${pegYear(window.first)} to ${pegYear(window.last)}`;
}
