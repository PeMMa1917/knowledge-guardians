import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../src/domain/types';
import { buildPack } from '../src/content';
import { exampleFor, segmentText } from '../src/domain/glossary';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const pack = buildPack();

describe('smart glossary (spec 47.10)', () => {
  it('marks each term once, keeps the text the same, and prefers the longest form', () => {
    const text = 'A knowledge question is not a claim. Another claim needs evidence.';
    const seg = segmentText(text, pack.glossary);
    expect(seg.map((x) => x.text).join('')).toBe(text);
    expect(seg.filter((x) => x.term).map((x) => x.term)).toEqual(['knowledge-question', 'claim', 'evidence']);
  });
  it('gives an example from the player\'s own play when there is one', () => {
    const d = new Driver();
    const claim = pack.glossary.find((g) => g.id === 'claim')!;
    expect(exampleFor(claim, d.s, (c) => check(c, d.s))).toMatch(/old label/);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'none' });
    expect(exampleFor(claim, d.s, (c) => check(c, d.s))).toMatch(/Your museum label was a claim: '.*Loud/);
  });
  it('covers all twelve concepts and offers a dictionary source for each registered word history', () => {
    const ids = pack.glossary.map((entry) => entry.id);
    for (const concept of CONCEPTS) expect(ids).toContain(concept);
    for (const entry of pack.glossary) {
      expect(entry.history?.note.length, entry.term).toBeGreaterThan(25);
      expect(entry.history?.url, entry.term).toMatch(/^https:\/\//);
    }
  });
  it('every term appears somewhere in the chapter text', () => {
    const all = JSON.stringify(pack.dialogue.map((n) => n.text)).toLowerCase();
    for (const g of pack.glossary) expect(g.match.some((m) => all.includes(m)), g.id).toBe(true);
  });
});

describe('titles (spec 47.1, C1)', () => {
  it('every award has its own title that names a deed', () => {
    const titles = pack.awards.map((a) => a.title);
    expect(titles.every(Boolean)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
