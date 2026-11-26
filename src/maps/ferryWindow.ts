import {
  FERRY_WINDOW_CASES, FERRY_WINDOW_OPEN, WINDOW_KEEPER, WINDOW_LAST_RETURN, WINDOW_METHODS, WINDOW_READER,
  atWindow, inWindow, shutterOpen, windowEmpty, windowMounted, windowPanel, windowReturned, type WindowCase,
} from '../content/ferryWindow';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const FERRY_WINDOW_DOOR: Interactable = {
  id: 'ferry-window-door', kind: 'door', x: 17, y: 6, w: 1, h: 1,
  label: 'the door to the ferry’s Lantern Window Room', art: 'preserved.door',
  visibleIf: FERRY_WINDOW_OPEN, to: { map: 'aethelgard.ferry-window', x: 17, y: 27 },
};

function scene(id: string, node: string, x: number, y: number, label: string, art: string,
  visibleIf: Condition, sfx = 'sfx.page'): Interactable {
  return { id: `ferry-window-${id}`, node, x, y, w: 1, h: 1, label, art, visibleIf, kind: 'scene', walkThrough: true, sfx };
}

function caseProps(entry: WindowCase, index: number): Interactable[] {
  const x = 3 + (index % 7) * 6;
  const y = 5 + Math.floor(index / 7) * 3;
  return [
    { id: `ferry-window-${entry.slug}-exhibit`, kind: 'exhibit', exhibit: entry.exhibit, x, y, w: 1, h: 1,
      art: 'collection-stand', label: `${entry.title} · ${entry.accession}` },
    scene(`${entry.slug}-take`, `${entry.flag}.take`, x + 2, y, `the working sheet for ${entry.accession}`, 'board-stand',
      { all: [{ card: entry.card }, windowEmpty, { not: { objective: entry.objective } }] }),
    scene(`${entry.slug}-pause`, `${entry.flag}.pause`, x + 2, y, 'the hook for the working sheet', 'preserved.slip', inWindow(entry)),
    ...WINDOW_METHODS.map((method) => scene(`${entry.slug}-${method}-readback`, `${entry.flag}.${method}-readback`, x + 2, y,
      method === 'hinge' ? 'the blocked view beside the cleared line' : 'the two marked positions beside the cargo plan',
      method === 'hinge' ? 'coast.clear-frame-row' : 'preserved.display-paired', windowMounted(entry, method))),
  ];
}

const W = 44;
const H = 31;

export const FERRY_WINDOW: MapDef = {
  id: 'aethelgard.ferry-window', name: 'The Old Ferry Landing: Lantern Window Room', world: 'WORLD-02',
  width: W, height: H, spawn: { x: 17, y: 27 }, music: 'music.town', ambience: 'study', background: 0x493b36,
  floor: (x, y) => {
    if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    if (y === 28 || (y >= 21 && (x === 22 || x === 28))) return 'stone-c';
    return 'island-boards';
  },
  blocks: [[0, 0, W, 3], [18, 24, 4, 1], [23, 24, 4, 1]],
  conditionalBlocks: [{ x: 22, y: 24, when: { not: shutterOpen } }],
  stamps: [
    ...[5, 15, 25, 35].map((x) => ({ stamp: 'window', x, y: 1 })),
    { stamp: 'rug-green', x: 15, y: 27 }, { stamp: 'crates', x: 18, y: 23 },
    { stamp: 'crates', x: 25, y: 23 }, { stamp: 'bench', x: 29, y: 21 },
    { stamp: 'cabinet', x: 39, y: 21 }, { stamp: 'crates', x: 24, y: 27 },
  ],
  lights: [
    ...[6, 17, 29, 39].flatMap((x) => [6, 15].map((y) => ({ x, y, r: 100, color: 0xe9c993 }))),
    { x: 21, y: 25, r: 60, color: 0xffcf95, flicker: true },
    { x: 26, y: 21, r: 75, color: 0xa4d6c4 },
  ],
  npcs: [{ id: WINDOW_KEEPER, x: 16, y: 24, facing: 'right' }, { id: WINDOW_READER, x: 24, y: 20, facing: 'down' }],
  zones: [],
  interactables: [
    ...FERRY_WINDOW_CASES.flatMap(caseProps),
    { id: 'ferry-window-exit', kind: 'door', x: 17, y: 29, w: 1, h: 1,
      label: 'the door back to Tova’s ferry landing', to: { map: 'aethelgard.ferry', x: 17, y: 7 }, art: 'preserved.door' },
    { id: 'ferry-window-guide', kind: 'sign', label: 'the model directions', x: 19, y: 27, w: 1, h: 1, walkThrough: true,
      art: 'forest.notice', text: 'After the low eye notch, use the hinge and cross through the opening, or walk around to the ledge with the cargo screen in place. Take the checked view to Merrit on the far side.' },
    { id: 'ferry-window-screen', kind: 'sign', label: 'the cargo screen and its hinge', x: 22, y: 24, w: 1, h: 1,
      walkThrough: true, art: 'seam.baffle', artOpen: { key: 'seam.open-view', if: shutterOpen },
      text: 'The hinged screen blocks a centre view when closed. The ledge outside the screen is a walk around the boxes.' },
    scene('eye', 'ferry-window.stop.eye', 20, 25, 'the low eye notch in front of the model', 'coast.clear-frame', atWindow('eye')),
    scene('hinge', 'ferry-window.stop.hinge', 22, 26, 'the cargo screen’s hinge handle', 'road-post', atWindow('hinge'), 'sfx.metal'),
    scene('open', 'ferry-window.stop.open', 22, 22, 'the far slot through the cleared viewing line', 'coast.clear-frame-row', atWindow('open')),
    scene('edge', 'ferry-window.stop.edge', 28, 24, 'the outside ledge round the boxes', 'coast.clear-frame-edge', atWindow('edge')),
    scene('handover', 'ferry-window.stop.handover', 24, 21, 'the bench where Merrit can repeat the view', 'workbench', atWindow('handover')),
    { id: 'ferry-window-hinge-mounted', kind: 'sign', label: 'Merrit’s cleared sight and cargo bay', x: 23, y: 21, w: 1, h: 1,
      art: 'coast.clear-frame-row', walkThrough: true, visibleIf: windowPanel('hinge'),
      text: 'A carrier can stand in the cleared line. The first mark records where the screen used to stop the view. Merrit’s bay keeps the boxes out of that line.' },
    { id: 'ferry-window-edge-mounted', kind: 'sign', label: 'Merrit’s paired standing marks at the ledge', x: 29, y: 24, w: 1, h: 1,
      art: 'preserved.display-paired', walkThrough: true, visibleIf: windowPanel('edge'),
      text: 'The cargo screen stays closed. The two sheets keep the low notch and outside ledge separate. A walker can try either view.' },
  ],
};

const windowCopyEquipped: Condition = { any: FERRY_WINDOW_CASES.map(({ key }) => specimenEquipped(key)) };

export const EMBERFORD_WINDOW: Interactable[] = FERRY_WINDOW_CASES.flatMap((entry) => {
  const equipped = specimenEquipped(entry.key);
  const returned = windowReturned(entry);
  return [
    scene(`ember-${entry.slug}`, `${entry.flag}.ember`, 35, 20,
      `the east road sight board for ${entry.accession}`, 'coast.clear-frame', { all: [equipped, { not: returned }] }),
    { ...scene(`ember-${entry.slug}-readback`, `${entry.flag}.ember-readback`, 35, 20,
      `the east road’s checked sight for ${entry.accession}`, 'preserved.display-paired', {
        all: [returned, { any: [equipped, { all: [{ not: windowCopyEquipped }, { flag: WINDOW_LAST_RETURN, eq: entry.slug }] }] }],
      }), artBy: { flag: entry.objective, keys: { hinge: 'coast.clear-frame-row', edge: 'coast.clear-frame-edge' } } },
  ];
});
