import type { Effect, FlagValue } from './types';

export type SheetPoint = readonly [east: number, north: number];
export const SHEET_SCALES = ['original', 'span'] as const;
export type SheetScale = (typeof SHEET_SCALES)[number];
export const SHEET_READERS = ['strip', 'pair'] as const;
export type SheetReader = (typeof SHEET_READERS)[number];
export const SHEET_RETURNS = ['tentative', 'survey'] as const;
export type SheetReturn = (typeof SHEET_RETURNS)[number];
export interface SheetCase { turn: number; offset: SheetPoint; outer: SheetPoint; }

const TURN = [0, 1, 2, 3];
const anchors: readonly SheetPoint[] = [[4, 4], [8, 4], [6, 8]];
const sheetPoints: readonly SheetPoint[] = [[0, 0], [2, 0], [1, 2]];
const fixedLabels = ['Gate', 'Post', 'Far turn'] as const;
export const sheetKey = (slug: string) => `align.${slug}`;

function rotate([x, y]: SheetPoint, turns: number): SheetPoint {
  switch ((turns + 4) % 4) {
    case 1: return [-y, x];
    case 2: return [-x, -y];
    case 3: return [y, -x];
    default: return [x, y];
  }
}

export function sheetRead(def: SheetCase, turns: number, seated: boolean, mode: SheetScale, returned = false) {
  const scale = mode === 'span' ? 2 : 1;
  const start = seated ? anchors[0] : def.offset;
  return sheetPoints.map((point, index) => {
    const [a, b] = rotate(point, def.turn + turns);
    const fixed: SheetPoint = index === 2 ? [anchors[index][0] + def.outer[0], anchors[index][1] + def.outer[1] + (returned ? 1 : 0)] : anchors[index];
    const placed: SheetPoint = [start[0] + a * scale, start[1] + b * scale];
    return { label: fixedLabels[index], fixed, placed, gap: Math.abs(placed[0] - fixed[0]) + Math.abs(placed[1] - fixed[1]) };
  });
}

export function readSheet(slug: string, flags: Record<string, FlagValue>) {
  const key = sheetKey(slug);
  const turns = TURN.find((n) => flags[`${key}.turn`] === n) ?? 0;
  const reader = SHEET_READERS.find((candidate) => flags[`${key}.reader`] === candidate);
  return { turns, reader, pinned: flags[`${key}.pin`] === true, checked: flags[`${key}.checked`] === true,
    trials: SHEET_SCALES.filter((mode) => flags[`${key}.trial.${mode}`] === true),
    received: !!reader && flags[`${key}.received`] === reader,
    returnTrials: SHEET_SCALES.filter((mode) => flags[`${key}.return.${mode}`] === true),
    returned: SHEET_RETURNS.find((action) => flags[`${key}.placed`] === action) };
}

export type SheetMove = { type: 'turn' | 'pin' | 'check' }
  | { type: 'trial' | 'revisit'; mode: SheetScale }
  | { type: 'send' | 'receive'; reader: SheetReader }
  | { type: 'place'; action: SheetReturn };
type FlagEffect = Extract<Effect, { setFlag: string }>;

export function sheetMove(def: SheetCase, slug: string, flags: Record<string, FlagValue>, move: SheetMove): FlagEffect | undefined {
  const key = sheetKey(slug);
  const state = readSheet(slug, flags);
  switch (move.type) {
    case 'turn': return !state.checked ? { setFlag: `${key}.turn`, value: (state.turns + 1) % 4 } : undefined;
    case 'pin': return !state.checked ? { setFlag: `${key}.pin`, value: true } : undefined;
    case 'check': return !state.checked && state.pinned && sheetRead(def, state.turns, true, 'span')[1].gap === 0 ? { setFlag: `${key}.checked`, value: true } : undefined;
    case 'trial': return state.checked && !state.reader && SHEET_SCALES.includes(move.mode) ? { setFlag: `${key}.trial.${move.mode}`, value: true } : undefined;
    case 'send': return state.trials.length === 2 && !state.reader && SHEET_READERS.includes(move.reader) ? { setFlag: `${key}.reader`, value: move.reader } : undefined;
    case 'receive': return state.reader === move.reader && !state.received ? { setFlag: `${key}.received`, value: move.reader } : undefined;
    case 'revisit': return state.received && !state.returned && SHEET_SCALES.includes(move.mode) ? { setFlag: `${key}.return.${move.mode}`, value: true } : undefined;
    case 'place': return state.returnTrials.length === 2 && !state.returned && SHEET_RETURNS.includes(move.action) ? { setFlag: `${key}.placed`, value: move.action } : undefined;
  }
}
