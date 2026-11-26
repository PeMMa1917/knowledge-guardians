import { BEARING_CASES, BEARING_GATE, BEARING_GROUP, BEARING_RETURN_MAP } from '../content/bearingBay';
import { bearingKey, type BearingRoute } from '../domain/bearingBay';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

const HALL = 'observatory.bearing-room';
const WIDTH = 43;
const HEIGHT = 31;

export const BEARING_DOOR: Interactable = { id: 'bearing-bay-door', kind: 'door', art: 'bearing.sight', label: 'the green door to the Bearing Room',
  x: 16, y: 8, w: 1, h: 1, visibleIf: BEARING_GATE, to: { map: HALL, x: 22, y: 27 } };

export function bearingReceiver(route: BearingRoute, x: number, y: number): Interactable {
  return { id: `bearing-receiver-${route}`, kind: 'fieldgame', game: `${BEARING_GROUP}:${route}`, x, y, w: 1, h: 1, walkThrough: true,
    label: route === 'quay' ? 'the low lamp frame at the west dock' : 'the Fold’s two-strip sight rail', art: 'bearing.sight',
    visibleIf: { any: BEARING_CASES.map(({ slug }) => ({ flag: `${bearingKey(slug)}.route`, eq: route })) },
    artOpen: { key: route === 'quay' ? 'bearing.side' : 'bearing.pair', if: {
      any: BEARING_CASES.map(({ slug }) => ({ flag: `${bearingKey(slug)}.received`, eq: route })),
    } } };
}

function sightRoom(id: string, name: string, tiles: [string, string], interactables: Interactable[]): MapDef {
  return {
    id, name, world: 'WORLD-05', width: WIDTH, height: HEIGHT, spawn: { x: 22, y: 27 }, music: 'music.archive', ambience: 'study', background: 0x28435b,
    floor: (x, y) => x < 1 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : y % 4 === 2 || x === 22 ? tiles[1] : tiles[0],
    blocks: [[1, 0, WIDTH - 2, 3]], npcs: [], zones: [],
    stamps: [{ stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 18, y: 1 }, { stamp: 'window', x: 29, y: 1 },
      { stamp: 'bench', x: 2, y: 27 }, { stamp: 'bench', x: 35, y: 27 }, { stamp: 'market-planter', x: 8, y: 28 }, { stamp: 'market-planter', x: 33, y: 28 }],
    lights: Array.from({ length: 12 }, (_, index) => ({ x: 5 + 10 * (index % 4), y: 5 + 10 * Math.floor(index / 4), r: 93,
      color: [0xb9ded9, 0xb0aee8, 0xf4d8aa][index % 3] })), interactables,
  };
}

export const BEARING_ROOM = sightRoom(HALL, 'Observatory Coast: Bearing Room', ['council-blue', 'council-inlay'], [
  { id: 'bearing-bay-return', kind: 'door', x: 22, y: 29, w: 1, h: 1, art: 'coast.waypost', label: 'the passage to Headland Station',
    to: { map: 'observatory.station', x: 16, y: 9 } },
  { id: 'bearing-return-door', kind: 'door', x: 22, y: 4, w: 1, h: 1, art: 'bearing.side', label: 'the door to the return shutters',
    visibleIf: { any: BEARING_CASES.map(({ objective }) => ({ objective })) }, to: { map: BEARING_RETURN_MAP, x: 22, y: 27 } },
  { id: 'bearing-bay-notice', kind: 'sign', x: 23, y: 27, w: 1, h: 1, walkThrough: true, art: 'preserved.slip', label: 'the first-bell card',
    text: 'The source cases give views made elsewhere. Put the practice lamp on two strips from the same bell. The low west dock has room for a lamp frame. Marl Fold has a rail where a guide can let two people try the strips.' },
  ...BEARING_CASES.flatMap((record, index): Interactable[] => {
    const x = 3 + 6 * (index % 7);
    const y = 5 + 4 * Math.floor(index / 7);
    return [{ id: `bearing-${record.slug}-exhibit`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1, walkThrough: true,
      art: 'coast.signal', label: `the dated record for ${record.name}` },
    { id: `bearing-${record.slug}-stand`, kind: 'fieldgame', game: `${BEARING_GROUP}:first:${record.slug}`, x: x + 2, y, w: 1, h: 1, walkThrough: true,
      art: 'bearing.sight', label: `the two sight lines for ${record.name}`, artOpen: { key: 'bearing.pair', if: { objective: record.objective } } }];
  }),
]);

export const BEARING_RETURN_ROOM = sightRoom(BEARING_RETURN_MAP, 'Observatory Coast: Return Shutters', ['council-purple', 'council-gallery-runner'], [
  { id: 'bearing-return-back', kind: 'door', x: 22, y: 29, w: 1, h: 1, art: 'bearing.sight', label: 'the door to the Bearing Room', to: { map: HALL, x: 22, y: 5 } },
  { id: 'bearing-return-notice', kind: 'sign', x: 23, y: 27, w: 1, h: 1, walkThrough: true, art: 'preserved.slip', label: 'the card below the return shutters',
    text: 'Equip one working copy from the Bag. Its shutter shows a missing or changed sight. The keeper has space to keep a matched pair at the next bell or to guide a reader from the third post now.' },
  ...BEARING_CASES.map((record, index): Interactable => ({
    id: record.returnProp, kind: 'fieldgame', game: `${BEARING_GROUP}:return:${record.slug}`, x: 4 + 6 * (index % 7), y: 5 + 4 * Math.floor(index / 7), w: 1, h: 1,
    art: 'bearing.sight', label: `the return shutter for ${record.name}`, walkThrough: true, visibleIf: specimenEquipped(record.key),
    artBy: { flag: `${bearingKey(record.slug)}.fitted`, keys: { wait: 'bearing.pair', side: 'bearing.side' } },
  })),
]);
