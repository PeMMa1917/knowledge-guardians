import { describe, expect, it } from 'vitest';
import { CATCHMENT_ROOM, CATCHMENT_TRIALS, catchmentReading, type CatchmentNotice } from '../src/domain/catchment';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(map: string, id: string) {
  const target = MAPS[map].interactables.find((entry) => entry.id === id);
  if (!target) throw new Error(`Missing fixture prop ${id}`);
  return target;
}

const lower = 'water.lower-channel';
const canal = 'civic.canal';
const routes = {
  rows: { door: 'catchment-rows-door', receipt: 'catchment-terrace-receipt', later: 'catchment-civic-terrace', x: 7, y: 11 },
  crossing: { door: 'catchment-rail-door', receipt: 'catchment-rail-receipt', later: 'catchment-civic-rail', x: 22, y: 6 },
} as const;

function discover(d: Driver) {
  for (const [map, id] of [['water.gatehouse', 'catchment-upper-peg'], [lower, 'catchment-lower-peg']]) {
    d.s.mapId = map;
    expect(check(prop(lower, 'catchment-hatch').visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: prop(map, id).flag!, value: true });
  }
  expect(check(prop(lower, 'catchment-hatch').visibleIf, d.s)).toBe(true);
  d.s.mapId = CATCHMENT_ROOM;
}

function receive(d: Driver, notice: CatchmentNotice) {
  const route = routes[notice];
  const opened = prop(CATCHMENT_ROOM, route.door);
  expect(check(opened.visibleIf, d.s)).toBe(true);
  expect(opened.to).toEqual({ map: lower, x: route.x, y: route.y });
  const receiver = prop(lower, route.receipt);
  expect(check(receiver.visibleIf, d.s)).toBe(false);
  d.run({ type: 'SetFlag', flag: opened.flag!, value: true });
  d.s.mapId = lower;
  expect(check(receiver.visibleIf, d.s)).toBe(true);
  d.walk(receiver.node!);
}

describe('Below the Gauge', () => {
  it('uses distinct peg observations and leaves a way back from the unopened model', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'TraceCatchment', trial: 'open' })).toThrow(/two peg marks/);
    discover(d);
    expect(d.done('catchment.pegs')).toBe(true);
    expect(prop(CATCHMENT_ROOM, 'catchment-exit').to?.map).toBe(lower);
    expect(check(prop(CATCHMENT_ROOM, 'catchment-exit').visibleIf, d.s)).toBe(true);
    expect(() => d.run({ type: 'PostCatchmentNotice', notice: 'rows' })).toThrow(/exposed and covered/);
  });

  it('keeps the upper pulse fixed and lets the player find the missing floats in the changed pocket', () => {
    expect(catchmentReading('pocket')).toEqual({ upper: 6, pocket: 2, lower: 4 });
    expect(catchmentReading('open')).toEqual({ upper: 6, pocket: 0, lower: 6 });
    const d = new Driver();
    discover(d);
    d.run({ type: 'TraceCatchment', trial: 'pocket' });
    const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Partial trace', location: 'Culvert', savedAt: '2026-11-26T15:24:00Z', state: d.s });
    const result = parsePair(serialisePair(pair));
    if (!result.ok || !result.pair.continue) throw new Error('Could not reload the model');
    d.s = result.pair.continue.state;
    expect(d.s.flags['catchment.trial.pocket']).toBe(true);
    expect(d.done('catchment.compare')).toBe(false);
    d.run({ type: 'TraceCatchment', trial: 'open' });
    expect(d.done('catchment.compare')).toBe(true);
    expect(d.p.skills['SK-MICRO-0411']).toHaveLength(1);
  });

  it.each([['rows', 'crossing'], ['crossing', 'rows']] as const)('keeps the %s receipt, then opens the revised %s route and its own Civic follow-up', (first, next) => {
    const d = new Driver();
    discover(d);
    for (const trial of CATCHMENT_TRIALS) d.run({ type: 'TraceCatchment', trial });
    d.run({ type: 'PostCatchmentNotice', notice: first });
    expect(d.done('catchment.local-receipt')).toBe(false);
    expect(check(prop(CATCHMENT_ROOM, routes[next].door).visibleIf, d.s)).toBe(false);
    expect(() => d.run({ type: 'PostCatchmentNotice', notice: next })).toThrow(/check its receipt/);
    receive(d, first);
    expect(d.done('catchment.local-receipt')).toBe(true);
    expect(check(prop(canal, routes[first].later).visibleIf, d.s)).toBe(true);
    expect(check(prop(canal, routes[next].later).visibleIf, d.s)).toBe(false);
    d.s.mapId = CATCHMENT_ROOM;
    d.run({ type: 'PostCatchmentNotice', notice: next });
    receive(d, next);
    expect(d.s.journal.filter((line) => line === 'j.catchment')).toHaveLength(1);
    expect(d.s.inventory['item.catchment.crossing-copy']).toBe(1);
    expect(d.p.skills['SK-MICRO-0350']).toHaveLength(1);
    expect(check(prop(canal, routes[first].later).visibleIf, d.s)).toBe(false);
    expect(check(prop(canal, routes[next].later).visibleIf, d.s)).toBe(true);
    d.s.mapId = canal;
    d.s.objectivesDone.push('civic.arrival');
    d.walk(prop(canal, routes[next].later).node!);
    expect(d.done('catchment.civic.receipt')).toBe(true);
    expect(d.p.skills['SK-MICRO-0887']).toHaveLength(1);
  });

  it('files the named public source independently of the fiction and requires no source agreement to trace a pulse', () => {
    const d = new Driver();
    discover(d);
    d.walk(prop(CATCHMENT_ROOM, 'catchment-source').node!);
    expect(d.done('catchment.read')).toBe(true);
    const source = d.e.pack.sources.find(({ id }) => id === 'HIS-WHANGANUI-TUPUA');
    expect(source?.mla?.container).toBe('Ngā Tāngata Tiaki o Whanganui');
  });
});
