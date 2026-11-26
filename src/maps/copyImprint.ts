import { IMPRINT_CASES, IMPRINT_GROUP, IMPRINT_OPEN, mountedAt, sentTo } from '../content/copyImprintCases';
import { LANDING_REFERENCE_PROOFS, PRESS_REFERENCE_PROOFS } from './referenceProofs';
import type { Interactable, MapDef } from './types';

export const IMPRINT_PATH: Interactable = {
  id: 'copies-proof-path', kind: 'door', x: 22, y: 12, w: 1, h: 1, walkThrough: true,
  label: 'the door to the proof room', art: 'preserved.door', visibleIf: IMPRINT_OPEN,
  to: { map: 'copies.proof-room', x: 16, y: 19 },
};

export const IMPRINT_LANDING: Interactable[] = [
  {
    id: 'copies-imprint-counter', kind: 'fieldgame', game: `${IMPRINT_GROUP}:counter`, x: 6, y: 13, w: 1, h: 1,
    label: 'the one-ink copies at the landing counter', art: 'copies.reprint',
    walkThrough: true, visibleIf: sentTo('counter'),
    artOpen: { key: 'preserved.display-paired', if: mountedAt('counter') },
  },
  ...LANDING_REFERENCE_PROOFS,
];

export const COPIES_PROOF_ROOM: MapDef = {
  id: 'copies.proof-room', name: 'City of Copies · Proof Room', world: 'WORLD-08',
  width: 34, height: 23, spawn: { x: 16, y: 19 },
  music: 'music.archive', ambience: 'study', background: 0x3c4b48,
  floor: (x, y) => {
    if (x < 1 || x > 32 || y < 0 || y >= 22) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return ((y >= 18 || (x >= 14 && x <= 18)) ? 'island-boards' : 'stone-c');
  },
  blocks: [[0, 0, 34, 3], [0, 0, 1, 23], [33, 0, 1, 23], [0, 22, 34, 1]],
  stamps: [
    { stamp: 'window', x: 8, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 26, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 30, y: 2 },
    { stamp: 'rug-green', x: 14, y: 18 }, { stamp: 'bench', x: 3, y: 18 }, { stamp: 'cabinet', x: 1, y: 16 },
  ],
  npcs: [],
  zones: [],
  lights: [
    { x: 5, y: 6, r: 72, color: 0xe3cdae }, { x: 17, y: 7, r: 74, color: 0xe9e3ac }, { x: 28, y: 6, r: 72, color: 0xb1dfd7 },
    { x: 7, y: 14, r: 77, color: 0xd4bedc }, { x: 22, y: 14, r: 76, color: 0xe5cba8 }, { x: 16, y: 19, r: 70, color: 0xe7ceac },
  ],
  interactables: [
    ...IMPRINT_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + index % 6 * 5;
      const y = 5 + Math.floor(index / 6) * 3;
      return [
        {
          id: `imprint-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit,
          x, y, w: 1, h: 1, art: 'collection-stand', label: `${record.title}, ${record.accession}`,
        },
        {
          id: `imprint-pull-${record.slug}`, kind: 'fieldgame', game: `${IMPRINT_GROUP}:${record.slug}`,
          x: x + 1, y, w: 1, h: 1, art: 'board-stand', label: `the proof press for ${record.accession}`,
          visibleIf: { card: record.card }, walkThrough: true,
        },
      ];
    }),
    ...PRESS_REFERENCE_PROOFS,
    {
      id: 'copies-imprint-drawer', kind: 'fieldgame', game: `${IMPRINT_GROUP}:drawer`,
      x: 7, y: 19, w: 1, h: 1, art: 'preserved.folder', label: 'the proof drawer for paired pulls',
      walkThrough: true, visibleIf: sentTo('drawer'),
      artOpen: { key: 'preserved.display-paired', if: mountedAt('drawer') },
    },
    {
      id: 'copies-proof-room-guide', kind: 'sign', x: 17, y: 17, w: 1, h: 1,
      art: 'copies.source', label: 'the proof room directions', walkThrough: true,
      text: 'Open any display, then try two ink charges on its proof press. The west drawer keeps a tested pair. The counter on the Landing accepts one pull with its own record.',
    },
    {
      id: 'copies-proof-return', kind: 'door', x: 16, y: 21, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to the Print Workshop', to: { map: 'copies.press', x: 21, y: 12 },
    },
  ],
};
