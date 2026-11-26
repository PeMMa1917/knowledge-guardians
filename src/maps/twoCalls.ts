import type { Condition } from '../domain/types';
import type { CallReissue } from '../domain/twoCalls';
import type { Interactable } from './types';

const scope = 'copies.twocalls.';
const available: Condition = { all: [{ objective: 'copies.revise' }, { item: 'item.bench-debate-minute' }] };
const objective = (step: string): Condition => ({ objective: scope + step });
const flag = (step: string, eq: boolean | string): Condition => ({ flag: scope + step, eq });
const pending = (step: string): Condition => ({ not: { flagSet: scope + step } });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return {
    id: `two-calls-${id}`, kind: 'scene', node: scope + id, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true,
  };
}

function installed(id: string, x: number, y: number, label: string, text: string, condition: Condition): Interactable {
  return {
    id: `two-calls-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, text,
    art: 'preserved.display-paired', walkThrough: true, visibleIf: condition,
  };
}

const boards = {
  paired: {
    landing: 'The large board and the wider runner frame carry both directions. The dated trial has a small lookup slip that leads to the archive desk.',
    archive: 'The first proof, Mina’s changed approach, and the third reader’s lookup receipt lie in order. A reader can check the old trial as a separate item.',
  },
  staffed: {
    landing: 'Returns go inside from the main door. The moving runner carries the entry line. Mina’s dated pocket is at the main door for her current shift.',
    archive: 'The first proof, the changed route and Mina’s signed reply hang together. The new proof gives the clerk’s shift its own line.',
  },
} satisfies Record<CallReissue, { landing: string; archive: string }>;
const variants = ['paired', 'staffed'] as const;

export const TWO_CALLS_ARCHIVE = [
  scene('log', 20, 8, 'the signed minute beside the old trial log', 'preserved.folder', { all: [available, pending('log')] }),
  ...variants.flatMap((mode) => [
    scene(`reply.${mode}`, 20, 8, 'the new proof and its reader’s receipt', 'preserved.display-paired',
      { all: [flag('posted', mode), pending('read')] }),
    installed(`archive-${mode}`, 20, 8, 'the filed proofs of both calls', boards[mode].archive, flag('read', mode)),
  ]),
];

export const TWO_CALLS_PRESS: Interactable[] = [
  scene('press', 18, 7, 'Lark’s two holders on the type bench', 'copies.press', { all: [available, pending('press')] }),
  {
    id: 'two-calls-proof-board', kind: 'fieldgame', game: 'copies-two-calls',
    x: 19, y: 8, w: 1, h: 1, label: 'the paired trial at the type bench', art: 'copies.press', walkThrough: true,
    visibleIf: objective('sources'), artOpen: { key: 'preserved.display-paired', if: objective('adapt') },
  },
];

export const TWO_CALLS_LANDING = [
  scene('needs', 22, 8, 'the first call’s three separate requests', 'copies.strip', { all: [available, pending('needs')] }),
  scene('change', 22, 8, 'Mina’s check of the new approaches', 'preserved.folder', { all: [objective('proof'), pending('change')] }),
  ...variants.flatMap((mode) => [
    scene(`receive.${mode}`, 22, 8, 'the checked repair hanging on the handcart', 'copies.reprint',
      { all: [objective('adapt'), flag('plan', mode), pending('posted')] }),
    installed(`landing-${mode}`, 22, 8, 'the working notice for the later call', boards[mode].landing, flag('posted', mode)),
  ]),
];
