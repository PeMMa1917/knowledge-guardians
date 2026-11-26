import { MODEL_RECORD_OPEN, MODEL_RECORD_GROUP, MODEL_RECORDS } from '../content/modelRecords';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const MODEL_RECORD_EXITS: Interactable[] = [
  { id: 'model-record-door', kind: 'door', x: 5, y: 12, w: 1, h: 1, art: 'preserved.door', label: 'the model records room',
    visibleIf: MODEL_RECORD_OPEN, to: { map: 'island.model-records', x: 10, y: 12 } },
  { id: 'model-record-near', kind: 'fieldgame', game: `${MODEL_RECORD_GROUP}:near`, x: 7, y: 11, w: 1, h: 1,
    art: 'fold.strip', label: 'the reader beside the Plan Workshop scale', walkThrough: true, visibleIf: MODEL_RECORD_OPEN },
  { id: 'model-record-study', kind: 'fieldgame', game: `${MODEL_RECORD_GROUP}:study`, x: 19, y: 11, w: 1, h: 1,
    art: 'fold.paired', label: 'the reader at the Plan Workshop study table', walkThrough: true, visibleIf: MODEL_RECORD_OPEN },
];

export const MODEL_RECORD_RETURNS: Interactable[] = MODEL_RECORDS.map((record, i) => ({
  id: record.revisit.prop, kind: 'fieldgame', game: `${MODEL_RECORD_GROUP}:return-${record.slug}`,
  x: 27 + i * 3, y: i === 0 ? 18 : 17, w: 1, h: 1, art: 'preserved.slip',
  walkThrough: true, label: record.revisit.method, visibleIf: specimenEquipped(record.key),
  artBy: { flag: `${record.flag}.return`, keys: { near: 'fold.strip', study: 'fold.paired' } },
}));

export const MODEL_RECORD_ROOM: MapDef = {
  id: 'island.model-records', name: 'Island of Models: the Model Records Room', world: 'WORLD-15', width: 21, height: 16,
  spawn: { x: 10, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x383a49,
  floor: (x, y) => {
    if (x < 1 || x > 19 || y >= 15) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'island-boards';
  },
  blocks: [[0, 0, 21, 3], [0, 0, 1, 16], [20, 0, 1, 16], [0, 15, 21, 1]],
  stamps: [{ stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 15, y: 1 }, { stamp: 'rug-green', x: 9, y: 9 }],
  npcs: MODEL_RECORDS.map(({ actor }, i) => ({ id: actor, x: 5 + 8 * i, y: 5, facing: 'down' })),
  lights: [{ x: 6, y: 8, r: 70, color: 0xe1c8a5 }, { x: 14, y: 8, r: 73, color: 0xa0c8d9 }], zones: [],
  interactables: [
    ...MODEL_RECORDS.flatMap((record, i): Interactable[] => [
      { id: `model-record-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x: 6 + 8 * i, y: 7, w: 1, h: 1,
        art: 'collection-stand', label: record.title },
      { id: `model-record-tool-${record.slug}`, kind: 'fieldgame', game: `${MODEL_RECORD_GROUP}:${record.slug}`, x: 7 + 8 * i, y: 7, w: 1, h: 1,
        art: 'board-stand', label: `the trial for ${record.accession}`, walkThrough: true, visibleIf: { card: record.card } },
    ]),
    { id: 'model-record-back', kind: 'door', x: 10, y: 14, w: 1, h: 1, art: 'preserved.door', label: 'the Plan Workshop',
      to: { map: 'island.workshop', x: 5, y: 11 } },
  ],
};
