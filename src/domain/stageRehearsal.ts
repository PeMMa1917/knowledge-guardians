/** One fictional scene staged in two orders. Only the middle beats move. */
export const STAGE_CUES = ['pause', 'move'] as const;
export type StageCue = typeof STAGE_CUES[number];

const cueBeats = {
  opening: { kind: 'line', text: 'Keeper: “Leave it by the door.”' },
  pause: { kind: 'pause', text: 'Silence.' },
  move: { kind: 'move', text: 'The keeper moves the crate beside the doorway.' },
  ending: { kind: 'line', text: 'Worker: “I can wait.”' },
} as const;

export function stageRehearsal(cue: string) {
  if (cue !== 'pause' && cue !== 'move') throw new Error('That cue order does not belong to this rehearsal.');
  return [cueBeats.opening, cueBeats[cue], cueBeats[cue === 'pause' ? 'move' : 'pause'], cueBeats.ending];
}
