import { ALIGN_CASES, ALIGN_GATE, ALIGN_GROUP } from '../content/mapAlignment';
import { sheetKey, type SheetReader } from '../domain/mapAlignment';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

const ROOM = 'copies.alignment-room';
export const ALIGN_DOOR: Interactable = { id: 'alignment-room-door', kind: 'door', x: 6, y: 6, w: 1, h: 1, art: 'align.map',
  visibleIf: ALIGN_GATE, label: 'the door to the map alignment room', to: { map: ROOM, x: 22, y: 27 } };

export function alignmentReceiver(reader: SheetReader, x: number, y: number): Interactable {
  return { id: `alignment-reader-${reader}`, kind: 'fieldgame', game: `${ALIGN_GROUP}:${reader}`, x, y, w: 1, h: 1, walkThrough: true,
    label: reader === 'strip' ? 'Mina’s low landing guide' : 'Lark’s paired-sheet frame at the press', art: 'align.map',
    visibleIf: { any: ALIGN_CASES.map(({ slug }) => ({ flag: `${sheetKey(slug)}.reader`, eq: reader })) },
    artOpen: { key: `align.${reader}`, if: { any: ALIGN_CASES.map(({ slug }) => ({ flag: `${sheetKey(slug)}.received`, eq: reader })) } } };
}

export const ALIGN_RETURN: Interactable[] = ALIGN_CASES.map((record) => ({
  id: record.prop, kind: 'fieldgame', game: `${ALIGN_GROUP}:return:${record.slug}`, x: 8, y: 8, w: 1, h: 1,
  art: 'align.map', walkThrough: true, label: `Marek’s changed turn with ${record.name}`, visibleIf: specimenEquipped(record.key),
  artBy: { flag: `${sheetKey(record.slug)}.placed`, keys: { tentative: 'align.strip', survey: 'align.pair' } },
}));

export const ALIGN_ROOM: MapDef = {
  id: ROOM, name: 'City of Copies: Map Alignment Room', world: 'WORLD-08', width: 43, height: 31,
  spawn: { x: 22, y: 27 }, music: 'music.archive', ambience: 'study', background: 0x302b46,
  floor: (x, y) => x < 1 || x > 41 || y < 0 || y > 30 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y]
    : (y % 4 === 2 || x === 22) ? 'voices-inlay' : 'voices-slate',
  blocks: [[1, 0, 41, 3]], zones: [], npcs: [],
  stamps: [{ stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 18, y: 1 }, { stamp: 'window', x: 29, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 37, y: 2 }, { stamp: 'bench', x: 2, y: 28 }, { stamp: 'bench', x: 34, y: 28 }],
  lights: Array.from({ length: 12 }, (_, i) => ({ x: 5 + 11 * (i % 4), y: 5 + 9 * Math.floor(i / 4), r: 92, color: [0xe9d9ab, 0xb4cbef, 0xb8dfd2][i % 3] })),
  interactables: [{ id: 'alignment-room-return', kind: 'door', x: 22, y: 29, w: 1, h: 1, art: 'copies.waypost', label: 'the Record Room',
    to: { map: 'copies.archive', x: 6, y: 7 } },
  { id: 'alignment-room-note', kind: 'sign', x: 23, y: 27, w: 1, h: 1, art: 'preserved.slip', walkThrough: true, label: 'the map alignment room note',
    text: 'The source cases give their own scales and dates. The movable sheets beside them are our local practice maps. Try the gate pin and the post. Leave the far turn in view. Mina can fit a short route at the Landing. Lark can keep both versions at the press.' },
  ...ALIGN_CASES.flatMap((record, index): Interactable[] => {
    const x = 3 + 6 * (index % 7), y = 5 + 4 * Math.floor(index / 7);
    return [{ id: `align-${record.slug}-exhibit`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1, walkThrough: true,
      label: `the exact sheet for ${record.name}`, art: 'align.map' },
    { id: `align-${record.slug}-stand`, kind: 'fieldgame', game: `${ALIGN_GROUP}:trial:${record.slug}`, x: x + 2, y, w: 1, h: 1, walkThrough: true,
      label: `the overlays for ${record.name}`, art: 'align.map', artOpen: { key: 'align.pair', if: { objective: record.objective } } }];
  })],
};
