/**
 * The Ballad of the Guardian (the 150-elements list: bards sing slightly exaggerated songs about the
 * player's deeds; earned reputation). Wynn the ballad-singer, in Emberford, makes a song from what the
 * player really did (flags). Every verse comes out TALLER than the truth, because a song is made to
 * be sung again. The player can correct a verse or let it stand. A true verse is less catchy; a tall
 * verse spreads. TOK: testimony grows each time it is retold; fame is not evidence.
 * Flags: `ballad.<verse>` = 'true' | 'tall'. Fictional people only. Pure data, no DOM.
 */
import type { CampaignState, Condition } from './types';
import { check } from './rules';
import { crossingWay } from './crossings';

export interface Verse { id: string; if: Condition; tall: string; true: (s: CampaignState) => string; crowd: string }

export const VERSES: Verse[] = [
  { id: 'lamps', if: { num: 'lamps.lit', gte: 1 },
    tall: 'They lit a hundred lamps with a single breath, and the dark ran off in fright!',
    true: (s) => `They lit ${Number(s.flags['lamps.lit'] ?? 0)} lamps, and every one took a whole town working it out.`,
    crowd: "The crowd stamps along to the hundred lamps. With the true count, a child asks, 'Only that many?' and an old man says, 'That many is a lot, if they are real.'" },
  { id: 'corvan', if: { flagSet: 'sd.corvan.outcome' },
    tall: 'They struck the false blade in two with one word, and the cheat fled over the hill!',
    true: () => "They asked the trader where the blade came from, in front of everyone, and waited for the answer.",
    crowd: "Corvan, at the back, mutters: 'I did not flee. I walked. Briskly.'" },
  { id: 'archivist', if: { flag: 'undercroft.done', eq: true },
    tall: 'Down in the dark they slew the Hollow Archivist with a silver pen!',
    true: () => 'Down in the dark they named its errors, one by one, until the Archivist went quiet.',
    crowd: "A girl at the front looks disappointed about the silver pen, and then interested in the naming." },
  { id: 'lamb', if: { flagSet: 'cross.lamb' },
    tall: 'They leapt into the roaring flood and carried a lamb through the waves!',
    true: (s) => (crossingWay(s.flags, 'lamb')?.id === 'post' ? 'They read the flood post twice, saw the water fall, and waited with a worried boy.'
      : crossingWay(s.flags, 'lamb')?.id === 'punt' ? 'They paid the ferry cook two marks to pole out a punt. The cook got wet boots.'
      : 'They walked past a lamb on a stone. The lamb swam back by itself, cross.'),
    crowd: "Hollis, the lamb's owner, shouts: 'That is not what happened!' It is not clear which version he means." },
  { id: 'prophecy', if: { flagSet: 'cross.lintel' },
    tall: 'The prophecy foretold them: the one from outside, chosen to light the dark!',
    true: (s) => (crossingWay(s.flags, 'lintel')?.id === 'believe' ? 'An old motto over an arch, and they let people think it was about them.'
      : 'An old motto over an arch. Nobody chose them. They chose the work.'),
    crowd: 'The chosen-one verse gets the biggest cheer. The true one gets a thoughtful silence, which Wynn says is worse for business.' },
  { id: 'harrowmere', if: { flagSet: 'ending.council' },
    tall: 'They brought the rival to their knees before the whole Council!',
    true: (s) => ({ correct: 'They changed the oldest label in the Nexus, in public, and said who had signed it.', recruit: 'They asked the rival to come back and help, and the rival said yes.', expose: 'They showed the Council what the rival sold, with the evidence on the table.', both: 'They corrected the old label and asked the rival to help check the new ones.' } as Record<string, string>)[String(s.flags['ending.council'])] ?? 'They stood in front of the Council and said what the evidence showed.',
    crowd: 'Nobody in Emberford knows what really happened at the Council, so the tall verse is all they have. Unless you tell them.' },
];

export const versesFor = (s: CampaignState): Verse[] => VERSES.filter((v) => check(v.if, s));

/** The reputation the song gives you, from how you set the verses. */
export function balladName(flags: Record<string, unknown>): string | null {
  const set = VERSES.map((v) => flags[`ballad.${v.id}`]).filter((x) => x === 'true' || x === 'tall');
  if (set.length < 2) return null;
  const t = set.filter((x) => x === 'true').length;
  if (t === set.length) return 'the Plain-Sung';
  if (t === 0) return 'of the Tall Tales';
  return 'the Half-Sung';
}
