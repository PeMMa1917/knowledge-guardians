import type { CampaignState, Effect } from './types';

const SLOT = 'passage.carry';
export const PASSAGE_STOPS = ['lower', 'upper'] as const;
export const PASSAGE_LEAVES = ['view', 'record'] as const;
export type PassageStop = typeof PASSAGE_STOPS[number];
export type PassageLeaf = typeof PASSAGE_LEAVES[number];
type Flags = CampaignState['flags'];

type PassageAction =
  | { type: 'inspect'; leaf: PassageLeaf }
  | { type: 'carry'; stop: PassageStop }
  | { type: 'unpack' }
  | { type: 'seat'; stop: PassageStop }
  | { type: 'leave'; stop: PassageStop };

export const passageKey = (slug: string) => `passage.${slug}`;
export const passageDone = (slug: string) => `${passageKey(slug)}.left`;

export function heldPassage(flags: Flags) {
  const payload = flags[SLOT];
  if (typeof payload !== 'string') return null;
  const [slug, packedStop, phase] = payload.split(':');
  const stop = PASSAGE_STOPS.find((candidate) => candidate === packedStop);
  if (!stop || flags[passageDone(slug)] || (phase !== 'carried' && phase !== 'seated')) return null;
  return { slug, stop, phase };
}

export function passageReady(slug: string, flags: Flags) {
  return PASSAGE_LEAVES.every((leaf) => flags[`${passageKey(slug)}.${leaf}`] === true);
}

export function passageMove(slug: string, flags: Flags, move: PassageAction): Extract<Effect, { setFlag: string }> | null {
  if (flags[passageDone(slug)]) return null;
  const active = heldPassage(flags);
  switch (move.type) {
    case 'inspect':
      return active ? null : { setFlag: `${passageKey(slug)}.${move.leaf}`, value: true };
    case 'carry':
      return active || !passageReady(slug, flags) ? null : { setFlag: SLOT, value: `${slug}:${move.stop}:carried` };
    case 'unpack':
      return active?.slug !== slug || active.phase !== 'carried' ? null : { setFlag: SLOT, value: false };
    case 'seat':
      return active?.slug !== slug || active.stop !== move.stop || active.phase !== 'carried' ? null
        : { setFlag: SLOT, value: `${slug}:${move.stop}:seated` };
    case 'leave':
      return active?.slug !== slug || active.stop !== move.stop || active.phase !== 'seated' ? null
        : { setFlag: passageDone(slug), value: move.stop };
  }
}
