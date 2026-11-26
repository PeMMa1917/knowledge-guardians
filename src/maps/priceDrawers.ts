import { PRICE_ACTIVE, PRICE_CASES, PRICE_MODES, PRICE_READY, PRICE_ROOM, priceEquipped, priceRead, priceReceipt, priceReceived, priceTurn } from '../content/priceDrawers';
import type { Interactable, MapDef } from './types';

export const PRICE_DRAWERS_DOOR: Interactable = {
  id: 'price-drawers-door', kind: 'door', x: 5, y: 12, w: 1, h: 1, art: 'market.waypost',
  label: 'the doorway to the Price Drawers', visibleIf: PRICE_READY, to: { map: PRICE_ROOM, x: 18, y: 27 },
};

const width = 36;
const height = 30;
export const PRICE_DRAWERS_MAP: MapDef = {
  id: PRICE_ROOM, world: 'WORLD-11', name: 'Market of Measures: The Price Drawers', width, height,
  spawn: { x: 18, y: 27 }, background: 0x313745, ambience: 'study', music: 'music.town',
  floor: (x, y) => {
    if (x < 1 || y < 0 || x >= width - 1 || y >= height) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y % 4 === 3 || x === 18 ? 'market-lane' : 'market-paving-a';
  },
  blocks: [[1, 0, width - 2, 3]], zones: [],
  stamps: [{ stamp: 'window', x: 9, y: 1 }, { stamp: 'window', x: 25, y: 1 },
    { stamp: 'bench', x: 4, y: 27 }, { stamp: 'bench', x: 28, y: 27 }],
  npcs: [{ id: 'price-drawers-sella', x: 14, y: 27, facing: 'right' }],
  lights: [{ x: 7, y: 8, r: 78, color: 0xffdca2 }, { x: 24, y: 8, r: 77, color: 0xcce6d8 },
    { x: 9, y: 18, r: 75, color: 0xe8b9ab }, { x: 27, y: 22, r: 78, color: 0xc0d9e7 }],
  interactables: [{
    id: 'price-drawers-exit', kind: 'door', x: 18, y: 29, w: 1, h: 1, art: 'market.waypost',
    label: 'the doorway back to Lantern Square', to: { map: 'market.square', x: 5, y: 11 },
  }, ...PRICE_CASES.flatMap((entry, i): Interactable[] => {
    const x = 3 + i % 6 * 5;
    const y = 4 + Math.floor(i / 6) * 4;
    const p = `price-drawers-${entry.slug}`;
    return [{
      id: `${p}-case`, kind: 'exhibit', exhibit: entry.exhibit, x, y, w: 1, h: 1, label: entry.title, art: entry.art,
    }, {
      id: `${p}-trial`, kind: 'scene', node: `${entry.flag}.trial`, x: x+1, y: y+1, w: 1, h: 1,
      label: `the two working pockets for ${entry.accession}`, art: 'price-drawers.closed', visibleIf: priceRead(entry), walkThrough: true,
      artOpen: { key: entry.art, if: { flag: PRICE_ACTIVE, eq: entry.slug } },
    }, ...PRICE_MODES.map((mode): Interactable => ({
      id: `${p}-${mode}`, kind: 'sign', x: mode === 'offer' ? 9 : 25, y: 27, w: 1, h: 1,
      label: mode === 'offer' ? 'the offer rail with the requested terms' : 'the staffed drawer with the checked entry',
      art: `price-drawers.${mode}`, flag: `${entry.flag}.tested`, text: priceReceipt(entry, mode),
      walkThrough: true, visibleIf: priceTurn(entry, mode), sfx: 'sfx.sparkle',
    }))];
  })],
};

export const PRICE_DRAWERS_RETURNS = PRICE_CASES.flatMap((entry): Interactable[] => [{
  id: entry.returnProp, kind: 'scene', node: `${entry.flag}.return`,
  x: 27, y: 21, w: 1, h: 1, label: `Hana’s working board for ${entry.accession}`, art: entry.art,
  walkThrough: true, visibleIf: priceEquipped(entry),
}, ...PRICE_MODES.map((mode): Interactable => ({
  id: `price-drawers-${entry.slug}-ember-${mode}`, kind: 'sign',
  x: mode === 'offer' ? 26 : 30, y: 22, w: 1, h: 1, art: `price-drawers.${mode}`,
  label: mode === 'offer' ? 'the buyer’s public comparison tab' : 'the buyer’s separate checked receipt',
  visibleIf: priceReceived(entry, mode), walkThrough: true, sfx: 'sfx.sparkle',
  flag: `${entry.flag}.received`, text: priceReceipt(entry, mode, true),
}))]);
