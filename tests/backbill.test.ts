import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { COPIES_ARCHIVE, COPIES_PRESS } from '../src/maps/copies';
import { EMBERFORD } from '../src/maps/emberford';
import { STAGE_FOYER, STAGE_GALLERY } from '../src/maps/stage';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const FRAME = 'paper-frame';
const FRAME_QUEST = 'painters-frame';
const PROOF = 'item.backbill.proof';
const BADGE = 'award.back-of-the-bill';

function prop(map: MapDef, id: string) {
  const p = map.interactables.find((x) => x.id === `backbill-${id}`);
  if (!p) throw new Error(`Missing prop ${id}`);
  return p;
}

function visible(d: Driver, map: MapDef, id: string) {
  return check(prop(map, id).visibleIf, d.s);
}

function at(d: Driver, map: MapDef, id: string) {
  expect(visible(d, map, id), id).toBe(true);
  d.s.mapId = map.id;
  return prop(map, id);
}

function scene(d: Driver, map: MapDef, id: string, pick: string) {
  const node = at(d, map, id).node;
  if (!node) throw new Error(`Missing scene at ${id}`);
  d.walk(node, [pick]);
}

function look(d: Driver, map: MapDef, id: string, frame = false) {
  const clue = at(d, map, id).clue;
  if (!clue) throw new Error(`Missing clue at ${id}`);
  d.run({ type: 'ReadClue', clue });
  if (frame) expect(d.run({ type: 'UseKeepsake', clue, keepsake: FRAME }).events).toContainEqual(expect.objectContaining({ kind: 'clue', keepsake: FRAME }));
}

function earnFrame(d: Driver) {
  const puzzle = d.e.pack.puzzles.find((p) => p.id === FRAME_QUEST);
  if (puzzle?.type !== 'frame') throw new Error('Painter’s frame was removed');
  d.run({ type: 'PuzzleFrame', puzzle: FRAME_QUEST, brief: 'guild', x: 0, y: 7 });
  d.run({ type: 'PuzzleFrame', puzzle: FRAME_QUEST, brief: 'fund', x: 17, y: 2 });
  d.run({ type: 'PuzzleFrame', puzzle: FRAME_QUEST, brief: 'council', x: 19, y: 6 });
  d.run({ type: 'PuzzleReport', puzzle: FRAME_QUEST, index: puzzle.reflect.findIndex((r) => r.honest) });
  expect(d.s.flags[`keepsake.${FRAME}`]).toBe(true);
}

function makeFragment(d: Driver, frame: boolean) {
  d.s.mapId = EMBERFORD.id;
  expect(visible(d, EMBERFORD, 'emberford-start')).toBe(false);
  d.run({ type: 'Reach', zone: 'emberford' });
  if (frame) earnFrame(d);
  scene(d, EMBERFORD, 'emberford-start', 'Hold the market bill');
  expect(visible(d, EMBERFORD, 'emberford-record')).toBe(false);
  look(d, EMBERFORD, 'emberford-clue', frame);
  scene(d, EMBERFORD, 'emberford-record', frame ? 'Mark Bill 12' : 'Fold the loose');
  expect(d.done('backbill.emberford.o.send')).toBe(true);
  expect(visible(d, EMBERFORD, 'emberford-dispatched')).toBe(true);
}

function compareAtPress(d: Driver, source: 'frame' | 'crease' | 'local') {
  expect(visible(d, COPIES_PRESS, 'copies-start')).toBe(false);
  const previousAward = d.p.awards[BADGE];
  d.s.objectivesDone.push('copies.arrival');
  scene(d, COPIES_PRESS, 'copies-start', source === 'frame' ? 'traced edge' : source === 'crease' ? 'pressed crease' : 'pull the old Bill');
  expect(d.s.flags['backbill.copies.source']).toBe(source);
  expect(visible(d, COPIES_PRESS, 'copies-seal')).toBe(false);
  look(d, COPIES_PRESS, 'copies-proof', source === 'frame');
  expect(visible(d, COPIES_PRESS, 'copies-seal')).toBe(false);
  expect(d.p.awards[BADGE]).toBe(previousAward);
  scene(d, COPIES_ARCHIVE, 'copies-ledger', 'Match the run number');
  expect(d.done('backbill.copies.o.check')).toBe(true);
}

function sealAtPress(d: Driver) {
  scene(d, COPIES_PRESS, 'copies-seal', 'Clip the signed split');
  expect(d.s.inventory[PROOF]).toBe(1);
  expect(d.p.awards[BADGE]).toBeTruthy();
  expect(visible(d, COPIES_PRESS, 'copies-covered')).toBe(true);
  expect(visible(d, COPIES_PRESS, 'copies-seal')).toBe(false);
}

function installAndUse(d: Driver, layout: 'folded' | 'whole') {
  const map = layout === 'folded' ? STAGE_FOYER : STAGE_GALLERY;
  scene(d, STAGE_GALLERY, 'stage-layout', layout === 'folded' ? 'short price strip' : 'full bill for the gallery');
  expect(d.done('backbill.stage.o.mount')).toBe(false);
  expect(visible(d, map, `stage-serve-${layout}`)).toBe(false);
  scene(d, map, `stage-mount-${layout}`, layout === 'folded' ? 'Pin the big price' : 'Mount the complete bill');
  expect(d.done('backbill.stage.o.mount')).toBe(true);
  expect(visible(d, map, `stage-notice-${layout}`)).toBe(false);
  scene(d, map, `stage-serve-${layout}`, layout === 'folded' ? 'Show the signed split' : 'Turn the arrow');
  expect(visible(d, map, `stage-notice-${layout}`)).toBe(true);
  expect(d.done('backbill.stage.o.serve')).toBe(true);
  expect(d.s.journal).toContain('j.backbill.stage');
}

describe('The Back of the Bill', () => {
  it.each([
    ['frame', 'folded'], ['crease', 'whole'],
  ] as const)('takes the %s fragment to a later %s rack that Hari lets a proven reader use', (source, layout) => {
    const d = new Driver();
    makeFragment(d, source === 'frame');
    const marks = d.s.marks;
    const credit = { ...d.p.credit };
    compareAtPress(d, source);
    sealAtPress(d);
    expect(d.s.flags[`clue.backbill.copies.proof.${FRAME}`]).toBe(source === 'frame' ? true : undefined);

    d.s.objectivesDone.push('stage.arrival');
    scene(d, STAGE_GALLERY, 'stage-prep', 'Offer Lark’s signed proof');
    expect(d.s.flags['backbill.stage.recognized']).toBe(true);
    expect(visible(d, STAGE_GALLERY, 'stage-local')).toBe(false);
    installAndUse(d, layout);
    expect(d.s.flags[`keepsake.${FRAME}`]).toBe(source === 'frame' ? true : undefined);
    expect(d.s.inventory[PROOF]).toBe(1);
    expect(d.s.marks).toBe(marks);
    expect(d.p.credit).toEqual(credit);
    expect(d.done('stage.finish')).toBe(false);
  });

  it('recognizes a permanent badge separately from an item and allows local work, then a later proof', () => {
    const earned = new Driver();
    compareAtPress(earned, 'local');
    sealAtPress(earned);
    const d = new Driver();
    d.p = earned.p;
    d.s.objectivesDone.push('stage.arrival');
    expect(d.e.visibleOptions('backbill.stage.prep', d.s).map(({ index }) => index)).toEqual([1, 2]);
    scene(d, STAGE_GALLERY, 'stage-prep', 'Ask Hari to find');
    scene(d, STAGE_GALLERY, 'stage-local', 'Match the stub');
    installAndUse(d, 'whole');
    expect(d.s.flags['backbill.stage.recognized']).toBeUndefined();
    expect(visible(d, STAGE_GALLERY, 'stage-return')).toBe(false);
    compareAtPress(d, 'local');
    sealAtPress(d);
    scene(d, STAGE_GALLERY, 'stage-return', 'Clip Lark’s proof');
    expect(d.s.flags['backbill.stage.recognized']).toBe(true);
    expect(visible(d, STAGE_GALLERY, 'stage-notice-whole')).toBe(true);
  });

  it('keeps the badge after a rewind and restores only one physical copy when the proof is retaken', () => {
    const d = new Driver();
    compareAtPress(d, 'local');
    const state = d.s;
    sealAtPress(d);
    const timestamp = d.p.awards[BADGE];
    const slot = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Bill 12 check', location: COPIES_ARCHIVE.name,
      savedAt: '2026-11-26T06:00:00.000Z', state });
    const restored = parsePair(serialisePair(slot));
    if (!restored.ok || !restored.pair.continue) throw new Error('Bill 12 save could not load');
    d.s = restored.pair.continue.state;
    expect(d.s.inventory[PROOF]).toBeUndefined();
    sealAtPress(d);
    expect(d.p.awards[BADGE]).toBe(timestamp);
    expect(d.events.filter((e) => e.kind === 'award' && e.award.id === BADGE)).toHaveLength(1);
  });
});
