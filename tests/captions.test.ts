import { describe, expect, it } from 'vitest';
import { chapterLights, chapterTint, skyAt } from '../src/app/daylight';
import { CAPTIONS, CaptionLog, captionFor } from '../src/app/captions';
// @ts-ignore
import { readFileSync } from 'node:fs';

describe('sound captions', () => {
  it('every loaded sound has a caption', () => {
    const boot = readFileSync('src/scenes/BootScene.ts', 'utf8') as string;
    const keys = [...boot.matchAll(/'((?:sfx|music)\.[a-z]+)'/g)].map((m) => m[1]).filter((k) => k !== 'sfx.hover' && k !== 'sfx.step');
    expect(keys.length).toBeGreaterThan(10);
    for (const k of keys) expect(CAPTIONS[k], k).toBeTruthy();
  });
  it('adds direction for the forge', () => {
    expect(captionFor('amb.forge', 'to the left')).toBe('Forge hammer rings (to the left)');
    expect(captionFor('nope')).toBeNull();
  });
  it('does not repeat a caption within the gap and keeps few lines', () => {
    const log = new CaptionLog(2, 4000, 3500);
    expect(log.add('A', 0)).toBe(true);
    expect(log.add('A', 1000)).toBe(false);
    log.add('B', 1100); log.add('C', 1200);
    expect(log.visible(1300)).toEqual(['B', 'C']);
    expect(log.visible(5000)).toEqual([]);
    expect(log.add('A', 5000)).toBe(true);
  });
});


describe('day and evening (town maps)', () => {
  it('gives each of the sixteen worlds its own light while keeping day and night distinguishable', () => {
    const ids = Array.from({length:16}, (_, i) => 'WORLD-' + String(i + 1).padStart(2, '0'));
    expect(Object.keys(chapterLights)).toEqual(ids);
    for (const phase of [0, .35, .68, .8]) {
      const sky = skyAt(phase).tint;
      expect(new Set(ids.map(world => chapterTint(world, sky))).size).toBe(16);
      expect(chapterTint('unknown', sky)).toBe(sky);
    }
    for (const world of ids) {
      const day = chapterTint(world, skyAt(.35).tint), night = chapterTint(world, skyAt(.8).tint);
      expect((day >> 16) - (night >> 16)).toBeGreaterThan(65);
    }
  });
  it('goes from a warm morning to a dark night and back', () => {
    expect(skyAt(0).tint).toBe(0xffe8c4);
    expect(skyAt(0.8).name).toBe('night');
    expect(skyAt(0.8).night).toBeCloseTo(1);
    expect(skyAt(0.2).night).toBe(0);
    expect(skyAt(1).tint).toBe(skyAt(0).tint);
    expect(skyAt(-0.2).tint).toBe(skyAt(0.8).tint);
  });
});

describe('rain showers', () => {
  it('a short, fixed shower in every cycle, never most of the time', async () => {
    const { raining, RAIN_EVERY, RAIN_FOR } = await import('../src/app/daylight');
    let wet = 0;
    for (let t = 0; t < RAIN_EVERY; t++) if (raining(t)) wet++;
    expect(wet).toBe(RAIN_FOR);
    expect(raining(0)).toBe(false);
    expect(raining(RAIN_EVERY * 3 + 530)).toBe(true);
  });
});
