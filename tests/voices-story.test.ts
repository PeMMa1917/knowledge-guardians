import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const formats = {
  paired: 'Keep the carrier’s wording',
  guide: 'Put the short route guide',
};
const revisions = {
  landmarks: 'Use the arch and rail',
  routes: 'Give each arrival point',
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

describe('The Second Lamp', () => {
  const routes = (['paired', 'guide'] as const).flatMap((format) =>
    (['landmarks', 'routes'] as const).map((revision) => ({ format, revision })));

  it.each(routes)('publishes $format and posts $revision for equal credit', ({ format, revision }) => {
    const d = new Driver();
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH13-M01')).toBe(false);
    d.resumeAfter('civic.finish');
    visit(d, 'voices-door');
    expect(d.done('voices.arrival')).toBe(true);
    expect(visible(d, 'voices-draft-label')).toBe(true);
    expect(visible(d, 'voices-checked-label')).toBe(false);
    expect(() => d.run({ type: 'RunVoiceReading', source: 'carrier', view: 'original' })).toThrow(/permission/i);
    d.run({ type: 'RunVoiceReading', source: 'clerk', view: 'original' });
    read(d, 'voices-permission');
    d.run({ type: 'RunVoiceReading', source: 'carrier', view: 'original' });
    expect(d.done('voices.sources')).toBe(false);

    visit(d, 'voices-walk-path');
    expect(visible(d, 'voices-stairs-view')).toBe(false);
    read(d, 'voices-opening-register');
    expect(d.done('voices.sources')).toBe(true);
    expect(d.e.talkEntry('voices-clerk', d.s)).toBe('voices.clerk.record');
    visit(d, 'voices-walk-return');
    expect(d.done('voices.verify')).toBe(false);
    d.talk('voices-steward', 'Pin the two dated records');
    expect(d.done('voices.verify')).toBe(true);
    expect(visible(d, 'voices-draft-label')).toBe(false);
    expect(visible(d, 'voices-checked-label')).toBe(true);
    d.run({ type: 'RunVoiceReading', source: 'carrier', view: 'guide' });
    expect(d.done('voices.compare')).toBe(false);
    d.run({ type: 'RunVoiceReading', source: 'clerk', view: 'guide' });
    expect(d.done('voices.compare')).toBe(true);
    visit(d, 'voices-walk-path');
    d.talk('voices-clerk', formats[format]);
    expect(d.done('voices.publish')).toBe(true);
    const displayed = (prefix: string) => MAPS['voices.walk'].interactables
      .filter((prop) => prop.id.startsWith(prefix) && check(prop.visibleIf, d.s))
      .map((prop) => prop.id);
    expect(displayed('voices-result-')).toEqual([`voices-result-${format}`]);

    visit(d, 'voices-walk-to-quay');
    read(d, 'voices-reader-note');
    read(d, 'voices-quay-view');
    expect(d.done('voices.reader')).toBe(false);
    visit(d, 'voices-quay-to-walk');
    expect(d.e.talkEntry('voices-clerk', d.s)).toBe('voices.clerk.reader');
    read(d, 'voices-stairs-view');
    expect(d.done('voices.reader')).toBe(true);
    d.talk('voices-clerk', revisions[revision]);
    expect(d.done('voices.finish')).toBe(true);
    expect(d.s.flags['voices.revision']).toBe(revision);
    expect(displayed('voices-result-')).toEqual([`voices-result-${format}`]);
    expect(displayed('voices-revised-')).toEqual([`voices-revised-${revision}`]);
    expect(d.p.credit['credit.voices.publish']).toBe(8);
    expect(d.p.credit['credit.voices.finish']).toBe(8);

    expect(visible(d, 'voices-wide-note')).toBe(false);
    d.talk('voices-clerk', 'Put a larger card by the arch');
    expect(visible(d, 'voices-wide-note')).toBe(true);
    expect(d.done('voices.access')).toBe(true);
  });

  it('recalls checking reachable stops only after the Civic Machine revision', () => {
    const d = new Driver();
    d.resumeAfter('civic.finish', 'voices.reader');
    d.s.flags['voices.response'] = 'guide';
    const recall = () => d.e.visibleOptions('voices.clerk.revisit', d.s)
      .find(({ option }) => option.next === 'voices.clerk.civic');
    expect(recall()).toBeUndefined();
    d.s.flags['civic.revised'] = true;
    expect(recall()).toBeDefined();
    d.talk('voices-clerk', 'A library reader asked', revisions.landmarks);
    expect(d.s.flags['voices.revision']).toBe('landmarks');
    expect(d.s.flags['voices.response']).toBe('guide');
  });

  it('recalls a different open date only after the Nexus ribbon is checked', () => {
    const d = new Driver();
    d.resumeAfter('civic.finish', 'voices.sources');
    const recall = () => d.e.visibleOptions('voices.steward.pin', d.s)
      .find(({ option }) => option.next === 'voices.steward.ribbon');
    expect(recall()).toBeUndefined();
    d.s.flags['nexus.ribbon.read'] = true;
    expect(recall()).toBeDefined();
    d.talk('voices-steward', 'We left room on the Nexus date ribbon', 'Pin the two dated records');
    expect(d.done('voices.verify')).toBe(true);
  });

  it.each([
    ['queue', 'Give people in the queue an approved excerpt'],
    ['desk', 'Keep the excerpt at the reading slot'],
  ])('places the optional reading copy by the %s after both source checks', (layout, choice) => {
    const d = new Driver();
    d.resumeAfter('civic.finish');
    visit(d, 'voices-door');
    const available = () => d.e.visibleOptions('voices.steward.pin', d.s)
      .some(({ option }) => option.next === 'voices.steward.quote');
    expect(available()).toBe(false);
    d.s.objectivesDone.push('voices.sources');
    expect(available()).toBe(true);
    d.talk('voices-steward', 'Where should we put the approved reading copy', choice);
    expect(d.done('voices.quote')).toBe(true);
    expect(d.done('voices.verify')).toBe(false);
    expect(visible(d, 'voices-quote-desk')).toBe(layout === 'desk');
    expect(visible(d, 'voices-quote-queue')).toBe(layout === 'queue');
    expect(available()).toBe(false);
    d.talk('voices-steward', 'Pin the two dated records');
    expect(d.done('voices.verify')).toBe(true);
  });
});
