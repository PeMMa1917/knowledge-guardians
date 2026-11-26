import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const EMBER = 'lanternfair.emberford.';
const ISLAND = 'lanternfair.island.';
const LAYOUTS = ['ring', 'trail'] as const;
const ember = (key: string, eq: boolean | string = true): Condition => ({ flag: EMBER + key, eq });
const island = (key: string, eq: boolean | string = true): Condition => ({ flag: ISLAND + key, eq });
const arrived: Condition = { flag: 'reached.emberford', eq: true };
const finishedIslandPlan: Condition = { objective: 'island.log' };
const opened = island('open');

function scene(place: 'emberford' | 'island', id: string, node: string, x: number, y: number, label: string, art: string,
  visibleIf: Condition, sfx?: string): Interactable {
  return { id: `lanternfair-${place}-${id}`, kind: 'scene', node: `lanternfair.${place}.${node}`, x, y, w: 1, h: 1, label, art,
    visibleIf, walkThrough: true, sfx };
}

function marker(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id: `lanternfair-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const EMBERFORD_LANTERN_FAIR: Interactable[] = [
  scene('emberford', 'role', 'role', 17, 18, 'Hana’s Lantern Fair rack', 'lantern-stall', arrived),
  scene('emberford', 'draft', 'draft', 18, 17, 'the movable lantern stands', 'voices.lamp',
    { flagSet: EMBER + 'role' }),
  ...LAYOUTS.flatMap((layout) => {
    const draft = ember('draft', layout);
    const art = layout === 'ring' ? 'nile.lamp-above' : 'nile.lamp-side';
    return [
      scene('emberford', layout === 'ring' ? 'road' : 'road-trail', 'road.' + layout, 22, 24,
        'the Lantern Fair’s road peg', art,
        { all: [draft, { not: ember('road') }, { any: [ember('role', 'runner'), ember('bench')] }] }),
      scene('emberford', layout === 'ring' ? 'bench' : 'bench-trail', 'bench.' + layout, 14, 11,
        'the Lantern Fair’s last bench seat', art,
        { all: [draft, { not: ember('bench') }, { any: [ember('role', 'host'), ember('road')] }] }),
    ];
  }),
  scene('emberford', 'send', 'send', 19, 18, 'the dispatch board with two viewing slips', 'preserved.display-paired',
    { all: [ember('road'), ember('bench')] }),
  scene('emberford', 'toast-ring', 'toast.ring', 16, 16, 'the song bench in a circle of lights', 'nile.lamp-above',
    ember('plan', 'ring'), 'sfx.complete'),
  scene('emberford', 'toast-trail', 'toast.trail', 14, 13, 'the welcome cup at the end of the lamp trail', 'voices.lamp',
    ember('plan', 'trail'), 'sfx.metal'),
  marker('emberford-trail-bend', 23, 23, 'the trail lamp at the bend', 'voices.lamp',
    'This light is visible with the stall flap down. Follow it toward the song bench.', ember('plan', 'trail')),
];

const sourced: Condition = { flagSet: ISLAND + 'source' };
const readyToPlace: Condition = { all: [island('ramp'), island('listening'), { not: opened }] };

export const ISLAND_LANTERN_FAIR: Interactable[] = [
  scene('island', 'slip', 'slip', 9, 8, 'Joss’s Lantern Fair binder', 'ledger',
    { all: [finishedIslandPlan, { not: sourced }] }),
  ...([
    ['ring', 'Emberford’s ring sketch', 'The stall flap hid the lamp ring from the road, though the lamps lit every face at the bench. Check the wind screen and the seats here.'],
    ['trail', 'Emberford’s trail sketch', 'The last seat could see the welcome when the host turned the cup. Two lamps showed the bends from the road even with the flap down. Check where the Island path can carry an answer.'],
    ['local', 'the Island’s chalk sketch', 'The last fair left a sketch of the welcome. Joss has kept a clear strip for the ramp check and the rest of this crew’s route.'],
  ] as const).map(([key, label, text]) => marker(`island-binder-${key}`, 9, 8, label, 'island.card', text, island('source', key))),
  scene('island', 'ramp', 'ramp', 20, 13, 'the lantern stand beside the lower-ramp trial', 'island.landing',
    { all: [sourced, { not: island('ramp') }] }),
  scene('island', 'listening', 'listening', 20, 7, 'the crew’s listening flag between the shelter and the bend', 'island.signal',
    { all: [sourced, { not: island('listening') }] }),
  scene('island', 'board', 'board', 17, 8, 'the fair board with one helper’s peg', 'preserved.display-paired', readyToPlace),
  scene('island', 'open-ring', 'open.ring', 23, 7, 'the warm lantern ring at the shelter', 'nile.lamp-above',
    { all: [island('plan', 'ring'), { not: opened }] }),
  scene('island', 'open-trail', 'open.trail', 25, 8, 'the last landward trail lantern', 'voices.lamp',
    { all: [island('plan', 'trail'), { not: opened }] }),
  scene('island', 'toast-ring', 'toast.ring', 23, 7, 'the shared cup in the shelter', 'nile.lamp-above',
    { all: [island('plan', 'ring'), opened] }, 'sfx.complete'),
  scene('island', 'toast-trail', 'toast.trail', 25, 8, 'the answering cup at the dry wall', 'voices.lamp',
    { all: [island('plan', 'trail'), opened] }, 'sfx.metal'),
  marker('island-trail-turn', 23, 9, 'the landward fair turn', 'voices.lamp',
    'The lamp trail turns away from the dock before the wheel lane. Look for the answering cup at the end.', island('plan', 'trail')),
];
