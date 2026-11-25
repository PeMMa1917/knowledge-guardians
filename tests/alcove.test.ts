import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Driver } from './driver';

const pack = buildPack();
const rec = pack.alcoves[0];

function ready(cards: string[]) {
  const d = new Driver();
  d.s = { ...d.s, cards: [...cards], objectivesDone: ['m01.o6.label'] };
  return d;
}
const last = (d: Driver) => [...d.events].reverse().find((e) => e.kind === 'alcove') as any;

describe('Exhibition alcove (SYM-001)', () => {
  it('a symbol brings the Symbol Mirage and the lamps stay dark', () => {
    const d = ready(['card.loud-patent']);
    d.run({ type: 'AlcovePlace', alcove: 'firsts', item: 'sym.glasses' });
    expect(last(d).result).toBe('mirage');
    expect(d.s.flags['alcove.firsts.item']).toBeUndefined();
  });
  it('a person is not an object', () => {
    const d = ready(['card.person.bisheng']);
    d.run({ type: 'AlcovePlace', alcove: 'firsts', item: 'card.person.bisheng' });
    expect(last(d).result).toBe('not-object');
  });
  it('a card the player does not hold cannot be placed', () => {
    const d = ready([]);
    expect(() => d.run({ type: 'AlcovePlace', alcove: 'firsts', item: 'card.loud-patent' })).toThrow();
  });
  it('the Checklist Golem and the So-What Sphinx block, then every object completes with the same credit', () => {
    for (const o of rec.objects) {
      const d = ready([o.card]);
      d.run({ type: 'AlcovePlace', alcove: 'firsts', item: o.card });
      expect(last(d).result).toBe('lit');
      const gi = o.links.findIndex((l) => l.kind === 'checklist');
      d.run({ type: 'AlcoveLink', alcove: 'firsts', index: gi });
      expect(last(d).result).toBe('golem');
      expect(() => d.run({ type: 'AlcoveImply', alcove: 'firsts', index: 0 })).toThrow();
      d.run({ type: 'AlcoveLink', alcove: 'firsts', index: o.links.findIndex((l) => l.kind === 'specific') });
      d.run({ type: 'AlcoveImply', alcove: 'firsts', index: o.implications.findIndex((i) => !i.ok) });
      expect(last(d).result).toBe('sphinx');
      d.run({ type: 'AlcoveImply', alcove: 'firsts', index: o.implications.findIndex((i) => i.ok) });
      expect(last(d).result).toBe('ok');
      expect(d.s.objectivesDone).toContain('alc.o3.sowhat');
      expect(d.p.credit['crit.evidence.alcove']).toBe(10);
      expect(d.p.portfolio.filter((x) => x.kind === 'exhibition').length).toBe(1);
    }
  });
});
