import { describe, expect, it } from 'vitest';
// @ts-ignore Node types are not installed; vitest runs in Node.
import { readFileSync, readdirSync } from 'node:fs';
import { LETTERS, composeLetter, dueLetters } from '../src/domain/letters';
import type { Condition } from '../src/domain/types';
import { Driver } from './driver';
import { buildPack } from '../src/content';

const content = readdirSync('src/content').filter((f: string) => f.endsWith('.json')).map((f: string) => readFileSync(`src/content/${f}`, 'utf8')).join('\n');
const objectives = (c: Condition | undefined): string[] => !c ? [] : 'objective' in c ? [c.objective] : 'all' in c ? c.all.flatMap(objectives) : 'any' in c ? c.any.flatMap(objectives) : 'not' in c ? objectives(c.not) : [];

describe("Vesper Quill's letters (the rival)", () => {
  it('one letter per chapter, 1 to 15, each with a fallback line, a fair point and a hook', () => {
    expect(LETTERS.map((l) => l.chapter)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    for (const l of LETTERS) {
      expect(l.remembers[l.remembers.length - 1].if).toBeUndefined();
      expect(l.fair.length).toBeGreaterThan(20);
      expect(l.hook.length).toBeGreaterThan(10);
    }
  });

  it('every objective a letter waits for is a real objective, and every remembered flag value is set somewhere', () => {
    const real = new Set(buildPack().missions.flatMap((m) => m.objectives.map((o) => o.id)));
    for (const l of LETTERS) for (const id of [...objectives(l.when), ...l.remembers.flatMap((r) => objectives(r.if))])
      expect(real.has(id), `${l.id}: ${id}`).toBe(true);
    const flagConds = (c: Condition | undefined): { flag: string; eq: unknown }[] => !c ? [] : 'eq' in c ? [c] : 'all' in c ? c.all.flatMap(flagConds) : 'any' in c ? c.any.flatMap(flagConds) : [];
    for (const l of LETTERS) for (const r of l.remembers) for (const f of flagConds(r.if)) {
      if (f.flag.startsWith('sd.')) continue; // Showdown outcomes are set by the engine
      expect(content.includes(`"setFlag": "${f.flag}"`) && content.includes(`"value": "${f.eq}"`), `${l.id}: ${f.flag}=${f.eq}`).toBe(true);
    }
  });

  it('the first letter arrives after the Corvan Showdown and remembers its outcome', () => {
    const d = new Driver();
    expect(dueLetters(d.s)).toHaveLength(0);
    d.run({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'won-over' });
    const due = dueLetters(d.s);
    expect(due.map((l) => l.id)).toEqual(['l01']);
    expect(composeLetter(due[0], d.s).join(' ')).toContain('won Corvan over');
    d.run({ type: 'SetFlag', flag: 'letter.l01', value: true });
    expect(dueLetters(d.s)).toHaveLength(0);
  });
});

describe('the Harrowmere reveal (chapter 11)', () => {
  it('the card sits in the Water Commons; Ise asks the player to choose; letters remember it', async () => {
    const { MAPS } = await import('../src/maps');
    const card = MAPS['water.gatehouse'].interactables.find((i) => i.id === 'harrowmere-order')!;
    expect(card.flag).toBe('harrowmere.found');
    const pack = buildPack();
    const ise = pack.characters.find((c) => c.id === 'warden-ise')!;
    expect(ise.talk![0].node).toBe('ise.harrowmere');
    const node = pack.dialogue.find((n) => n.id === 'ise.harrowmere')!;
    expect(node.options!.filter((o) => o.effects?.some((e) => 'setFlag' in e && e.setFlag === 'ise.harrowmere'))).toHaveLength(3);
    const d = new Driver();
    const l11 = LETTERS.find((l) => l.id === 'l11')!;
    expect(composeLetter(l11, d.s).join(' ')).toContain('drawer');
    d.run({ type: 'SetFlag', flag: 'harrowmere.found', value: true });
    expect(composeLetter(l11, d.s).join(' ')).toContain('Harrowmere had a weir');
    d.run({ type: 'SetFlag', flag: 'ise.harrowmere', value: 'herself' });
    expect(composeLetter(LETTERS.find((l) => l.id === 'l12')!, d.s).join(' ')).toContain('tell Harrowmere herself');
  });
});
