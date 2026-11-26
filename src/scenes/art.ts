/**
 * Art registry. Maps readable names to rectangles ("stamps") on tile sheets
 * listed in CREDITS.md. Units are 16 px tiles.
 *
 * Sheets:
 *   ow = public/assets/art/armm1998/Overworld.png (40 x 36 tiles)
 *   in = public/assets/art/armm1998/Inner.png     (40 x 25 tiles)
 *   market = public/assets/art/generated/market_tiles.png (18 x 9 tiles)
 *
 * `collide` is the blocked area in tiles, relative to the stamp's top-left.
 * Leave it out for decorations the player can walk over or behind.
 *
 * To add a stamp: open the sheet in an image editor with a 16 px grid, note
 * the column/row of the top-left tile, the width and height, and add a line.
 */
export const TILE = 16;

export interface Stamp {
  sheet: 'ow' | 'in' | 'market';
  x: number; y: number; w: number; h: number;
  collide?: [number, number, number, number];
  /** Draw above characters regardless of y (for roofs/awnings that overlap). */
  above?: boolean;
  /** Lies flat on the floor (rugs, flowers): always drawn under characters. */
  flat?: boolean;
}

export const STAMPS: Record<string, Stamp> = {
  // Ground and floors (single tiles)
  'grass': { sheet: 'ow', x: 0, y: 0, w: 1, h: 1 },
  'grass-tuft': { sheet: 'ow', x: 4, y: 9, w: 1, h: 1 },
  'grass-tuft2': { sheet: 'ow', x: 5, y: 10, w: 1, h: 1 },
  'flowers-white': { sheet: 'ow', x: 0, y: 8, w: 1, h: 1 },
  'flowers-small': { sheet: 'ow', x: 2, y: 11, w: 1, h: 1 },
  'flowers-small2': { sheet: 'ow', x: 3, y: 12, w: 1, h: 1 },
  'stone-c': { sheet: 'ow', x: 23, y: 1, w: 1, h: 1 },
  'stone-tl': { sheet: 'ow', x: 22, y: 0, w: 1, h: 1 },
  'stone-t': { sheet: 'ow', x: 23, y: 0, w: 1, h: 1 },
  'stone-tr': { sheet: 'ow', x: 24, y: 0, w: 1, h: 1 },
  'stone-l': { sheet: 'ow', x: 22, y: 1, w: 1, h: 1 },
  'stone-r': { sheet: 'ow', x: 24, y: 1, w: 1, h: 1 },
  'stone-bl': { sheet: 'ow', x: 22, y: 2, w: 1, h: 1 },
  'stone-b': { sheet: 'ow', x: 23, y: 2, w: 1, h: 1 },
  'stone-br': { sheet: 'ow', x: 24, y: 2, w: 1, h: 1 },
  'wall-top': { sheet: 'ow', x: 23, y: 3, w: 1, h: 1 },
  'wall-mid': { sheet: 'ow', x: 23, y: 4, w: 1, h: 1 },
  'wall-base': { sheet: 'ow', x: 23, y: 5, w: 1, h: 1 },

  // Buildings and large objects
  'house-a': { sheet: 'ow', x: 6, y: 0, w: 5, h: 5, collide: [0, 1, 5, 4] },
  'house-b': { sheet: 'ow', x: 11, y: 0, w: 5, h: 5, collide: [0, 1, 5, 4] },
  'gatehouse': { sheet: 'ow', x: 4, y: 31, w: 4, h: 3, collide: [0, 0, 4, 3] },
  'tower': { sheet: 'ow', x: 0, y: 21, w: 3, h: 6, collide: [0, 2, 3, 4] },
  'stall': { sheet: 'ow', x: 18, y: 22, w: 5, h: 6, collide: [0, 4, 5, 2] },
  'fountain-0': { sheet: 'ow', x: 22, y: 9, w: 3, h: 3, collide: [0, 0, 3, 3] },
  'fountain-1': { sheet: 'ow', x: 25, y: 9, w: 3, h: 3, collide: [0, 0, 3, 3] },
  'fountain-2': { sheet: 'ow', x: 28, y: 9, w: 3, h: 3, collide: [0, 0, 3, 3] },
  'tree': { sheet: 'ow', x: 5, y: 16, w: 2, h: 2, collide: [0, 1, 2, 1] },
  'bush': { sheet: 'ow', x: 2, y: 14, w: 1, h: 1, collide: [0, 0, 1, 1] },
  'statue': { sheet: 'ow', x: 8, y: 31, w: 2, h: 3, collide: [0, 1, 2, 2] },
  'banners': { sheet: 'ow', x: 5, y: 27, w: 2, h: 2 },
  'bench': { sheet: 'ow', x: 27, y: 4, w: 3, h: 2, collide: [0, 1, 3, 1] },
  'crates': { sheet: 'ow', x: 30, y: 0, w: 2, h: 2, collide: [0, 0, 2, 2] },
  'barrel': { sheet: 'ow', x: 33, y: 1, w: 1, h: 1, collide: [0, 0, 1, 1] },
  'sign': { sheet: 'ow', x: 34, y: 2, w: 1, h: 1, collide: [0, 0, 1, 1] },
  'fruit-yellow': { sheet: 'ow', x: 26, y: 20, w: 1, h: 2, collide: [0, 1, 1, 1] },
  'fruit-green': { sheet: 'ow', x: 27, y: 20, w: 1, h: 2, collide: [0, 1, 1, 1] },
  'fruit-red': { sheet: 'ow', x: 28, y: 20, w: 1, h: 2, collide: [0, 1, 1, 1] },
  'pot-plant': { sheet: 'ow', x: 35, y: 1, w: 1, h: 1, collide: [0, 0, 1, 1] },
  'well-box': { sheet: 'ow', x: 31, y: 5, w: 2, h: 2, collide: [0, 0, 2, 2] },

  // Interior furniture
  'bookshelf': { sheet: 'in', x: 3, y: 12, w: 3, h: 2, collide: [0, 0, 3, 2] },
  'rug-green': { sheet: 'in', x: 0, y: 7, w: 3, h: 3, flat: true },
  'table': { sheet: 'in', x: 10, y: 7, w: 3, h: 3, collide: [0, 0, 3, 3] },
  'long-table': { sheet: 'in', x: 14, y: 7, w: 3, h: 3, collide: [0, 0, 3, 2] },
  'plant-tall': { sheet: 'in', x: 8, y: 12, w: 1, h: 2, collide: [0, 1, 1, 1] },
  'cabinet': { sheet: 'in', x: 6, y: 12, w: 2, h: 3, collide: [0, 1, 2, 2] },
  'forge': { sheet: 'in', x: 12, y: 10, w: 2, h: 3, collide: [0, 1, 2, 2] },
  'window': { sheet: 'in', x: 9, y: 4, w: 2, h: 2 },
  'painting': { sheet: 'in', x: 11, y: 4, w: 1, h: 2 },

  // Original Market of Measures pavements, buildings and furniture.
  'market-paving-a': { sheet: 'market', x: 0, y: 0, w: 1, h: 1 },
  'market-paving-b': { sheet: 'market', x: 1, y: 0, w: 1, h: 1 },
  'market-paving-c': { sheet: 'market', x: 2, y: 0, w: 1, h: 1 },
  'market-paving-d': { sheet: 'market', x: 3, y: 0, w: 1, h: 1 },
  'market-lane': { sheet: 'market', x: 4, y: 0, w: 1, h: 1 },
  'market-edge': { sheet: 'market', x: 5, y: 0, w: 1, h: 1 },
  'market-office': { sheet: 'market', x: 0, y: 1, w: 5, h: 4, collide: [0, 2, 5, 2] },
  'market-workshop': { sheet: 'market', x: 5, y: 1, w: 5, h: 4, collide: [0, 2, 5, 2] },
  'market-home': { sheet: 'market', x: 10, y: 1, w: 4, h: 4, collide: [0, 2, 4, 2] },
  'market-wick-stall': { sheet: 'market', x: 0, y: 5, w: 4, h: 3, collide: [0, 1, 4, 2] },
  'market-display-stall': { sheet: 'market', x: 4, y: 5, w: 4, h: 3, collide: [0, 1, 4, 2] },
  'market-repair-stall': { sheet: 'market', x: 8, y: 5, w: 4, h: 3, collide: [0, 1, 4, 2] },
  'market-scale-stand': { sheet: 'market', x: 12, y: 5, w: 3, h: 2, collide: [0, 1, 3, 1] },
  'market-bench': { sheet: 'market', x: 15, y: 5, w: 3, h: 2, collide: [0, 1, 3, 1] },
  'market-lamp': { sheet: 'market', x: 15, y: 7, w: 1, h: 2, collide: [0, 1, 1, 1] },
  'market-planter': { sheet: 'market', x: 16, y: 7, w: 2, h: 2, collide: [0, 1, 2, 1] },
};

/** Character sheets: 16x32 frames, 4 per row; rows: down, right, up, left. */
export const CHAR_FRAME = { w: 16, h: 32 };
export const DIR_ROW = { down: 0, right: 1, up: 2, left: 3 } as const;

export const PLAYER_LOOKS = ['player-a', 'player-b', 'player-c', 'player-d'] as const;
