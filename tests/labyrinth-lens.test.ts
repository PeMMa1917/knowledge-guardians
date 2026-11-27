import { describe, expect, it } from 'vitest';
import { LENSES, VIEWS, reachable, step } from '../src/domain/labyrinthLens';

describe('The Labyrinth Lens (chapter 14, C-004)', () => {
  it('cannot reach the ferry with any one lens, or any two, but can with all three', () => {
    const ids = LENSES.map((l) => l.id);
    for (const l of ids) expect(reachable([l]), l).toBe(false);
    for (const a of ids) for (const b of ids) if (a < b) expect(reachable([a, b]), `${a}+${b}`).toBe(false);
    expect(reachable(ids)).toBe(true);
  });
  it('stops the player at the bridge that is on the plan but gone', () => {
    const r = step([3, 0], [1, 0], 'plan');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.why).toBe('gone');
    expect(step([0, 4], [0, -1], 'tide')).toEqual({ ok: false, why: 'no-path' });
  });
  it('gives every answer a reply', () => {
    for (const v of VIEWS) expect(v.reply.length).toBeGreaterThan(40);
  });
});
