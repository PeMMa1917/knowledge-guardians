import type { ContentPack, DialogueNode } from '../domain/types';
import { BADGE_FAMILIES, badgeFamilyReady, selectedFamily, tokBadgeAwards, type BadgeFamily } from './tokBadges';
import { fieldBadgeContent } from './fieldBadges';
import { oraclePressContent } from './oraclePress';

export const BADGE_WORK: Record<BadgeFamily, {
  title: string;
  introduction: string;
  action: string;
  result: string;
}> = {
  pillars: {
    title: 'The case with two glass faces',
    introduction: 'A wide case came back from the workshop. There is space for the result on one side and the check on the other.',
    action: 'Open both faces and leave the check reachable.',
    result: 'From the east you can read what a keeper found. The west side holds the check that let the keeper say it.',
  },
  realms: {
    title: 'The folding wall map',
    introduction: 'One corner of the map has a bare peg. A source trail and a repeated measurement need different marks to fit it.',
    action: 'Unfold the source trail beside the repeated reading.',
    result: 'Two working routes now share a starting place. One follows dated receipts. The other repeats a reading from the same spot.',
  },
  toolkit: {
    title: 'The next keeper’s loose work card',
    introduction: 'Your last bench had enough tools. The next keeper has only one clip and one reading rail.',
    action: 'Fit a recheck slip on the rail within reach.',
    result: 'The keeper picks the clip up and repeats the check without moving the first record.',
  },
  oracle: {
    title: 'A second clip for the press notice',
    introduction: 'Yesterday the press sheet covered the reader’s account. The two should stay close without taking each other’s place.',
    action: 'Fit a separate keeper’s clip beside the pressed copy.',
    result: 'The press puts a call on the left. A keeper can write where the source stops on the right.',
  },
  record: {
    title: 'The chalk board and its return leaf',
    introduction: 'The earlier line is still legible on the chalk board. A clipped leaf can show the change at the same place.',
    action: 'Clip the revision above the first wording.',
    result: 'The two lines stay in order. A reader can see what was assumed first and what the second visit changed.',
  },
  fellowship: {
    title: 'The visitors’ bench key',
    introduction: 'The spare bench is close enough to the hall for a new runner to ask a question. The file carriers have its key.',
    action: 'Open the side passage and leave room on the bench.',
    result: 'The open passage gives the next carrier a second way to the table. There is also space for a waiting reader.',
  },
  paths: {
    title: 'The carrier’s return grate',
    introduction: 'One lane fits a loaded crate. There is room for a person to take the old return without taking that lane.',
    action: 'Raise the return grate for people on foot.',
    result: 'The crate lane stays clear. The foot lane now leads straight back to the entrance.',
  },
  legend: {
    title: 'The lantern on the closing table',
    introduction: 'The final lantern casts one pool of light on several separate records. Each still has its own name.',
    action: 'Light the closing table and open the shared record.',
    result: 'The lantern keeps the late record open for the next reader. Its sources are still clipped separately.',
  },
};

export const BADGE_ANNEX_PREFIX = 'badge-annex:';

const stations: DialogueNode[] = BADGE_FAMILIES.flatMap(({ id }) => {
  const work = BADGE_WORK[id];
  return [
    { id: `badge-room.${id}`, speaker: 'badge-keeper', historicalLabel: 'fictional-world', text: work.introduction,
      options: [{ text: work.action, if: { all: [badgeFamilyReady(id), { not: selectedFamily(id) }] },
        effects: [{ setFlag: `badge-room.${id}.used`, value: true }] }] },
    { id: `badge-room.${id}.done`, speaker: 'badge-keeper', historicalLabel: 'fictional-world', text: work.result },
  ];
});

export const tokBadgeContent = {
  ...oraclePressContent,
  awards: [...tokBadgeAwards.awards, ...fieldBadgeContent.awards],
  items: fieldBadgeContent.items,
  missions: [...oraclePressContent.missions, ...fieldBadgeContent.missions],
  hints: [...oraclePressContent.hints, ...fieldBadgeContent.hints],
  characters: [...oraclePressContent.characters,
    { id: 'badge-keeper', name: 'Brenna Reedfast', mode: 'fictional', role: 'Looks after the work remembered in the Badge Annex', sprite: 'villager-1',
      talk: [{ node: 'badge-room.brenna' }] }],
  dialogue: [...oraclePressContent.dialogue, ...fieldBadgeContent.dialogue, ...stations,
    { id: 'badge-room.brenna', speaker: 'badge-keeper', historicalLabel: 'fictional-world',
      text: 'The tokens here are for things people did. Find your deed in the cabinet. Its tool has another job waiting if you feel like lending a hand.' }],
} satisfies Partial<ContentPack>;
