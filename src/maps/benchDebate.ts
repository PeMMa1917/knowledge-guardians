import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const prefix = 'bench.debate.';
const ready: Condition = { flag: prefix + 'started', eq: true };
const compared: Condition = { objective: prefix + 'compare' };
const first: Condition = { flagSet: prefix + 'first' };
const restated: Condition = { flag: prefix + 'restated', eq: true };
const heard: Condition = { objective: prefix + 'exchange' };
const minute: Condition = { objective: prefix + 'minute' };
const local: Condition = { objective: prefix + 'civic.proof' };
const mounted: Condition = { flag: prefix + 'civic.mounted', eq: true };
const used: Condition = { objective: prefix + 'civic.used' };
const mode = (value: string): Condition => ({ flag: prefix + 'decision', eq: value });

function station(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `bench-debate-${id}`, kind: 'scene', node: prefix + node, x, y, w: 1, h: 1, label,
    art: `bench-debate.${art}`, walkThrough: true, visibleIf };
}

export const METAL_DEBATE_DOOR: Interactable = {
  id: 'bench-debate-entry', kind: 'door', x: 21, y: 9, w: 1, h: 1, label: 'the passage to the bench meeting',
  art: 'metalworks.waypost', to: { map: 'metalworks.bench-meeting', x: 10, y: 12 }, visibleIf: { objective: 'metal.finish' },
};

export const METAL_BENCH_MEETING: MapDef = {
  id: 'metalworks.bench-meeting', name: 'Metalworks: Bench Meeting', world: 'WORLD-07',
  width: 21, height: 15, music: 'music.town', ambience: 'study', background: 0x37343e,
  floor: (x, y) => {
    if (x < 1 || x > 19 || y < 0 || y >= 15) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : x >= 7 && x <= 13 ? 'stone-c' : 'voices-slate';
  },
  blocks: [[1, 0, 19, 3]], zones: [], spawn: { x: 10, y: 12 }, npcs: [],
  stamps: [
    { stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 14, y: 1 },
    { stamp: 'bookshelf', x: 3, y: 3 }, { stamp: 'plant-tall', x: 18, y: 4 },
    { stamp: 'bench', x: 3, y: 12 }, { stamp: 'bench', x: 15, y: 12 },
  ],
  interactables: [
    { id: 'bench-debate-return', kind: 'door', x: 10, y: 14, w: 1, h: 1, label: 'the way back to the trade hall',
      art: 'preserved.door', to: { map: 'metalworks.records', x: 21, y: 10 } },
    station('open', 'open', 10, 12, 'Bea and the shared bench docket', 'docket', { not: ready }),
    { ...station('repair-record', 'record.repair', 4, 8, 'the signed repair record at the fitter’s table', 'paper', ready),
      artOpen: { key: 'bench-debate.checked', if: { flag: prefix + 'repair', eq: true } } },
    { ...station('arrival', 'record.arrival', 16, 8, 'Ressa at the return slot', 'slot', ready),
      artOpen: { key: 'bench-debate.checked', if: { flag: prefix + 'arrival', eq: true } } },
    { ...station('trial', 'trial', 10, 5, 'the model bench with two bell marks', 'trial', ready),
      artBy: { flag: prefix + 'lastTrial', keys: { whole: 'bench-debate.whole', split: 'bench-debate.split' } } },
    { ...station('first', 'first', 7, 10, 'the first stand for the proposed turn', 'docket', compared),
      artBy: { flag: prefix + 'first', keys: { whole: 'bench-debate.whole', split: 'bench-debate.split' } } },
    { ...station('other', 'other', 13, 10, 'the stand where the other speaker was sitting', 'slot', first),
      artOpen: { key: 'bench-debate.checked', if: restated } },
    station('listeners', 'listeners', 17, 11, 'Bea and Ressa waiting to repeat the proposal', 'slot',
      { all: [restated, { not: { flagSet: prefix + 'listener' } }] }),
    station('draft', 'draft', 10, 8, 'both cases and the listener’s line in the draft tray', 'paper',
      { all: [heard, { not: { flag: prefix + 'decision', in: ['whole', 'split'] } }] }),
    ...(['whole', 'split'] as const).flatMap((choice) => [
      station(`sign-${choice}`, `sign.${choice}`, 10, 8, 'the revised minute with a space for signatures', choice, { all: [mode(choice), { not: minute }] }),
      station(`kept-${choice}`, `kept.${choice}`, 10, 8, 'the signed minute beside the retained request', `minute-${choice}`, { all: [mode(choice), minute] }),
    ]),
  ],
  lights: [{ x: 10, y: 6, r: 62, color: 0xf0ce97 }, { x: 7, y: 10, r: 57, color: 0xdec2a6 }, { x: 16, y: 9, r: 58, color: 0xbcd6cf }],
};

const atSteps: Condition = { all: [{ objective: 'civic.arrival' }, { item: 'item.bench-debate-minute' }] };
export const CIVIC_BENCH_DEBATE: Interactable[] = [
  { ...station('civic-test', 'civic.test', 12, 10, 'Lin’s two-slot practice rack and the carried minute', 'trial', atSteps),
    artOpen: { key: 'bench-debate.checked', if: local } },
  ...([
    ['whole', 9, 10, 'the reserved desk for the full tracing job'],
    ['split', 23, 13, 'the two short turns beside the steps'],
  ] as const).flatMap(([choice, x, y, label]) => {
    const present: Condition = { all: [atSteps, local, mode(choice)] };
    return [
      station(`civic-fit-${choice}`, `civic.fit.${choice}`, x, y, label, 'slot', { all: [present, { not: mounted }] }),
      station(`civic-read-${choice}`, `civic.read.${choice}`, x, y, label, choice, { all: [present, mounted, { not: used }] }),
      station(`civic-kept-${choice}`, `civic.kept.${choice}`, x, y, label, `minute-${choice}`, { all: [present, used] }),
    ];
  }),
];
