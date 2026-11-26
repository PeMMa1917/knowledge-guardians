export const BREEZE_TOOL = 'coast-breeze:';
export const BREEZE_START = 'coast.detector.received';
export const BREEZE_CHECK = 'coast.breeze.first';
export const BREEZE_FOLLOW = 'coast.breeze.follow';
export const BREEZE_PLAN = 'coast.breeze.plan';

export const BREEZE_MOMENTS = ['still', 'gust', 'eased', 'again'] as const;
export type BreezeMoment = (typeof BREEZE_MOMENTS)[number];
export type BreezeStation = 'headland' | 'archive' | 'harbour';
export type BreezePlan = Exclude<BreezeStation, 'headland'>;

export const BREEZE_CHECKS: Record<BreezeStation, readonly BreezeMoment[]> = {
  headland: ['still', 'gust'],
  archive: ['gust'],
  harbour: ['eased', 'again'],
};

export function breezeMoment(value: unknown, start: BreezeMoment): BreezeMoment {
  return BREEZE_MOMENTS.find((moment) => moment === value) ?? start;
}

export function nextBreezeMoment(moment: BreezeMoment): BreezeMoment {
  return BREEZE_MOMENTS[Math.min(BREEZE_MOMENTS.length - 1, BREEZE_MOMENTS.indexOf(moment) + 1)];
}

export function breezeReading(station: BreezeStation, moment: BreezeMoment) {
  // The workshop's practice script gives both gusts the same screen movement.
  // Both practice lights hold steady. The moving vane only shadows the exposed view.
  const shadow = station !== 'archive' && (moment === 'gust' || moment === 'again');
  return { rim: 1, step: shadow ? 1 : 3 };
}

export const breezeTraceFlag = (station: BreezeStation, moment: BreezeMoment) => `coast.breeze.${station}.trace.${moment}`;
export const breezePhaseFlag = (station: BreezeStation) => `coast.breeze.${station}.phase`;
export const breezeReceiptFlag = (plan: BreezePlan) => `coast.breeze.${plan}.receipt`;
