import { describe, expect, it } from 'vitest';
import { SPECIMEN_WORK, type SpecimenWork } from '../src/content/specimenWorkCases';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { specimenWorkId } from '../src/maps/specimenWork';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((p) => p.id === id);
  expect(entry, id).toBeDefined();
  return entry!;
}

function visible(d: Driver, id: string) {
  return check(prop(d, id).visibleIf, d.s);
}

function cross(d: Driver, id: string) {
  const door = prop(d, id);
  expect(visible(d, id) && check(door.openIf, d.s), id).toBe(true);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to!.map;
}

function scene(d: Driver, record: SpecimenWork, step: string, choice?: string) {
  const id = specimenWorkId(record, step);
  expect(visible(d, id), id).toBe(true);
  d.walk(prop(d, id).node!, choice ? [choice] : []);
}

function arrive(record: SpecimenWork) {
  const d = new Driver();
  // Only the previous main chapter is staged. The ordinary Nexus gate sets the arrival flag.
  d.resumeAfter(record.room === 'market' ? 'stage.finish' : 'sea.finish');
  cross(d, record.room === 'market' ? 'market-door' : 'stage-door');
  if (record.room === 'stage') cross(d, 'stage-gallery-path');
  cross(d, `specimen-work-${record.room}-entrance`);
  return d;
}

const assets = import.meta.glob('../public/assets/specimens/*.jpg', { eager: true, query: '?url', import: 'default' });
const gameArt = new Set(artKeys());

describe('Specimen jobs in the Sample Shed and Prop Room', () => {
  it('places every dated source once with its own use, local image, and concrete delivery slots', () => {
    const d = new Driver();
    expect(SPECIMEN_WORK).toHaveLength(8);
    expect(new Set(SPECIMEN_WORK.map((record) => record.object.id)).size).toBe(8);
    const maps = Object.values(MAPS);
    for (const record of SPECIMEN_WORK) {
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === record.exhibit)!;
      expect(exhibit, record.exhibit).toBeDefined();
      expect(exhibit.historicalLabel).toBe('documented');
      expect(exhibit.dateText).toEqual(record.object.date);
      expect(exhibit.specimen).toMatchObject({ key: record.object.id, accession: record.object.accession, objective: record.objective });
      expect(exhibit.sources).toContain(record.source);
      expect(assets[`../public/assets/${exhibit.specimen!.pixelAsset}`], exhibit.specimen!.pixelAsset).toBeDefined();
      expect(d.e.pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.object.catalogUrl);
      expect(maps.flatMap(({ interactables }) => interactables).filter(({ exhibit }) => exhibit === record.exhibit)).toHaveLength(1);
      expect(record.trials.every(({ art, checkedArt }) => art !== checkedArt && gameArt.has(art) && gameArt.has(checkedArt))).toBe(true);
      expect(record.branches.every(({ art, doneArt }) => art !== doneArt && gameArt.has(art) && gameArt.has(doneArt))).toBe(true);
      const branchPlaces = record.branches.map(({ x, y }) => `${x},${y}`);
      expect(new Set(branchPlaces).size).toBe(2);
    }
  });

  it.each(SPECIMEN_WORK)('completes each $title handoff only in its real receiving position', (record) => {
    const credits: Record<string, number>[] = [];
    for (const [branchIndex, branch] of record.branches.entries()) {
      const d = arrive(record);
      const id = (step: string) => specimenWorkId(record, step);
      const other = record.branches[1 - branchIndex];
      expect(visible(d, id('trial-1'))).toBe(false);
      expect(visible(d, id('arrange'))).toBe(false);
      const exhibit = prop(d, id('exhibit'));
      expect(exhibit.kind).toBe('exhibit');
      d.run({ type: 'InspectExhibit', exhibit: exhibit.exhibit! });
      expect(visible(d, id('trial-1'))).toBe(true);
      expect(visible(d, id('trial-2'))).toBe(true);
      scene(d, record, 'trial-1', 'Leave the trial');
      expect(check(prop(d, id('trial-1')).artOpen?.if, d.s)).toBe(false);
      const order = branchIndex === 0 ? [0, 1] : [1, 0];
      for (const [i, trial] of order.entries()) {
        const step = `trial-${trial + 1}`;
        scene(d, record, step, record.trials[trial].action);
        expect(check(prop(d, id(step)).artOpen?.if, d.s)).toBe(true);
        expect(visible(d, id('arrange'))).toBe(i === 1);
      }
      expect(d.done(record.objective)).toBe(false);
      scene(d, record, 'arrange', branch.choice);
      expect(visible(d, id(`packed-${branch.key}`))).toBe(true);
      expect(visible(d, id(`packed-${other.key}`))).toBe(false);
      expect(d.done(record.objective)).toBe(false);
      const objectiveState = d.e.visibleOptions(`${record.flag}.arrange`, d.s).map(({ option }) => option.text);
      expect(objectiveState).toEqual(['Leave both plans at the worktable.']);
      cross(d, `specimen-work-${record.room}-back`);
      expect(visible(d, id(`deliver-${branch.key}`))).toBe(true);
      expect(visible(d, id(`deliver-${other.key}`))).toBe(false);
      expect(visible(d, id(`deliver-${branch.key}-result`))).toBe(false);
      scene(d, record, `deliver-${branch.key}`, 'Come back');
      expect(d.done(record.objective)).toBe(false);
      scene(d, record, `deliver-${branch.key}`, branch.action);
      expect(visible(d, id(`deliver-${branch.key}`))).toBe(false);
      expect(visible(d, id(`deliver-${branch.key}-result`))).toBe(true);
      expect(d.done(record.objective)).toBe(true);
      expect(d.s.journal).toContain(`j.${record.flag}`);
      expect(d.e.node(prop(d, id(`deliver-${branch.key}-result`)).node!).text).toBe(branch.result);
      expect(SPECIMEN_WORK.every((candidate) => candidate === record || !d.done(candidate.objective))).toBe(true);
      credits.push({ ...d.p.credit });
    }
    expect(credits[0]).toEqual(credits[1]);
  });
});
