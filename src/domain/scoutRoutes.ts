/** An exhaustive paper drill, with one turning space and three approaches. */
export const SCOUT_ROUTES = ['orchard', 'arch', 'steps'] as const;
export type ScoutRoute = typeof SCOUT_ROUTES[number];
export type ScoutProtocol = 'informed' | 'independent';
export type ScoutDecision = 'hold' | 'change' | 'revealed';

const DEAL_ORDER = [3, 2, 0, 5, 4, 1] as const;

/** A reproducible cycle lets the yard visit each deal before repeating it. */
export function scoutNextTrial(roundsPlayed: number): number {
  return DEAL_ORDER[roundsPlayed % DEAL_ORDER.length];
}

export interface ScoutTrial {
  first: ScoutRoute;
  clear: ScoutRoute;
  slip: ScoutRoute;
  opened: ScoutRoute;
  other: ScoutRoute | null;
}

/** The three clear routes and both candidate reveals are equally weighted. */
export function scoutTrials(first: ScoutRoute, protocol: ScoutProtocol): ScoutTrial[] {
  if (!SCOUT_ROUTES.includes(first)) throw new Error('Choose a marked approach at the practice yard.');
  if (protocol !== 'informed' && protocol !== 'independent') throw new Error('Unknown scout instruction.');
  const alternatives = SCOUT_ROUTES.filter((route) => route !== first);
  return SCOUT_ROUTES.flatMap((clear) => alternatives.map((candidate) => {
    const second = alternatives.find((route) => route !== candidate)!;
    // A scout with the notes passes over a clear candidate. A scout without
    // them opens the candidate and may reveal the only clear approach.
    const opened = protocol === 'informed' && candidate === clear ? second : candidate;
    const other = opened === clear ? null : alternatives.find((route) => route !== opened)!;
    return { first, clear, slip: candidate, opened, other };
  }));
}

export function scoutDecision(trial: ScoutTrial, decision: ScoutDecision) {
  if (!trial.other) {
    if (decision !== 'revealed') throw new Error('The scout has already shown the clear route.');
    return { route: trial.opened, fits: true };
  }
  if (decision !== 'hold' && decision !== 'change') throw new Error('Keep the chalk route or try the other unopened gate.');
  const route = decision === 'hold' ? trial.first : trial.other;
  return { route, fits: route === trial.clear };
}

/** Compare decisions only in the rounds that reported a blocked route. */
export function scoutReport(trials: ScoutTrial[]) {
  const blocked = trials.filter(({ other }) => other !== null);
  return {
    rounds: trials.length,
    revealed: trials.length - blocked.length,
    blocked: blocked.length,
    hold: blocked.filter(({ first, clear }) => first === clear).length,
    change: blocked.filter(({ other, clear }) => other === clear).length,
  };
}
