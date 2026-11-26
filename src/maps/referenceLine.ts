import {
  REFERENCE_CASES, REFERENCE_LAST, REFERENCE_LAYOUTS, REFERENCE_LINE_AVAILABLE,
  referenceBenchFree, referenceChosen, referenceCompactLane, referenceInHand, referenceMatched, referenceMounted,
  referencePairedLane, referenceProcessed, type ReferenceCase,
} from '../content/referenceLine';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, visibleIf?: Condition): Interactable {
  return { id, x, y, w: 1, h: 1, label, to, visibleIf, kind: 'door', art: 'preserved.door' };
}

export const REFERENCE_HALL_DOOR = door('metal-reference-shop', 18, 13, 'the pattern shop', {
  map: 'metalworks.reference-floor', x: 16, y: 19,
}, REFERENCE_LINE_AVAILABLE);

export const REFERENCE_YARD_DOOR = door('metal-reference-yard', 23, 8, 'the testing lanes', {
  map: 'metalworks.reference-lanes', x: 3, y: 12,
}, REFERENCE_LINE_AVAILABLE);

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, node, x, y, w: 1, h: 1, label, art, visibleIf, kind: 'scene', walkThrough: true, sfx: 'sfx.page' };
}

const retained = (entry: ReferenceCase): Condition => ({ flagSet: entry.objective });
const mounted = (entry: ReferenceCase, mode: 'paired' | 'compact'): Condition =>
  ({ all: [referenceInHand(entry), referenceChosen(entry, mode), referenceMounted(entry)] });

function workFloor(width: number, height: number, x: number, y: number): string | null {
  if (x < 1 || x >= width - 1 || y < 0 || y >= height - 1) return null;
  if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
  return 'stone-c';
}

function sourceStand(entry: ReferenceCase, i: number): Interactable[] {
  const x = 3 + (i % 6) * 5;
  const y = 5 + Math.floor(i / 6) * 4;
  const belongsHere = { card: entry.card };
  return [{
    id: `line-${entry.slug}-exhibit`, kind: 'exhibit', x, y, w: 1, h: 1,
    label: entry.title, art: 'collection-stand', exhibit: entry.exhibit,
  },
  scene(`line-${entry.slug}-order`, `${entry.flag}.order`, x + 2, y, `the order stand for ${entry.accession}`,
    'board-stand', { all: [belongsHere, referenceBenchFree, { not: retained(entry) }] }),
  scene(`line-${entry.slug}-cancel`, `${entry.flag}.cancel`, x + 2, y, 'the hook for this reference order',
    'preserved.slip', { all: [referenceInHand(entry), { not: referenceMounted(entry) }] }),
  scene(`line-${entry.slug}-mounted`, `${entry.flag}.mount.kept`, x + 2, y, 'the note pointing to the testing lane',
    'metalworks.receipt', { all: [referenceInHand(entry), referenceMounted(entry)] }),
  ...REFERENCE_LAYOUTS.map((mode) => scene(`line-${entry.slug}-reply-${mode}`, `${entry.flag}.reply.${mode}`, x + 2, y,
    `the ${mode === 'compact' ? 'narrow-lane' : 'shared-lane'} reply for ${entry.accession}`,
    mode === 'compact' ? 'fold.strip' : 'preserved.display-paired', referenceProcessed(entry, mode)))];
}

export const REFERENCE_FLOOR: MapDef = {
  id: 'metalworks.reference-floor', name: 'Metalworks: Pattern Shop', world: 'WORLD-07',
  width: 34, height: 23, spawn: { x: 16, y: 19 },
  music: 'music.archive', ambience: 'study', background: 0x44353e,
  floor: (x, y) => workFloor(34, 23, x, y),
  blocks: [[0, 0, 34, 3], [0, 0, 1, 23], [33, 0, 1, 23], [0, 22, 34, 1]], zones: [],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 15, y: 1 }, { stamp: 'window', x: 26, y: 1 },
    { stamp: 'rug-green', x: 15, y: 7 }, { stamp: 'rug-green', x: 15, y: 15 },
    { stamp: 'bench', x: 3, y: 19 }, { stamp: 'bench', x: 26, y: 19 },
  ],
  lights: [
    { x: 4, y: 7, r: 86, color: 0xe9ceaa }, { x: 14, y: 8, r: 92, color: 0xc0c5d1 },
    { x: 25, y: 8, r: 93, color: 0xf5d192 }, { x: 6, y: 15, r: 85, color: 0xc8d6ba },
    { x: 18, y: 15, r: 85, color: 0xf0ddb1 }, { x: 28, y: 16, r: 82, color: 0xa7cdcf },
    { x: 16, y: 19, r: 73, color: 0xf2cb9f, flicker: true },
  ],
  npcs: [{ id: 'reference-line-deva', x: 19, y: 20, facing: 'left' }],
  interactables: [
    ...REFERENCE_CASES.flatMap(sourceStand),
    door('reference-floor-back', 16, 21, 'the Trade Hall', { map: 'metalworks.records', x: 17, y: 13 }),
  ],
};

function railGate(id: string, y: number, label: string, condition: Condition, text: string): Interactable {
  return { id, x: 9, y, w: 1, h: 1, label, text, kind: 'sign', art: 'cellar-door', walkThrough: true,
    artOpen: { key: 'cellar-door.open', if: condition } };
}

function laneWork(entry: ReferenceCase): Interactable[] {
  return [
    ...REFERENCE_LAYOUTS.flatMap((mode): Interactable[] => {
      const compact = mode === 'compact';
      const y = compact ? 7 : 11;
      const railArt = compact ? 'plumb-mark' : 'preserved.display-paired';
      return [
        scene(`line-${entry.slug}-install-${mode}`, `${entry.flag}.install.${mode}`, 5, 9,
          `the order for ${entry.accession}`, 'metalworks.receipt',
          { all: [referenceInHand(entry), referenceChosen(entry, mode), { not: referenceMounted(entry) }] }),
        scene(`line-${entry.slug}-check-${mode}`, `${entry.flag}.check.${mode}`, 13, y,
          compact ? 'the fixed stop past the upper gate' : 'the other support past the lower gate', railArt,
          { all: [mounted(entry, mode), compact ? referenceCompactLane : referencePairedLane] }),
        scene(`line-${entry.slug}-receipt-${mode}`, `${entry.flag}.reply.${mode}`, 13, y,
          `Noll’s checked setup for ${entry.accession}`, railArt,
          { all: [referenceBenchFree, referenceProcessed(entry, mode), { flag: REFERENCE_LAST, eq: entry.slug }] }),
      ];
    }),
    scene(`line-${entry.slug}-match`, `${entry.flag}.match`, 7, 11, 'the first support outside the lower gate',
      'plumb-mark', { all: [mounted(entry, 'paired'), { not: referenceMatched(entry) }] }),
    scene(`line-${entry.slug}-match-kept`, `${entry.flag}.matched`, 7, 11,
      'the aligned mark by the lower gate', 'forest.field-diagram',
      { all: [mounted(entry, 'paired'), referenceMatched(entry)] }),
  ];
}

export const REFERENCE_LANES: MapDef = {
  id: 'metalworks.reference-lanes', name: 'Metalworks: Testing Lanes', world: 'WORLD-07',
  width: 19, height: 16, spawn: { x: 3, y: 12 },
  music: 'music.town', ambience: 'study', background: 0x43373d,
  floor: (x, y) => x === 9 && y >= 3 && y < 15 && ![7, 11].includes(y) ? 'wall-mid' : workFloor(19, 16, x, y),
  blocks: [[0, 0, 19, 3], [0, 0, 1, 16], [18, 0, 1, 16], [0, 15, 19, 1],
    [9, 3, 1, 4], [9, 8, 1, 3], [9, 12, 1, 3]],
  conditionalBlocks: [
    { x: 9, y: 7, when: { not: referenceCompactLane } },
    { x: 9, y: 11, when: { not: referencePairedLane } },
  ],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 13, y: 1 },
    { stamp: 'cabinet', x: 2, y: 4 }, { stamp: 'bench', x: 15, y: 4 },
  ],
  lights: [
    { x: 4, y: 8, r: 68, color: 0xf2c890 }, { x: 10, y: 7, r: 54, color: 0xb0d2c6 },
    { x: 10, y: 11, r: 60, color: 0xe7c48d }, { x: 14, y: 9, r: 60, color: 0xf0d4ac, flicker: true },
  ],
  zones: [],
  npcs: [{ id: 'reference-line-noll', x: 3, y: 7, facing: 'right' }],
  interactables: [
    door('reference-yard-back', 3, 14, 'the Sample Yard', { map: 'metalworks.yard', x: 24, y: 8 }),
    railGate('reference-upper-gate', 7, 'the upper narrow gate', referenceCompactLane,
      'The upper lane opens for one fixed support. Leave room for the carrier to pass.'),
    railGate('reference-lower-gate', 11, 'the lower wide gate', referencePairedLane,
      'Fit the first support to the marks on this side before the lower gate can swing.'),
    ...REFERENCE_CASES.flatMap(laneWork),
  ],
};
