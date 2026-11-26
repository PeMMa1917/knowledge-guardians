import {
  FERN_ARRIVED, FERN_RECORDS, fernRecordAtReceiver, fernRecordCarried, fernRecordDelivered,
  fernRecordLast, fernRecordPrepared, fernRecordStationFree, type FernRecord, type FernRoute,
} from '../content/fernRecords';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const FERN_RECORD_DOOR: Interactable = {
  id: 'forest-record-room-door', kind: 'door', x: 21, y: 7, w: 1, h: 1,
  label: 'the record room off Fern Station', art: 'preserved.door', visibleIf: FERN_ARRIVED,
  to: { map: 'forest.record-room', x: 13, y: 17 },
};

function scene(id: string, node: string, x: number, y: number, label: string, art: string, ifVisible: Condition): Interactable {
  return { id, node, kind: 'scene', x, y, w: 1, h: 1, label, art, visibleIf: ifVisible, walkThrough: true, sfx: 'sfx.page' };
}

function caseProps(entry: FernRecord, x: number, y: number): Interactable[] {
  const prepared = fernRecordPrepared(entry);
  const currentCopy = fernRecordCarried(entry);
  const canWork: Condition[] = [{ card: entry.card }, { not: { flagSet: entry.objective } }];
  const unprepared = entry.kind === 'fossil' ? 'preserved.folder' : entry.kind === 'view' ? 'fold.strip' : 'board-stand';
  const ready = entry.kind === 'fossil' ? 'preserved.display-records' : entry.kind === 'view' ? 'forest.guide-hinges' : 'forest.field-diagram';
  const pad = (step: string, label: string, art: string, ifVisible: Condition) =>
    scene(`fern-${entry.slug}-${step}`, `${entry.flag}.${step}`, x + 2, y, label, art, ifVisible);
  return [{
    id: `fern-${entry.slug}-exhibit`, kind: 'exhibit', x, y, w: 1, h: 1,
    exhibit: entry.exhibit, label: entry.title, art: 'collection-stand',
  },
  pad('frame', entry.frame, unprepared, { all: [...canWork, { not: prepared }] }),
  pad('send', `${entry.frame}, ready to copy`, ready, { all: [...canWork, prepared, fernRecordStationFree] }),
  pad('wait', `${entry.frame}, waiting on its hook`, ready, { all: [...canWork, prepared, { not: currentCopy }, { not: fernRecordStationFree }] }),
  pad('carry.field', 'the empty practice hook', 'preserved.slip', fernRecordAtReceiver(entry, 'field')),
  pad('carry.desk', 'the numbered hook', 'preserved.slip', fernRecordAtReceiver(entry, 'desk')),
  pad('returned.field', 'the ribbon from Lio’s low rail', 'forest.guide-hinges', fernRecordDelivered(entry, 'field')),
  pad('returned.desk', 'the numbered return tab from Nemi', 'preserved.display-paired', fernRecordDelivered(entry, 'desk'))];
}

function receiver(route: FernRoute, x: number, y: number): Interactable[] {
  const place = route === 'field' ? 'Lio’s low practice rail' : 'Nemi’s records desk';
  const nobodyCarrying: Condition = { not: { any: FERN_RECORDS.map((entry) => fernRecordAtReceiver(entry, route)) } };
  const retained = fernRecordLast(route);
  return [
    ...FERN_RECORDS.flatMap((entry) => [
      scene(`fern-${entry.slug}-receive-${route}`, `${entry.flag}.receive.${route}`, x, y,
        `${place} with room for ${entry.accession}`, route === 'field' ? 'forest.field-diagram' : 'preserved.folder',
        fernRecordAtReceiver(entry, route)),
      scene(`fern-${entry.slug}-kept-${route}`, `${entry.flag}.kept.${route}`, x, y,
        `${place}, with the check for ${entry.accession}`, route === 'field' ? 'forest.guide-hinges' : 'preserved.display-paired',
        { all: [nobodyCarrying, { flag: retained, eq: entry.slug }] }),
    ]),
    scene(`fern-${route}-receiver-open`, route === 'field' ? 'fern.record.lio' : 'fern.record.nemi', x, y,
      place, route === 'field' ? 'workbench' : 'preserved.catalogue',
      { all: [FERN_ARRIVED, nobodyCarrying, { not: { flagSet: retained } }] }),
  ];
}

export const FERN_FIELD_RECEIVER = receiver('field', 17, 11);

export const FERN_RECORD_ROOM: MapDef = {
  id: 'forest.record-room', name: 'Living Forest: Fern Record Room', world: 'WORLD-06',
  width: 27, height: 21, spawn: { x: 13, y: 17 },
  music: 'music.archive', ambience: 'study', background: 0x263e38,
  floor: (x, y) => {
    if (x < 1 || x > 25 || y < 0 || y >= 20) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return 'stone-c';
  },
  blocks: [[0, 0, 27, 3], [0, 0, 1, 21], [26, 0, 1, 21], [0, 20, 27, 1]],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 1 }, { stamp: 'bookshelf', x: 23, y: 1 },
    { stamp: 'rug-green', x: 12, y: 7 }, { stamp: 'rug-green', x: 12, y: 15 },
    { stamp: 'bench', x: 3, y: 17 }, { stamp: 'bookshelf', x: 23, y: 15 },
  ],
  lights: [
    { x: 5, y: 7, r: 78, color: 0xcde0af }, { x: 12, y: 8, r: 84, color: 0xffdca2 },
    { x: 19, y: 8, r: 82, color: 0xb8d7d3 }, { x: 8, y: 13, r: 88, color: 0xd4e1b9 },
    { x: 20, y: 13, r: 88, color: 0xe3cb9e }, { x: 13, y: 17, r: 70, color: 0xe8dbb8, flicker: true },
  ],
  npcs: [{ id: 'fern-record-nemi', x: 23, y: 18, facing: 'left' }],
  zones: [],
  interactables: [
    ...FERN_RECORDS.flatMap((entry, i) => caseProps(entry, 4 + (i % 3) * 8, 5 + Math.floor(i / 3) * 4)),
    ...receiver('desk', 21, 17),
    { id: 'forest-record-room-back', kind: 'door', x: 13, y: 19, w: 1, h: 1,
      label: 'the way back to Fern Station', art: 'preserved.door', to: { map: 'forest.station', x: 21, y: 8 } },
  ],
};
