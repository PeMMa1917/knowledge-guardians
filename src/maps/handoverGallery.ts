/** The next keeper can set out a fresh practice bundle after the epilogue. */
import { HANDOVER_BUNDLES, HANDOVER_CASES, HANDOVER_FLAG, HANDOVER_PLACES, handoverKey } from '../domain/handoverGallery';
import type { MapDef } from './types';

export const HANDOVER_GALLERY: MapDef = {
  id: 'nexus.handover', name: 'The Nexus: Handover Room', world: 'WORLD-01',
  width: 24, height: 15, music: 'music.archive', ambience: 'study', background: 0x383343,
  floor: (x, y) => x < 1 || x > 22 || y < 0 || y > 14 ? null
    : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c',
  blocks: [[1, 0, 22, 3]], zones: [], spawn: { x: 11, y: 11 }, npcs: [],
  stamps: [
    { stamp: 'bookshelf', x: 3, y: 3 }, { stamp: 'bookshelf', x: 18, y: 3 },
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'long-table', x: 10, y: 4 }, { stamp: 'rug-green', x: 10, y: 8 },
    { stamp: 'voices-bench', x: 4, y: 10 }, { stamp: 'voices-bench', x: 18, y: 10 },
    { stamp: 'plant-tall', x: 2, y: 12 }, { stamp: 'plant-tall', x: 21, y: 12 },
  ],
  interactables: [
    { id: 'handover-return', kind: 'door', x: 11, y: 13, w: 1, h: 1, label: 'the door back to the next keeper’s bench',
      art: 'preserved.door', to: { map: 'nexus.next-bench', x: 15, y: 8 } },
    { id: 'handover-board', kind: 'fieldgame', game: 'handover-gallery', x: 11, y: 7, w: 1, h: 1,
      label: 'Lia’s practice bundle', art: 'preserved.display-paired', walkThrough: true },
    { id: 'handover-reference-tray', kind: 'sign', x: 13, y: 10, w: 1, h: 1,
      label: 'Lia’s tray of spare clips and strips', art: 'preserved.folder', walkThrough: true,
      text: 'The clips, spare lamp and measuring strip belong to the room. Start with whatever you brought. A finished bundle gives the next visitor something to read and leaves a new bundle at the middle table.' },
    ...HANDOVER_CASES.flatMap((bundle) => HANDOVER_PLACES.map((place) => ({
      id: `handover-${bundle}-${place}`, kind: 'sign' as const,
      x: place === 'public' ? 18 : 5, y: 8, w: 1, h: 1, walkThrough: true,
      label: (place === 'public' ? 'the east notice for ' : 'the west keeper’s copy for ') + HANDOVER_BUNDLES[bundle].name.toLowerCase(),
      art: place === 'public' ? 'preserved.display-records' : 'preserved.catalogue', text: HANDOVER_BUNDLES[bundle][place],
      visibleIf: { flag: HANDOVER_FLAG, eq: handoverKey(bundle, place) },
    }))),
  ],
  lights: [
    { x: 11, y: 7, r: 76, color: 0xe9d099 }, { x: 5, y: 8, r: 64, color: 0xbdd3b3 },
    { x: 18, y: 8, r: 65, color: 0xd9c0df }, { x: 11, y: 13, r: 44, color: 0xcdc7e8 },
  ],
};
