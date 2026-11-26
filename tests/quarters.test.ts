import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { DEFAULT_ROOM, decodeRoom, encodeRoom, placeKeepsake, starsFor, starPoints } from '../src/domain/quarters';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const pack = buildPack();

describe("Guardian's quarters (spec 12.16, 32.6)", () => {
  it('a room survives encoding, and a bad string is refused', () => {
    const r = placeKeepsake({ ...DEFAULT_ROOM, wall: 'brick', lamp: 'lumen' }, 2, 'check-weight');
    expect(decodeRoom(encodeRoom(r))).toEqual(r);
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern|,,,,,')).not.toBeNull();
    expect(decodeRoom('gold.boards.wine.lantern.stars.fern|,,,,,')).toBeNull();
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern|,,')).toBeNull();
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern|<b>,,,,,')).toBeNull();
    expect(decodeRoom(42)).toBeNull();
    // A companion is an optional 7th part; no companion keeps the old format.
    expect(encodeRoom(DEFAULT_ROOM)).toBe('plaster.boards.wine.lantern.stars.fern|,,,,,,,');
    // Old rooms with six shelf places still open, with two empty places added.
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern|pen-tip,,,,,')?.shelf).toEqual(['pen-tip', null, null, null, null, null, null, null]);
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern.owl|,,,,,')?.pet).toBe('owl');
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern|,,,,,')?.pet).toBe('none');
    expect(decodeRoom('brick.boards.wine.lantern.stars.fern.dragon|,,,,,')).toBeNull();
  });
  it('a keepsake sits in one slot only', () => {
    let r = placeKeepsake(DEFAULT_ROOM, 0, 'yarn');
    r = placeKeepsake(r, 4, 'yarn');
    expect(r.shelf.filter((x) => x === 'yarn')).toHaveLength(1);
    expect(r.shelf[4]).toBe('yarn');
    expect(() => placeKeepsake(r, 8, 'yarn')).toThrow();
  });
  it('the Star Chart lights one star for each fifth of a ring, at fixed places', () => {
    expect(starsFor(0, 20)).toBe(0);
    expect(starsFor(1, 20)).toBe(1);
    expect(starsFor(12, 20)).toBe(3);
    expect(starsFor(20, 20)).toBe(5);
    expect(starPoints(3, 4, 192, 20)).toEqual(starPoints(3, 4, 192, 20));
  });
  it('keepsakes appear only after the deed that earns them', () => {
    const d = new Driver();
    const has = (id: string) => check(pack.keepsakes!.find((k) => k.id === id)!.if, d.s);
    expect(has('check-weight')).toBe(false);
    for (const r of [['g5', 'g2'], ['g2', 'g3'], ['g5', 'g1']]) d.run({ type: 'PuzzleWeigh', puzzle: 'weigh-house', round: Number(d.s.flags['puzzle.weigh-house.rounds'] ?? 0), weights: r });
    expect(has('check-weight')).toBe(true);
    expect(pack.keepsakes!.length).toBeGreaterThanOrEqual(12);
  });
});
