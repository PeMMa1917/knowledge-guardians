import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { PUSHBACKS, pendingPushback, pushSeenFlag } from '../src/domain/pushbacks';

const pack = buildPack();

describe('pushback after a weighed judgement (C-016)', () => {
  it('uses real speakers, and flags that the game sets', () => {
    const speakers = new Set(pack.characters.map((c) => c.id));
    const text = JSON.stringify(pack);
    for (const p of PUSHBACKS) {
      expect(speakers.has(p.speaker), p.id).toBe(true);
      expect(text.includes(`"${p.flag}"`), p.flag).toBe(true);
    }
  });
  it('gives every answer a reply and marks none as right', () => {
    for (const p of PUSHBACKS) {
      expect(p.answers.map((a) => a.id)).toEqual(['hold', 'change', 'ask']);
      for (const a of p.answers) { expect(a.reply.length).toBeGreaterThan(60); expect(a).not.toHaveProperty('best'); }
    }
  });
  it('shows the text for the value the player chose, once', () => {
    expect(pendingPushback({})).toBeNull();
    expect(pendingPushback({ 'water.response': 'split' })?.text).toMatch(/Five and five/);
    expect(pendingPushback({ 'forest.moss.result': 'ribbon' })?.text).toMatch(/ribbon/);
    expect(pendingPushback({ 'coast.updated': true })?.entry.id).toBe('coast.revised');
    expect(pendingPushback({ 'water.response': 'split', [pushSeenFlag('water.order')]: true })).toBeNull();
    expect(pendingPushback({ 'water.response': 'unknown' })).toBeNull();
  });
});
