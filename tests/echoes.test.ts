import { describe, expect, it } from 'vitest';
// @ts-ignore Node types are not installed; vitest runs in Node.
import { readFileSync, readdirSync } from 'node:fs';
import voices from '../src/content/chapter-voices.json';
import { buildPack } from '../src/content';

const content = readdirSync('src/content').filter((f: string) => f.endsWith('.json')).map((f: string) => readFileSync(`src/content/${f}`, 'utf8')).join('\n');
type Cond = { flag?: string; eq?: unknown; flagSet?: string; all?: Cond[]; not?: Cond; objective?: string };
const flat = (c: Cond): Cond[] => [c, ...(c.all ?? []).flatMap(flat), ...(c.not ? flat(c.not) : [])];

describe('Echoes: later chapters remember earlier choices (spec ECHO-003, story bible section 10)', () => {
  const echoes = (voices.memories as { id: string; character: string; if: Cond; line: string }[]).filter((m) => m.id.startsWith('echo.'));

  it('every chapter from 2 to 15 has Echo lines from at least two earlier choices', () => {
    const pack = buildPack();
    const chapterOf = (cid: string) => pack.missions.find((m) => m.objectives.some((o) => echoes.find((e) => e.character === cid)?.if.all?.[0].objective === o.id))?.world;
    const sources: Record<string, Set<string>> = {};
    for (const e of echoes) {
      const w = chapterOf(e.character)!;
      const f = flat(e.if).find((x) => x.flag || x.flagSet)!;
      (sources[w] ??= new Set()).add(f.flag ?? f.flagSet!);
    }
    expect(Object.keys(sources)).toHaveLength(14);
    for (const [w, s] of Object.entries(sources)) expect(s.size, w).toBeGreaterThanOrEqual(2);
  });

  it('every remembered choice is really set somewhere', () => {
    for (const e of echoes) for (const f of flat(e.if)) {
      if (!f.flag || f.flag.startsWith('sd.')) continue;
      expect(content.includes(`"setFlag": "${f.flag}"`) && content.includes(`"value": "${f.eq}"`), `${e.id}: ${f.flag}=${f.eq}`).toBe(true);
    }
  });

  it('every Echo line names something the player did (you or your)', () => {
    for (const e of echoes) expect(/\b(you|your)\b/i.test(e.line), e.id).toBe(true);
  });
});
