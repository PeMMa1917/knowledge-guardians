import { LANTERN_LEAVES, LANTERN_WEAVE, LANTERN_WEAVE_OPEN } from '../content/lanternWeave';
import { NUMBER_LEAF_DOOR } from './numberLeaves';
import type { Interactable, MapDef } from './types';

export const NEXUS_LANTERN_WEAVE: Interactable[] = [
  { id: 'lantern-weave-door', kind: 'door', x: 33, y: 6, w: 1, h: 1, label: 'the Half-Light Room', art: 'preserved.door',
    visibleIf: LANTERN_WEAVE_OPEN, to: { map: 'nexus.half-light', x: 13, y: 17 } },
  { id: 'lantern-weave-window', kind: 'fieldgame', game: `${LANTERN_WEAVE}:window`, x: 36, y: 6, w: 1, h: 1,
    label: 'Nell’s daylight viewing stand', art: 'nexus.viewer-detail', walkThrough: true, visibleIf: LANTERN_WEAVE_OPEN },
  { id: 'lantern-weave-table', kind: 'fieldgame', game: `${LANTERN_WEAVE}:table`, x: 32, y: 4, w: 1, h: 1,
    label: 'Hem’s whole-sheet drawer', art: 'nexus.viewer-sheet', walkThrough: true, visibleIf: LANTERN_WEAVE_OPEN },
];

export const PRESS_LANTERN_WEAVE: Interactable = {
  id: 'lantern-weave-copy-hook', kind: 'fieldgame', game: `${LANTERN_WEAVE}:press`, x: 20, y: 11, w: 1, h: 1,
  art: 'fold.strip', label: 'the direction hooks at the back of the press queue', walkThrough: true,
  visibleIf: { all: [{ objective: 'copies.revise' }, { any: LANTERN_LEAVES.map(({ objective }) => ({ objective })) }] },
  artBy: { flag: 'lantern.weave.copies.notice', keys: { flow: 'nexus.viewer-fixed-detail', review: 'nexus.viewer-fixed-sheet' } },
};

export const HALF_LIGHT_ROOM: MapDef = {
  id: 'nexus.half-light', name: 'The Nexus: the Half-Light Room', world: 'WORLD-01',
  width: 27, height: 20, spawn: { x: 13, y: 17 },
  music: 'music.archive', ambience: 'study', background: 0x1e253d,
  floor: (x, y) => {
    if (x < 1 || x > 25 || y >= 19) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[0, 0, 27, 3], [0, 0, 1, 20], [26, 0, 1, 20], [0, 19, 27, 1]],
  stamps: [
    { stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 18, y: 1 },
    { stamp: 'rug-green', x: 11, y: 8 }, { stamp: 'rug-green', x: 12, y: 16 },
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bench', x: 23, y: 15 },
  ],
  npcs: [
    { id: 'lantern-weave-nell', x: 4, y: 15, facing: 'right' },
    { id: 'lantern-weave-hem', x: 21, y: 15, facing: 'left' },
  ],
  lights: [
    { x: 5, y: 6, r: 74, color: 0xf2cb8f }, { x: 21, y: 6, r: 85, color: 0x9abed7 },
    { x: 13, y: 15, r: 73, color: 0xffddbb, flicker: true },
  ],
  zones: [],
  interactables: [
    NUMBER_LEAF_DOOR,
    ...LANTERN_LEAVES.flatMap((record, i): Interactable[] => {
      const x = 2 + (i % 6) * 4;
      const y = i < 6 ? 5 : 11;
      return [
        { id: `lantern-leaf-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit,
          x, y, w: 1, h: 1, art: 'collection-stand', label: `${record.title} · ${record.accession}` },
        { id: `lantern-arm-${record.slug}`, kind: 'fieldgame', game: `${LANTERN_WEAVE}:${record.slug}`,
          x: x + 1, y, w: 1, h: 1, art: 'nexus.viewer-sheet', label: `the lantern arm for ${record.accession}`,
          walkThrough: true, visibleIf: { card: record.card },
          artBy: { flag: `${record.flag}.sent`, keys: { window: 'nexus.viewer-detail', table: 'nexus.viewer-sheet' } } },
      ];
    }),
    { id: 'lantern-weave-back', kind: 'door', x: 13, y: 18, w: 1, h: 1, art: 'preserved.door',
      label: 'the Archive Hall', to: { map: 'nexus.archive', x: 33, y: 7 } },
  ],
};
