import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const flag = (key: string, eq: string | boolean = true): Condition => ({ flag: 'corner.' + key, eq });
const ready: Condition = { objective: 'corner.compare' };
const unset = (key: string): Condition => ({ not: { flagSet: 'corner.' + key } });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const found = flag('found');
const setup = all(found, { not: ready });

const display = { x: 5, y: 7, w: 1, h: 1, walkThrough: true };
const roomArt = (name: string) => 'corner.' + name;

function scene(id: string, label: string, node: string, art: string, visibleIf: Condition,
  x = display.x, y = display.y): Interactable {
  return { ...display, x, y, id: 'fourth-corner-' + id, kind: 'scene', label,
    node: 'corner.' + node, art: roomArt(art), visibleIf };
}

export const NEXUS_FOURTH_CORNER: Interactable[] = [
  scene('frame', 'the blue hanging with a loose hem', 'frame', 'old', unset('found')),
  scene('inserts', 'the two inserts under the hanging', 'try', 'old', all(setup, unset('preview'))),
  scene('repeat-preview', 'the diamond on the turned insert', 'try', 'repeat', all(setup, flag('preview', 'repeat'))),
  scene('cut-preview', 'the clipped insert and its cord gap', 'try', 'cut', all(setup, flag('preview', 'cut'))),
  scene('order', 'the dated repair tab on shelf 43', 'order', 'order', found, 8, 9),
  scene('review', 'the hanging ready for its display bay', 'choose', 'review', all(ready, unset('layout'))),
  {
    ...display, id: 'fourth-corner-hung-repeat', kind: 'sign', label: 'the conjectural repeat on its own tracing',
    art: roomArt('repeat'), visibleIf: flag('layout', 'repeat'),
    text: 'The dashed diamond belongs to the tracing. The dated order has its own tab below the old hanging.',
  },
  {
    ...display, id: 'fourth-corner-hung-gap', kind: 'sign', label: 'the dated repair beside the open corner',
    art: roomArt('cut'), visibleIf: flag('layout', 'gap'),
    text: 'The old edge and inner stitches stay separate. The empty corner is reachable from the stitch shelf.',
  },
  scene('cutting-rail', 'Aro’s cutting rail with the full tracing', 'aro', 'rail', all(flag('layout', 'repeat'), unset('checked')), 4, 10),
  scene('stitch-shelf', 'Junel’s working shelf by the cord', 'junel', 'stitch', all(flag('layout', 'gap'), unset('checked')), 5, 13),
  {
    ...display, x: 4, y: 10, id: 'fourth-corner-rehearsal-cloth', kind: 'sign', label: 'the new rehearsal cloth',
    art: roomArt('cloth'), visibleIf: flag('checked', 'repeat'),
    text: 'The new cloth can be taken straight to rehearsal. Its trial corner follows the three old diamonds. The tracing still shows which corner was inferred.',
  },
  {
    ...display, x: 5, y: 13, id: 'fourth-corner-liftable-sample', kind: 'sign', label: 'the working cord and removable sample',
    art: roomArt('sample'), visibleIf: flag('checked', 'gap'),
    text: 'A second pair of hands can lift the sample and still pull the cord. The older holes are open for the next inspection.',
  },
];
