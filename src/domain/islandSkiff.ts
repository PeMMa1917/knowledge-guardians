import type { CampaignState } from './types';

export const SKIFF_MODES = ['practice', 'delivery'] as const;
export const SKIFF_WEATHER = ['early', 'fresh'] as const;
export const SKIFF_CREW = ['lookout', 'rower'] as const;
export const SKIFF_LOADS = ['bundles', 'crates'] as const;
export const SKIFF_STROKES = ['north', 'ahead', 'south', 'hold'] as const;
export const SKIFF_BERTHS = ['stair', 'ramp'] as const;
export const SKIFF_LANES = ['North bank', 'Upper channel', 'Middle channel', 'Lower channel', 'South bank'] as const;
export const SKIFF_LAST_MARK = 8;

type SkiffMode = typeof SKIFF_MODES[number];
type SkiffWeather = typeof SKIFF_WEATHER[number];
type SkiffCrew = typeof SKIFF_CREW[number];
type SkiffLoad = typeof SKIFF_LOADS[number];
export type SkiffStroke = typeof SKIFF_STROKES[number];
export type SkiffBerth = typeof SKIFF_BERTHS[number];

export interface SkiffSetup {
  mode: SkiffMode;
  weather: SkiffWeather;
  crew: SkiffCrew;
  load: SkiffLoad;
}

type LastStroke = 'launch' | 'held' | 'blocked' | 'cleared' | 'drifted';

export interface SkiffRun extends SkiffSetup {
  mark: number;
  lane: number;
  beat: number;
  holds: number;
  drifts: number;
  last: LastStroke;
}

export type SkiffAction = { type: 'SkiffStart'; setup: SkiffSetup }
  | { type: 'SkiffStroke'; stroke: SkiffStroke }
  | { type: 'SkiffMoor' }
  | { type: 'SkiffLand' };

const PREFIX = 'island.skiff';
const ROCKS = {
  practice: [[], [], [0, 4], [2], [1, 4], [0, 3], [2], [], []],
  delivery: [[], [], [0, 4], [2, 3], [0], [1, 4], [2], [], [2]],
};
const SHOALS = {
  practice: [[], [0, 4], [1], [], [2], [4], [1, 3], [], []],
  delivery: [[], [0, 4], [3], [4], [1], [2], [0, 3], [2], []],
};
const STREAM = { early: [0, 0, 1, 0, 0, -1, 0, 0], fresh: [1, 1, 0, -1, -1, 0] };
const MOVES: Record<Exclude<SkiffStroke, 'hold'>, number> = { north: -1, ahead: 0, south: 1 };
const inside = (lane: number) => lane >= 0 && lane < SKIFF_LANES.length;

export function skiffTerrain(mode: SkiffMode, mark: number, lane: number): 'water' | 'rock' | 'shoal' {
  if (ROCKS[mode][mark]?.includes(lane)) return 'rock';
  if (SHOALS[mode][mark]?.includes(lane)) return 'shoal';
  return 'water';
}

export function skiffCurrent(run: SkiffRun, lookAhead = 0): number {
  const sequence = STREAM[run.weather];
  return sequence[(run.beat + lookAhead + Math.floor((run.mark + lookAhead) / 2)) % sequence.length];
}

export function newSkiff(setup: SkiffSetup): SkiffRun {
  return { ...setup, mark: 0, lane: 2, beat: 0, holds: 0, drifts: 0, last: 'launch' };
}

export function skiffBerth(run: SkiffRun): SkiffBerth | null {
  if (run.mode !== 'delivery' || run.mark < SKIFF_LAST_MARK) return null;
  return run.lane < 2 ? 'stair' : 'ramp';
}

export function skiffAdvance(run: SkiffRun, stroke: SkiffStroke): SkiffRun {
  if (run.mark >= SKIFF_LAST_MARK) return run;
  const beat = run.beat + 1;
  if (stroke === 'hold') return { ...run, beat, holds: run.holds + 1, last: 'held' };
  const mark = run.mark + 1;
  const intended = run.lane + MOVES[stroke];
  const drift = stroke === 'ahead' && run.crew === 'rower' ? 0 : skiffCurrent(run);
  const lane = intended + drift;
  const terrain = skiffTerrain(run.mode, mark, lane);
  if (!inside(intended) || !inside(lane) || terrain === 'rock' || (terrain === 'shoal' && run.load === 'crates')) {
    return { ...run, beat, holds: run.holds + 1, last: 'blocked' };
  }
  return { ...run, mark, lane, beat, drifts: run.drifts + Number(drift !== 0), last: drift ? 'drifted' : 'cleared' };
}

const validSetup = (setup: SkiffSetup) => Boolean(setup &&
  SKIFF_MODES.includes(setup.mode) && SKIFF_WEATHER.includes(setup.weather) &&
  SKIFF_CREW.includes(setup.crew) && SKIFF_LOADS.includes(setup.load));

function readRun(saved: unknown): SkiffRun | null {
  if (typeof saved !== 'string') return null;
  try {
    const run = JSON.parse(saved) as SkiffRun;
    if (!validSetup(run) || !Number.isInteger(run.mark) || run.mark < 0 || run.mark > SKIFF_LAST_MARK
      || !Number.isInteger(run.lane) || !inside(run.lane) || !Number.isSafeInteger(run.beat) || run.beat < run.mark
      || !Number.isSafeInteger(run.holds) || run.holds < 0 || run.holds > run.beat
      || !Number.isInteger(run.drifts) || run.drifts < 0 || run.drifts > run.mark
      || !['launch', 'held', 'blocked', 'cleared', 'drifted'].includes(run.last)) return null;
    return run;
  } catch {
    return null;
  }
}

export const skiffRun = (flags: CampaignState['flags']): SkiffRun | null => readRun(flags[`${PREFIX}.run`]);
export const skiffPractice = (flags: CampaignState['flags'], setup: Pick<SkiffSetup, 'crew' | 'load' | 'weather'>) =>
  readRun(flags[`${PREFIX}.practice.${setup.crew}.${setup.load}.${setup.weather}`]);
export const skiffDelivery = (flags: CampaignState['flags'], berth: SkiffBerth): SkiffRun | null =>
  readRun(flags[`${PREFIX}.delivery.${berth}`]);

export function hasSkiffComparison(flags: CampaignState['flags'], setup: SkiffSetup) {
  return SKIFF_WEATHER.every((weather) => skiffPractice(flags, { ...setup, weather }));
}

export function changeSkiff(action: SkiffAction, state: CampaignState): CampaignState {
  if (state.mapId !== 'island.dock' || !state.objectivesDone.includes('island.finish')) {
    throw new Error('Use the skiff at the Two-Tide Dock after the island plan is posted.');
  }
  const flags = { ...state.flags };
  const run = skiffRun(flags);
  if (action.type === 'SkiffMoor') {
    if (!run) throw new Error('There is no skiff to bring back.');
    delete flags[`${PREFIX}.run`];
  } else if (action.type === 'SkiffStart') {
    const setup = action.setup;
    if (run || !validSetup(setup)) throw new Error('Choose a setup while the skiff is moored.');
    if (setup.mode === 'delivery' && flags[`${PREFIX}.calibrated`] !== true) {
      throw new Error('Run the same practice setup under both bell conditions before carrying deliveries.');
    }
    flags[`${PREFIX}.started`] = true;
    flags[`${PREFIX}.run`] = JSON.stringify(newSkiff(setup));
  } else if (!run) {
    throw new Error('Set up the skiff before working the helm.');
  } else if (action.type === 'SkiffStroke') {
    if (!SKIFF_STROKES.includes(action.stroke) || run.mark >= SKIFF_LAST_MARK) throw new Error('The crossing is at its last marker.');
    const next = skiffAdvance(run, action.stroke);
    if (next.mode === 'practice' && next.mark === SKIFF_LAST_MARK) {
      flags[`${PREFIX}.practice.${next.crew}.${next.load}.${next.weather}`] = JSON.stringify(next);
      if (hasSkiffComparison(flags, next)) flags[`${PREFIX}.calibrated`] = true;
      delete flags[`${PREFIX}.run`];
    } else {
      flags[`${PREFIX}.run`] = JSON.stringify(next);
    }
  } else {
    const berth = skiffBerth(run);
    if (!berth) throw new Error('Bring the skiff alongside a receiving berth first.');
    flags[`${PREFIX}.delivery.${berth}`] = JSON.stringify(run);
    flags[`${PREFIX}.delivery.${berth}.load`] = run.load;
    flags[`${PREFIX}.landed`] = berth;
    delete flags[`${PREFIX}.run`];
  }
  return { ...state, flags };
}
