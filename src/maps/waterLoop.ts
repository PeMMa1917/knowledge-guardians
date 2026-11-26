import { LOOP_GAUGES, LOOP_SITES, loopKey, type LoopGauge, type LoopService, type LoopSite } from '../domain/waterLoop';
import type { Interactable } from './types';

export type LoopStation = 'model' | LoopGauge;
const STATIONS = ['model', ...LOOP_GAUGES] as const;
const GAMES = LOOP_SITES.flatMap((site) => STATIONS.map((station) => ({ id: `water-loop-${site}-${station}`, site, station })));
export const waterLoopStation = (id: string) => GAMES.find((game) => game.id === id);

const LABELS: Record<LoopStation, string> = {
  model: 'the circulation model', basin: 'the basin storage staff', reuse: 'the return counter', spill: 'the spill tray',
};
const ART: Record<LoopStation, string> = {
  model: 'water-loop.course', basin: 'water.fields', reuse: 'water.channel', spill: 'preserved.slip',
};

function station(site: LoopSite, kind: LoopStation, x: number, y: number): Interactable {
  const id = `water-loop-${site}-${kind}`;
  const available = { objective: site === 'archive' ? 'coast.revise' : 'island.finish' };
  return { id, kind: 'fieldgame', game: id, x, y, w: 1, h: 1, label: LABELS[kind], art: ART[kind], walkThrough: true,
    visibleIf: kind === 'model' ? available : { all: [available, { flagSet: loopKey(site, 'trial') }] } };
}

export const ARCHIVE_WATER_LOOP: Interactable[] = [
  { id: 'water-loop-jewel-record', kind: 'exhibit', exhibit: 'OBJ-JEWEL-RAIN', x: 9, y: 6, w: 1, h: 1,
    label: 'the Jewel Rain Vortex catalogue mount', art: 'water-loop.jewel', walkThrough: true, visibleIf: { objective: 'coast.revise' } },
  station('archive', 'model', 12, 8), station('archive', 'basin', 9, 8),
  station('archive', 'reuse', 11, 10), station('archive', 'spill', 14, 10),
];

const installed = (service: LoopService) => ({ flag: loopKey('island', 'service'), eq: service });

function gate(service: LoopService, x: number, y: number, to: NonNullable<Interactable['to']>): Interactable {
  const garden = service === 'garden';
  return { id: `water-loop-${service}-gate`, kind: 'door', x, y, w: 1, h: 1, walkThrough: true,
    label: garden ? 'the side path to Ivo’s rain garden' : 'the covered passage to the powered tide plate',
    text: garden ? 'Ivo opens this garden side path when the basin can hold the garden’s next draw.'
      : 'This side passage opens when Ivo powers the tide plate for visitors.',
    art: 'preserved.door', artOpen: { key: garden ? 'water.fields' : 'island.signal', if: installed(service) },
    visibleIf: { flagSet: loopKey('island', 'source') }, openIf: installed(service), to,
    flag: loopKey('island', `crossed.${service}`) };
}

export const ISLAND_WATER_LOOP: Interactable[] = [
  station('island', 'model', 10, 7), station('island', 'basin', 8, 7),
  station('island', 'reuse', 8, 9), station('island', 'spill', 10, 9),
  gate('garden', 6, 11, { map: 'island.margin', x: 7, y: 8 }),
  gate('plate', 22, 11, { map: 'island.margin', x: 23, y: 12 }),
];

function destination(service: LoopService, x: number, y: number, label: string, art: string, text: string): Interactable {
  return { id: `water-loop-${service}-opened`, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true,
    visibleIf: { all: [installed(service), { flag: loopKey('island', `crossed.${service}`), eq: true }] },
    flag: loopKey('island', `seen.${service}`) };
}

export const MARGIN_WATER_LOOP: Interactable[] = [
  destination('garden', 8, 8, 'the water-fed rain garden path', 'water.fields',
    'The rain-garden door reached the nearer beds. The crew can draw from the basin beside this path. The visitor tide plate rests while the attendant works here.'),
  destination('plate', 23, 11, 'the powered tide plate on its visitor rail', 'island.signal',
    'Two bell readings light up on the tide plate. Visitors can see them from the covered path. Ivo keeps the little garden path shut while the attendant works here.'),
];
