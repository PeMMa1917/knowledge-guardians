import type { CampaignState, Effect } from './types';

export const BEND_TOOL = 'strip-bend:';
export const BEND_CARD = 'item.bend-card';
export const BEND_MAPS = { nile: 'nile.route', landing: 'copies.landing' } as const;
export type BendSite = keyof typeof BEND_MAPS;

export const BEND_TRIALS = {
  'spring-near': { name: 'Spring strip · near stop', strip: 'spring', reach: 'near', start: 0 },
  'spring-far': { name: 'Spring strip · far stop', strip: 'spring', reach: 'far', start: 0 },
  'stiff-near': { name: 'Stiff strip · near stop', strip: 'stiff', reach: 'near', start: 0 },
  'stiff-far': { name: 'Stiff strip · far stop', strip: 'stiff', reach: 'far', start: 0 },
  worn: { name: 'Used stiff strip · near stop', strip: 'stiff', reach: 'near', start: 2 },
  short: { name: 'Fresh stiff strip · near stop', strip: 'stiff', reach: 'near', start: 0 },
  long: { name: 'Fresh spring strip · far stop', strip: 'spring', reach: 'far', start: 0 },
} as const;
export type BendTrial = keyof typeof BEND_TRIALS;

export const SITE_TRIALS = {
  nile: ['spring-near', 'spring-far', 'stiff-near', 'stiff-far'],
  landing: ['worn', 'short', 'long'],
} as const satisfies Record<BendSite, readonly BendTrial[]>;

export const BEND_PLANS = {
  nile: {
    reading: {
      label: 'Carry the reading card',
      result: 'Marek moves the model to the short reading rail southwest of his bench. The reader can see the line under weight.',
    },
    return: {
      label: 'Carry the return card',
      result: 'Marek clears the long work tray south of his bench. The runner can reach both ends. The reader checks the line after lifting.',
    },
  },
  landing: {
    short: {
      label: 'Set the short reading stand',
      result: 'Mina sets the short stand by the hall bench. The waiting reader can use the line under weight, and the runner brings the far bundle forward.',
    },
    long: {
      label: 'Open the far return tray',
      result: 'Mina opens the far tray by the ramp. The runner leaves the wide bundle in place, and the waiting reader checks after the weight comes off.',
    },
  },
} as const;
export type BendPlan = keyof typeof BEND_PLANS.nile | keyof typeof BEND_PLANS.landing;

export type BendAction =
  | { type: 'RecordBendTrial'; trial: BendTrial }
  | { type: 'FileBendPlan'; plan: BendPlan };

export function stripReading(trial: BendTrial) {
  const { strip, reach, start } = BEND_TRIALS[trial];
  const arm = reach === 'near' ? 1 : 3;
  // Calibration of these fictional strips, in marks on this board only.
  const loaded = start + arm * (strip === 'spring' ? 2 : 1);
  const released = strip === 'stiff' && reach === 'far' ? 2 : start;
  return { start, loaded, released };
}

export const bendLayout = (site: BendSite) => `bend.${site}.layout`;
export const bendRecord = (trial: BendTrial) => `bend.trial.${trial}`;

function hasReading(state: CampaignState, trial: BendTrial) {
  return state.flags[bendRecord(trial)] === true;
}

export function bendComparisonReady(state: CampaignState, site: BendSite) {
  const trials: readonly BendTrial[] = SITE_TRIALS[site];
  return trials.every((trial) => hasReading(state, trial));
}

export function canUseBendBoard(state: CampaignState, site: BendSite) {
  return state.mapId === BEND_MAPS[site] && (site === 'nile'
    ? state.cards.includes('card.nile.mine')
    : (state.inventory[BEND_CARD] ?? 0) > 0);
}

export function bendEffects(action: BendAction, state: CampaignState): Effect[] {
  const site = state.mapId === BEND_MAPS.landing ? 'landing' : 'nile';
  if (!canUseBendBoard(state, site)) throw new Error('Check the Mine Map in the archive or bring Marek’s trial card to the Landing.');

  if (action.type === 'RecordBendTrial') {
    const trials: readonly BendTrial[] = SITE_TRIALS[site];
    if (!trials.includes(action.trial)) throw new Error('That strip and stop are set up at the other board.');
    if (site === 'landing' && action.trial !== 'worn' && !hasReading(state, 'worn')) {
      throw new Error('Lift the practice weight from the used strip before fitting a replacement.');
    }
    return hasReading(state, action.trial) ? [] : [{ setFlag: bendRecord(action.trial), value: true }];
  }

  const layout = bendLayout(site);
  if (state.flags[layout]) throw new Error('The checked plan is already at its reader’s stand.');
  if (!Object.hasOwn(BEND_PLANS[site], action.plan)) throw new Error('Use a fitting plan for this room.');
  if (!bendComparisonReady(state, site)) throw new Error('Finish the load and lift readings before you file a plan.');
  return [{ setFlag: layout, value: action.plan }, ...(site === 'nile' ? [{ giveItem: BEND_CARD }] : [])];
}
