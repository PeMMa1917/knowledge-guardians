import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const yard = 'metalworks.yard';
const hall = 'metalworks.records';
const release = {
  yard: ['Open Corra’s low peg', 'Set the low peg', 'Seat the small sample', 'Leave the peg'],
  hall: ['Set the wide cradle', 'Set the sleeve cradle', 'Hold the sleeve', 'Leave the cradle'],
} as const;

function enter(): Driver {
  const d = new Driver();
  d.resumeAfter('forest.finish');
  takeDoor(d, 'metalworks-door');
  expect(d.done('metal.arrival')).toBe(true);
  return d;
}

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
}

function has(d: Driver, id: string): boolean {
  const candidate = prop(d, id);
  return Boolean(candidate && check(candidate.visibleIf, d.s));
}

function play(d: Driver, id: string, ...actions: string[]): void {
  expect(has(d, `metal-rim-${id}`)).toBe(true);
  d.walk(prop(d, `metal-rim-${id}`)!.node!, actions);
}

function takeDoor(d: Driver, id: string): void {
  const door = prop(d, id);
  expect(check(door?.visibleIf, d.s) && check(door?.openIf, d.s)).toBe(true);
  d.s.mapId = door!.to!.map;
  if (door!.flag) d.run({ type: 'SetFlag', flag: door!.flag, value: true });
}

function makeRuns(d: Driver, reverse = false): void {
  play(d, 'rack', 'Pull the loose tray', 'Set the sample back',
    reverse ? 'Close the padded sleeve' : 'Raise the low peg', 'Set the sample back',
    reverse ? 'Raise the low peg' : 'Close the padded sleeve', 'Leave the rack');
}

function collect(d: Driver, reverse = false): void {
  if (reverse) play(d, 'note', 'Lift the caption', 'Clip the dated docket');
  makeRuns(d, reverse);
  if (!reverse) play(d, 'note', 'Lift the caption', 'Clip the dated docket');
  takeDoor(d, 'metal-records-path');
}

describe('The Rim That Slipped', () => {
  it('opens along normal entry and holds other supports until the failed attempt', () => {
    const d = enter();
    const rack = prop(d, 'metal-rim-rack')!;
    expect(rack.artBy?.keys).toEqual({ slip: 'metalworks.panel-b', peg: 'preserved.display-paired', sleeve: 'preserved.folder' });
    const options = () => d.e.visibleOptions(rack.node!, d.s).map(({ option }) => option.text);
    expect(options()).toHaveLength(2);
    play(d, 'rack', 'Leave the rack');
    expect(d.s.flags['metal.rim.last']).toBeUndefined();
    play(d, 'rack', 'Pull the loose tray', 'Leave the rack');
    expect(d.s.flags['metal.rim.last']).toBe('slip');
    expect(d.done('metal.rim.runs')).toBe(false);
    expect(options()).toHaveLength(4);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    play(d, 'rack', 'Raise the low peg', 'Leave the rack');
    play(d, 'rack', 'Close the padded sleeve', 'Leave the rack');
    play(d, 'rack', 'Raise the low peg', 'Leave the rack');
    expect(d.done('metal.rim.runs')).toBe(true);
    expect(d.events.filter((event) => event.kind === 'objective' && event.id === 'metal.rim.runs')).toHaveLength(1);
    expect(['slip', 'peg', 'sleeve'].map((kind) => d.s.flags[`metal.rim.${kind}`])).toEqual([true, true, true]);
    expect(d.s.flags['metal.rim.last']).toBe('peg');
    expect(d.done('metal.compare')).toBe(false);
  });

  it('requires the dated entry and the runs, then personally lays both sources on the stand', () => {
    const d = enter();
    makeRuns(d);
    expect(d.e.node('metal.rim.slip').text).toContain('passes the inside rim');
    expect(d.e.node('metal.rim.peg').text).toMatch(/same blue sample.*same mark.*stays inside/);
    expect(d.e.node('metal.rim.sleeve').text).toMatch(/Same sample, same chalk marks.*holds the sample inside/);
    takeDoor(d, 'metal-records-path');
    expect(has(d, 'metal-rim-compare')).toBe(false);
    takeDoor(d, 'metal-yard-return');
    play(d, 'note', 'Leave the docket');
    expect(d.done('metal.rim.record')).toBe(false);
    play(d, 'note', 'Lift the caption', 'Clip the dated docket');
    expect(d.e.node('metal.rim.docket').text).toMatch(/Second Frost, third bell.*Hall sleeve check, grey sample.*yard handling line is blank.*no signature or date/);
    takeDoor(d, 'metal-records-path');
    expect(d.done('metal.rim.record')).toBe(true);
    expect(d.done('metal.rim.compare')).toBe(false);
    expect(has(d, 'metal-rim-compare')).toBe(true);
    expect(has(d, 'metal-rim-plan')).toBe(false);
    play(d, 'compare', 'Keep the older docket', 'Leave the receiving choice');
    expect(d.done('metal.rim.compare')).toBe(true);
    expect(d.e.node('metal.rim.plan').text).toContain('a grey sample and another shift');
    expect(d.done('metal.rim.receive')).toBe(false);
    expect(has(d, 'metal-rim-compare')).toBe(false);
    expect(has(d, 'metal-rim-plan')).toBe(true);
    expect(has(d, 'metal-rim-hall')).toBe(false);
    expect(d.e.talkEntry('metal-steward', d.s)).toBe('metal.steward.welcome');
  });

  it.each(['yard', 'hall'] as const)('keeps only the enacted %s station and accepts either result', (place) => {
    const d = enter();
    const alternative = place === 'hall' ? 'yard' : 'hall';
    collect(d, place === 'hall');
    const [selectWrongPlace, goWrongPlace] = release[alternative];
    const [select, go, enact, leave] = release[place];
    play(d, 'compare', 'Keep the older docket', selectWrongPlace, goWrongPlace);
    play(d, 'plan', select, go);
    expect(d.done('metal.rim.setup')).toBe(true);
    expect(d.done('metal.rim.receive')).toBe(false);
    if (place === 'yard') {
      expect(has(d, 'metal-rim-hall')).toBe(false);
      takeDoor(d, 'metal-yard-return');
    }
    expect(d.s.mapId).toBe(place === 'yard' ? yard : hall);
    const station = prop(d, `metal-rim-${place}`)!;
    expect(check(station.artOpen?.if, d.s)).toBe(false);
    play(d, place, enact, leave);
    expect(d.done('metal.rim.receive')).toBe(true);
    expect(d.s.flags['metal.rim.used']).toBe(place);
    expect(check(station.artOpen?.if, d.s)).toBe(true);
    expect(d.p.credit).toEqual({});
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    play(d, place, 'Check the', leave);
    if (place === 'yard') takeDoor(d, 'metal-records-path');
    else takeDoor(d, 'metal-yard-return');
    expect(has(d, 'metal-rim-plan')).toBe(false);
    expect(has(d, `metal-rim-${alternative}`)).toBe(false);
    expect(d.events.filter((event) => event.kind === 'objective' && event.id === 'metal.rim.receive')).toHaveLength(1);
  });
});
