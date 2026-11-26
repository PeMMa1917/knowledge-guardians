import {
  JIG_CASES, JIG_LANE, JIG_MODES, JIG_RETURN_MODES, JIG_SHOP, JIG_SHOP_GATE,
  jigActive, jigEquipped, jigLane, jigReceipt, jigReturned, jigSeen,
} from '../content/jigShop';
import type { Interactable, MapDef } from './types';

export const JIG_SHOP_DOOR: Interactable = {
  id: 'jig-shop-door', kind: 'door', x: 3, y: 14, w: 1, h: 1, art: 'metalworks.waypost',
  label: 'the doorway to the jig shop', visibleIf: JIG_SHOP_GATE, to: { map: JIG_SHOP, x: 20, y: 27 },
};

const width = 40;
const height = 36;
const footmarks = { common: 14, fitted: 26 };

export const JIG_SHOP_MAP: MapDef = {
  id: JIG_SHOP, name: 'Metalworks: The Jig Shop', world: 'WORLD-07',
  background: 0x393247, width, height, music: 'music.town', ambience: 'study', spawn: { x: 20, y: 27 },
  floor: (x, y) => {
    if (x < 1 || x >= width - 1 || y < 0 || y >= height) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    if (y < 31) return y % 4 === 3 || x === 20 ? 'stone-b' : 'stone-c';
    if (y === 31) return x === footmarks.common || x === footmarks.fitted ? 'council-inlay' : null;
    if (Math.abs(x - footmarks.common) <= 2 || Math.abs(x - footmarks.fitted) <= 2) return 'council-blue';
    return null;
  },
  blocks: [[1, 0, width - 2, 3]], zones: [],
  conditionalBlocks: JIG_MODES.map((mode) => ({ x: footmarks[mode], y: 31, when: { not: jigLane(mode) } })),
  npcs: [{ id: 'jig-shop-nesta', x: 17, y: 27, facing: 'right' }],
  stamps: [
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'window', x: 19, y: 1 }, { stamp: 'window', x: 32, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 36, y: 2 },
    { stamp: 'bench', x: 3, y: 27 }, { stamp: 'bench', x: 33, y: 27 }, { stamp: 'rug-green', x: 19, y: 27 },
  ],
  lights: [
    { x: 7, y: 7, r: 110, color: 0xf1c18b }, { x: 29, y: 7, r: 110, color: 0xbdd1e9 },
    { x: 6, y: 19, r: 95, color: 0xeec48c }, { x: 30, y: 22, r: 85, color: 0xd7b8a2 },
    { x: 14, y: 32, r: 50, color: 0xb5e2cc }, { x: 26, y: 32, r: 52, color: 0xf5c59e },
  ],
  interactables: [{
    id: 'jig-shop-exit', kind: 'door', x: 20, y: 26, w: 1, h: 1, art: 'metalworks.waypost',
    label: 'the doorway back to the Sample Yard', to: { map: 'metalworks.yard', x: 4, y: 14 },
  }, {
    id: 'jig-shop-guide', kind: 'sign', x: 18, y: 29, w: 1, h: 1, walkThrough: true, art: 'preserved.slip',
    label: 'the two fitting lane guide',
    text: 'Take the practice blank from any case. The common support clears the west lane. The fitted support clears the east lane. Both lanes return here. Check one support or return and try the other.',
  }, ...JIG_MODES.map((mode): Interactable => ({
    id: `jig-shop-${mode}-footmark`, kind: 'sign', x: footmarks[mode], y: 30, w: 1, h: 1,
    label: `the ${mode} lane’s footmark`, text: 'The passage beyond this mark opens after that support is set at the fixture.',
    art: 'jig-shop.closed', artOpen: { if: jigLane(mode), key: `jig-shop.${mode}` }, walkThrough: true,
  })), ...JIG_CASES.flatMap((entry, index): Interactable[] => {
    const x = 3 + index % 7 * 5;
    const y = 4 + Math.floor(index / 7) * 4;
    const id = `jig-shop-${entry.slug}`;
    return [{
      id: `${id}-case`, kind: 'exhibit', exhibit: entry.exhibit, label: entry.title, x, y, w: 1, h: 1, art: entry.art,
    }, {
      id: `${id}-sample`, kind: 'scene', node: `${entry.flag}.take`, label: `the practice blank for ${entry.accession}`,
      x: x + 1, y: y + 1, w: 1, h: 1, art: 'jig-shop.closed', walkThrough: true, visibleIf: jigSeen(entry),
      artOpen: { key: entry.art, if: jigActive(entry) },
    }, {
      id: `${id}-fit`, kind: 'scene', node: `${entry.flag}.fit`, label: `the fitting stand with ${entry.accession}’s practice blank`,
      x: 20, y: 29, w: 1, h: 1, art: entry.art, walkThrough: true, visibleIf: jigActive(entry),
      artBy: { flag: JIG_LANE, keys: { common: 'jig-shop.common', fitted: 'jig-shop.fitted' } },
    }, ...JIG_MODES.map((mode): Interactable => ({
      id: `${id}-${mode}`, kind: 'sign', x: footmarks[mode], y: 34, w: 1, h: 1,
      label: `the ${mode} support’s independent witness for ${entry.accession}`,
      art: `jig-shop.${mode}`, walkThrough: true, flag: `${entry.flag}.used.${mode}`, sfx: 'sfx.sparkle',
      visibleIf: { all: [jigActive(entry), jigLane(mode)] }, text: entry[`${mode}Result`],
    }))];
  })],
};

export const JIG_EMBERFORD_RETURNS = JIG_CASES.flatMap((entry): Interactable[] => [{
  id: entry.returnProp, kind: 'scene', node: `${entry.flag}.return`,
  x: 9, y: 20, w: 1, h: 1, label: `Hesper’s receiving fixture for ${entry.accession}`,
  art: entry.art, walkThrough: true, visibleIf: jigEquipped(entry),
}, ...JIG_RETURN_MODES.map((mode): Interactable => ({
  id: `jig-shop-${entry.slug}-${mode}`, kind: 'sign',
  x: mode === 'bench' ? 10 : 11, y: mode === 'bench' ? 21 : 22, w: 1, h: 1,
  label: `the ${mode === 'bench' ? 'shared bench' : 'fitted tray'} for ${entry.accession}`,
  art: mode === 'bench' ? 'jig-shop.common' : 'jig-shop.fitted', walkThrough: true,
  visibleIf: jigReturned(entry, mode), flag: `${entry.flag}.used.return`, sfx: 'sfx.sparkle', text: jigReceipt(entry, mode),
}))]);
