import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

function start() {
  const d = new Driver();
  d.s.flags['nile.returned'] = true;
  d.s.inventory['tool.date-lens'] = 1;
  d.s.inventory['tool.provenance-thread'] = 1;
  const door = MAPS['nexus.archive'].interactables.find((p) => p.id === 'preserved-door')!;
  expect(check(door.visibleIf, d.s)).toBe(true);
  d.s.mapId = door.to!.map;
  d.run({ type: 'SetFlag', flag: door.flag!, value: true });
  return d;
}

function royal(d: Driver, claim: 'monument' | 'custody') {
  d.s.mapId = 'preserved.royal';
  for (const exhibit of ['OBJ-PRES-RAMESSEUM', 'OBJ-PRES-RAM-CUSTODY']) {
    d.run({ type: 'InspectExhibit', exhibit });
    d.run({ type: 'UseLens', exhibit });
  }
  for (const node of ['burial', 'cache', 'catalogue']) d.run({ type: 'FollowThread', thread: 'preserved-royal', node });
  d.run({ type: 'BuildLabel', kit: 'preserved-name', subject: claim === 'monument' ? 'temple' : 'catalogue', criterion: claim, limit: 'gap' });
  expect(d.done('preserved.royal')).toBe(true);
}

function coast(d: Driver, order: 'map' | 'notes') {
  d.s.mapId = 'preserved.coast';
  for (const exhibit of ['OBJ-PRES-CHIN-SITES', 'OBJ-PRES-CHIN-CONTEXT']) d.run({ type: 'InspectExhibit', exhibit });
  for (const node of ['site', 'conditions', 'context']) d.run({ type: 'FollowThread', thread: 'preserved-coast', node });
  expect(d.done('preserved.coast')).toBe(true);
  d.talk('preserved-coast-keeper', order === 'map' ? 'site map uppermost' : 'preservation notes');
  expect(d.s.flags['preserved.coastLead']).toBe(order);
}

describe('Chapter 3: The Missing Transfer', () => {
  it('starts after the Nile return, independent of its optional follow-ups', () => {
    const fresh = new Driver();
    const door = MAPS['nexus.archive'].interactables.find((p) => p.id === 'preserved-door')!;
    expect(check(door.visibleIf, fresh.s)).toBe(false);
    fresh.run({ type: 'SetFlag', flag: 'nile.dispatch', value: 'print' });
    expect(check(door.visibleIf, fresh.s)).toBe(false);
    expect(fresh.e.activeMissions(fresh.s).some((m) => m.id === 'KG-CH3-M01')).toBe(false);
    expect(start().e.talkEntry('preserved-registrar', start().s)).toBe('preserved.welcome');
  });

  it('offers either missing tool individually to older campaigns', () => {
    const d = start();
    delete d.s.inventory['tool.provenance-thread'];
    expect(d.e.talkEntry('preserved-registrar', d.s)).toBe('preserved.tools');
    expect(d.e.visibleOptions('preserved.tools', d.s).some(({ option }) => option.text.includes('Lens'))).toBe(false);
    d.talk('preserved-registrar', 'Provenance Thread', 'Leave the desk');
    expect(d.s.inventory['tool.provenance-thread']).toBe(1);
    expect(d.e.talkEntry('preserved-registrar', d.s)).toBe('preserved.welcome');
  });

  it('keeps the missing transfer visible even after the two endpoints are read', () => {
    const d = start();
    d.talk('preserved-registrar', 'royal records first');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-PRES-RAMESSEUM' });
    d.run({ type: 'BuildLabel', kit: 'preserved-name', subject: 'temple', criterion: 'proves', limit: 'gap' });
    expect(d.s.flags['label.preserved-name.holds']).toBe(false);
    expect(d.done('preserved.royal')).toBe(false);
    expect(() => d.run({ type: 'FollowThread', thread: 'preserved-royal', node: 'catalogue' })).toThrow(/from its start/);
  });

  it.each([
    ['records', 'Open two stands', 'desk', 'File a traceable', 'royal'],
    ['paired', 'comparison slip', 'margin', 'Clip the limits', 'coast'],
    ['delayed', 'Hold the cases', 'desk', 'File a traceable', 'coast'],
  ] as const)('reaches the %s display, returns a reference and earns equal credit',
  (display, publication, reply, placement, first) => {
    const d = start();
    d.talk('preserved-registrar', first === 'royal' ? 'royal records first' : 'coast map');
    if (first === 'royal') {
      royal(d, 'monument');
      expect(d.e.talkEntry('preserved-registrar', d.s)).toBe('preserved.in-progress');
      coast(d, 'notes');
    } else {
      coast(d, 'map');
      expect(d.e.talkEntry('preserved-registrar', d.s)).toBe('preserved.in-progress');
      royal(d, 'custody');
    }
    d.s.mapId = 'preserved.archive';
    d.talk('preserved-registrar', publication);
    expect(d.s.flags['preserved.display']).toBe(display);
    const displays = MAPS[d.s.mapId].interactables.filter((p) => p.id.startsWith('preserved-display-'));
    expect(displays.filter((p) => check(p.visibleIf, d.s)).map((p) => p.id)).toEqual(['preserved-display-' + display]);
    expect(d.p.credit['credit.preserved.publish']).toBe(10);
    d.s.mapId = 'preserved.inquiry';
    d.talk('preserved-inquiry-keeper', placement);
    expect(d.done('preserved.answer')).toBe(true);
    const notices = MAPS['nexus.archive'].interactables.filter((p) => p.id.startsWith('preserved-return-'));
    expect(notices.filter((p) => check(p.visibleIf, d.s)).map((p) => p.id)).toEqual(['preserved-return-' + reply]);
    expect(d.p.credit['credit.preserved.answer']).toBe(6);
    const earned = { ...d.p.credit };
    d.talk('preserved-inquiry-keeper');
    expect(d.p.credit).toEqual(earned);
  });

  it.each([
    ['names', 'Lead with the named'],
    ['timeline', 'Lead with a dated'],
  ])('puts the %s on the proof after using the Lens on both dated records', (route, pick) => {
    const d = start();
    d.s.objectivesDone.push('preserved.publish');
    d.s.mapId = 'preserved.inquiry';
    for (const exhibit of ['OBJ-PRES-TUT-WORKFORCE', 'OBJ-PRES-TUT-JOURNAL', 'OBJ-PRES-TUT-NOTE']) {
      d.run({ type: 'InspectExhibit', exhibit });
    }
    const proof = MAPS[d.s.mapId].interactables.find((p) => p.id === 'preserved.tut.request')!;
    expect(check(proof.visibleIf, d.s)).toBe(false);
    d.run({ type: 'UseLens', exhibit: 'OBJ-PRES-TUT-JOURNAL' });
    d.run({ type: 'UseLens', exhibit: 'OBJ-PRES-TUT-NOTE' });
    expect(check(proof.visibleIf, d.s)).toBe(true);
    d.walk(proof.node!, [pick]);
    expect(d.done('preserved.proof.hung')).toBe(true);
    expect(d.s.flags['preserved.tut.request']).toBe(route);
    expect(d.p.credit['credit.preserved.proof']).toBe(6);
  });
});
