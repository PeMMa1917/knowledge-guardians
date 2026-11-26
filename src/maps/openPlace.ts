import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const scope = 'open.place.';
const civic: Condition = { objective: 'civic.finish' };
const objective = (name: string): Condition => ({ objective: scope + name });
const flag = (name: string, eq: boolean | string = true): Condition => ({ flag: scope + name, eq });
const ready = (...all: Condition[]): Condition => ({ all });
const unset = (name: string): Condition => ({ not: { flagSet: scope + name } });
const route = (mode: string): Condition => flag('plan', mode);

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `open-place-${name}`, kind: 'scene', node: scope + name, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function sign(name: string, x: number, y: number, label: string, text: string, art: string, visibleIf: Condition): Interactable {
  return { id: `open-place-${name}`, kind: 'sign', x, y, w: 1, h: 1, label, text, art, visibleIf, walkThrough: true };
}

export const OPEN_PLACE_DISPATCH = [
  scene('draft', 11, 12, 'Ade’s first-bell practice invitation', 'preserved.slip', ready(civic, unset('trial'))),
  scene('retime', 11, 12, 'the two clips above the first-bell invitation', 'civic.ledger',
    ready(civic, flag('blythe'), flag('ione'), flag('shift'), unset('retime'))),
  scene('file', 11, 12, 'the folder with both attendance lines', 'preserved.folder',
    ready(flag('blythe.late'), flag('ione.late'), unset('file'))),
  sign('docket', 11, 12, 'the checked attendance lines and dissent', 'One signed place at the first call. Two checked replies at the second call. Ione’s signed correction request stays on its own slip.',
    'preserved.display-paired', flag('file')),
];

export const OPEN_PLACE_STEPS_ACTORS: MapDef['npcs'] = [
  { id: 'open-place-blythe', x: 10, y: 11, facing: 'down', visibleIf: ready(flag('trial'), unset('plan')) },
  { id: 'open-place-ione', x: 12, y: 11, facing: 'left', visibleIf: ready(flag('retime'), unset('plan')) },
];
export const OPEN_PLACE_STEPS = [
  scene('empty', 9, 12, 'the still-folded invitation by the empty place', 'preserved.slip', ready(flag('trial'), unset('empty'))),
  sign('first-attendance', 9, 12, 'the first-bell record left beside the bench',
    'Blythe’s place has a signed stub. The canal place is marked invited and absent.',
    'civic.ledger', flag('empty')),
  scene('return.hearing', 10, 13, 'the returned open minute at North Steps', 'preserved.display-paired',
    ready(flag('posted', 'hearing'), unset('returned'))),
  sign('hearing-return', 10, 13, 'the open minute and its return slip',
    'Ione’s objection is still here. An extra slip points to the next public question. The printer has its own dated draft line.',
    'preserved.display-paired', flag('returned', 'hearing')),
];

export const OPEN_PLACE_CANAL_ACTORS: MapDef['npcs'] = [
  { id: 'open-place-ione', x: 17, y: 9, facing: 'left', visibleIf: ready(objective('miss'), unset('retime')) },
];
export const OPEN_PLACE_CANAL = [
  scene('shift', 18, 9, 'the two signed marks on the key handover slip', 'civic.ledger',
    ready(objective('miss'), unset('shift'))),
  sign('shift-record', 18, 9, 'the checked key handover at Canal Walk',
    'Ione held the keys until the second bell. The relief keeper’s signature comes after the handover.',
    'civic.ledger', flag('shift')),
  scene('return.written', 19, 10, 'the received-at stamp beside the canal witness reply slot', 'preserved.folder',
    ready(flag('posted', 'written'), unset('returned'))),
  sign('written-return', 19, 10, 'the marked witness reply slot and the dated receipt',
    'Ione’s approved words stay visible. The signed witness reply has a numbered receipt for Edvin’s next turn.',
    'preserved.display-paired', flag('returned', 'written')),
];

export const OPEN_PLACE_COUNCIL_ACTORS: MapDef['npcs'] = [
  { id: 'open-place-blythe', x: 15, y: 14, facing: 'left', visibleIf: route('hearing') },
  { id: 'open-place-ione', x: 17, y: 14, facing: 'left', visibleIf: route('hearing') },
  { id: 'open-place-edvin', x: 11, y: 9, facing: 'down', visibleIf: route('written') },
];
export const OPEN_PLACE_COUNCIL_INTAKE =
  scene('intake', 22, 10, 'the docket intake outside the Letter Gallery', 'preserved.folder',
    ready({ objective: 'council.arrival' }, { item: 'item.open-place-docket' }, unset('plan')));

export const OPEN_PLACE_COUNCIL = [
  scene('post.hearing', 14, 16, 'the open minutes beside the second-bell seats', 'council.record',
    ready(route('hearing'), flag('heard.blythe'), flag('heard.ione'), unset('posted'))),
  sign('open-minute', 14, 16, 'the minute with two named speaking turns',
    'One line keeps Blythe’s printing reply. Another keeps Ione’s dissent and the still-open correction time.',
    'council.record', flag('posted', 'hearing')),
  scene('post.written', 13, 9, 'the witness pocket and next reply time', 'council.letter',
    ready(route('written'), flag('seal'), unset('posted'))),
  sign('witness-pocket', 13, 9, 'the signed reply time at the witness desk',
    'The approved dissent appears above a separate place for the next written question. Other crew names stay under the flap.',
    'council.letter', flag('posted', 'written')),
];
