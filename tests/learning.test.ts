import { describe, expect, it } from 'vitest';
import { BLOOM, FINK, FRAMEWORK, LEARN, SOLO } from '../src/domain/learningLevels';
import { PLAY_STYLES, OPTIONAL_CHAPTER, pathGaps, playPath } from '../src/domain/learningPaths';
import { CROSSINGS } from '../src/domain/crossings';
import { HEARTH } from '../src/domain/hearth';
import { FIELD_GAMES } from '../src/domain/fieldgames';
import { LOYALTY } from '../src/domain/loyalty';
import { CONCEPTS } from '../src/domain/types';
import { BRUSH_STROKES, SKY_PICTURES, STARS, TRADE_START, TRADE_STEPS, digNote, digReport, digSite, digStroke } from '../src/domain/compendiumGames';
import { MAPS } from '../src/maps';
import { buildPack } from '../src/content';

const pack = buildPack();

describe('learning tags (for developers; players never see levels)', () => {
  it('tags every crossing, hearth talk, field game and loyalty mission, with a chapter for the audit', () => {
    const keys = [...CROSSINGS.map((c) => `crossing:${c.id}`), ...HEARTH.map((t) => `hearth:${t.id}`), ...FIELD_GAMES.map((g) => `field:${g.id}`), ...LOYALTY.map((l) => `loyalty:${l.id}`)];
    for (const k of keys) { expect(LEARN[k], k).toBeTruthy(); expect(OPTIONAL_CHAPTER[k], k).toBeGreaterThan(0); }
    expect(Object.keys(LEARN).sort()).toEqual([...keys].sort());
    for (const [k, l] of Object.entries(LEARN)) {
      expect(l.concepts.length, k).toBeGreaterThan(0);
      for (const c of l.concepts) expect(CONCEPTS).toContain(c);
      for (const f of l.framework) expect(FRAMEWORK).toContain(f);
    }
  });

  it('varies the thinking asked for: every DOK, Bloom, Fink and SOLO level appears, and each family spans several', () => {
    const all = Object.values(LEARN);
    expect(new Set(all.map((l) => l.dok))).toEqual(new Set([1, 2, 3, 4]));
    expect(new Set(all.map((l) => l.bloom))).toEqual(new Set(BLOOM));
    expect(new Set(all.map((l) => l.fink))).toEqual(new Set(FINK));
    expect(new Set(all.map((l) => l.solo))).toEqual(new Set(SOLO));
    for (const fam of ['crossing', 'hearth', 'field']) {
      const f = Object.entries(LEARN).filter(([k]) => k.startsWith(`${fam}:`)).map(([, l]) => l);
      expect(new Set(f.map((l) => l.dok)).size, fam).toBeGreaterThanOrEqual(3);
      expect(new Set(f.map((l) => l.bloom)).size, fam).toBeGreaterThanOrEqual(4);
      expect(new Set(f.map((l) => l.solo)).size, fam).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('the 30-minute design audit along play-style paths', () => {
  // Every 30 estimated minutes should meet all 12 key concepts and all four framework parts. These are
  // the windows that still miss something today. The numbers may only go down: when you add content,
  // run `npx vitest run tests/learning.test.ts` and lower the budget. See docs/LEARNING_DESIGN.md.
  const BUDGET: Record<string, number> = { story: 36, social: 63, explorer: 130, puzzler: 47, cozy: 63 };
  it.each(PLAY_STYLES)('does not add gaps on the %s path', (style) => {
    const path = playPath(pack, style);
    expect(path.length).toBeGreaterThan(80);
    const gaps = pathGaps(path);
    if (import.meta.env.MODE === 'tok-report') console.log(`\n${style}: ${gaps.length} windows with gaps\n` + gaps.map((g) => `  ${g.from} -> ${g.to}: ${g.missing.join(', ')}`).join('\n'));
    expect(gaps.length).toBeLessThanOrEqual(BUDGET[style]);
  });
});

describe('field games from the compendium', () => {
  it('Star Pictures: two traditions draw different lines between the same stars', () => {
    expect(SKY_PICTURES).toHaveLength(2);
    for (const sp of SKY_PICTURES) for (const [a, b] of sp.lines) { expect(STARS[a]).toBeTruthy(); expect(STARS[b]).toBeTruthy(); }
    const key = (l: [number, number]) => [...l].sort().join('-');
    expect(SKY_PICTURES[0].lines.map(key).sort()).not.toEqual(SKY_PICTURES[1].lines.map(key).sort());
  });

  it('The Careful Dig: the brush is slow and safe, the pick is fast and cracks a find, notes need an open square', () => {
    const site = digSite(4);
    expect(site.filter((c) => c.find)).toHaveLength(4);
    const f = site.findIndex((c) => c.find);
    let s = digStroke(site, f, 'brush');
    expect(digReport(s).pieces).toBe(0);
    expect(digNote(s, f)[f].noted).toBe(false);
    for (let i = 1; i < BRUSH_STROKES; i++) s = digStroke(s, f, 'brush');
    expect(digReport(s)).toMatchObject({ pieces: 1, whole: 1, cracked: 0 });
    s = digNote(s, f);
    expect(digReport(s).notedFinds).toBe(1);
    const g = site.findIndex((c, i) => c.find && i !== f);
    expect(digReport(digStroke(s, g, 'pick'))).toMatchObject({ pieces: 2, cracked: 1 });
    expect(digSite(4)).toEqual(site);
  });

  it('The Spare Tag: every step offers two people who value the item for different kinds of reasons', () => {
    let have = TRADE_START;
    for (const stepFn of TRADE_STEPS) {
      const offers = stepFn(have);
      expect(offers).toHaveLength(2);
      expect(offers[0].kind).not.toBe(offers[1].kind);
      for (const o of offers) expect(o.wants).toBe(have);
      have = offers[1].gives;
    }
  });

  it('places each new game in the world', () => {
    for (const [map, game] of [['aethelgard.ferry', 'trade'], ['forest.trail', 'dig'], ['observatory.harbour', 'stars']]) expect(MAPS[map].interactables.some((i) => i.game === game), game).toBe(true);
  });
});
