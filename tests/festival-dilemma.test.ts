import { describe, expect, it } from 'vitest';
import { CHOICES, FACTS, FRIENDS, SUMMARIES, VIEW_NAMES, heardAll, movedBy, respond } from '../src/domain/festivalDilemma';

describe('The Festival Dilemma (chapter 11, C-004)', () => {
  it('has a reply for every friend and every fact', () => {
    for (const fr of FRIENDS) for (const fa of FACTS) expect(respond(fr.id, fa.id)?.line.length, `${fr.id}.${fa.id}`).toBeGreaterThan(30);
  });
  it('lets the facts tell the friends apart: no two friends are moved by the same facts', () => {
    const patterns = FRIENDS.map((f) => movedBy(f.id).join(','));
    expect(new Set(patterns).size).toBe(FRIENDS.length);
    expect(movedBy('odette')).toEqual([]);
  });
  it('sums up a friend only after every fact, and names each view once in the journal', () => {
    const tried = new Set(['fen.unharmed', 'fen.mill']);
    expect(heardAll(tried, 'fen')).toBe(false);
    tried.add('fen.secret');
    expect(heardAll(tried, 'fen')).toBe(true);
    for (const f of FRIENDS) expect(SUMMARIES[f.id]).toBeTruthy();
    expect(new Set(Object.values(VIEW_NAMES)).size).toBe(FRIENDS.length);
  });
  it('replies to every piece of advice, including the player’s own mix', () => {
    expect(CHOICES.map((c) => c.id)).toEqual([...FRIENDS.map((f) => f.id), 'mix']);
    for (const c of CHOICES) expect(c.reply.length).toBeGreaterThan(60);
  });
});
