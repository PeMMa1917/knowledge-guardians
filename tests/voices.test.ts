// @ts-ignore
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';

const pack = buildPack();
const doc = readFileSync('docs/VOICES.md', 'utf8') as string;

/** Each sheet: a heading with the id in backticks, then four labelled lines. */
const sheets = new Map(doc.split(/\n### /).slice(1).map((block: string): [string, string] => [/\(`([^`]+)`\)/.exec(block)?.[1] ?? '', block]));

describe('voice sheets (C-005)', () => {
  it('has a sheet for every character with more than 20 lines of dialogue', () => {
    const count = new Map<string, number>();
    for (const d of pack.dialogue) count.set(d.speaker, (count.get(d.speaker) ?? 0) + 1);
    const missing = [...count].filter(([id, n]) => id !== 'narrator' && n > 20 && !sheets.has(id)).map(([id]) => id);
    expect(missing).toEqual([]);
  });
  it('gives every sheet a belief, a worry, a way of speaking and a reason, for a real character', () => {
    const ids = new Set(pack.characters.map((c) => c.id));
    for (const [id, block] of sheets) {
      expect(ids.has(id), id).toBe(true);
      for (const label of ['Believes', 'Worries', 'Speaks', 'Why']) expect(block, `${id} ${label}`).toContain(`**${label}:**`);
    }
  });
});
