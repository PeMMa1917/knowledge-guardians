import { CALLBOARD_CASES, CALLBOARD_FOLIO, CALLBOARD_GROUP, CALLBOARD_OPEN, CALLBOARD_SHORT, GAGE, GAGE_ART, callboardReturnCases } from '../content/callboardCases';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function station(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `callboard-${id}`, game: `${CALLBOARD_GROUP}:${id}`, kind: 'fieldgame', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

export const CIVIC_CALLBOARD_DOOR: Interactable = {
  id: 'civic-callboard-door', kind: 'door', x: 26, y: 14, w: 1, h: 1, label: 'Civic Callboard Reading Room', art: 'preserved.door',
  visibleIf: CALLBOARD_OPEN, to: { map: 'civic.callboard', x: 18, y: 34 },
};

function returnProp(id: 'claims' | 'maker' | 'return-view', x: number, y: number, label: string, art: string): Interactable {
  const matches = callboardReturnCases(id);
  return { ...station(id, x, y, label, art, { any: matches.map(({ key }) => specimenEquipped(key)) }),
    id: matches[0].revisit.prop,
    artOpen: { key: 'preserved.display-records', if: { any: matches.map(({ flag }) => ({ flag: `${flag}.returned`, eq: true })) } } };
}

export const SEA_CALLBOARD_RETURNS: Interactable[] = [
  returnProp('claims', 3, 8, 'Renna’s paired clip for a map’s people and claims', 'sea.shore-chart'),
  returnProp('return-view', 5, 11, 'Renna’s spare record and view clips', 'preserved.folder'),
];

export const METAL_CALLBOARD_RETURN = returnProp('maker', 6, 12, 'the inscribed name and maker clips', GAGE_ART);

const WIDTH = 39;
const HEIGHT = 37;
export const CIVIC_CALLBOARD: MapDef = {
  id: 'civic.callboard', name: 'Civic Dispatch: The Callboard Reading Room', world: 'WORLD-13',
  width: WIDTH, height: HEIGHT, spawn: { x: 18, y: 34 }, music: 'music.archive', ambience: 'study', background: 0x283e45,
  floor: (x, y) => {
    if (x < 1 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 18 || x === 19 || y >= 32 ? 'civic-hall-route' : 'civic-hall-tile';
  },
  blocks: [[1, 0, WIDTH - 2, 3]], zones: [],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 18, y: 1 }, { stamp: 'window', x: 31, y: 1 },
    { stamp: 'rug-green', x: 17, y: 33 }, { stamp: 'bookshelf', x: 33, y: 3 },
  ],
  lights: [
    ...[6, 19, 32].flatMap((x) => [6, 17, 27].map((y) => ({ x, y, r: 105, color: 0xf2cb9e }))),
    { x: 18, y: 34, r: 80, color: 0xaae4d4 },
  ],
  npcs: [
    { id: 'callboard-keeper', x: 21, y: 34, facing: 'left' },
    { id: 'callboard-reader', x: 7, y: 33, facing: 'down', visibleIf: { not: CALLBOARD_SHORT } },
    { id: 'callboard-reader', x: 33, y: 32, facing: 'left', visibleIf: CALLBOARD_SHORT },
  ],
  interactables: [
    ...CALLBOARD_CASES.flatMap((c, i): Interactable[] => {
      const x = 3 + 6 * (i % 6), y = 5 + 5 * Math.floor(i / 6);
      return [
        { id: `callboard-case-${c.slug}`, kind: 'exhibit', exhibit: c.artifact, x, y, w: 1, h: 1,
          label: c.title, art: c.key === GAGE ? GAGE_ART : 'preserved.folder' },
        { ...station(c.slug, x + 2, y, `the two clips for ${c.accession}`, 'board-stand', CALLBOARD_OPEN),
          artOpen: { key: 'preserved.display-paired', if: { objective: c.objective } } },
      ];
    }),
    station('first', 6, 34, 'the first reading bench', 'civic.ledger', CALLBOARD_OPEN),
    station('second', 32, 33, 'the later source-call desk', 'civic.notice', CALLBOARD_OPEN),
    { id: 'callboard-seal-folio', kind: 'scene', node: 'callboard.authorise', x: 20, y: 34, w: 1, h: 1,
      label: 'Orella’s clip for the signed Lantern House folio', art: 'fold.paired', walkThrough: true,
      visibleIf: { all: [CALLBOARD_FOLIO, { not: CALLBOARD_SHORT }] } },
    { id: 'callboard-short-passage', kind: 'door', x: 9, y: 33, w: 1, h: 1, label: 'the signed short passage to the source desk',
      art: 'preserved.door', openIf: CALLBOARD_SHORT, to: { map: 'civic.callboard', x: 31, y: 34 },
      text: 'Orella can open this staffed passage when a completed Lantern House folio has arrived.' },
    { id: 'callboard-short-back', kind: 'door', x: 32, y: 35, w: 1, h: 1, label: 'the signed passage back to the first bench',
      art: 'preserved.door', visibleIf: CALLBOARD_SHORT, to: { map: 'civic.callboard', x: 10, y: 34 } },
    { id: 'callboard-return', kind: 'door', x: 18, y: 36, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to Civic Dispatch', to: { map: 'civic.dispatch', x: 25, y: 14 } },
  ],
};
