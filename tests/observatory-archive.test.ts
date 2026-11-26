import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const harbour = 'observatory.harbour';
const archive = 'observatory.archive';
const objective = 'coast.archive.published';

function object(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  if (!prop || !check(prop.visibleIf, d.s) || !check(prop.openIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return prop;
}

function passThrough(d: Driver, id: string): void {
  const to = object(d, id).to;
  if (!to) throw new Error(`${id} has no destination`);
  d.s.mapId = to.map;
  d.s.pos = { x: to.x, y: to.y };
}

function scene(d: Driver, id: string, selection: string): void {
  const prop = object(d, id);
  if (prop.kind !== 'scene' || !prop.node) throw new Error(`${id} has no scene`);
  d.walk(prop.node, [selection]);
}

function arrive(): Driver {
  const d = new Driver();
  d.s.mapId = harbour;
  passThrough(d, 'coast-archive-path');
  expect(d.s.mapId).toBe(archive);
  return d;
}

function pressOptions(d: Driver): string[] {
  return d.e.visibleOptions(object(d, 'coast-archive-press').node!, d.s).map(({ option }) => option.text);
}

function gather(d: Driver): void {
  scene(d, 'coast-archive-sleeve', 'trace its issue stamp');
  scene(d, 'coast-archive-register', 'ruled strip');
  scene(d, 'coast-archive-copy', 'Open the fold');
}

describe('The Number That Outlived the Weather', () => {
  it('lets a visitor reach and leave the archive, and requires all three records to print', () => {
    const d = arrive();
    scene(d, 'coast-archive-sleeve', 'Rest the sleeve');
    expect(d.s.flags['coast.archive.forecast-read']).toBeUndefined();
    scene(d, 'coast-archive-sleeve', 'trace its issue stamp');
    scene(d, 'coast-archive-register', 'ruled strip');
    expect(pressOptions(d)).toEqual(['Leave the desk open for now.']);
    passThrough(d, 'coast-archive-return');
    expect(d.s.mapId).toBe(harbour);
    expect(() => object(d, 'coast-archive-harbour-card')).toThrow('Cannot use');
    passThrough(d, 'coast-archive-path');
    scene(d, 'coast-archive-copy', 'Open the fold');
    expect(pressOptions(d)).toHaveLength(3);
    expect(d.s.flags['coast.notice']).toBeUndefined();
  });

  it('files the old copy with both dated records on a timeline', () => {
    const d = arrive();
    gather(d);
    const priorCredit = { ...d.p.credit };
    scene(d, 'coast-archive-press', 'Mount the forecast');
    expect(() => object(d, 'coast-archive-press')).toThrow('Cannot use');
    expect(d.done(objective)).toBe(false);
    scene(d, 'coast-archive-timeline', 'Clip the printed notice');
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.coast.archive');
    expect(d.p.credit).toEqual(priorCredit);
    expect(object(d, 'coast-archive-copy').node).toBe('coast.archive.copy');
    passThrough(d, 'coast-archive-return');
    expect(() => object(d, 'coast-archive-harbour-card')).toThrow('Cannot use');
    expect(d.s.flags['coast.updated']).toBeUndefined();
  });

  it('leaves an archive index and a source card at the harbour without replacing its news', () => {
    const d = arrive();
    d.run({ type: 'SetFlag', flag: 'coast.notice', value: 'runner' });
    d.run({ type: 'SetFlag', flag: 'coast.updated', value: true });
    gather(d);
    const priorCredit = { ...d.p.credit };
    scene(d, 'coast-archive-press', 'Send the working copy shelf');
    expect(object(d, 'coast-archive-index').node).toBe('coast.archive.index');
    expect(() => object(d, 'coast-archive-timeline')).toThrow('Cannot use');
    expect(d.done(objective)).toBe(false);
    passThrough(d, 'coast-archive-return');
    scene(d, 'coast-archive-harbour-card', 'Slip the card into the copy rack');
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.coast.archive');
    expect(d.s.flags['coast.notice']).toBe('runner');
    expect(d.s.flags['coast.updated']).toBe(true);
    expect(d.p.credit).toEqual(priorCredit);
    passThrough(d, 'coast-archive-path');
    expect(object(d, 'coast-archive-register').node).toBe('coast.archive.register');
  });
});
