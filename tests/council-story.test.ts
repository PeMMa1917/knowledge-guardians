import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const policies = {
  rail: 'Start each shift with a rail comparison',
  record: 'Use the dated repair record and its fallback',
};
const revisions = {
  relay: 'Set a spoken relay',
  mark: 'Put two large reference marks',
};

function visit(d: Driver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((item) => item.kind === 'door' && item.id === id);
  if (!door?.to || !check(door.visibleIf, d.s) || !check(door.openIf, d.s)) throw new Error(`Cannot use ${id} here`);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function read(d: Driver, id: string): void {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.kind === 'sign' && prop.id === id);
  if (!item?.flag || !check(item.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function visible(d: Driver, id: string): boolean {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return !!prop && check(prop.visibleIf, d.s);
}

describe('When the Hand Moves', () => {
  const routes = (['rail', 'record'] as const).flatMap((policy) =>
    (['relay', 'mark'] as const).map((revision) => ({ policy, revision })));

  it.each(routes)('keeps the $policy docket after adding $revision', ({ policy, revision }) => {
    const d = new Driver();
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH15-M01')).toBe(false);
    d.s.objectivesDone.push('island.finish');
    visit(d, 'council-door');
    expect(d.done('council.arrival')).toBe(true);
    expect(visible(d, 'council-draft')).toBe(true);
    read(d, 'council-repair-record');
    d.run({ type: 'RunCouncilClock', trial: 'matched' });
    expect(d.done('council.compare')).toBe(false);

    visit(d, 'council-gallery-path');
    read(d, 'council-optics-letter');
    read(d, 'council-mill-letter');
    expect(d.done('council.sources')).toBe(false);
    expect(visible(d, 'council-reader-note')).toBe(false);
    read(d, 'council-rail-record');
    expect(d.s.cards).toEqual(expect.arrayContaining(['card.person.haytham', 'card.council.mill']));
    expect(d.done('council.sources')).toBe(true);
    expect(d.e.talkEntry('council-reader', d.s)).toBe('council.rail.records');
    visit(d, 'council-gallery-return');

    d.run({ type: 'RunCouncilClock', trial: 'working' });
    expect(d.done('council.compare')).toBe(false);
    d.run({ type: 'RunCouncilClock', trial: 'drift' });
    expect(d.done('council.compare')).toBe(true);
    expect(visible(d, 'council-draft')).toBe(false);
    expect(visible(d, 'council-checked')).toBe(true);
    visit(d, 'council-gallery-path');
    d.talk('council-reader', policies[policy]);
    expect(d.done('council.publish')).toBe(true);
    const displayed = (prefix: string) => MAPS['council.gallery'].interactables
      .filter((prop) => prop.id.startsWith(prefix) && check(prop.visibleIf, d.s))
      .map((prop) => prop.id);
    expect(displayed('council-result-')).toEqual([`council-result-${policy}`]);

    read(d, 'council-reader-note');
    expect(d.done('council.reader')).toBe(false);
    read(d, 'council-shutter-view');
    expect(d.done('council.reader')).toBe(true);
    d.talk('council-reader', revisions[revision]);
    expect(d.done('council.finish')).toBe(true);
    expect(displayed('council-revised-')).toEqual([`council-revised-${revision}`]);
    expect(displayed('council-result-')).toEqual([`council-result-${policy}`]);
    expect(d.p.credit['credit.council.publish']).toBe(8);
    expect(d.p.credit['credit.council.finish']).toBe(8);

    expect(visible(d, 'council-check-copy')).toBe(false);
    d.talk('council-reader', 'Leave a wide copy');
    expect(visible(d, 'council-check-copy')).toBe(true);
    expect(d.done('council.copy')).toBe(true);
  });

  it.each([
    ['island.revision', 'I kept both landing sheets', 'council.rail.island', 'ferry'],
    ['voices.revision', 'I checked what someone could see', 'council.rail.voices', 'routes'],
  ])('keeps the same revision choices when recalling %s', (flag, label, node, value) => {
    const d = new Driver();
    d.s.objectivesDone.push('island.finish', 'council.reader');
    d.s.flags['council.response'] = 'record';
    const options = () => d.e.visibleOptions('council.rail.revisit', d.s);
    expect(options().some(({ option }) => option.next === node)).toBe(false);
    d.s.flags[flag] = value;
    expect(options().some(({ option }) => option.next === node)).toBe(true);
    d.talk('council-reader', label, revisions.mark);
    expect(d.s.flags['council.revision']).toBe('mark');
    expect(d.s.flags['council.response']).toBe('record');
  });

  it.each([
    ['rail', 'Set the practice dial at the shared rail'],
    ['slot', 'Set the practice dial in the low slot'],
  ])('places the optional dial at the %s and checks how it is used', (layout, choice) => {
    const d = new Driver();
    d.s.objectivesDone.push('island.finish');
    visit(d, 'council-door');
    read(d, 'council-low-slot');
    visit(d, 'council-gallery-path');
    const canPlace = () => d.e.visibleOptions('council.rail.records', d.s)
      .some(({ option }) => option.next === 'council.rail.bench');
    expect(canPlace()).toBe(false);
    read(d, 'council-crew-slate');
    expect(canPlace()).toBe(true);
    d.talk('council-reader', 'Find a place for the spare practice dial', choice);
    expect(d.done('council.bench')).toBe(false);
    expect(visible(d, 'council-bench-rail')).toBe(layout === 'rail');
    if (layout === 'slot') {
      visit(d, 'council-gallery-return');
      expect(visible(d, 'council-bench-slot')).toBe(true);
    }
    read(d, `council-bench-${layout}`);
    expect(d.done('council.bench')).toBe(true);
    expect(d.done('council.sources')).toBe(false);
    expect(d.done('council.publish')).toBe(false);
  });
});
