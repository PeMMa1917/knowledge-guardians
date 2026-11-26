import { describe, expect, it } from 'vitest';
import { LANTERN_LEAVES } from '../src/content/lanternWeave';
import { beamCovers } from '../src/domain/lanternWeave';
import { check } from '../src/domain/rules';
import { HALF_LIGHT_ROOM, NEXUS_LANTERN_WEAVE, PRESS_LANTERN_WEAVE } from '../src/maps/lanternWeave';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

describe('A Light Between the Frames', () => {
  it('places each dated item at one physical stand and opens in the first chapter', () => {
    const d = new Driver();
    const door = NEXUS_LANTERN_WEAVE[0];
    expect(check(door.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('m01.o2.inspect');
    expect(check(door.visibleIf, d.s)).toBe(true);
    expect(door.to?.map).toBe(HALF_LIGHT_ROOM.id);
    for (const object of LANTERN_LEAVES) {
      const sites = Object.values(MAPS).flatMap((m) => m.interactables.filter(({ exhibit }) => exhibit === object.exhibit).map(() => m.id));
      expect(sites, object.accession).toEqual([HALF_LIGHT_ROOM.id]);
      expect(object.left).not.toBe(object.right);
      expect(beamCovers(object.leftPosition, object.rightPosition)).toBe(false);
      expect(beamCovers(object.leftPosition, object.leftPosition)).toBe(true);
    }
  });

  it.each(['window', 'table'] as const)('keeps the %s copy tied to both things observed, then reuses the decision at the press', (route) => {
    const d = new Driver();
    const [leaf, other] = LANTERN_LEAVES;
    const set = (flag: string, value: string | boolean) => d.run({ type: 'SetFlag', flag, value });
    d.s.objectivesDone.push('m01.o2.inspect');
    d.run({ type: 'InspectExhibit', exhibit: leaf.exhibit });
    set(`${leaf.flag}.read.left`, true);
    set(`${leaf.flag}.sent`, route);
    set(`${leaf.flag}.hung`, route);
    expect(d.done(leaf.objective)).toBe(false);
    set(`${leaf.flag}.read.right`, true);
    expect(d.done(leaf.objective)).toBe(true);
    expect(d.done(other.objective)).toBe(false);
    expect(check(PRESS_LANTERN_WEAVE.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('copies.revise');
    expect(check(PRESS_LANTERN_WEAVE.visibleIf, d.s)).toBe(true);
    set('lantern.weave.copies.trial.flow', true);
    set('lantern.weave.copies.notice', 'flow');
    expect(d.done('lantern.weave.copies.used')).toBe(false);
    set('lantern.weave.copies.trial.review', true);
    expect(d.done('lantern.weave.copies.used')).toBe(true);
  });
});
