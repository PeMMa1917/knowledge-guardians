import type { CampaignState, Effect } from './types';
import { dayOf } from './ledger';

/** Sefa's work slips. Each printed pair has a reading and the edge of what it shows. */
export const DISPATCH_SLIPS = [
  { id: 'rain-cup', name: 'Rain cup', mark: '○ ︵', print: 'Ring stamp, one round cut',
    reading: 'At the open stall, the cup held water up to the second scratch at first bell.',
    limit: 'The covered stall kept a separate cup. Its reading has not reached Sefa.',
    guild: 'The stall keeper clips the open-cup reading to the canopy order. The covered-cup line stays blank for the next shift.',
    ferry: 'Tova keeps the open-cup reading beside the loading lane. A second cup under the awning gets its own scratch instead of copying the first.' },
  { id: 'wick-bundle', name: 'Wick bundle', mark: '◇ ︵', print: 'Diamond stamp, one round cut',
    reading: 'Sefa laid three dry wicks along the guide. All three reached the long line.',
    limit: 'The count comes from the top of the bundle. The lower layer stayed tied.',
    guild: 'The maker keeps the three tested wicks in a small loop and asks the next shift to untie a second layer before grading the whole bundle.',
    ferry: 'Wenna uses the three checked wicks for the loading lamps. She keeps the tied bundle by the bench for a separate count.' },
  { id: 'bridge-board', name: 'Bridge board', mark: '△ ⌄', print: 'Triangle stamp, one pointed cut',
    reading: 'The handcart crossed the board with one empty basket. The board did not shift.',
    limit: 'No loaded cart took this board during the check.',
    guild: 'Estelle opens the short board for empty carts and leaves the load line unmarked for the next trial.',
    ferry: 'The crew carries empty baskets down this board. Full baskets still use the staffed ramp until the crew checks their weight.' },
  { id: 'dye-swatch', name: 'Dye swatch', mark: '○ ⌄⌄', print: 'Ring stamp, two pointed cuts',
    reading: 'The two samples looked alike while both lay under the market cloth.',
    limit: 'Nobody took the same samples into open light during this check.',
    guild: 'The dyer clips the shaded pair together and leaves a second pair of hooks by the open stand for a daylight comparison.',
    ferry: 'Wenna puts the shaded match on the inside tag. The dock checker keeps both names on the outside copy for sorting in daylight.' },
  { id: 'shift-bell', name: 'Shift bell', mark: '◇ ⌃⌃', print: 'Diamond stamp, two raised cuts',
    reading: 'A runner standing by the steps heard both rings between two cart passes.',
    limit: 'A runner at the west gate was still beside the carts. Their listening note is separate.',
    guild: 'The gate staff keep a chalk signal for the west runner while the stair keeper continues using the two rings.',
    ferry: 'Tova asks the ramp hand to point to a clear lane. The slip keeps the stair runner’s hearing place with the two recorded rings.' },
  { id: 'flour-scoop', name: 'Flour scoop', mark: '△ ︵︵', print: 'Triangle stamp, two round cuts',
    reading: 'A level scoop filled the baker’s small cup to its black line.',
    limit: 'The baker held the cup still. He did not weigh flour from a moving cart.',
    guild: 'The baker marks the level scoop on the fixed stand. The cart ledger still asks for a separate weight on arrival.',
    ferry: 'A carrier puts the measure in the dry box. At the landing the clerk records what spilled separately from the cup’s capacity.' },
  { id: 'reed-strand', name: 'Reed strand', mark: '□ ⌄', print: 'Square stamp, one pointed cut',
    reading: 'The dry practice braid reached the holder with one hand around the bend.',
    limit: 'The workers have not handled the same braid while it is wet.',
    guild: 'The bench hangs the dry braid at the bend. A loose hook beside it leaves room for a separate wet comparison.',
    ferry: 'The landing hooks the dry braid under the canopy. The next wet braid goes to the broad tray before the carrier tries the bend.' },
  { id: 'crate-clip', name: 'Crate clip', mark: '□ ︵⌄', print: 'Square stamp, one round and one pointed cut',
    reading: 'The copper clip still held the date strip after one crossing on the small crate.',
    limit: 'The strip names this crate and this crossing. Its maker line is empty.',
    guild: 'The keeper files the carrier’s date beneath the crate number and leaves the maker line empty.',
    ferry: 'The clerk keeps the dated strip on the small crate. A second crate starts its own route record instead of borrowing this one.' },
] as const;

export const TILE_PAIRS = 6;
export const DISPATCH_DESKS = { guild: 'Emberford guild desk', ferry: 'Ferry Landing desk' } as const;
export const DISPATCH_MAPS = { guild: 'aethelgard.emberford', ferry: 'aethelgard.ferry' } as const;
export const DISPATCH_GAME = 'sefa-dispatch:';
export const DISPATCH_SELECTION = 'tiles.dispatch.selection';
export type DispatchDesk = keyof typeof DISPATCH_DESKS;
export type DispatchSlip = (typeof DISPATCH_SLIPS)[number];
export interface Tile { slip: DispatchSlip; kind: 'reading' | 'limit'; text: string }

export type TileDispatchAction =
  | { type: 'CompleteTileStitch'; daily: string | null; run: number; pairs: string[]; moves: number; secs: number; times: number[] }
  | { type: 'SendTileDispatch'; slip: string; desk: DispatchDesk }
  | { type: 'ReceiveTileDispatch'; slip: string; desk: DispatchDesk };

export const dispatchFlag = (desk: DispatchDesk, slip: string) => `tiles.dispatch.${desk}.${slip}`;
export const dispatchCount = (desk: DispatchDesk) => `tiles.dispatch.${desk}.count`;
export const dispatchReceived = (desk: DispatchDesk) => `tiles.dispatch.${desk}.received`;
export const dispatchSlip = (id: string) => DISPATCH_SLIPS.find((slip) => slip.id === id);
export function runNumber(s: CampaignState): number {
  const n = Number(s.flags['tiles.runs'] ?? 0);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}
export const selectableSlips = (s: CampaignState) => {
  const selection = s.flags[DISPATCH_SELECTION];
  const ids = typeof selection === 'string' ? selection.split(',') : [];
  return DISPATCH_SLIPS.filter((slip) => ids.includes(slip.id));
};

function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(list: readonly T[], r: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function dealTiles(seed: number): Tile[] {
  const r = rng(seed + 1);
  const slips = shuffle(DISPATCH_SLIPS, r).slice(0, TILE_PAIRS);
  return shuffle(slips.flatMap((slip): Tile[] => [
    { slip, kind: 'reading', text: slip.reading }, { slip, kind: 'limit', text: slip.limit },
  ]), r);
}

export const isPair = (a: Tile, b: Tile): boolean => a.slip.id === b.slip.id && a.kind !== b.kind;

/** A rank for precision: a 'move' is turning two tiles. The best possible is one move per pair. */
export function tileRank(moves: number, pairs: number): 'S' | 'A' | 'B' | 'C' {
  return moves <= pairs + 2 ? 'S' : moves <= pairs + 5 ? 'A' : moves <= pairs * 2 + 2 ? 'B' : 'C';
}
export function speedRank(secs: number, pairs: number): 'S' | 'A' | 'B' | 'C' {
  const per = secs / pairs;
  return per <= 6 ? 'S' : per <= 10 ? 'A' : per <= 16 ? 'B' : 'C';
}

/** Each player gets the same deal on a given local calendar date. */
export function dailySeed(d: Date): number {
  return 100000 + d.getFullYear() * 1000 + (d.getMonth() + 1) * 32 + d.getDate();
}

/** Seconds at which each pair was made in the fastest run. */
export const encodeGhost = (times: number[]): string => times.map((t) => Math.round(t)).join(',');
export const decodeGhost = (v: unknown): number[] => typeof v === 'string' && v ? v.split(',').map(Number).filter((n) => Number.isFinite(n)) : [];
export const ghostPairs = (ghost: number[], secs: number): number => ghost.filter((t) => t <= secs).length;

export function tileDispatchEffects(action: TileDispatchAction, state: CampaignState): Effect[] {
  const write = (setFlag: string, value: string | number | boolean): Effect => ({ setFlag, value });
  if (action.type === 'CompleteTileStitch') {
    const { daily, run, pairs, moves, secs, times } = action;
    if (state.mapId !== DISPATCH_MAPS.guild) throw new Error('Sefa keeps her stitching table in Emberford.');
    const day = daily === null ? null : new Date(daily + 'T12:00:00');
    if (day && (!Number.isFinite(day.getTime()) || dayOf(day) !== daily)) throw new Error('Choose a calendar day for the daily tray.');
    if (run !== runNumber(state)) throw new Error('Start another set of slips.');
    const dealt = new Set(dealTiles(day ? dailySeed(day) : run).map(({ slip }) => slip.id as string));
    if (pairs.length !== TILE_PAIRS || new Set(pairs).size !== TILE_PAIRS || !pairs.every((id) => dealt.has(id)) ||
      !Number.isSafeInteger(moves) || moves < TILE_PAIRS || !Number.isSafeInteger(secs) || secs < 1 ||
      times.length !== TILE_PAIRS || times.some((t, i) => !Number.isFinite(t) || t < 0 || t > secs + .5 || i > 0 && t < times[i - 1])) {
      throw new Error('Stitch the six slips from this tray before filing them.');
    }
    const bestMoves = Number(state.flags['tiles.best.moves'] ?? 0);
    const bestSecs = Number(state.flags['tiles.best.secs'] ?? 0);
    const effects = [write(DISPATCH_SELECTION, pairs.join(','))];
    if (daily === null) effects.push(write('tiles.runs', run + 1));
    if (!bestMoves || moves < bestMoves) effects.push(write('tiles.best.moves', moves));
    if (!bestSecs || secs < bestSecs) effects.push(write('tiles.best.secs', secs), write('tiles.ghost', encodeGhost(times)));
    const sameDay = state.flags['tiles.daily.day'] === daily;
    const lastMoves = Number(state.flags['tiles.daily.moves']);
    if (daily !== null && (!sameDay || moves < lastMoves || moves === lastMoves && secs < Number(state.flags['tiles.daily.secs']))) {
      effects.push(write('tiles.daily.day', daily), write('tiles.daily.moves', moves), write('tiles.daily.secs', secs));
    }
    return effects;
  }

  const { desk, slip } = action;
  if (!Object.hasOwn(DISPATCH_DESKS, desk) || !dispatchSlip(slip)) throw new Error('Choose a printed slip and a receiving desk.');
  const key = dispatchFlag(desk, slip);
  if (action.type === 'SendTileDispatch') {
    if (state.mapId !== DISPATCH_MAPS.guild || !selectableSlips(state).some(({ id }) => id === slip)) throw new Error('Choose one slip from the set you just stitched.');
    return [write(DISPATCH_SELECTION, false), ...(!state.flags[key] ? [write(key, 'sent'), { addNum: dispatchCount(desk), by: 1 } as Effect] : [])];
  }
  if (state.mapId !== DISPATCH_MAPS[desk] || state.flags[key] !== 'sent') throw new Error('Take the stitched slip to its marked desk.');
  return [write(key, 'received'), { addNum: dispatchReceived(desk), by: 1 }];
}
