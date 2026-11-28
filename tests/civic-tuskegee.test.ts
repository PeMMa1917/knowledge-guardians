import { describe, expect, it } from 'vitest';
import { contentNoteFor } from '../src/domain/contentNotes';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import data from '../src/content/civic-tuskegee.json';
import { Driver } from './driver';

const MAP = 'civic.quiet-records';
const scene = (d: Driver, id: string, ...picks: string[]) => {
  const prop = MAPS[MAP].interactables.find((p) => p.id === id);
  if (!prop?.node || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, picks);
};

describe('The study at Tuskegee (X-005, chapter 12)', () => {
  it('shows a content note with a way to step back before the room', () => {
    const note = contentNoteFor(MAP, {});
    expect(note?.stepBack.map).toBe('civic.dispatch');
    expect(note?.sources.length).toBeGreaterThanOrEqual(2);
  });
  it('opens only after the chapter choice, and cites the descendants\' foundation', () => {
    const door = MAPS['civic.dispatch'].interactables.find((p) => p.id === 'civic-quiet-records-door')!;
    const d = new Driver();
    expect(check(door.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'civic.response', value: 'rank' });
    expect(check(door.visibleIf, d.s)).toBe(true);
    expect(data.sources.some((s) => s.url.includes('voicesforfathers.org'))).toBe(true);
    for (const c of data.cards) expect(c.sources.length).toBeGreaterThan(0);
  });
  it.each(['consent', 'names', 'stop'])('accepts the "%s" rule after all three records', (rule) => {
    const d = new Driver();
    d.s.mapId = MAP;
    d.run({ type: 'SetFlag', flag: 'civic.response', value: 'rank' });
    for (const k of ['told', 'withheld', 'after']) scene(d, `quiet-records-${k}`, 'Keep');
    const text = data.dialogue.find((n) => n.id === 'civic.tuskegee.desk')!.options!.find((o) => o.next === `civic.tuskegee.desk.${rule}`)!.text;
    scene(d, 'quiet-records-desk', text.slice(0, 24));
    expect(d.s.flags['civic.tuskegee.rule']).toBe(rule);
    for (const o of data.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
  });
});
