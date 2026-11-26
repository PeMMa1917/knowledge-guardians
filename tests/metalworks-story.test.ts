import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const inspector = 'metal-inspector';
const steward = 'metal-steward';
const yard = 'metalworks.yard';
const hall = 'metalworks.records';
const responseProps = ['metal-response-window', 'metal-response-ledger'];
const weightTags = ['metal-weight-tag', 'metal-weight-correction'];

function enter() {
  const d = new Driver();
  const crossing = MAPS['nexus.archive'].interactables.find((item) => item.to?.map === yard)!;
  expect(check(crossing.visibleIf, d.s)).toBe(false);
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH6-M01')).toBe(false);
  d.s.objectivesDone.push('forest.finish');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  expect(d.done('metal.arrival')).toBe(true);
  return d;
}

function sign(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Unable to read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function visible(d: Driver, ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

describe('The Blue Panels', () => {
  it('uses both matched-size weighings and independently filed custody records', () => {
    const d = enter();
    expect(visible(d, weightTags)).toEqual(['metal-weight-tag']);
    d.run({ type: 'CompareMetalSample', sample: 'panel-a' });
    sign(d, 'metal-custody-intake');
    expect(d.e.talkEntry(inspector, d.s)).toBe('metal.inspector.welcome');
    d.s.mapId = hall;
    expect(visible(d, ['metal-custody-return'])).toEqual([]);
    expect(d.e.talkEntry(steward, d.s)).toBe('metal.steward.welcome');
    sign(d, 'metal-custody-repair');
    d.talk(steward, 'Pin each slip');
    expect(d.done('metal.trace')).toBe(true);
    expect(d.e.talkEntry(steward, d.s)).toBe('metal.steward.trace.ready');
    d.s.mapId = yard;
    d.run({ type: 'CompareMetalSample', sample: 'panel-b' });
    expect(d.done('metal.compare')).toBe(false);
    expect(visible(d, weightTags)).toEqual(['metal-weight-tag']);
    d.talk(inspector, 'Pin the two balance readings');
    expect(d.done('metal.compare')).toBe(true);
    expect(visible(d, weightTags)).toEqual(['metal-weight-correction']);
    expect(d.e.talkEntry(steward, d.s)).toBe('metal.steward.decide');
  });

  it.each([
    ['window', 'Pin the two balance readings', 'File the descriptions', 'Put the two panel readings', 'Add a dated cart card'],
    ['ledger', 'Clip each box letter', 'Pin each slip', 'Hold back the maker label', 'File the cart trip'],
  ])('%s shares the record with a different audience and earns equal capped credit',
  (response, organise, file, send, update) => {
    const d = enter();
    d.run({ type: 'CompareMetalSample', sample: 'panel-a' });
    d.run({ type: 'CompareMetalSample', sample: 'panel-b' });
    d.talk(inspector, organise);
    sign(d, 'metal-custody-intake');
    d.s.mapId = hall;
    sign(d, 'metal-custody-repair');
    d.talk(steward, file);
    expect(visible(d, responseProps)).toEqual([]);

    d.talk(steward, send);
    expect(d.s.flags['metal.response']).toBe(response);
    expect(visible(d, responseProps)).toEqual([`metal-response-${response}`]);
    expect(d.e.talkEntry(steward, d.s)).toBe('metal.steward.wait');
    sign(d, 'metal-custody-return');
    d.talk(steward, update);
    expect(d.done('metal.finish')).toBe(true);
    expect(d.p.credit['credit.metal.publish']).toBe(8);
    expect(d.p.credit['credit.metal.finish']).toBe(8);
    expect(d.p.moments['mom.metal.trace']).toBeTruthy();

    d.talk(steward, 'Make a larger copy');
    expect(d.done('metal.copy')).toBe(true);
    expect(d.p.credit['credit.metal.finish']).toBe(8);
  });
});
