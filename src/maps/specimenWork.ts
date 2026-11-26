import { SPECIMEN_WORK, workChoice, workReady, workTrial, type SpecimenWork } from '../content/specimenWorkCases';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

type Workshop = SpecimenWork['room'];
const positions = [[4, 5], [15, 5], [4, 10], [15, 10]] as const;

const rooms = {
  market: {
    map: 'market.sample-shed', name: 'Market of Measures: Sample Shed', world: 'WORLD-11',
    outside: 'market.square', entrance: [31, 11], returnPoint: [31, 12], chapter: 'market.arrival',
    doorArt: 'market.waypost', music: 'music.town', ambience: 'town', background: 0x344245,
    keepers: [
      { id: 'specimen-work-vera', x: 10, y: 5, facing: 'down' },
      { id: 'specimen-work-sali', x: 10, y: 10, facing: 'down' },
    ],
  },
  stage: {
    map: 'stage.prop-room', name: 'House of Performance: Prop Room', world: 'WORLD-10',
    outside: 'stage.gallery', entrance: [22, 13], returnPoint: [22, 14], chapter: 'stage.arrival',
    doorArt: 'stage.waypost', music: 'music.archive', ambience: 'study', background: 0x3d3150,
    keepers: [{ id: 'specimen-work-tobin', x: 10, y: 5, facing: 'down' }],
  },
} as const;

export function specimenWorkId(record: SpecimenWork, place: string): string {
  return `specimen-work-${record.slug}-${place}`;
}

function caseScene(record: SpecimenWork, suffix: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: specimenWorkId(record, suffix), node: `${record.flag}.${suffix}`, kind: 'scene', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function cases(room: Workshop): SpecimenWork[] {
  return SPECIMEN_WORK.filter((record) => record.room === room);
}

export function specimenWorkEntrance(room: Workshop): Interactable {
  const { map, entrance: [x, y], chapter, doorArt } = rooms[room];
  return { id: `specimen-work-${room}-entrance`, kind: 'door', x, y, w: 1, h: 1, art: doorArt,
    label: room === 'market' ? 'the Sample Shed by the loading lane' : 'the Prop Room behind the Audience Gallery',
    to: { map, x: 12, y: 14 }, visibleIf: { objective: chapter } };
}

export function specimenWorkReadbacks(room: Workshop): Interactable[] {
  return cases(room).flatMap((record) => record.branches.flatMap((branch) => {
    const selected: Condition = { all: [workReady(record), workChoice(record, branch.key)] };
    const served: Condition = { flag: record.objective, eq: true };
    return [
      caseScene(record, `deliver-${branch.key}`, branch.x, branch.y, branch.delivery, branch.art, { all: [selected, { not: served }] }),
      caseScene(record, `deliver-${branch.key}-result`, branch.x, branch.y, branch.delivery, branch.doneArt, { all: [selected, served] }),
    ];
  }));
}

function station(record: SpecimenWork, index: number): Interactable[] {
  const [x, y] = positions[index];
  const card: Condition = { card: record.card };
  const route: Condition = { flagSet: `${record.flag}.route` };
  return [
    { id: specimenWorkId(record, 'exhibit'), kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
      art: 'preserved.catalogue', label: `${record.object.displayName} · ${record.object.accession}` },
    ...record.trials.map((trial, i) => ({
      ...caseScene(record, `trial-${i + 1}`, x + 2, y + i * 2, trial.label, trial.art, card),
      artOpen: { key: trial.checkedArt, if: workTrial(record, i) },
    })),
    caseScene(record, 'arrange', x + 4, y + 1, record.arrangeLabel, 'board-stand',
      { all: [workReady(record), { not: route }] }),
    ...record.branches.map((branch) => caseScene(record, `packed-${branch.key}`, x + 4, y + 1, branch.delivery, branch.art,
      workChoice(record, branch.key))),
  ];
}

function workshop(room: Workshop): MapDef {
  const plan = rooms[room];
  const [x, y] = plan.returnPoint;
  return {
    id: plan.map, name: plan.name, world: plan.world, width: 25, height: 17,
    spawn: { x: 12, y: 14 }, music: plan.music, ambience: plan.ambience, background: plan.background,
    floor: (col, row) => {
      if (col < 1 || col > 23 || row < 0 || row > 16) return null;
      if (row < 3) return ['wall-top', 'wall-mid', 'wall-base'][row];
      return 'stone-c';
    },
    blocks: [[0, 0, 25, 3], [0, 0, 1, 17], [24, 0, 1, 17]], zones: [],
    stamps: [
      { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 18, y: 1 },
      { stamp: 'cabinet', x: 1, y: 4 }, { stamp: 'bookshelf', x: 21, y: 4 },
      { stamp: 'rug-green', x: 11, y: 8 }, { stamp: 'bench', x: 4, y: 14 },
      { stamp: 'cabinet', x: 20, y: 13 }, { stamp: 'plant-tall', x: 2, y: 14 },
    ],
    npcs: plan.keepers.map((keeper) => ({ ...keeper })),
    lights: [
      { x: 6, y: 6, r: 70, color: 0xf8d392 }, { x: 17, y: 6, r: 70, color: 0xc4dedd },
      { x: 6, y: 11, r: 70, color: 0xa8d9d6 }, { x: 17, y: 11, r: 70, color: 0xeacbe4 },
      { x: 12, y: 14, r: 52, color: 0xffc9a5 },
    ],
    interactables: [
      ...cases(room).flatMap(station),
      { id: `specimen-work-${room}-back`, kind: 'door', x: 12, y: 16, w: 1, h: 1, art: plan.doorArt,
        label: room === 'market' ? 'the way to Lantern Square' : 'the way to the Audience Gallery',
        to: { map: plan.outside, x, y } },
    ],
  };
}

export const MARKET_SAMPLE_SHED = workshop('market');
export const STAGE_PROP_ROOM = workshop('stage');
