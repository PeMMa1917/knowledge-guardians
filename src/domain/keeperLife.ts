import type { CampaignState, CharacterRecord, DialogueNode } from './types';

export function keeperLifeEntry(person: string, state: Pick<CampaignState, 'flags'>): string {
  const key = 'offshift.' + person;
  const remembered = state.flags[key];
  return key + (remembered === 'cover' || remembered === 'work' ? '.' + remembered : '.offer');
}

/** The same invitations are available at physical greetings and at the end of a speaker’s scene. */
export function offersKeeperVisit(node: DialogueNode, person: Pick<CharacterRecord, 'mode'> | undefined, greeting: boolean): boolean {
  return person?.mode === 'fictional' && !node.id.startsWith('offshift.') && !node.open && (greeting || !node.next);
}
