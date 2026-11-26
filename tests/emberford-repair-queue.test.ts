import { describe, expect, it } from 'vitest';
import { crossingOf, crossingWay, wayOpen } from '../src/domain/crossings';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { EMBERFORD, REPAIR_YARD } from '../src/maps/emberford';
import { Driver } from './driver';

const crossing = crossingOf('repair-queue')!;

function prop(map: typeof EMBERFORD, id: string) {
  const found = map.interactables.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown prop ${id}`);
  return found;
}

function visible(d: Driver, id: string, map = EMBERFORD) {
  return check(prop(map, id).visibleIf, d.s);
}

function open(d: Driver, id: string, choice: string, map = EMBERFORD) {
  expect(visible(d, id, map)).toBe(true);
  const { node } = prop(map, id);
  if (!node) throw new Error(`No dialogue on ${id}`);
  d.walk(node, [choice]);
}

function begin() {
  const d = new Driver();
  d.s.mapId = EMBERFORD.id;
  expect(visible(d, 'repair-queue-opening')).toBe(false);
  d.run({ type: 'Reach', zone: 'emberford' });
  expect(visible(d, 'repair-queue-opening')).toBe(true);
  open(d, 'repair-queue-opening', 'Take a copy');
  return d;
}

function choose(d: Driver, id: string) {
  expect(visible(d, 'cross-repair-queue')).toBe(true);
  const way = crossing.ways.find((w) => w.id === id)!;
  expect(wayOpen(way, d.s)).toBe(true);
  // The crossing panel records its already checked way through this command.
  d.run({ type: 'SetFlag', flag: `cross.${crossing.id}`, value: way.id });
  expect(d.done('repair.queue.o.terms')).toBe(true);
  expect(d.done('repair.queue.o.receipt')).toBe(false);
  expect(visible(d, 'cross-repair-queue')).toBe(false);
  expect(crossingWay(d.s.flags, crossing.id)?.id).toBe(id);
}

function permission(d: Driver) {
  open(d, 'repair-queue-permission', 'Fold the permitted copy');
}

function suspendAndResume(d: Driver) {
  const save = writeSuspend(emptyPair(), { kind: 'suspend', label: 'The Repair Queue', location: MAPS[d.s.mapId].name,
    savedAt: '2026-11-26T00:00:00.000Z', state: d.s });
  const loaded = parsePair(serialisePair(save));
  if (!loaded.ok || !loaded.pair.continue) throw new Error('Could not resume the repair queue');
  d.s = loaded.pair.continue.state;
}

describe('The Repair Queue', () => {
  it('checks both physical fit and permission, spends two marks once and opens an optional yard', () => {
    const d = begin();
    const credit = { ...d.p.credit };
    const main = d.s.objectivesDone.filter((id) => /^m0[12]\./.test(id));
    const paired = crossing.ways.find((w) => w.id === 'paired')!;
    expect(wayOpen(paired, d.s)).toBe(false);
    expect(visible(d, 'repair-queue-blanks')).toBe(false);
    expect(visible(d, 'repair-queue-gate')).toBe(false);
    open(d, 'repair-queue-bench', 'Lay both twelves');
    expect(visible(d, 'repair-queue-blanks')).toBe(false);
    permission(d);
    d.s.marks = 1;
    expect(d.e.visibleOptions('repair.queue.blanks', d.s).map(({ index }) => index)).toEqual([1]);
    d.s.marks = 3;
    open(d, 'repair-queue-blanks', 'Pay two marks');
    expect(d.s.marks).toBe(1);
    expect(visible(d, 'repair-queue-blanks')).toBe(false);
    expect(wayOpen(paired, d.s)).toBe(true);
    choose(d, 'paired');
    expect(visible(d, 'repair-queue-shut')).toBe(false);
    const gate = prop(EMBERFORD, 'repair-queue-gate');
    expect(visible(d, gate.id)).toBe(true);
    expect(check(gate.openIf, d.s)).toBe(true);
    expect(gate.to?.map).toBe(REPAIR_YARD.id);
    expect(MAPS[REPAIR_YARD.id]).toBe(REPAIR_YARD);
    expect(d.e.visibleOptions('repair.queue.paired.collect', d.s).map(({ index }) => index)).toEqual([1]);
    d.s.mapId = gate.to!.map;
    d.run({ type: 'Reach', zone: REPAIR_YARD.zones[0].id });
    open(d, 'repair-queue-collect', 'Clip the checked half', REPAIR_YARD);
    expect(d.s.flags['repair.queue.receipt']).toBe('paired');
    expect(visible(d, 'repair-queue-yard-receipt', REPAIR_YARD)).toBe(true);
    expect(prop(REPAIR_YARD, 'repair-queue-yard-exit').to?.map).toBe(EMBERFORD.id);
    expect(d.done('repair.queue.o.receipt')).toBe(true);
    expect(d.s.objectivesDone.filter((id) => /^m0[12]\./.test(id))).toEqual(main);
    expect(d.p.credit).toEqual(credit);
  });

  it('makes the no-fee route carry a tray, hand it over and return a stub after resuming', () => {
    const d = begin();
    const marks = d.s.marks;
    const relay = crossing.ways.find((w) => w.id === 'relay')!;
    expect(wayOpen(relay, d.s)).toBe(false);
    permission(d);
    choose(d, 'relay');
    expect(visible(d, 'repair-queue-gate')).toBe(false);
    expect(visible(d, 'repair-queue-handover')).toBe(false);
    open(d, 'repair-queue-tray', 'Lift the covered tray');
    open(d, 'repair-queue-handover', 'Set the tray below the counter');
    expect(d.s.flags['repair.queue.receipt']).toBeUndefined();
    suspendAndResume(d);
    expect(visible(d, 'repair-queue-handover')).toBe(false);
    open(d, 'repair-queue-return-stub', 'Clip the return stub');
    expect(d.s.marks).toBe(marks);
    expect(d.s.flags['repair.queue.receipt']).toBe('relay');
    expect(visible(d, 'repair-queue-relay-hours')).toBe(true);
    expect(d.done('repair.queue.o.receipt')).toBe(true);
  });

  it('leaves the gate shut, returns control to apprentices and pins their next appointment hours', () => {
    const d = begin();
    const credit = { ...d.p.credit };
    choose(d, 'leave');
    expect(d.s.flags['repair.queue.permission']).toBeUndefined();
    expect(visible(d, 'repair-queue-shut')).toBe(true);
    expect(visible(d, 'repair-queue-gate')).toBe(false);
    expect(visible(d, 'repair-queue-tray')).toBe(false);
    open(d, 'repair-queue-appointment-rota', 'Read which shifts');
    expect(d.s.flags['repair.queue.receipt']).toBe('leave');
    expect(d.done('repair.queue.o.receipt')).toBe(true);
    expect(visible(d, 'repair-queue-appointment-rota')).toBe(false);
    expect(visible(d, 'repair-queue-private-hours')).toBe(true);
    expect(d.p.credit).toEqual(credit);
  });
});
