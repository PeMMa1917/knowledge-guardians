import entries from '../content/community-letters.json';
import type { CampaignState } from './types';

export interface CommunityLetter {
  id: string;
  sender: string;
  subject: string;
  prerequisites: string[];
  outcomeFlag: string;
  byOutcome: Record<string, string | undefined>;
}

export const COMMUNITY_LETTERS: readonly CommunityLetter[] = entries;
export const communityLetterFlag = (id: string) => `letter.community.${id}`;

function letterWithOutcome(letter: CommunityLetter, outcome: unknown) {
  if (typeof outcome !== 'string' || !Object.hasOwn(letter.byOutcome, outcome)) return [];
  const body = letter.byOutcome[outcome];
  return body ? [{ ...letter, outcome, body }] : [];
}

/** Sequence these notes after a scene the player resolved and a later visit. */
export function dueCommunityLetters(s: CampaignState) {
  return COMMUNITY_LETTERS.flatMap((letter) =>
    s.flags[communityLetterFlag(letter.id)] === undefined && letter.prerequisites.every((id) => s.objectivesDone.includes(id))
      ? letterWithOutcome(letter, s.flags[letter.outcomeFlag])
      : [],
  );
}

/** Use the outcome carried with the delivered letter if the player later changes a decision. */
export function receivedCommunityLetters(s: CampaignState) {
  return COMMUNITY_LETTERS.flatMap((letter) => letterWithOutcome(letter, s.flags[communityLetterFlag(letter.id)]));
}
