/** Three authored tests of the same apparent clock reading. */
export const COUNCIL_TRIALS = ['working', 'matched', 'drift'] as const;
export type CouncilTrial = typeof COUNCIL_TRIALS[number];

export function councilClock(trial: string) {
  if (trial !== 'working' && trial !== 'matched' && trial !== 'drift') {
    throw new Error('That watch does not belong to the Council test.');
  }
  return {
    watch: '12:00',
    reference: trial === 'drift' ? '11:00' : '12:00',
    after: trial === 'working' ? '12:01' : '12:00',
  } as const;
}
