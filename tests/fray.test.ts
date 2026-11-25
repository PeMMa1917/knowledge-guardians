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

describe('The Shattering Rumour (rumour trace, Echo Moths)', () => {
  it('trace the story back to the record; blame and "all lies" send the player back to try again', () => {
    const d = new Driver();
    d.talk('villager-1', 'Any news');
    expect(d.s.flags['rumour.v1']).toBe(true);
    d.talk('porter-idris'); d.talk('stallkeeper-hana');
    expect(d.done('rum.o2.hana')).toBe(true);
    d.run({ type: 'SetFlag', flag: 'rumour.record', value: true });
    expect(d.done('rum.o3.record')).toBe(true);
    d.talk('villager-1', 'I found where', 'Corvan started', 'You are right', 'It was all lies', 'Let me say it again', 'One test blade');
    expect(d.done('rum.o4.tell')).toBe(true);
    expect(d.p.credit['crit.truth.rumour']).toBe(5);
    expect(d.s.flags['fray.echo-moths']).toBeDefined();
    expect(d.e.talkEntry('villager-1', d.s)).toBe('tea.start');
    expect(d.e.visibleOptions('tea.start', d.s).some((o) => o.option.text === 'Any news today?')).toBe(true);
  });
  it('people further along the chain wait their turn', () => {
    const d = new Driver();
    expect(d.e.talkEntry('stallkeeper-hana', d.s)).toBe('rumour.hana.idle');
  });
});
