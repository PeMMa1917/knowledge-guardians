import type { CampaignState, Effect } from './types';

export const INCENTIVE_POLICIES = ['dispatch', 'kits'] as const;
export const INCENTIVE_KITS = ['rail', 'bench'] as const;
export const INCENTIVE_TRACES = ['early-workshop', 'early-dock', 'late-workshop', 'late-dock'] as const;
export const INCENTIVE_ORDER = 'item.incentive.manifest';

export type IncentivePolicy = typeof INCENTIVE_POLICIES[number];
export type IncentiveKit = typeof INCENTIVE_KITS[number];
export type IncentiveTrace = typeof INCENTIVE_TRACES[number];
type Part = `${IncentiveKit}-${'hook' | 'foot'}`;
type Phase = 'early' | 'late' | 'audited';

export const INCENTIVE_PARTS: Record<IncentiveKit, readonly Part[]> = {
  rail: ['rail-hook', 'rail-foot'],
  bench: ['bench-hook', 'bench-foot'],
};

export const INCENTIVE_NAMES: Record<Part, string> = {
  'rail-hook': 'Rail kit hook', 'rail-foot': 'Rail kit foot',
  'bench-hook': 'Bench kit hook', 'bench-foot': 'Bench kit foot',
};

export const INCENTIVE_RECEIPTS: Record<IncentivePolicy, Record<IncentiveTrace, readonly Part[]>> = {
  dispatch: { 'early-workshop': ['rail-hook'], 'early-dock': ['bench-hook'], 'late-workshop': ['rail-foot', 'bench-foot'], 'late-dock': [] },
  kits: { 'early-workshop': [], 'early-dock': [], 'late-workshop': INCENTIVE_PARTS.rail, 'late-dock': INCENTIVE_PARTS.bench },
};

export const INCENTIVE_SITES: Record<IncentiveTrace, string> = {
  'early-workshop': 'island.workshop', 'late-workshop': 'island.workshop',
  'early-dock': 'island.dock', 'late-dock': 'island.dock',
};

export function incentiveReport(policy: IncentivePolicy) {
  const rows = INCENTIVE_RECEIPTS[policy];
  const first = [...rows['early-workshop'], ...rows['early-dock']];
  const all = INCENTIVE_TRACES.flatMap((spot) => rows[spot]);
  const matched = (parts: Part[]) => INCENTIVE_KITS.filter((kit) => INCENTIVE_PARTS[kit].every((part) => parts.includes(part))).length;
  return { published: policy === 'dispatch' ? all.length : matched(all), earlyParts: first.length,
    earlyKits: matched(first), totalParts: all.length, totalKits: matched(all) };
}

export type IncentiveAction = { type: 'PublishDispatchTarget'; policy: IncentivePolicy }
  | { type: 'CheckDispatchReceipt'; trace: IncentiveTrace }
  | { type: 'CallDispatchBell' }
  | { type: 'CheckDispatchKit'; kit: IncentiveKit }
  | { type: 'KeepDispatchTarget'; policy: IncentivePolicy };

const key = (field: string) => `incentive.${field}`;
const mark = (field: string, value: string | boolean): Effect => ({ setFlag: key(field), value });

export function activeIncentive(flags: CampaignState['flags']) {
  return flags[key('policy')] as IncentivePolicy | undefined;
}

export function incentivePhase(flags: CampaignState['flags']) {
  return flags[key('phase')] as Phase | undefined;
}

export function traceSeen(flags: CampaignState['flags'], trace: IncentiveTrace) {
  return flags[key(`trace.${trace}`)] === true;
}

export function incentiveAudited(flags: CampaignState['flags'], policy: IncentivePolicy) {
  return flags[key(`audited.${policy}`)] === true;
}

export function kitChecked(flags: CampaignState['flags'], kit: IncentiveKit) {
  return flags[key(`kit.${kit}`)] === true;
}

export function checkedParts(flags: CampaignState['flags']): Part[] {
  const policy = activeIncentive(flags);
  return policy ? INCENTIVE_TRACES.filter((spot) => traceSeen(flags, spot)).flatMap((spot) => INCENTIVE_RECEIPTS[policy][spot]) : [];
}

export function readyForBell(flags: CampaignState['flags']) {
  return incentivePhase(flags) === 'early' && traceSeen(flags, 'early-workshop') && traceSeen(flags, 'early-dock');
}

function readyForAudit(flags: CampaignState['flags'], policy: IncentivePolicy) {
  return incentivePhase(flags) === 'late' && traceSeen(flags, 'late-workshop')
    && (policy === 'dispatch' || traceSeen(flags, 'late-dock'));
}

export function canCheckKit(flags: CampaignState['flags'], kit: IncentiveKit) {
  const policy = activeIncentive(flags);
  return !!policy && readyForAudit(flags, policy) && INCENTIVE_PARTS[kit].every((part) => checkedParts(flags).includes(part));
}

export function civicIncentiveEffects(action: IncentiveAction, state: CampaignState): Effect[] {
  const { mapId, flags, inventory, objectivesDone } = state;
  const phase = incentivePhase(flags);
  const policy = activeIncentive(flags);
  if (!objectivesDone.includes('civic.finish')) throw new Error('Read Lin’s board after the main route is set.');

  if (action.type === 'PublishDispatchTarget') {
    const board = mapId === 'civic.steps' || (mapId === 'island.workshop' && phase === 'audited');
    if (!board || (phase && phase !== 'audited') || !INCENTIVE_POLICIES.includes(action.policy)) {
      throw new Error('Finish the current handover before posting a rule for the next run.');
    }
    const record = [mark('phase', 'early'), mark('policy', action.policy),
      ...INCENTIVE_TRACES.map((spot) => mark(`trace.${spot}`, false)),
      ...INCENTIVE_KITS.map((kit) => mark(`kit.${kit}`, false))];
    if (!inventory[INCENTIVE_ORDER]) record.push({ giveItem: INCENTIVE_ORDER });
    return record;
  }
  if (!policy || !inventory[INCENTIVE_ORDER]) throw new Error('Bring Lin’s copy of the four-part order.');
  if (action.type === 'CheckDispatchReceipt') {
    const trace = action.trace;
    if (!INCENTIVE_TRACES.includes(trace) || mapId !== INCENTIVE_SITES[trace]
      || phase !== trace.split('-')[0] || (policy === 'dispatch' && trace === 'late-dock')) {
      throw new Error('Use the receiving rack for the current bell.');
    }
    return [mark(`trace.${trace}`, true)];
  }
  if (mapId !== 'island.workshop') throw new Error('Use Ivo’s trace table in the Island workshop.');
  if (action.type === 'CallDispatchBell') {
    if (!readyForBell(flags)) throw new Error('Visit both receiving places at first bell before calling the second.');
    return [mark('phase', 'late')];
  }
  if (action.type === 'CheckDispatchKit') {
    const kit = action.kit;
    if (!INCENTIVE_KITS.includes(kit) || !canCheckKit(flags, kit) || kitChecked(flags, kit)) {
      throw new Error('Bring this kit’s matched hook and foot to the trace table.');
    }
    const effects = [mark(`kit.${kit}`, true)];
    if (INCENTIVE_KITS.every((name) => name === kit || kitChecked(flags, name))) {
      effects.push(mark('phase', 'audited'), mark(`audited.${policy}`, true));
    }
    return effects;
  }
  if (phase !== 'audited' || !INCENTIVE_POLICIES.includes(action.policy)
    || !INCENTIVE_POLICIES.every((option) => incentiveAudited(flags, option))) {
    throw new Error('Line up both trials before posting a standing target.');
  }
  return [mark('standing', action.policy), mark('readback', false)];
}
