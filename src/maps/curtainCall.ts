import { CURTAIN_PREFIX, CURTAIN_REWARD, callFlag, callReady } from '../content/curtainCall';
import type { CallStation } from '../domain/curtainCall';
import type { Condition } from '../domain/types';
import type { MapDef, Interactable } from './types';

const neg = (condition: Condition): Condition => ({ not: condition });
const after = (name: string): Condition => ({ flagSet: 'curtain.' + name });

function trial(station: CallStation, x: number, y: number, label: string, extra?: Condition): Interactable {
  return {
    id: `curtain-call-${station}`, kind: 'fieldgame', game: CURTAIN_PREFIX + station, x, y, w: 1, h: 1,
    label, art: station === 'open' || station === 'marks' ? 'plumb-mark' : 'preserved.folder', walkThrough: true,
    visibleIf: extra ? { all: [callReady(station), extra] } : callReady(station),
  };
}

export const EARLY_CURTAIN_NPC: MapDef['npcs'][number] = { id: 'curtain-ethren', x: 10, y: 19, facing: 'up' };

export const EARLY_CURTAIN_PROPS: Interactable[] = [
  {
    id: 'curtain-call-striker', kind: 'sign', x: 10, y: 18, w: 1, h: 1, label: 'Ethren’s fixed striker',
    text: 'Three pegs hold the same striker pace. The open rail and the curtained side each stop two slate marks from here.',
    art: 'plumb-mark', walkThrough: true,
  },
  trial('open', 12, 18, 'the listening mark at the open rail', neg(callFlag('layout', 'marks'))),
  trial('curtain', 8, 18, 'the listening mark behind the swaying curtain', neg(callFlag('layout', 'felt'))),
  ...(['marks', 'felt'] as const).flatMap((mode, i): Interactable[] => {
    const x = i === 0 ? 12 : 8;
    const end = { id: `curtain-end-${mode}`, x, y: 18, w: 1, h: 1, walkThrough: true,
      label: mode === 'marks' ? 'the three visible ticks at the rail' : 'the padded latch and the quiet stop',
      art: mode === 'marks' ? 'preserved.display-paired' : 'preserved.display-records',
    };
    return [
      { ...end, kind: 'scene', node: `curtain.read.${mode}`, visibleIf: { all: [callFlag('layout', mode), neg(after('read'))] } },
      { ...end, id: `curtain-fitted-${mode}`, kind: 'sign', visibleIf: callFlag('read', mode),
        text: mode === 'marks' ? 'The caller’s count is visible. The latch still clicks behind the curtain.'
          : 'The padded latch closes softly. Ethren sends the same three taps from his unchanged striking mark.' },
      { ...end, id: `curtain-gift-${mode}`, x: i === 0 ? 13 : 9, y: 19,
        label: 'Ethren’s little thank-you chest', kind: 'scene', node: `curtain.gift.${mode}`, art: 'survey-box',
        visibleIf: { all: [callFlag('read', mode), neg(after('gift'))] } },
    ];
  }),
];

export const WORKMEN_CURTAIN_PROPS: Interactable[] = [
  trial('marks', 20, 10, 'the fixed-work pace rail and the tick-board'),
  trial('felt', 22, 11, 'the small practice latch and its felt slot'),
  ...(['marks', 'felt'] as const).map((mode): Interactable => ({
    id: `curtain-workmen-${mode}`, kind: 'sign', x: 22, y: 10, w: 1, h: 1, walkThrough: true,
    label: 'Leila’s checked handover', art: CURTAIN_REWARD[mode].art, visibleIf: callFlag('nile', mode),
    text: mode === 'marks' ? 'The woodworkers touch the rail to count their own pause. Visitors can follow the raised marks. Both counts refer to the same call.'
      : 'Leila kept the workshop’s familiar call and padded the later latch. The three taps now carry to the side where the new keeper stands.',
  })),
];
