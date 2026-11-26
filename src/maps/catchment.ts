import { CATCHMENT_ROOM, catchmentFlag, type CatchmentNotice } from '../domain/catchment';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const marked = (key: string): Condition => ({ flag: catchmentFlag(key), eq: true });
export const CATCHMENT_DISCOVERED: Condition = { all: [marked('upper'), marked('lower')] };
const posted = (notice: CatchmentNotice): Condition => ({ flag: catchmentFlag('notice'), eq: notice });
const reached = (notice: CatchmentNotice): Condition => ({ all: [posted(notice), marked(`crossed.${notice}`)] });
const checked = (notice: CatchmentNotice): Condition => ({ all: [posted(notice), { flag: catchmentFlag('checked'), eq: notice }, { item: 'item.catchment.crossing-copy' }] });

export const CATCHMENT_UPPER: Interactable = {
  id: 'catchment-upper-peg', kind: 'sign', x: 11, y: 8, w: 1, h: 1, label: 'the upper crew’s reed mark', art: 'water.notice', walkThrough: true,
  text: 'Upper peg, second bell. Six passed before the bend. Omi has scratched an arrow down from the mark. “The old service hatch used two marks. Ask the lower peg where the other went.”',
  flag: catchmentFlag('upper'),
};

export const CATCHMENT_LOWER: Interactable[] = [
  {
    id: 'catchment-lower-peg', kind: 'sign', x: 14, y: 7, w: 1, h: 1, label: 'the lower crew’s matching reed mark', art: 'water.notice', walkThrough: true,
    text: 'Lower peg, second bell. Four reached this bank. The arrow points behind the wall. The lower keeper has drawn a little door on the back of the slip.',
    flag: catchmentFlag('lower'),
  },
  {
    id: 'catchment-hatch', kind: 'door', x: 14, y: 8, w: 1, h: 1, label: 'the service hatch between the pegs', art: 'preserved.door', walkThrough: true,
    visibleIf: CATCHMENT_DISCOVERED, to: { map: CATCHMENT_ROOM, x: 7, y: 9 },
  },
  {
    id: 'catchment-terrace-receipt', kind: 'scene', x: 8, y: 11, w: 1, h: 1, label: 'the crew’s receipt on the open footboard', art: 'water.notice', walkThrough: true,
    node: 'catchment.rows', visibleIf: reached('rows'),
  },
  {
    id: 'catchment-rail-receipt', kind: 'scene', x: 21, y: 6, w: 1, h: 1, label: 'the receipt at the staffed low rail', art: 'water.notice', walkThrough: true,
    node: 'catchment.crossing', visibleIf: reached('crossing'),
  },
];

export const CATCHMENT_CANAL: Interactable[] = [
  {
    id: 'catchment-civic-terrace', kind: 'scene', x: 11, y: 11, w: 1, h: 1,
    label: 'the Canal Walk’s single-lane transfer', art: 'civic.ledger', walkThrough: true,
    node: 'catchment.civic.rows', visibleIf: checked('rows'),
  },
  {
    id: 'catchment-civic-rail', kind: 'scene', x: 20, y: 11, w: 1, h: 1,
    label: 'the Canal Walk’s paired transfer', art: 'civic.notice', walkThrough: true,
    node: 'catchment.civic.crossing', visibleIf: checked('crossing'),
  },
];

export const WATER_CULVERT: MapDef = {
  id: CATCHMENT_ROOM, name: 'Water Commons: Beneath the Pegs', world: 'WORLD-12',
  width: 16, height: 12, spawn: { x: 7, y: 9 }, music: 'music.town', ambience: 'town', background: 0x233843,
  floor: (x, y) => {
    if (x < 1 || x > 14 || y < 0 || y > 10) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 7 || y >= 8 ? 'water-path' : 'stone-c';
  },
  blocks: [[0, 0, 16, 3]], npcs: [], zones: [],
  stamps: [{ stamp: 'water-lantern', x: 6, y: 3 }, { stamp: 'water-gauge', x: 11, y: 4 }, { stamp: 'crates', x: 2, y: 6 }],
  lights: [{ x: 7, y: 5, r: 90, color: 0xc3ded6 }, { x: 5, y: 7, r: 57, color: 0xe6c487, flicker: true }, { x: 12, y: 7, r: 62, color: 0x8ed0c8 }],
  interactables: [
    { id: 'catchment-model', kind: 'fieldgame', game: 'catchment-trace', x: 7, y: 5, w: 1, h: 1, art: 'water.lever', label: 'Omi’s float model' },
    { id: 'catchment-source', kind: 'scene', node: 'catchment.source', x: 4, y: 5, w: 1, h: 1, art: 'preserved.folder', walkThrough: true, label: 'the travelling copy from Whanganui Iwi' },
    { id: 'catchment-exit', kind: 'door', x: 7, y: 10, w: 1, h: 1, art: 'preserved.door', label: 'the service hatch to the lower path', to: { map: 'water.lower-channel', x: 14, y: 9 } },
    { id: 'catchment-rows-door', kind: 'door', x: 3, y: 9, w: 1, h: 1, art: 'preserved.door', label: 'the terrace footboard door', visibleIf: posted('rows'), flag: catchmentFlag('crossed.rows'), to: { map: 'water.lower-channel', x: 7, y: 11 } },
    { id: 'catchment-rail-door', kind: 'door', x: 12, y: 9, w: 1, h: 1, art: 'preserved.door', label: 'the staffed rail door', visibleIf: posted('crossing'), flag: catchmentFlag('crossed.crossing'), to: { map: 'water.lower-channel', x: 22, y: 6 } },
  ],
};
