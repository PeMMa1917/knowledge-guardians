import { STORY_FRAMES, STORY_FRAME_GROUP, frameLayout, frameReady, frameViewed } from '../content/storyArchive';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const chapter: Condition = { objective: 'stage.arrival' };
const room = 'stage.story-archive';
const gallery = 'stage.gallery';
const places = [
  { x: 5, y: 5, benchX: 8 },
  { x: 15, y: 5, benchX: 18 },
];

export const STORY_ARCHIVE_ENTRANCE: Interactable = {
  id: 'story-archive-entrance', kind: 'door', x: 25, y: 15, w: 1, h: 1,
  label: 'the Story Archive beside the Gallery', art: 'preserved.door', visibleIf: chapter,
  to: { map: room, x: 11, y: 12 },
};

export const STORY_ARCHIVE_READBACKS: Interactable[] = STORY_FRAMES.flatMap((record) => record.variants.flatMap((variant, position) => {
  const id = `story-frame-${record.key}-${variant.key}`;
  const node = `${record.flag}.read.${variant.key}`;
  const ready: Condition = { all: [chapter, frameReady(record), frameViewed(record), frameLayout(record, variant.key)] };
  const read: Condition = { flag: record.objective, eq: variant.key };
  const prop = { kind: 'scene' as const, x: variant.x, y: variant.y, w: 1, h: 1, label: variant.destination, walkThrough: true };
  return [
    { ...prop, id, node, art: position === 0 ? 'fold.strip' : 'fold.paired', visibleIf: { all: [ready, { not: read }] } },
    { ...prop, id: `${id}-done`, node: `${node}-done`, art: 'preserved.display-records', visibleIf: { all: [ready, read] } },
  ];
}));

export const STORY_ARCHIVE: MapDef = {
  id: room, name: 'House of Performance: Story Archive', world: 'WORLD-10',
  width: 23, height: 17, spawn: { x: 11, y: 12 },
  music: 'music.archive', ambience: 'study', background: 0x302c40,
  floor: (x, y) => {
    if (x < 1 || x > 21 || y < 0 || y > 16) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return 'stone-c';
  },
  blocks: [[0, 0, 23, 3], [0, 0, 1, 17], [22, 0, 1, 17]], zones: [],
  npcs: [{ id: 'story-frame-keeper', x: 11, y: 8, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'bookshelf', x: 2, y: 3 }, { stamp: 'bookshelf', x: 19, y: 3 },
    { stamp: 'bench', x: 3, y: 12 }, { stamp: 'bench', x: 17, y: 12 },
    { stamp: 'rug-green', x: 10, y: 10 },
  ],
  lights: [
    { x: 6, y: 5, r: 72, color: 0xd3b698 }, { x: 16, y: 5, r: 72, color: 0xafcddd },
    { x: 11, y: 10, r: 64, color: 0xd7bed4 },
  ],
  interactables: [
    ...STORY_FRAMES.flatMap((record, index): Interactable[] => {
      const { x, y, benchX } = places[index];
      return [
        { id: `story-frame-case-${record.key}`, kind: 'exhibit', exhibit: record.exhibit,
          x, y, w: 1, h: 1, art: record.art, label: record.name },
        ...record.stamps.map((stamp, i): Interactable => ({
          id: `story-frame-${record.key}-stamp-${stamp.name}`, node: `${record.flag}.stamp.${stamp.name}`, kind: 'scene',
          x: x + i * 2, y: y + 4, w: 1, h: 1, label: stamp.label, art: stamp.art,
          visibleIf: { card: record.card }, walkThrough: true,
        })),
        { id: `story-frame-bench-${record.key}`, kind: 'fieldgame', game: `${STORY_FRAME_GROUP}:${record.key}`,
          x: benchX, y: 6, w: 1, h: 1, art: 'board-stand', label: `the caption frame for ${record.specimen.accession}`,
          visibleIf: frameReady(record), walkThrough: true },
      ];
    }),
    { id: 'story-archive-back', kind: 'door', x: 11, y: 15, w: 1, h: 1,
      label: 'the way back to the Audience Gallery', art: 'preserved.door', to: { map: gallery, x: 25, y: 14 } },
  ],
};
