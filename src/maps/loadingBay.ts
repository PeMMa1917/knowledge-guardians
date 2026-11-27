import { LOAD_CASES, LOAD_CHECK_MAP, LOAD_GATE, LOAD_GROUP } from '../content/loadingBay';
import { loadKey, type LoadRoute } from '../domain/loadingBay';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

const BAY = 'council.loading-bay';
const WIDTH = 37;
const HEIGHT = 31;

export const LOADING_BAY_DOOR: Interactable = { id: 'loading-bay-door', kind: 'door', x: 28, y: 17, w: 1, h: 1,
  label: 'the blue door to the Council Cart Bay', art: 'council.waypost', visibleIf: LOAD_GATE, to: { map: BAY, x: 18, y: 27 } };

export function loadingReceiver(route: LoadRoute, x: number, y: number): Interactable {
  return { id: `loading-receiver-${route}`, kind: 'fieldgame', game: `${LOAD_GROUP}:${route}`, x, y, w: 1, h: 1,
    label: route === 'bench' ? 'Hale’s low deposit bench' : 'Essi’s handover rail', art: 'loading.cart', walkThrough: true,
    visibleIf: { any: LOAD_CASES.map(({ slug }) => ({ flag: `${loadKey(slug)}.route`, eq: route })) },
    artOpen: { key: route === 'bench' ? 'loading.marked' : 'loading.fitted', if: {
      any: LOAD_CASES.map(({ slug }) => ({ flag: `${loadKey(slug)}.received`, eq: route })),
    } },
  };
}

function cartMap(id: string, name: string, tiles: [string, string], interactables: Interactable[]): MapDef {
  return { id, name, world: 'WORLD-16', width: WIDTH, height: HEIGHT, music: 'music.archive', ambience: 'study', background: 0x353d54,
    floor: (x, y) => x < 1 || x > WIDTH - 2 || y < 0 || y >= HEIGHT ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y]
      : y % 4 === 2 || x === 18 ? tiles[1] : tiles[0],
    blocks: [[1, 0, WIDTH - 2, 3]], zones: [], npcs: [], spawn: { x: 18, y: 27 },
    stamps: [{ stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 27, y: 1 },
      { stamp: 'council-clock-shelf', x: 1, y: 3 }, { stamp: 'council-clock-shelf', x: 31, y: 3 },
      { stamp: 'council-bench', x: 2, y: 28 }, { stamp: 'council-bench', x: 30, y: 28 }],
    lights: Array.from({ length: 9 }, (_, index) => ({ x: 7 + 11 * (index % 3), y: 6 + 10 * Math.floor(index / 3),
      r: 96, color: [0xf2d7ad, 0xb1d5dc, 0xe1bcea][index % 3] })), interactables,
  };
}

export const COUNCIL_LOADING_BAY = cartMap(BAY, 'Council of Inquiry: Cart Bay', ['council-blue', 'council-inlay'], [
  { id: 'loading-bay-return', kind: 'door', x: 18, y: 29, w: 1, h: 1,
    label: 'the passage back to the Bell Rail', art: 'council.waypost', to: { map: 'council.gallery', x: 28, y: 16 } },
  { id: 'loading-check-door', kind: 'door', x: 18, y: 4, w: 1, h: 1,
    label: 'the violet door to the return-load racks', art: 'preserved.door',
    visibleIf: { any: LOAD_CASES.map(({ objective }) => ({ objective })) }, to: { map: LOAD_CHECK_MAP, x: 18, y: 27 } },
  { id: 'loading-bay-slip', kind: 'sign', x: 19, y: 27, w: 1, h: 1, walkThrough: true, label: 'the bay’s work notice', art: 'council.letter',
    text: 'Hale has a low bench in Time Hall for people who arrive between readings. Essi has a rail where readers try a cart together. The cases have records from elsewhere. Load only the practice boxes at their adjoining stands.' },
  ...LOAD_CASES.flatMap((record, index): Interactable[] => {
    const x = 3 + 6 * (index % 6);
    const y = 5 + 4 * Math.floor(index / 6);
    return [{ id: `loading-${record.slug}-exhibit`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1, walkThrough: true,
      art: 'council.record', label: `the exact record for ${record.name}` },
    { id: `loading-${record.slug}-stand`, kind: 'fieldgame', game: `${LOAD_GROUP}:trial:${record.slug}`, x: x + 2, y, w: 1, h: 1,
      walkThrough: true, art: 'loading.cart', label: `the axle stand beside ${record.name}`,
      artOpen: { key: 'loading.marked', if: { objective: record.objective } } }];
  }),
]);

export const COUNCIL_LOAD_CHECK = cartMap(LOAD_CHECK_MAP, 'Council of Inquiry: Return-Load Racks', ['council-purple', 'council-gallery-runner'], [
  { id: 'loading-check-return', kind: 'door', x: 18, y: 29, w: 1, h: 1,
    label: 'the passage to the Cart Bay', art: 'preserved.door', to: { map: BAY, x: 18, y: 5 } },
  { id: 'loading-check-slip', kind: 'sign', x: 19, y: 27, w: 1, h: 1, walkThrough: true, label: 'the return rack’s work notice', art: 'council.letter',
    text: 'Keep the old axle mark until you have tried the returned load there. Equip a Cart Bay object in the Bag. Its rack lights up with the recorded load and the two ways the keeper can adjust it.' },
  ...LOAD_CASES.map((record, index): Interactable => ({
    id: record.returnProp, kind: 'fieldgame', game: `${LOAD_GROUP}:return:${record.slug}`, x: 4 + 6 * (index % 6), y: 5 + 4 * Math.floor(index / 6),
    w: 1, h: 1, walkThrough: true, art: 'loading.cart', visibleIf: specimenEquipped(record.key),
    artOpen: { key: 'loading.fitted', if: { objective: record.returnObjective } }, label: `the return rack for ${record.name}`,
  })),
]);
