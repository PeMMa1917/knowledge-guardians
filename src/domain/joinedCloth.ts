/** A toy dock model. These ticks describe its supports and stop. */
export const JOINED_CLOTH_KEY = 'cma:1971.160';
export const JOINED_CLOTH_SOURCE = 'HIS-CMA-1971.160';
export const JOINED_CLOTH_MAP = 'island.dock';
export const JOINED_CLOTH_PROP = 'joined-cloth-test';
export const JOINED_CLOTH_GAME = 'joined-cloth:';
export const JOINED_CLOTH_DESTINATION = 'joined.cloth.destination';
export const JOINED_CLOTH_USED = 'joined.cloth.used';
export const JOINED_CLOTH_OBJECTIVE = 'joined.cloth.handoff';
export const JOINT_STOP = 3;
export const PACKET_WEIGHT = 2;

export const JOINT_SUPPORTS = ['beam', 'separate'] as const;
export const JOINT_LOADS = ['centre', 'edge'] as const;
export type JointSupport = typeof JOINT_SUPPORTS[number];
export type JointLoad = typeof JOINT_LOADS[number];
export const JOINT_USES = {
  rack: { support: 'beam', load: 'centre' },
  ledge: { support: 'separate', load: 'edge' },
} as const;

export const jointTrialFlag = (support: JointSupport, load: JointLoad) => `joined.cloth.trial.${support}.${load}`;

export function jointTrial(support: JointSupport, load: JointLoad) {
  const distance = load === 'centre' ? 0 : 2;
  const pull = 1 + PACKET_WEIGHT * distance;
  const travel = Math.ceil(pull / (support === 'beam' ? 1 : 2));
  return { travel, clears: travel <= JOINT_STOP };
}

export function comparedJointTrials(flags: Record<string, unknown>) {
  return JOINT_SUPPORTS.every((support) => JOINT_LOADS.every((load) => flags[jointTrialFlag(support, load)] === true));
}

export function jointReceipt(place: keyof typeof JOINT_USES, load: JointLoad) {
  const setup = JOINT_USES[place];
  const result = jointTrial(setup.support, load);
  return { ...result, arrives: result.clears && load === setup.load };
}
