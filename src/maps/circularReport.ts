import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const scope = 'ember.circle.';
const flag = (name: string, eq: string | boolean = true): Condition => ({ flag: scope + name, eq });
const unset = (name: string): Condition => ({ not: { flagSet: scope + name } });
const ready = (...all: Condition[]): Condition => ({ all });
const packet: Condition = { item: 'item.ember.circle-packet' };

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `circlereport-${name}`, kind: 'scene', node: scope + name, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function receiver(channel: 'runner' | 'record', x: number, y: number, label: string): Interactable {
  return scene(`receive.${channel}`, x, y, label, 'preserved.folder', ready(packet, flag('choice', channel), unset('placed')));
}

function result(channel: 'runner' | 'record', x: number, y: number, label: string, text: string): Interactable {
  return { id: `circlereport-result.${channel}`, kind: 'sign', x, y, w: 1, h: 1, label, text,
    visibleIf: flag('placed', channel), art: 'preserved.display-paired', walkThrough: true };
}

export const CIRCULAR_REPORT_EMBERFORD = [
  scene('stall', 21, 14, 'the stall notice with a chipped letter', 'notice-board', { objective: 'm02.o1.arrive' }),
  scene('tea', 17, 17, 'the second slip beside the tea table', 'copies.strip', flag('stall')),
  scene('ledger', 13, 12, 'the printer’s issue book and its first loose note', 'civic.ledger', ready(flag('stall'), flag('tea'))),
  scene('witness', 31, 21, 'Havra’s signed slip and the lookout mark', 'preserved.slip', flag('stall')),
  scene('prepare', 14, 15, 'the clips for a new post beside the tea bench', 'preserved.folder',
    ready({ objective: scope + 'trace' }, unset('choice'))),
  receiver('runner', 30, 19, 'Kip’s upper-landing parcel hook'),
  result('runner', 30, 19, 'the waiting parcel and second-bell note',
    'One parcel waits at the upper hook. Havra’s signed sighting covers the second bell. Kip will ask for a fresh check before carrying it across.'),
  receiver('record', 11, 14, 'Venn’s dated rack for source trails'),
  result('record', 11, 14, 'the source trail beside a blank check line',
    'The first stall note, the tea copy and the replacement stay in dated order. One original report. The fresh observation line for the lower landing stays blank.'),
];
