import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Driver } from './driver';

const pack = buildPack();

describe('Fray Bestiary (spec 36.2)', () => {
  it('records a creature the first time and counts later meetings, with one toast only', () => {
    const d = new Driver();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.events = [];
    d.moves({ move: 'claim', claim: 'bold' }, { move: 'shout' }, { move: 'attack' }, { move: 'attack' });
    expect(d.s.flags['fray.echo-moths']).toBe(d.s.mapId);
    expect(d.s.flags['fray.hornet-of-blame.n']).toBe(2);
    expect(d.events.filter((e) => e.kind === 'fray' && e.id === 'hornet-of-blame')).toHaveLength(1);
  });
  it('the alcove creatures and the Loreling counterexample are recorded', () => {
    const d = new Driver();
    d.s = { ...d.s, cards: ['card.loud-patent'], objectivesDone: ['m01.o6.label'] };
    d.run({ type: 'AlcovePlace', alcove: 'firsts', item: 'sym.glasses' });
    expect(d.s.flags['fray.symbol-mirage']).toBeDefined();
    for (const sg of ['lamp', 'desk']) d.run({ type: 'LorelingWatch', loreling: 'glimmermoth', sighting: sg });
    d.run({ type: 'LorelingNote', loreling: 'glimmermoth', question: 'draws', option: 'light' });
    d.run({ type: 'LorelingNote', loreling: 'glimmermoth', question: 'glow', option: 'worn' });
    d.run({ type: 'LorelingOffer', loreling: 'glimmermoth', place: 'handle' });
    expect(d.s.flags['fray.shadow-twins']).toBeDefined();
  });
  it('a failed command records nothing', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'ShowdownMove', move: { move: 'attack' } })).toThrow();
    expect(Object.keys(d.s.flags).some((k) => k.startsWith('fray.'))).toBe(false);
  });
  it('every chapter-1 creature can be met in this chapter, and all have a weakness that is a good move', () => {
    expect(pack.fray.filter((f) => f.chapter === 1).length).toBeGreaterThanOrEqual(9);
    for (const f of pack.fray) expect(f.weakness.length).toBeGreaterThan(10);
  });
});
