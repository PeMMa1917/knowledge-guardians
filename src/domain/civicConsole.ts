/** A fictional mobile library has four appointment windows to assign. */
export const CIVIC_SAMPLES = ['desk', 'combined'] as const;
export const CIVIC_RULES = ['rank', 'reserve', 'even'] as const;
export type CivicSample = typeof CIVIC_SAMPLES[number];
export type CivicRule = typeof CIVIC_RULES[number];

const desk = { steps: 12, canal: 5 };
const distinctWalkingRequests = { steps: 3, canal: 11 };
const combined = { steps: desk.steps + distinctWalkingRequests.steps, canal: desk.canal + distinctWalkingRequests.canal };

export function civicAllocation(sample: string, rule: string) {
  if (sample !== 'desk' && sample !== 'combined') throw new Error('That register does not belong to this dispatch.');
  if (rule !== 'rank' && rule !== 'reserve' && rule !== 'even') throw new Error('That rule does not belong to this dispatch.');
  const counts = sample === 'desk' ? desk : combined;
  const base = rule === 'rank' ? 0 : rule === 'reserve' ? 1 : 2;
  const remainder = 4 - 2 * base;
  const steps = counts.steps === counts.canal ? 2 : base + (counts.steps > counts.canal ? remainder : 0);
  return { counts: { ...counts }, windows: { steps, canal: 4 - steps } };
}
