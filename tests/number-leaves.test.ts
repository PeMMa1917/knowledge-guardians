import { describe, expect, it } from 'vitest';
import { NUMBER_LEAVES } from '../src/content/numberLeaves';
import { countedNotches, placeWindow, TRAINING_TRIANGLES, triangleFit } from '../src/domain/numberLeaves';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { NUMBER_LEAF_ROOM, MARKET_NUMBER_LEAF } from '../src/maps/numberLeaves';
import { Driver } from './driver';

describe('The Ledger with No Name', () => {
  it('keeps numerical patterns separate from the meaning of their original marks', () => {
    expect(countedNotches()).toBe(36);
    expect(TRAINING_TRIANGLES.map(triangleFit)).toEqual([
      { shortAreas: 25, longArea: 25 }, { shortAreas: 169, longArea: 169 },
    ]);
    expect(placeWindow(true)).toEqual([[1, 0, 7], 107]);
    expect(placeWindow(false)).toEqual([[1, 7], 17]);
  });
  for (const entry of NUMBER_LEAVES) {
    it(`places and checks only the ${entry.accession} specimen`, () => {
      const d = new Driver();
      d.s.objectivesDone.push('m01.o2.inspect');
      const sites = Object.values(MAPS).filter((m) => m.interactables.some((prop) => prop.exhibit === entry.exhibit));
      expect(sites.map(({ id }) => id)).toEqual([NUMBER_LEAF_ROOM.id]);
      const prop = NUMBER_LEAF_ROOM.interactables.find(({ id }) => id === `number-leaf-trial-${entry.slug}`)!;
      expect(check(prop.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      expect(check(prop.visibleIf, d.s)).toBe(true);
      const set = (flag: string, value: string | boolean) => d.run({ type: 'SetFlag', flag: `${entry.flag}.${flag}`, value });
      set('trial.a', true);
      set('filed', 'context');
      set('sent', 'method');
      expect(d.done(entry.objective)).toBe(false);
      set('trial.b', true);
      expect(d.done(entry.objective)).toBe(false);
      set('filed', 'method');
      expect(d.done(entry.objective)).toBe(true);
      expect(check(MARKET_NUMBER_LEAF.visibleIf, d.s)).toBe(true);
      expect(d.s.journal).toContain(`j.${entry.objective}`);
    });
  }
});
