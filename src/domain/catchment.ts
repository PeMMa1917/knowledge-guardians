import type { CampaignState, Effect, FlagValue } from './types';

export const CATCHMENT_ROOM = 'water.culvert';
export const catchmentFlag = (key: string) => `catchment.${key}`;
export const CATCHMENT_TRIALS = ['pocket', 'open'] as const;
export const CATCHMENT_NOTICES = ['rows', 'crossing'] as const;
export type CatchmentTrial = typeof CATCHMENT_TRIALS[number];
export type CatchmentNotice = typeof CATCHMENT_NOTICES[number];
export type CatchmentAction = { type: 'TraceCatchment'; trial: CatchmentTrial }
  | { type: 'PostCatchmentNotice'; notice: CatchmentNotice };

export const TRIAL_NAME: Record<CatchmentTrial, string> = { pocket: 'Pocket exposed', open: 'Pocket covered' };
export const NOTICE_NAME: Record<CatchmentNotice, string> = { rows: 'Open the terrace footboard now', crossing: 'Wait for a joint watch at the low crossing' };

/** One fictional pulse goes past the upper peg before it can enter the side pocket. */
export function catchmentReading(trial: CatchmentTrial) {
  const upper = 6;
  const pocket = trial === 'pocket' ? 2 : 0;
  return { upper, pocket, lower: upper - pocket };
}

export function catchmentCompared(flags: Record<string, FlagValue>): boolean {
  return CATCHMENT_TRIALS.every((trial) => flags[catchmentFlag(`trial.${trial}`)] === true);
}

export function catchmentEffects(action: CatchmentAction, state: CampaignState): Effect[] {
  const flags = state.flags;
  if (state.mapId !== CATCHMENT_ROOM || !['upper', 'lower'].every((key) => flags[catchmentFlag(key)] === true)) {
    throw new Error('Follow the two peg marks to the culvert before using its model.');
  }
  if (action.type === 'TraceCatchment') {
    if (!CATCHMENT_TRIALS.includes(action.trial)) throw new Error('Choose how the pocket is set.');
    return [{ setFlag: catchmentFlag(`trial.${action.trial}`), value: true }];
  }
  if (!CATCHMENT_NOTICES.includes(action.notice)) throw new Error('Choose a crossing notice.');
  if (!catchmentCompared(flags)) throw new Error('Trace the same pulse with the side pocket exposed and covered.');
  const posted = flags[catchmentFlag('notice')];
  if (posted === action.notice) return [];
  if (posted && posted !== flags[catchmentFlag('checked')]) throw new Error('Go through the opened door and check its receipt before changing the notice.');
  return [
    { setFlag: catchmentFlag('notice'), value: action.notice },
    { setFlag: catchmentFlag(`crossed.${action.notice}`), value: false },
  ];
}
