import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const kit = 'copies.mending-card';
const objective = 'copies.translation.circulated';

function object(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  if (!prop || !check(prop.visibleIf, d.s) || !check(prop.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  return prop;
}

function walk(d: Driver, id: string): void {
  const to = object(d, id).to;
  if (!to) throw new Error(`${id} has no destination`);
  d.s.mapId = to.map;
  d.s.pos = { x: to.x, y: to.y };
}

function scene(d: Driver, id: string, ...picks: string[]): void {
  const prop = object(d, id);
  if (prop.kind !== 'scene' || !prop.node) throw new Error(`${id} has no scene`);
  d.walk(prop.node, picks);
}

function begin(): Driver {
  const d = new Driver();
  d.s.mapId = 'copies.archive';
  d.run({ type: 'SetFlag', flag: 'copies.arrived', value: true });
  return d;
}

function proof(d: Driver, criterion: string): void {
  const builder = object(d, 'copies-translation-type');
  expect(builder.kit).toBe(kit);
  const result = d.run({ type: 'BuildLabel', kit, subject: 'mended', criterion, limit: 'register' });
  const label = result.events.find((event) => event.kind === 'label');
  expect(label?.result.holds).toBe(true);
  expect(label?.result.text).toContain('return desk');
}

describe('Room for the Meaning', () => {
  it('follows the fold through two places before opening its own press', () => {
    const d = begin();
    walk(d, 'copies-press-path');
    expect(() => object(d, 'copies-translation-type')).toThrow('Cannot use');
    walk(d, 'copies-press-return');
    scene(d, 'copies-translation-file', 'Leave the file');
    expect(d.s.cards).not.toContain('card.copies.mender');
    scene(d, 'copies-translation-file', 'Fit the crease');
    walk(d, 'copies-press-path');
    expect(() => object(d, 'copies-translation-type')).toThrow('Cannot use');
    walk(d, 'copies-press-to-landing');
    scene(d, 'copies-translation-reader', 'Lift the wrapper');
    walk(d, 'copies-landing-to-press');
    expect(object(d, 'copies-translation-type').kit).toBe(kit);
    expect(() => object(d, 'copies-translation-carrier')).toThrow('Cannot use');
    expect(d.s.flags['copies.checked.press']).toBeUndefined();
  });

  it.each([false, true].flatMap((repaired) => [
    [repaired, 'plain'] as const, [repaired, 'paired'] as const,
  ]))('with notice repaired=%s, typesets and circulates the %s edition without changing the notice',
  (repaired, edition) => {
    const d = begin();
    if (repaired) {
      d.run({ type: 'SetFlag', flag: 'copies.response', value: 'strip' });
      d.run({ type: 'SetFlag', flag: 'copies.followup', value: true });
    }
    scene(d, 'copies-translation-file', 'Fit the crease');
    walk(d, 'copies-landing-path');
    scene(d, 'copies-translation-reader', 'Lift the wrapper',
      ...(repaired ? ['Hold the wrapper beside'] : []));
    expect(d.s.flags['node.copies.translation.repaired-notice'] === true).toBe(repaired);
    walk(d, 'copies-landing-to-press');

    const priorCredit = { ...d.p.credit };
    proof(d, edition === 'plain' ? 'paired' : 'plain');
    proof(d, edition);
    const carrier = object(d, 'copies-translation-carrier');
    expect(d.e.visibleOptions(carrier.node!, d.s).map(({ option }) => option.text)).toHaveLength(2);
    scene(d, 'copies-translation-carrier', edition === 'plain' ? 'Clip the plain-word' : 'Clip the paired');
    expect(d.s.flags['copies.translation.edition']).toBe(edition);
    expect(d.done(objective)).toBe(false);
    expect(() => object(d, 'copies-translation-type')).toThrow('Cannot use');

    if (edition === 'plain') {
      expect(() => object(d, 'copies-translation-workshop-proof')).toThrow('Cannot use');
      walk(d, 'copies-press-to-landing');
      scene(d, 'copies-translation-landing-proof', 'Put the notebook in the tray');
    } else {
      scene(d, 'copies-translation-workshop-proof', 'Fasten the notebook');
      walk(d, 'copies-press-to-landing');
      expect(() => object(d, 'copies-translation-landing-proof')).toThrow('Cannot use');
    }
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.copies.translation');
    expect(d.p.credit).toEqual(priorCredit);
    expect(d.s.flags['copies.response']).toBe(repaired ? 'strip' : undefined);
    expect(d.s.flags['copies.followup']).toBe(repaired ? true : undefined);
    expect(d.s.flags['copies.checked.press']).toBeUndefined();
  });
});
