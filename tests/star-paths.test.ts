import { describe, expect, it } from 'vitest';
import { STAR_PATHS, STAR_STATIONS, starStationOpen } from '../src/content/starPaths';
import { STAR_METHODS, starFlag, starMethodReady, starRouteRead, triedStarStep } from '../src/domain/starPaths';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function practice(d: Driver, skills: readonly string[]) {
  for (const id of skills) d.s.objectivesDone.push(id);
}

describe('Field stars', () => {
  it('finds all five paths, fifteen skills and four real actions per skill', () => {
    const d = new Driver();
    const objectives = new Set(d.e.pack.missions.flatMap(({ objectives }) => objectives.map(({ id }) => id)));
    expect(STAR_PATHS).toHaveLength(5);
    expect(STAR_PATHS.flatMap(({ skills }) => skills)).toHaveLength(15);
    for (const { skills } of STAR_PATHS) for (const skill of skills) {
      expect(skill.steps).toHaveLength(4);
      for (const { objectives: ids } of skill.steps) for (const id of ids) expect(objectives.has(id), id).toBe(true);
      expect(skill.choices[0].result).not.toBe(skill.choices[1].result);
      expect(triedStarStep(d.s, skill.steps[0])).toBe(false);
    }
  });

  for (const site of STAR_STATIONS) {
    it(`carries ${site.path.name} methods into a real field notice by either route`, () => {
      const d = new Driver();
      const props = Object.values(MAPS).flatMap(({ interactables }) => interactables);
      const board = props.find(({ id }) => id === `star-path-board-${site.path.id}`)!;
      const notice = props.find(({ id }) => id === `star-path-notice-${site.path.id}`)!;
      expect(check(starStationOpen(site), d.s)).toBe(false);
      expect(check(board.visibleIf, d.s)).toBe(false);
      expect(check(notice.visibleIf, d.s)).toBe(false);
      for (const skill of site.path.skills) {
        expect(check(starMethodReady(skill), d.s)).toBe(false);
        practice(d, skill.steps.slice(0, 2).map(({ objectives }) => objectives[0]));
        expect(check(board.visibleIf, d.s)).toBe(true);
        expect(check(starMethodReady(skill), d.s)).toBe(true);
        const flag = starFlag(site.path, skill);
        for (const method of STAR_METHODS) {
          d.run({ type: 'SetFlag', flag: `${flag}.layout`, value: method });
          expect(check(notice.visibleIf, d.s)).toBe(true);
          expect(check(starRouteRead(site.path, skill), d.s)).toBe(false);
          d.run({ type: 'SetFlag', flag: `${flag}.checked`, value: method });
          expect(check(starRouteRead(site.path, skill), d.s)).toBe(true);
          expect(d.s.adventureDiary.entries.some(({ id }) => id === `quest:${flag}`)).toBe(true);
        }
      }
    });
  }
});
