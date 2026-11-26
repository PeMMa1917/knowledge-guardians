/** Editions of the fictional lending notice and its checked repair. */
const claim = 'The return-slip line moved faster.';

export const COPY_EDITIONS = {
  source: { name: 'Trial log', time: 'During Tuesday’s trial', claim, credit: 'Lending Clerk, trial log' },
  press: { name: 'Press sheet', time: '', claim, credit: 'Lending Clerk, trial log' },
  landing: { name: 'Landing notice', time: '', claim, credit: '' },
  proof: { name: 'Corrected trial line', time: 'During Tuesday’s trial', claim, credit: 'Lending Clerk, trial log' },
} as const;

export function compareCopy(edition: string) {
  if (edition !== 'press' && edition !== 'landing' && edition !== 'proof') throw new Error('That edition does not belong to this copy trail.');
  const prior = { press: 'source', landing: 'press', proof: 'landing' } as const;
  const before = COPY_EDITIONS[prior[edition]];
  const after = COPY_EDITIONS[edition];
  const lost = [before.time && !after.time ? before.time : '', before.credit && !after.credit ? before.credit : ''].filter(Boolean);
  const restored = [after.time && !before.time ? after.time : '', after.credit && !before.credit ? after.credit : ''].filter(Boolean);
  return { before, after, lost, restored };
}
