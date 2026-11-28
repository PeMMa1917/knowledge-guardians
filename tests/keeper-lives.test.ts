import { expect, it } from 'vitest';
import { Driver } from './driver';
import { keeperLifeEntry } from '../src/domain/keeperLife';
import lives from '../src/content/keeper-lives.json';
import { factions } from '../src/domain/temples';

it('gives each fictional speaker a complete profile and an individual voice', () => {
  const { pack } = new Driver().e;
  const people = pack.characters.filter(c => c.mode === 'fictional' && pack.dialogue.some(d => d.speaker === c.id));
  expect(Object.keys(lives).sort()).toEqual(people.map(c => c.id).sort());
  for (const field of ['want', 'belief', 'speech', 'reply'] as const)
    expect(new Set(Object.values(lives).map(p => p[field])).size, field).toBe(people.length);
  for (const p of Object.values(lives)) {
    expect(factions).toContain(p.thread);
    expect(Object.values(p).every(v => v.trim().length > 2)).toBe(true);
    expect(p.method).not.toBe(p.need);
  }
});

it('remembers either form of help for each keeper and lets the Guardian change it without farming trust', () => {
  const g = new Driver();
  for (const [who, p] of Object.entries(lives)) {
    const first = keeperLifeEntry(who, g.s);
    const trust = g.s.relations[who] ?? 0;
    g.walk(first, [p.need, 'Take leave']);
    const home = keeperLifeEntry(who, g.s);
    expect(g.e.node(home).text).toBe(p.reply);
    g.walk(home, ['Try the other', p.method, 'Take leave']);
    expect(g.e.node(keeperLifeEntry(who, g.s)).text).toBe(p.belief);
    expect(g.s.relations[who]).toBe(trust + 1);
    g.walk(first, [p.need, 'Take leave']);
    expect(keeperLifeEntry(who, g.s)).toBe(home);
    expect(g.s.relations[who]).toBe(trust + 1);
  }
}, 60000);
