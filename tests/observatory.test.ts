import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const harbour = MAPS['observatory.harbour'];
const station = MAPS['observatory.station'];

function begin(): Driver {
  const d = new Driver();
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH4-M01')).toBe(false);
  d.s.objectivesDone.push('nile.return');
  d.s.mapId = harbour.id;
  d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
  expect(d.done('coast.arrival')).toBe(true);
  return d;
}

/** Run the same flag-backed action that reading this sign causes in the scene. */
function read(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Unable to read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function visible(d: Driver, ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

describe('The Next Bell', () => {
  it('gates the notice on two measured observations and a separately qualified estimate', () => {
    const d = begin();
    const signalkeeper = 'coast-signalkeeper';
    const forecaster = 'coast-forecaster';
    d.talk(signalkeeper, 'Where did the reports come from?');
    read(d, 'coast-harbour-gauge');
    d.s.mapId = station.id;
    read(d, 'coast-chart-board');
    expect(visible(d, ['coast-station-recheck'])).toEqual([]);
    expect(d.e.talkEntry(forecaster, d.s)).toBe('coast.station.brief');
    expect(d.e.visibleOptions('coast.station.model', d.s)).toHaveLength(1);
    read(d, 'coast-station-gauge');
    expect(d.e.talkEntry(forecaster, d.s)).toBe('coast.station.compare');
    d.talk(forecaster, 'dated strip');
    expect(d.done('coast.readings')).toBe(true);
    expect(d.e.talkEntry(signalkeeper, d.s)).toBe('coast.harbour.brief');
    d.talk(forecaster, 'mark when');
    expect(d.done('coast.forecast')).toBe(true);
    expect(d.e.talkEntry(signalkeeper, d.s)).toBe('coast.dispatch.offer');
  });

  it.each([
    ['strip', 'same dated strip', 'Lay the paired readings'],
    ['map', 'Pin each reading', 'Hang the walking guide'],
  ])('uses the %s comparison to leave a distinct handover with the accustomed gauge names', (layout, compare, handoff) => {
    const d = begin();
    const handovers = ['coast-names-strip-handover', 'coast-names-map-handover'];
    const posted = ['coast-names-strip-posted', 'coast-names-map-posted'];
    const trace = [
      harbour.interactables.find(({ id }) => id === 'coast-harbour-gauge')?.text,
      station.interactables.find(({ id }) => id === 'coast-station-gauge')?.text,
    ];
    expect(trace[0]).toContain('Wallfoot');
    expect(trace[0]).toContain('Two finger-widths');
    expect(trace[1]).toContain('Wind Peg');
    expect(trace[1]).toContain('Five finger-widths');
    read(d, 'coast-harbour-gauge');
    d.s.mapId = station.id;
    read(d, 'coast-station-gauge');
    const tray = station.interactables.find(({ id }) => id === 'coast-names-strip-tray')!;
    expect(check(tray.visibleIf, d.s)).toBe(false);
    d.talk('coast-forecaster', compare);
    expect(d.done('coast.readings')).toBe(true);
    expect(d.done('coast.names.handoff')).toBe(false);
    expect(check(tray.visibleIf, d.s)).toBe(layout === 'strip');

    const headland = 'coast-names-headland-tag';
    expect(visible(d, [headland])).toEqual(layout === 'map' ? [headland] : []);
    expect(d.e.visibleOptions('coast.names.receive.map', d.s).map(({ option }) => option.text)).toEqual(['Leave the hook for now.']);
    if (layout === 'strip') {
      expect(check(tray.artOpen?.if, d.s)).toBe(false);
      d.walk(tray.node!, ['Wrap the dated strip']);
      expect(check(tray.artOpen?.if, d.s)).toBe(true);
    } else {
      read(d, headland);
    }
    d.s.mapId = harbour.id;
    expect(visible(d, posted)).toEqual([]);
    if (layout === 'map') {
      expect(visible(d, handovers)).toEqual([]);
      read(d, 'coast-names-quay-tag');
    }
    const receiverId = `coast-names-${layout}-handover`;
    expect(visible(d, handovers)).toEqual([receiverId]);
    const receiver = harbour.interactables.find(({ id }) => id === receiverId)!;
    d.walk(receiver.node!, [handoff]);
    expect(d.done('coast.names.handoff')).toBe(true);
    expect(visible(d, handovers)).toEqual([]);
    expect(visible(d, posted)).toEqual([`coast-names-${layout}-posted`]);
    expect(d.s.flags['coast.notice']).toBeUndefined();
    expect(d.e.talkEntry('coast-forecaster', d.s)).toBe('coast.station.chart');
  });

  it.each([
    [
      'signal', 'same dated strip', 'separate strip', 'Pin the qualified notice',
      'Pin the new reading', 'coast-notice-signal',
    ],
    [
      'runner', 'Pin each reading', 'mark when we’ll test', 'Send the runner to',
      'Send the runner back', 'coast-notice-runner',
    ],
  ])('%s reaches a distinct audience, then updates the notice with equal capped credit',
  (notice, compare, qualify, send, revise, display) => {
    const d = begin();
    const signalkeeper = 'coast-signalkeeper';
    const notices = ['coast-notice-signal', 'coast-notice-runner'];
    read(d, 'coast-harbour-gauge');
    d.s.mapId = station.id;
    read(d, 'coast-station-gauge');
    d.talk('coast-forecaster', compare);
    read(d, 'coast-chart-board');
    d.talk('coast-forecaster', qualify);
    d.s.mapId = harbour.id;
    expect(visible(d, notices)).toEqual([]);
    d.talk(signalkeeper, send);
    expect(d.s.flags['coast.notice']).toBe(notice);
    expect(visible(d, notices)).toEqual([display]);
    expect(d.e.talkEntry(signalkeeper, d.s)).toBe('coast.wait');

    d.s.mapId = station.id;
    read(d, 'coast-station-recheck');
    d.s.mapId = harbour.id;
    d.talk(signalkeeper, revise);
    expect(d.done('coast.revise')).toBe(true);
    expect(visible(d, ['coast-notice-revision'])).toEqual(['coast-notice-revision']);
    const recipient = notice === 'signal' ? 'quay' : 'steps';
    const other = recipient === 'quay' ? 'steps' : 'quay';
    expect(visible(d, [`coast-correction-${recipient}`, `coast-correction-${other}`])).toEqual([`coast-correction-${recipient}`]);
    expect(d.s.flags['coast.correction.catch']).toBe(recipient);
    expect(d.p.credit['credit.coast.dispatch']).toBe(8);
    expect(d.p.credit['credit.coast.revise']).toBe(8);

    const after = d.e.talkEntry(signalkeeper, d.s)!;
    expect(d.e.visibleOptions(after, d.s)).toHaveLength(1);
    read(d, 'coast-harbour-notebook');
    d.talk(signalkeeper, 'path by the sheds');
    expect(d.done('coast.missed-copy')).toBe(true);
    expect(visible(d, ['coast-notice-spare'])).toEqual(['coast-notice-spare']);
    expect(d.p.moments['mom.coast.copy']).toBeTruthy();
    expect(d.e.visibleOptions(after, d.s)).toHaveLength(1);
    expect(d.p.credit['credit.coast.dispatch']).toBe(8);
    expect(d.p.credit['credit.coast.revise']).toBe(8);
  });

  it.each([
    ['signal', 'Pin the qualified notice', 'Send the signed catch', 'steps', 'Fit the dated blank under the basket crews'],
    ['runner', 'Send the runner to', 'Leave the signed catch with the quay cutters', 'quay', 'Fit the dated blank at the cutters'],
  ])('lets the %s issue keep its original route while the other crew receives the right to post a check',
    (notice, send, handover, recipient, install) => {
      const d = begin();
      const keeper = 'coast-signalkeeper';
      const props = ['coast-correction-quay', 'coast-correction-steps'];
      read(d, 'coast-harbour-gauge');
      d.s.mapId = station.id;
      read(d, 'coast-station-gauge');
      d.talk('coast-forecaster', 'Pin each reading');
      read(d, 'coast-chart-board');
      d.talk('coast-forecaster', 'separate strip');
      d.s.mapId = harbour.id;
      d.talk(keeper, send);
      expect(visible(d, props)).toEqual([]);
      expect(d.e.visibleOptions(d.e.talkEntry(keeper, d.s)!, d.s).some(({ option }) => option.text.includes(handover))).toBe(false);
      d.s.mapId = station.id;
      read(d, 'coast-station-recheck');
      d.s.mapId = harbour.id;
      d.talk(keeper, handover);
      expect(d.done('coast.revise')).toBe(true);
      expect(d.s.flags['coast.notice']).toBe(notice);
      const id = `coast-correction-${recipient}`;
      expect(visible(d, props)).toEqual([id]);
      const hook = harbour.interactables.find((entry) => entry.id === id)!;
      expect(harbour.interactables.filter(({ x, y }) => x === hook.x && Math.abs(y - hook.y) < 2)).toEqual([hook]);
      expect(check(hook.artOpen?.if, d.s)).toBe(false);
      d.walk(hook.node!, ['Leave the catch']);
      expect(check(hook.artOpen?.if, d.s)).toBe(false);
      d.walk(hook.node!, [install]);
      expect(check(hook.artOpen?.if, d.s)).toBe(true);
      expect(d.s.flags['coast.correction.fitted']).toBe(recipient);
      expect(d.e.node(`${hook.node}.fitted`).text).toContain(recipient === 'quay' ? 'waits for a second quay reading' : 'line stays open');
      d.walk(hook.node!, ['Read the signed catch again']);
      expect(d.s.journal.filter((entry) => entry === `j.coast.correction.${recipient}`)).toHaveLength(1);
      expect(d.p.credit['credit.coast.revise']).toBe(8);
      expect(d.done('coast.missed-copy')).toBe(false);
    });

  it('leaves a previously revised save with its original notice and no assigned catch', () => {
    const d = begin();
    d.run({ type: 'SetFlag', flag: 'coast.notice', value: 'runner' });
    d.run({ type: 'SetFlag', flag: 'coast.updated', value: true });
    expect(visible(d, ['coast-notice-revision', 'coast-correction-quay', 'coast-correction-steps'])).toEqual(['coast-notice-revision']);
  });

});

describe('Clear for Whom?', () => {
  it.each([
    ['Pass the ribbon through', 'row', 'Leave the ribbon at the row', 'Pass the same ribbon', 'tags', 'Leave separate tags'],
    ['Pass the same ribbon', 'edge', 'Leave the ribbon at the edge', 'Pass the ribbon through', 'card', 'Give the runner'],
  ])('uses both checks after the %s reading, then files the appropriate copy',
  (first, phase, exit, second, placement, choose) => {
    const d = begin();
    const frame = harbour.interactables.find((prop) => prop.id === 'coast-clear-net-frame')!;
    const desk = station.interactables.find((prop) => prop.id === 'coast-clear-terms')!;
    const stationTag = ['coast-clear-tower-tag'];
    const harbourNotes = ['coast-clear-net-tag', 'coast-clear-runner-card'];
    const credits = { ...d.p.credit };

    expect(visible(d, harbourNotes)).toEqual([]);
    d.walk(frame.node!, [first, exit]);
    expect(d.s.flags['coast.clear.phase']).toBe(phase);
    expect(frame.artBy?.keys[phase]).toBe(`coast.clear-frame-${phase}`);
    expect(d.done('coast.clear.test')).toBe(false);
    expect(check(desk.visibleIf, d.s)).toBe(false);
    d.walk(frame.node!, [second, 'Keep the two readings']);
    expect(d.done('coast.clear.test')).toBe(true);

    d.s.mapId = station.id;
    read(d, 'coast-clear-visibility');
    expect(check(desk.visibleIf, d.s)).toBe(false);
    expect(d.e.visibleOptions(desk.node!, d.s).map(({ option }) => option.next)).toEqual([undefined]);
    read(d, 'coast-station-gauge');
    expect(check(desk.visibleIf, d.s)).toBe(true);
    d.walk(desk.node!, [choose]);
    expect(d.done('coast.clear.share')).toBe(true);
    expect(d.done('coast.readings')).toBe(false);
    expect(d.s.flags['coast.notice']).toBeUndefined();
    expect(d.p.credit).toEqual(credits);
    expect(visible(d, stationTag)).toEqual(placement === 'tags' ? stationTag : []);
    d.s.mapId = harbour.id;
    expect(visible(d, harbourNotes)).toEqual([placement === 'tags' ? harbourNotes[0] : harbourNotes[1]]);
  });
});
