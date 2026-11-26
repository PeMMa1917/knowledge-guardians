import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

function visible(d: Driver, id: string): boolean {
  const prop = EMBERFORD.interactables.find((entry) => entry.id === id);
  if (!prop) throw new Error(`Unknown prop ${id}`);
  return check(prop.visibleIf, d.s);
}

function initial() {
  const d = new Driver();
  d.s.mapId = EMBERFORD.id;
  return d;
}

describe('Two Tags on the Line', () => {
  it('offers the side case immediately with the main dispute and late quests untouched', () => {
    const d = initial();
    expect(visible(d, 'linen-clip')).toBe(true);
    expect(visible(d, 'linen-shade')).toBe(false);
    expect(visible(d, 'linen-open')).toBe(false);
    d.walk('linen.start', ['Leave the two cuttings']);
    expect(d.e.activeMissions(d.s).some(({ id }) => id === 'KG-CH1-S06')).toBe(false);

    d.walk('linen.start', ['Clip the two slips']);
    expect(d.done('linen.o.tags')).toBe(true);
    expect(d.s.cards).toContain('card.person.haytham');
    expect(visible(d, 'linen-shade')).toBe(true);
    expect(visible(d, 'linen-open')).toBe(true);
    expect(d.s.flags['heard.corvan']).toBeUndefined();
    expect(d.s.flags['sd.corvan.outcome']).toBeUndefined();
  });

  it.each([
    ['shade', 'Slide both cuttings', 'open', 'Put the same board', 'dye', 'Hang the shared-light', 'ferry'],
    ['open', 'Put the same board', 'shade', 'Slide both cuttings', 'ferry', 'Hang the crew', 'dye'],
  ])('can compare %s first, preserve both notes, and hang either priority with neutral credit', (first, actFirst, second, actSecond, tag, hang, other) => {
    const d = initial();
    const credit = { ...d.p.credit };
    d.walk('linen.start', ['Clip the two slips']);
    d.walk(`linen.${first}`, [actFirst]);
    expect(visible(d, `linen-${first}-result`)).toBe(true);
    expect(visible(d, 'linen-tag')).toBe(false);
    d.walk(`linen.${second}`, [actSecond]);
    expect(visible(d, `linen-${second}-result`)).toBe(true);
    expect(visible(d, 'linen-tag')).toBe(true);
    d.walk('linen.tag', [hang]);

    expect(d.s.flags['linen.tag']).toBe(tag);
    expect(d.done('linen.o.pin')).toBe(true);
    expect(d.s.journal).toContain('j.linen.ready');
    expect(d.p.moments['moment.linen.ready']).toBeTruthy();
    expect(d.p.credit).toEqual(credit);
    expect(visible(d, `linen-${tag}-tag`)).toBe(true);
    expect(visible(d, `linen-${other}-tag`)).toBe(false);
    expect(visible(d, 'copy-spare')).toBe(false);
  });
});
