export const PORTER_TOOL = 'porter-pace';
export const PORTER_SLIP = 'item.porter.pace-strip';
export const PORTER_PACES = ['front', 'even'] as const;
export type PorterPace = (typeof PORTER_PACES)[number];
export const PORTER_CREWS = ['solo', 'relay'] as const;
export type PorterCrew = (typeof PORTER_CREWS)[number];
export type PorterSite = 'emberford' | 'water';

export const PORTER_CARGO = 4;
export const PORTER_RECOVERY = 2;

const routes = {
  emberford: [
    { name: 'Porch lane', rise: 0 }, { name: 'Covered turn', rise: 1 },
    { name: 'Flat lane', rise: 0 }, { name: 'Receiving rail', rise: 1 },
  ],
  water: [
    { name: 'Dry yard', rise: 1 }, { name: 'Raised boards', rise: 2 },
    { name: 'Trough turn', rise: 1 }, { name: 'Lower store', rise: 2 },
  ],
} as const;

export type PorterTrial = {
  leg: number;
  elapsed: number;
  burden: [number, number];
  peak: number;
  handed: boolean;
  recovery: number;
  arrival?: number;
};

export function startPorterTrial(): PorterTrial {
  return { leg: 0, elapsed: 0, burden: [0, 0], peak: 0, handed: false, recovery: 0 };
}

export function porterStep(trial: PorterTrial, site: PorterSite, pace: PorterPace, crew: PorterCrew) {
  const route = routes[site];
  if (trial.leg === route.length) {
    return trial.recovery === PORTER_RECOVERY ? undefined : {
      label: 'Take one recovery beat', kind: 'rest' as const, turns: 1,
    };
  }
  if (crew === 'relay' && trial.leg === 2 && !trial.handed) {
    return { label: 'Pass the load to the second carrier', kind: 'pass' as const, turns: 1 };
  }
  const { name, rise } = route[trial.leg];
  const quick = pace === 'front' && trial.leg < 2;
  return {
    label: `Carry through ${name}`, kind: 'carry' as const, turns: quick ? 1 : 2,
    effort: PORTER_CARGO + (quick ? 4 : 1) + rise, pace: quick ? 'Quick' : 'Even',
  };
}

function settled(load: number, turns: number) {
  return Math.max(0, load - 4 * turns);
}

export function movePorterTrial(trial: PorterTrial, site: PorterSite, pace: PorterPace, crew: PorterCrew): PorterTrial {
  const step = porterStep(trial, site, pace, crew);
  if (!step) return trial;
  const next = { ...trial, elapsed: trial.elapsed + step.turns };
  const [first, second] = trial.burden;
  if (step.kind === 'rest') return {
    ...next, recovery: trial.recovery + 1, burden: [settled(first, step.turns), settled(second, step.turns)],
  };
  if (step.kind === 'pass') return {
    ...next, handed: true, burden: [settled(first, step.turns), settled(second, step.turns)],
  };
  const burden: PorterTrial['burden'] = trial.handed
    ? [settled(first, step.turns), second + step.effort]
    : [first + step.effort, settled(second, step.turns)];
  const peak = Math.max(trial.peak, ...burden);
  const leg = trial.leg + 1;
  const arrival = leg === routes[site].length ? next.elapsed : undefined;
  return { ...next, leg, burden, peak, arrival };
}

export function runPorterTrial(site: PorterSite, pace: PorterPace, crew: PorterCrew): PorterTrial {
  let trial = startPorterTrial();
  while (porterStep(trial, site, pace, crew)) trial = movePorterTrial(trial, site, pace, crew);
  return trial;
}

export const PORTER_EARLY = 'porter.pace.early.choice';
export const PORTER_LATER = 'porter.pace.later.choice';
export const PORTER_EARLY_RECEIPT = 'porter.pace.early.receipt';
export const PORTER_LATER_RECEIPT = 'porter.pace.later.receipt';
export const PORTER_EARLY_CHECKED = 'porter.pace.compared';
export const PORTER_LATER_CHECKED = 'porter.crew.compared';
export const porterPaceTrace = (pace: PorterPace) => `porter.pace.early.checked.${pace}`;
export const porterCrewTrace = (crew: PorterCrew) => `porter.pace.later.checked.${crew}`;

export function paceSummary(trial: PorterTrial, crew: PorterCrew) {
  const afterPause = crew === 'solo'
    ? `First carrier after the pause ${trial.burden[0]} effort marks.`
    : `After the pause, first carrier ${trial.burden[0]} and second carrier ${trial.burden[1]} effort marks.`;
  return `Arrival after ${trial.arrival} turns. Peak for one carrier ${trial.peak} effort marks. ${afterPause}`;
}
