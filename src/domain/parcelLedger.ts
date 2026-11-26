import { pellOpens } from './fairgames';

export const DRAWERS = ['Reed', 'Shell', 'Wing'] as const;
export type DrawerRule = 'keeper' | 'spring';

/** All six equally weighted slips: three possible seal positions, two opening priorities.
 * Keeping the exposed seal in the tally lets readers see which trials left the comparison. */
export function pullParcelRack(pinned: number, rule: DrawerRule) {
  let keep = 0, move = 0, exposed = 0;
  for (let seal = 0; seal < DRAWERS.length; seal++) {
    for (const priority of [0, 0.5]) {
      const opened = pellOpens(seal, pinned, rule === 'keeper', () => priority);
      if (opened === seal) exposed++;
      else if (pinned === seal) keep++;
      else move++;
    }
  }
  return { keep, move, exposed };
}

export const CLAIM_ROLLS = [
  ['Reed', 'Moon', 'Shell', 'Moon', 'Wing', 'Flint'],
  ['Reed', 'Flint', 'Wing', 'Reed', 'Moon', 'Ash'],
] as const;

/** Index zero is Lella's own tag. A pair is a lead for reopening a claim. */
export function matchParcelTags(tags: readonly string[], wholeRoll: boolean): [number, number][] {
  const matches: [number, number][] = [];
  for (let first = 0; first < (wholeRoll ? tags.length : 1); first++) {
    for (let next = first + 1; next < tags.length; next++) {
      if (tags[first] === tags[next]) matches.push([first, next]);
    }
  }
  return matches;
}

export const PARCEL_REPLY = {
  token: {
    label: 'Leave two unmarked turn tokens',
    text: 'A runner takes one token in each hand, then slips the spare under the door. The second claimant can come back without giving a name in the queue. Someone will still have to match the two halves.',
    journal: 'I slipped two plain turn tokens into the return slot. A runner doubled back to pass one under the door. I still do not know which bundle was hers.',
  },
  desk: {
    label: 'Set a chair beside Omrin',
    text: 'Omrin turns the chair sideways, out of earshot. Two runners describe the torn wrapping in turn. Others wait on the stair. Lella brings a second lamp and stays for the last person.',
    journal: 'I set a chair sideways beside Omrin. We heard two accounts of the torn wrapper. The stairs filled while we listened. Lella stayed to light the last runner home.',
  },
} as const;
