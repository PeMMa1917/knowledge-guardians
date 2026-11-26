import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { Driver } from './driver';
import { SLATE, boatGuests, dayName, doorPrize, evalClear, pellOpens, rng, runDoors, shareChance } from '../src/domain/fairgames';
import { FIELD_GAMES } from '../src/domain/fieldgames';

describe('fair games from the mathematics lessons', () => {
  it('the same seed always gives the same rounds', () => {
    expect(doorPrize(7, 3)).toBe(doorPrize(7, 3));
    expect(boatGuests(7, 1)).toEqual(boatGuests(7, 1));
    const a = rng(5), b = rng(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('when Pell knows, he never shows the lantern, and switching wins about two times in three', () => {
    const r = rng(1);
    for (let p = 0; p < 3; p++) for (let k = 0; k < 3; k++) {
      const o = pellOpens(p, k, true, r);
      expect(o).not.toBe(p); expect(o).not.toBe(k);
    }
    const run = runDoors(6000, 42, true);
    expect(run.setAside).toBe(0);
    expect(run.swap / run.counted).toBeGreaterThan(0.62);
    expect(run.swap / run.counted).toBeLessThan(0.71);
    expect(run.stay + run.swap).toBe(run.counted);
  });

  it('when Pell forgets, the counted rounds split about half and half', () => {
    const run = runDoors(6000, 42, false);
    expect(run.setAside).toBeGreaterThan(1000);
    expect(run.swap / run.counted).toBeGreaterThan(0.45);
    expect(run.swap / run.counted).toBeLessThan(0.55);
  });

  it('the guest book stops at the first shared birthday; 23 guests give just over half', () => {
    for (let n = 0; n < 20; n++) {
      const g = boatGuests(9, n);
      expect(new Set(g).size).toBe(g.length - 1);
      expect(g.indexOf(g[g.length - 1])).toBeLessThan(g.length - 1);
    }
    expect(shareChance(23)).toBeCloseTo(0.507, 3);
    expect(shareChance(1)).toBe(0);
    expect(dayName(0)).toBe('1 January');
    expect(dayName(364)).toBe('31 December');
    expect(dayName(59)).toBe('1 March');
  });

  it('the slate: two readers, two answers; each clear line and story gives one answer', () => {
    expect(SLATE.readers.map((r) => r.result).sort((a, b) => a - b)).toEqual([1, 16]);
    for (const s of SLATE.stories) expect(evalClear(s.meant)).toBe(s.result);
    expect(SLATE.clear.map(evalClear).sort((a, b) => a - b)).toEqual([1, 16]);
    expect(evalClear('2 + 3 × 4')).toBe(14);
  });

  it('finishing a field game gives its reward once, and each game has a spot on a map', () => {
    const d = new Driver();
    for (const g of FIELD_GAMES) {
      d.run({ type: 'FinishFieldGame', game: g.id });
      d.run({ type: 'FinishFieldGame', game: g.id });
      expect(d.s.flags[`field.${g.id}.done`]).toBe(true);
      const spots = Object.values(MAPS).flatMap((m) => m.interactables).filter((i) => i.kind === 'fieldgame' && i.game === g.id);
      expect(spots.length).toBeGreaterThan(0);
    }
    expect(d.s.flags['count.fieldgames']).toBe(FIELD_GAMES.length);
    expect(d.events.filter((e) => e.kind === 'fieldgame' && e.first)).toHaveLength(FIELD_GAMES.length);
  });
});

describe('the Missing Word (language and power)', () => {
  it('every wording keeps the same fact and gives each reader a line', async () => {
    const { WORDINGS, READERS, WITH_REASON, ATTEMPTS, COINAGES, paintedNotice } = await import('../src/domain/wordgames');
    for (const w of WORDINGS) {
      expect(w.line).toContain('4 marks');
      for (const r of READERS) expect(w.says[r.id]).toBeTruthy();
    }
    for (const r of READERS) { expect(WITH_REASON[r.id]).toBeTruthy(); expect(ATTEMPTS[r.id]).toBeTruthy(); }
    expect(new Set(COINAGES.map((k) => k.whose))).toEqual(new Set(READERS.map((r) => r.id)));
    expect(paintedNotice({})).toBeNull();
    expect(paintedNotice({ 'word.painted': 'raised', 'word.reason': true })).toContain('rotten beams');
    expect(paintedNotice({ 'word.painted': 'raised' })).not.toContain('Reason');
  });

  it('finishing it meets the Hush Moth', () => {
    const d = new Driver();
    d.run({ type: 'FinishFieldGame', game: 'word' });
    expect(d.s.flags['meet.fray.hush-moth']).toBe(true);
  });
});
