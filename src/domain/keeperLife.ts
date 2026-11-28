import type { CampaignState } from './types';

export function keeperLifeEntry(person: string, state: Pick<CampaignState, 'flags'>): string {
  const key = 'offshift.' + person;
  const remembered = state.flags[key];
  return key + (remembered === 'cover' || remembered === 'work' ? '.' + remembered : '.offer');
}
