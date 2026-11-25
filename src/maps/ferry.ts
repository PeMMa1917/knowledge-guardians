/**
 * WORLD-02 Aethelgard: the old ferry road and the ferry folk's landing, east of Emberford.
 * A pathway that a keepsake opens: Kip's map beside Elsbet's map shows the forgotten road
 * (flag clue.oldmap.folded-map). The ferry folk are their own people, with their own river cant
 * (an invented language) and their own knowledge of the river. 26 x 14 tiles. Fictional world.
 * Tiles with no floor show the background colour: here, the river.
 */
import type { MapDef } from './types';

const W = 26, H = 14;
const RIVER = 9; // first row of water

function floor(x: number, y: number): string | null {
  if (x < 0 || x >= W || y < 0 || y >= H) return null;
  if (x >= 11 && x <= 13 && y >= RIVER && y <= 11) return 'stone-c'; // the jetty
  if (y >= RIVER) return null;
  if (y >= 4 && y <= 5 && x <= 12) return 'stone-c'; // the old road, grass at its edges
  return 'grass';
}

export const FERRY: MapDef = {
  id: 'aethelgard.ferry',
  name: 'Aethelgard: the old ferry landing',
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.town',
  ambience: 'town',
  background: 0x2b6f9a,
  floor,
  stamps: [
    { stamp: 'house-b', x: 16, y: 1 },
    { stamp: 'tree', x: 2, y: 0 }, { stamp: 'tree', x: 8, y: 1 }, { stamp: 'tree', x: 23, y: 2 }, { stamp: 'tree', x: 4, y: 7 },
    { stamp: 'bush', x: 14, y: 3 }, { stamp: 'bush', x: 22, y: 7 }, { stamp: 'bush', x: 1, y: 7 },
    { stamp: 'crates', x: 14, y: 7 }, { stamp: 'barrel', x: 10, y: 8 }, { stamp: 'barrel', x: 16, y: 7 },
    { stamp: 'bench', x: 19, y: 6 },
    { stamp: 'flowers-white', x: 7, y: 7 }, { stamp: 'flowers-white', x: 21, y: 1 },
  ],
  blocks: [[-1, 0, 1, H], [W, 0, 1, H], [0, -1, W, 1], [0, H, W, 1]],
  npcs: [{ id: 'ferry-tova', x: 12, y: 8, facing: 'up' }],
  interactables: [
    { id: 'ferry-road-back', kind: 'door', x: 0, y: 4, w: 1, h: 2, label: 'the road back to Emberford', art: 'road-post', to: { map: 'aethelgard.emberford', x: 38, y: 18 } },
    { id: 'secret-star-names', kind: 'secret', secret: 'star-names', x: 22, y: 8, w: 1, h: 1, label: 'something glinting in the reeds' },
    { id: 'clay-bank', kind: 'gather', resource: 'clay', x: 9, y: 8, w: 1, h: 1, label: 'the clay bank (gather)', art: 'clay-bank' },
    { id: 'reeds-ferry', kind: 'gather', resource: 'reed', x: 19, y: 8, w: 1, h: 1, label: 'the tall reeds (gather)', art: 'reeds' },
    { id: 'barter-boat', kind: 'trader', x: 17, y: 8, w: 1, h: 1, label: "Wenna's barter boat (dyes and materials)", art: 'barter-boat' },
    { id: 'ferry-waystone', kind: 'waystone', place: 'the old ferry landing', x: 6, y: 3, w: 1, h: 1, label: 'the Waystone by the old road (save and rest)', art: 'waystone' },
    { id: 'ferry-camp-sign', kind: 'sign', x: 15, y: 5, w: 1, h: 1, label: 'the ferry folk\'s board', art: 'ferry-slate', flag: 'ferry.board',
      text: 'A slate board, written in the river cant and in town words. TODAY: slow water. The ford is good for walkers, not for carts. The next boat goes when the water says, not when the bell says. Ask Tova.' },
  ],
  zones: [{ id: 'ferry', x: 0, y: 0, w: W, h: H }],
  lights: [
    { x: 12.5, y: 10, r: 50, color: 0x9fe8ff },
    { x: 18.5, y: 4.5, r: 40, color: 0xffd98a, flicker: true },
  ],
  spawn: { x: 1, y: 4 },
};
