import { describe, expect, it } from 'vitest';
import { DIAL, FOUND_TO_LISTEN, VIEWS, batsFound, canHearBuzz } from '../src/domain/batKeeper';

describe('The Bat Keeper (chapter 4, C-004)', () => {
  it('has more bats on the dial than the player must find, and one empty setting', () => {
    expect(batsFound(DIAL.map((d) => d.khz)).length).toBeGreaterThan(FOUND_TO_LISTEN);
    expect(DIAL.some((d) => !d.bat)).toBe(true);
  });
  it('lets the catch be heard only after enough bats are found, at the pipistrelle setting', () => {
    expect(canHearBuzz([45], 45)).toBe(false);
    expect(canHearBuzz([20, 35, 45], 45)).toBe(true);
    expect(canHearBuzz([20, 35, 45], 20)).toBe(false);
  });
  it('gives each answer about the bat a reply', () => {
    expect(VIEWS).toHaveLength(3);
    for (const v of VIEWS) expect(v.reply.length).toBeGreaterThan(40);
  });
});
