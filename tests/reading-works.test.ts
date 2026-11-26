import { describe, expect, it } from 'vitest';
import {
  PERKINS_KEY, PERKINS_REVISIT, READING_ROUTES, READING_WORKS_CASES, READING_WORKS_LAST, READING_WORKS_RECEIVER,
} from '../src/content/readingWorks';
import { check } from '../src/domain/rules';
import { ownsSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { READING_WORKS, READING_WORKS_DOOR, READING_WORKS_LANDING } from '../src/maps/readingWorks';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

describe('The Reader Across the Landing', () => {
  it('places each exhibit once and excludes the undated facsimile from the specimen count', () => {
    const d = new Driver();
    expect(MAPS['copies.reading-works']).toBe(READING_WORKS);
    expect(MAPS['copies.archive'].interactables).toContain(READING_WORKS_DOOR);
    expect(MAPS['copies.landing'].interactables).toContain(READING_WORKS_LANDING);
    expect(check(READING_WORKS_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('copies.arrival');
    expect(check(READING_WORKS_DOOR.visibleIf, d.s)).toBe(true);
    expect(check(READING_WORKS_LANDING.visibleIf, d.s)).toBe(false);

    for (const entry of READING_WORKS_CASES) {
      const locations = Object.values(MAPS).flatMap((map) => map.interactables
        .filter((target) => target.exhibit === entry.exhibit).map(() => map.id));
      expect(locations, entry.accession).toEqual([entry.slug === 'perkins-procede' ? 'copies.archive' : READING_WORKS.id]);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit).toMatchObject({ historicalLabel: 'documented', dateText: entry.date });
      if (entry.slug === 'braille') {
        expect(exhibit?.specimen).toBeUndefined();
      } else {
        expect(exhibit?.specimen).toMatchObject({
          key: entry.key, accession: entry.accession, source: entry.sourceId, objective: entry.objective,
        });
      }
      expect(artKeys()).toContain(entry.art);
    }
    expect(READING_WORKS_CASES.find(({ slug }) => slug === 'braille')?.date).toContain('Facsimile date unlisted');
    expect(READING_WORKS_CASES.find(({ slug }) => slug === 'next')?.accession).not.toContain('2008-5019');
  });

  it.each(READING_ROUTES)('makes each %s setup usable only after both trials and a landing action', (route) => {
    const d = new Driver();
    d.s.objectivesDone.push('copies.arrival');
    const index = READING_ROUTES.indexOf(route);
    for (const entry of READING_WORKS_CASES) {
      const map = entry.slug === 'perkins-procede' ? MAPS['copies.archive'] : READING_WORKS;
      d.s.mapId = map.id;
      const work = map.interactables.find(({ id }) => id === `reading-works-${entry.slug}-choose`)!;
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      expect(check(work.visibleIf, d.s)).toBe(false);
      d.walk(`${entry.flag}.trial.1`, [entry.trials[1].action]);
      expect(check(work.visibleIf, d.s)).toBe(false);
      d.walk(`${entry.flag}.trial.0`, [entry.trials[0].action]);
      expect(check(work.visibleIf, d.s)).toBe(true);
      d.walk(`${entry.flag}.send`, ['Leave both setups']);
      expect(check(work.visibleIf, d.s)).toBe(true);
      d.walk(`${entry.flag}.send`, [entry.routes[index].action]);
      expect(d.done(entry.objective)).toBe(false);
      expect(check(READING_WORKS_LANDING.visibleIf, d.s)).toBe(true);
      d.s.mapId = 'copies.landing';
      d.walk(READING_WORKS_RECEIVER, [entry.pad, 'Keep the setup waiting']);
      expect(d.done(entry.objective)).toBe(false);
      d.walk(READING_WORKS_RECEIVER, [entry.pad, entry.routes[index].use]);
      expect(d.done(entry.objective)).toBe(true);
      expect(d.s.flags[READING_WORKS_LAST]).toBe(`${entry.slug}.${route}`);
      expect(d.s.journal).toContain(`j.${entry.flag}.${route}`);
      expect(READING_WORKS_LANDING.artBy?.keys[`${entry.slug}.${route}`]).toBe(`${entry.art}.${route}`);
      d.s.mapId = map.id;
      d.walk(`${entry.flag}.kept.${route}`, ['Read the landing reply']);
    }
    expect(d.done('copies.revise')).toBe(false);
  });

  it('uses the earned Perkins working copy to leave two separate credit stops at an earlier archive', () => {
    const d = new Driver();
    const original = READING_WORKS_CASES.find(({ key }) => key === PERKINS_KEY)!;
    d.s.objectivesDone.push('copies.arrival');
    d.s.mapId = 'copies.archive';
    d.run({ type: 'InspectExhibit', exhibit: original.exhibit });
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: original.exhibit })).toThrow('Finish the object’s quest first');
    original.trials.forEach((trial, index) => d.walk(`${original.flag}.trial.${index}`, [trial.action]));
    d.walk(`${original.flag}.send`, [original.routes[0].action]);
    d.s.mapId = 'copies.landing';
    d.walk(READING_WORKS_RECEIVER, [original.pad, original.routes[0].use]);
    d.s.mapId = 'copies.archive';
    d.run({ type: 'ClaimSpecimen', exhibit: original.exhibit });
    expect(ownsSpecimen(d.s, PERKINS_KEY)).toBe(true);
    d.s.mapId = PERKINS_REVISIT.map;
    const revisit = MAPS[d.s.mapId].interactables.find(({ id }) => id === PERKINS_REVISIT.prop)!;
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(PERKINS_KEY) });
    expect(check(revisit.visibleIf, d.s)).toBe(true);
    d.walk(revisit.node!, ['fit a raised stop']);
    expect(d.s.journal).toContain('j.reading-works.perkins.cold');
    expect(d.s.flags['reading-works.perkins.cold.used']).toBe(true);
    expect(check(revisit.visibleIf, d.s)).toBe(false);
  });
});
