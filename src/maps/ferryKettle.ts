import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const active: Condition = { flag: 'kettle.active', eq: true };
const card: Condition = { item: 'item.kettle.service-card' };

const service = [
  ['busy-whole', 'the four collected cups and two empty early rings', 'preserved.slip',
    'Second bell. One heat gave six servings. Four cups went to the bench. The first-bell crew is already afloat. Two servings remain at the landing.'],
  ['busy-split', 'the used early rail and four bench cups', 'preserved.display-paired',
    'First bell: two cups went to the boat. Second bell: four cups went to the bench. Two heats used the same six measures. Enna needed a second turn at the hearth.'],
  ['steady-whole', 'the full second-bell serving bench', 'ledger',
    'All six reached the bench at the second bell. One heat filled the six cups together. No cups had to wait.'],
  ['steady-split', 'the early cups waiting beside the bench cups', 'preserved.display-paired',
    'All six reached the bench at the second bell. The two cups on the rail had been cooling since the first. The rest came from a second heat.'],
] as const;

export const FERRY_KETTLE: Interactable[] = [
  { id: 'ferry-kettle-trial', kind: 'scene', node: 'ferry.kettle.trial', x: 3, y: 5, w: 1, h: 1, walkThrough: true,
    label: 'Enna’s trial kettle and six cup rings', art: 'ferry-slate', visibleIf: active, sfx: 'sfx.metal' },
  ...service.map(([result, label, art, text]): Interactable => ({
    id: 'ferry-kettle-' + result, kind: 'sign', x: 5, y: 6, w: 1, h: 1, walkThrough: true,
    label, art, text, flag: 'kettle.checked', visibleIf: { flag: 'kettle.served', eq: result },
  })),
];

const unplaced: Condition = { not: { flagSet: 'market.kettle.layout' } };

export const MARKET_KETTLE: Interactable[] = [
  { id: 'market-kettle-card', kind: 'scene', node: 'market.kettle.source', x: 5, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the covered table and its four-cup carrier', art: 'ledger',
    visibleIf: { all: [card, { not: { objective: 'market.kettle.compare' } }] } },
  { id: 'market-kettle-plan', kind: 'scene', node: 'market.kettle.place', x: 5, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the forked tally atop the covered table', art: 'preserved.display-paired',
    visibleIf: { all: [{ objective: 'market.kettle.compare' }, unplaced] } },
  { id: 'market-kettle-fold', kind: 'sign', x: 9, y: 11, w: 1, h: 1, walkThrough: true,
    label: 'the carrier’s returned fold with two counts', art: 'preserved.folder',
    text: 'Ready: six. Received: four. A second carrier cannot see the count until this fold returns, but the first brings a signed entry for what was actually received.',
    flag: 'market.kettle.readback', visibleIf: { flag: 'market.kettle.layout', eq: 'fold' } },
  { id: 'market-kettle-table', kind: 'sign', x: 5, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the two marked spaces at the covered table', art: 'preserved.display-paired',
    text: 'Six cups began on this table. Four went with the first carrier. The two still here have their own marks. A second carrier can find them while the first is on the lane.',
    flag: 'market.kettle.readback', visibleIf: { flag: 'market.kettle.layout', eq: 'table' } },
];
