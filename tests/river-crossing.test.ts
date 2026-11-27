import { describe, expect, it } from 'vitest';
import { KEEPERS, PEOPLE, VIEW_NAMES, complete, moves, ravelMoved, samePlaces, voiceFor } from '../src/domain/riverCrossing';
import data from '../src/content/river-crossing.json';

const ids = PEOPLE.map((p) => p.id);

describe('The River Crossing Inquiry (chapter 11, C-004)', () => {
  it('gives every person a villager who would put them first, each with a different way of judging', () => {
    for (const id of ids) expect(voiceFor(id).line.length, id).toBeGreaterThan(60);
    expect(new Set(Object.values(VIEW_NAMES)).size).toBe(PEOPLE.length);
  });
  it('accepts only an order that holds all five people once', () => {
    expect(complete(ids)).toBe(true);
    expect(complete(ids.slice(0, 4))).toBe(false);
    expect(complete([...ids.slice(0, 4), ids[0]])).toBe(false);
  });
  it('gives Omi and Sena full orders that differ from each other', () => {
    for (const k of KEEPERS) expect(complete(k.rank)).toBe(true);
    expect(KEEPERS[0].rank[0]).not.toBe(KEEPERS[1].rank[0]);
    expect(samePlaces(KEEPERS[0].rank, KEEPERS[0].rank)).toBe(5);
  });
  it('sees whether the new fact moved Ravel to a less harsh place', () => {
    const before = ['ravel', 'orrin', 'pell', 'council', 'tamsin'];
    const after = ['orrin', 'pell', 'council', 'tamsin', 'ravel'];
    expect(moves(before, after).ravel).toBe(4);
    expect(ravelMoved(before, after)).toBe(true);
    expect(ravelMoved(after, before)).toBe(false);
  });
  it('keeps the story free of sexual content and marks no order right', () => {
    const text = JSON.stringify(data).toLowerCase();
    for (const w of ['correct', 'right answer', 'wrong answer', 'kiss', 'lover', 'sex']) expect(text, w).not.toContain(w);
  });
});
