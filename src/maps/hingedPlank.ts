import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const started: Condition = { flag: 'last-bell.bridge.start', eq: true };
const crossed: Condition = { flag: 'last-bell.bridge.out', eq: true };
export const PLANK_DOOR: Interactable = {
  id: 'last-bell-footpath',
  kind: 'door',
  x: 15,
  y: 7,
  w: 1,
  h: 1,
  walkThrough: true,
  label: 'Joss’s footpath to the hinged plank',
  art: 'island.waypost',
  visibleIf: { flag: 'last-bell.island.left', in: [0, 1] },
  to: { map: 'island.hinged-plank', x: 4, y: 8 },
};

export const HINGED_PLANK: MapDef = {
  id: 'island.hinged-plank',
  name: 'Island of Models: The Hinged Plank',
  world: 'WORLD-15',
  width: 22,
  height: 14,
  spawn: { x: 4, y: 8 },
  background: 0x314f58,
  music: 'music.town',
  ambience: 'town',
  floor(x, y) {
    if (x < 1 || y < 1 || x > 20 || y > 12) return null;
    if (x >= 8 && x <= 13) return y === 6 || y === 7 ? 'island-boards' : 'island-shallow';
    return y === 6 || y === 7 ? 'island-path' : (x + y) % 3 === 0 ? 'island-marsh-a' : 'island-marsh-b';
  },
  blocks: [
    [0, 0, 22, 1],
    [0, 13, 22, 1],
    [0, 1, 1, 12],
    [21, 1, 1, 12],
    [8, 1, 6, 5],
    [8, 8, 6, 5],
  ],
  stamps: [
    { stamp: 'island-reeds', x: 2, y: 2 },
    { stamp: 'crates', x: 15, y: 2 },
    { stamp: 'island-reeds', x: 17, y: 10 },
  ],
  zones: [],
  npcs: [],
  lights: [
    { x: 5, y: 6, r: 48, color: 0xf8c780 },
    { x: 16, y: 7, r: 45, color: 0xbddcdd },
  ],
  interactables: [
    {
      id: 'last-bell-back-to-model',
      kind: 'door',
      label: 'the path back to Ivo’s model',
      x: 2,
      y: 9,
      w: 1,
      h: 1,
      art: 'island.waypost',
      to: { map: 'island.workshop', x: 15, y: 8 },
    },
    {
      id: 'last-bell-bridge-start',
      kind: 'sign',
      x: 6,
      y: 6,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'island.landing',
      label: 'Joss’s timing cord at the kiln',
      flag: 'last-bell.bridge.start',
      text: 'Joss puts the last knot in your hand. Start here, on the kiln bank. She will tap the rail once per beat while you cross the hinged span. Look for the iron ring at the sail loft.',
    },
    {
      id: 'last-bell-bridge-out',
      kind: 'sign',
      x: 16,
      y: 7,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'island.landing',
      label: 'the iron ring on the loft bank',
      flag: 'last-bell.bridge.out',
      visibleIf: started,
      text: 'One tap on the hinged span. The board drops easily under your weight. On the way back you find the iron ring on this side. Give it a lift, then follow the cord back to the kiln.',
    },
    {
      id: 'last-bell-bridge-back',
      kind: 'sign',
      x: 5,
      y: 8,
      w: 1,
      h: 1,
      walkThrough: true,
      art: 'preserved.slip',
      label: 'the return time under Joss’s glove',
      flag: 'last-bell.bridge.back',
      visibleIf: crossed,
      text: 'Four taps coming back. Lifting the plank takes three more beats than letting it fall. Joss lends you the cord with both times tied in. The path to Ivo’s model is west of you.',
    },
  ],
};
