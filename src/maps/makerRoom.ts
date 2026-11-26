import { MAKER_CASES, MAKER_ROOM_OPEN, makerReceiver, makerReceiverUsed } from '../content/makerRoomCases';
import { MAKER_EXACT, MAKER_TOOL, type MakerRoute } from '../domain/makerRoom';
import { MAKER_RETURNS } from '../domain/makerReturns';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const NILE_MAKER_PATH: Interactable = {
  id: 'nile-makers-path', kind: 'door', x: 21, y: 10, w: 1, h: 1, label: 'the steps to the Makers’ Room',
  art: 'nile.door', visibleIf: MAKER_ROOM_OPEN, walkThrough: true,
  to: { map: 'nile.makers-room', x: 15, y: 24 },
};

function receiving(route: MakerRoute, x: number, y: number, label: string): Interactable {
  return {
    id: `makers-receiver-${route}`, kind: 'fieldgame', game: `${MAKER_TOOL}:${route}`,
    x, y, w: 1, h: 1, label, art: 'preserved.folder', walkThrough: true, visibleIf: makerReceiver(route),
    artOpen: { key: 'preserved.display-paired', if: makerReceiverUsed(route) },
  };
}

export const MAKER_QUAY = receiving('quay', 8, 12, 'the makers’ front-pattern receipt at Lamp Quay');
export const MAKER_WALK = receiving('walk', 20, 12, 'the makers’ checked section on the Glass Walk');

const exact = [
  { slug: 'jiahu', label: 'the 23.1 cm Jiahu flute record', bench: 'the practice tube with a movable stop' },
  { slug: 'disk', label: 'the record of Enheduanna’s disk', bench: 'the two-sided disk mount' },
  { slug: 'laguna', label: 'the Laguna Copperplate Inscription record', bench: 'the copperplate docket desk' },
];

export const NILE_MAKERS_ROOM: MapDef = {
  id: 'nile.makers-room', name: 'Nile Archive · Makers’ Room', world: 'WORLD-03',
  width: 32, height: 28, spawn: { x: 15, y: 24 },
  music: 'music.archive', ambience: 'study', background: 0x4e4940,
  floor: (x, y) => {
    if (x < 1 || x > 30 || y < 0 || y >= 27) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 23 || (x >= 14 && x <= 17) ? 'island-boards' : 'stone-c';
  },
  blocks: [[0, 0, 32, 3], [0, 0, 1, 28], [31, 0, 1, 28], [0, 27, 32, 1]],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 26, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 27, y: 2 },
    { stamp: 'bench', x: 4, y: 23 }, { stamp: 'rug-green', x: 15, y: 24 }, { stamp: 'cabinet', x: 28, y: 24 },
  ],
  npcs: [],
  zones: [],
  lights: [
    { x: 5, y: 7, r: 68, color: 0xe4cea4 }, { x: 18, y: 7, r: 80, color: 0x9fc8bc }, { x: 28, y: 7, r: 65, color: 0xd6bdce },
    { x: 6, y: 15, r: 75, color: 0xf0d1a4 }, { x: 21, y: 15, r: 80, color: 0xc8cfc5 },
    { x: 12, y: 22, r: 74, color: 0xe5d197 }, { x: 25, y: 22, r: 82, color: 0xeacb9c },
  ],
  interactables: [
    ...MAKER_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + index % 6 * 5;
      const y = 5 + Math.floor(index / 6) * 3;
      return [
        {
          id: `maker-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit,
          x, y, w: 1, h: 1, art: 'collection-stand', label: `${record.title}, ${record.accession}`,
        },
        {
          id: `maker-bench-${record.slug}`, kind: 'fieldgame', game: `${MAKER_TOOL}:${record.slug}`,
          x: x + 1, y, w: 1, h: 1, art: 'board-stand', label: `the practice cut for ${record.accession}`,
          visibleIf: { card: record.card }, walkThrough: true,
        },
      ];
    }),
    ...exact.flatMap(({ slug, label, bench }, index): Interactable[] => {
      const x = 18 + index * 5;
      return [
        {
          id: `maker-exact-${slug}-record`, kind: 'exhibit', exhibit: `OBJ-MAKERS-EXACT-${slug.toUpperCase()}`,
          x, y: 20, w: 1, h: 1, art: `maker-exact-${slug}`, label,
        },
        {
          id: `maker-exact-${slug}-bench`, kind: 'fieldgame', game: `${MAKER_EXACT}:${slug}`,
          x: x + 1, y: 20, w: 1, h: 1, art: 'board-stand', label: bench,
          visibleIf: { card: `card.makers.exact.${slug}` }, walkThrough: true,
        },
      ];
    }),
    ...MAKER_RETURNS.map((entry): Interactable => ({
      id: entry.prop, kind: 'fieldgame', game: `${MAKER_EXACT}:return-${entry.slug}`,
      x: entry.x, y: entry.y, w: 1, h: 1, walkThrough: true, label: entry.method,
      art: 'board-stand', visibleIf: specimenEquipped(entry.key),
      artOpen: { key: 'preserved.display-paired', if: { flagSet: `makers.return.${entry.slug}` } },
    })),
    {
      id: 'nile-makers-guide', kind: 'sign', x: 13, y: 23, w: 1, h: 1, walkThrough: true,
      label: 'the note for the next archive visitor', art: 'nile.scroll',
      text: 'Leila can copy a pattern from above. She needs a look through a practice cut to show someone how a piece is put together. Every object has its own collection strip.',
    },
    {
      id: 'nile-makers-return', kind: 'door', x: 15, y: 26, w: 1, h: 1, label: 'the steps back to the Map Room', art: 'nile.door',
      to: { map: 'nile.route', x: 20, y: 10 },
    },
    {
      id: 'nile-makers-hall', kind: 'door', x: 12, y: 26, w: 1, h: 1, label: 'the short stairs to the Archive Hall', art: 'nile.door',
      to: { map: 'nile.hall', x: 12, y: 10 },
    },
  ],
};
