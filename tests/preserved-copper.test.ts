import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(map: string, id: string) {
  const found = MAPS[map]?.interactables.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown prop ${map} ${id}`);
  return found;
}

function enterSurvey() {
  const d = new Driver();
  d.s.objectivesDone.push('preserved.publish');
  d.s.mapId = 'preserved.copper';
  return d;
}

function readRecords(d: Driver) {
  for (const exhibit of ['OBJ-PRES-COPPER-FIND', 'OBJ-PRES-COPPER-ORE']) {
    d.run({ type: 'InspectExhibit', exhibit });
  }
}

describe('Between the Markers', () => {
  it('opens independently of other follow-ups after the first Cold Store display', () => {
    const d = new Driver();
    const door = prop('preserved.archive', 'preserved-door-copper');
    expect(door.to?.map).toBe('preserved.copper');
    expect(check(door.openIf, d.s)).toBe(false);
    d.s.objectivesDone.push('preserved.publish');
    expect(check(door.openIf, d.s)).toBe(true);
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH3-R06')).toBe(true);
  });

  it('uses material evidence to close only the unsupported source trial', () => {
    const d = enterSurvey();
    const near = prop('preserved.copper', 'preserved-copper-trial-near');
    const overlay = prop('preserved.copper', 'preserved-copper-source-peg');
    const closed = prop('preserved.copper', 'preserved-copper-near-closed');
    expect(check(near.visibleIf, d.s)).toBe(true);
    expect(check(overlay.visibleIf, d.s)).toBe(false);
    d.walk('copper.trial.near', ['Try the nearby source.']);
    expect(d.s.flags['copper.tested.near']).toBe(true);

    readRecords(d);
    expect(check(overlay.visibleIf, d.s)).toBe(true);
    d.walk('copper.overlay', ['Mount the source report']);
    expect(check(near.visibleIf, d.s)).toBe(false);
    expect(check(closed.visibleIf, d.s)).toBe(true);
    expect(check(prop('preserved.copper', 'preserved-copper-trial-one').visibleIf, d.s)).toBe(true);
    expect(check(prop('preserved.copper', 'preserved-copper-trial-several').visibleIf, d.s)).toBe(true);
    expect(d.e.visibleOptions('copper.trial.near', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the marker where it is.']);
  });

  it.each([
    ['markers', 'Send the record markers', 'marker', 'chain'],
    ['chains', 'Send both trial tracks', 'chain', 'marker'],
  ])('makes the %s display available after both remaining tracks with neutral credit', (choice, action, display, other) => {
    const d = enterSurvey();
    const credit = { ...d.p.credit };
    const dispatch = prop('preserved.copper', 'preserved-copper-dispatch');
    readRecords(d);
    d.walk('copper.overlay', ['Mount the source report']);
    d.walk('copper.trial.one', ['through one exchange']);
    expect(check(dispatch.visibleIf, d.s)).toBe(false);
    d.walk('copper.trial.several', ['through several exchanges']);
    expect(check(dispatch.visibleIf, d.s)).toBe(true);
    d.walk('copper.dispatch', [action]);
    expect(d.s.flags['copper.display']).toBe(choice);
    expect(d.done('copper.o.display')).toBe(true);
    expect(d.s.journal).toContain('j.copper.display');
    expect(d.p.credit).toEqual(credit);
    expect(check(prop('preserved.archive', `preserved-copper-${display}-display`).visibleIf, d.s)).toBe(true);
    expect(check(prop('preserved.archive', `preserved-copper-${other}-display`).visibleIf, d.s)).toBe(false);
  });
});
