import type { DateWindow } from './datePeg';

export type RegisterEvent = 'custody' | 'display' | 'source' | 'conservation' | 'attribution';
export type RegisterRoute = 'porch' | 'runner';

export interface DateRegisterRecord extends DateWindow {
  eventYear: number;
  eventKind: RegisterEvent;
}

export const REGISTER_ROUTES = ['porch', 'runner'] as const;

export const REGISTER_EVENT_NAMES: Record<RegisterEvent, string> = {
  custody: 'recorded custody date',
  display: 'recorded display date',
  source: 'date of the earlier source',
  conservation: 'recorded conservation date',
  attribution: 'date of the attribution',
};

/** Compare distinct events at calendar-year precision, omitting year zero. */
export function dateRegisterGap({ first, last, eventYear }: DateRegisterRecord): DateWindow {
  const yearDistance = (year: number, target: number) => {
    if (year < 0 && target > 0) return target - year - 1;
    if (year > 0 && target < 0) return target - year + 1;
    return target - year;
  };
  return { first: yearDistance(last, eventYear), last: yearDistance(first, eventYear) };
}

export function registerOrder(gap: DateWindow): 'later' | 'earlier' | 'touches' {
  if (gap.first > 0) return 'later';
  if (gap.last < 0) return 'earlier';
  return 'touches';
}

export const DRESDEN_CODEX_KEY = 'slub:mscr.dresd.r.310';
export const BROOKLYN_KHIPU_KEY = 'brooklyn:70.177.69';
export const DRESDEN_RETURN = { map: 'copies.archive', prop: 'copies-dresden-frames', method: 'Set makers’ date and conservation length in separate frames',
  hint: 'Bring the manuscript reference to the two practice frames in the City of Copies Record Room.' };
export const BROOKLYN_RETURN = { map: 'copies.archive', prop: 'copies-khipu-index', method: 'Catalogue one accession linked to four study entries',
  hint: 'Bring the cotton-record folio to the spare index in the City of Copies Record Room.' };
export const CODEX_RAIL_CM = 240;

/** A practice rail, with measurements reported by the holding library. */
export function codexRail(model: 'strip' | 'pieces') {
  const spans = model === 'strip' ? [356] : [182.5, 174.3];
  return { spans, clears: spans.every((cm) => cm <= CODEX_RAIL_CM) };
}

export const KHIPU_RACK = { width: 62, height: 90 };

/** Fit a flat measured template; the historic objects are not handled. */
export function khipuRack(model: 'wide' | 'tall') {
  const [width, height] = model === 'wide' ? [77, 39] : [39, 77];
  return { width, height, clears: width <= KHIPU_RACK.width && height <= KHIPU_RACK.height };
}
