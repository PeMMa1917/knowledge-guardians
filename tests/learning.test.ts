import { describe, expect, it } from 'vitest';
import { BLOOM, FINK, FRAMEWORK, LEARN, SOLO } from '../src/domain/learningLevels';
import { PLAY_STYLES, OPTIONAL_CHAPTER, auditPath, playPath, type PathStep, type PlayStyle } from '../src/domain/learningPaths';
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
  // Baseline for completion-timed windows. This measures minutes with a gap,
  // independent of how many steps or dimensions change during those minutes.
  const baseline: Record<PlayStyle, number> = {
    // Puzzler and cozy paths include The Assay Trial (6 optional minutes in chapter 6, added 2026-11-27).
    // Those minutes sit inside a window that ends before metal.publish, so the bound grows by them.
    story: 160, social: 356, explorer: 667, puzzler: 266, cozy: 348,
  };
  // The original checkpoint measured 1,582 modeled explorer minutes. New
  // optional room time can extend the upper bound by its own duration. The
  // report still shows every gap and requires a complete first window.
  const explorerBaselineMinutes = 1582;

  it('keeps alternative museum visits in the full route and audits distinct explorer itineraries', () => {
    const take = (visit: number | 'all') => playPath(pack, 'explorer', visit).filter(({ id }) => id.startsWith('clearance.'));
    expect(take(0).map(({ id }) => id)).toEqual(['clearance.recuay-vessel.heard']);
    expect(take(1).map(({ id }) => id)).toEqual(['clearance.amenemope-paint-box.heard']);
    expect(take('all')).toHaveLength(5);
    const complete = auditPath(playPath(pack, 'explorer', 'all'));
    expect(complete.firstWindow?.missing).toEqual([]);
    if (import.meta.env.MODE === 'tok-report') console.log(`Explorer with all filed cases (${complete.minutes} estimated minutes, ${complete.gapMinutes} with a trailing-window gap)`);
  });

  it('counts a step at its estimated completion and finds gaps between completions', () => {
    const covered = CONCEPTS.filter((concept) => concept !== 'culture');
    const report = auditPath([
      { id: 'group A', chapter: 1, minutes: 12, concepts: covered, framework: FRAMEWORK },
      { id: 'long group B', chapter: 1, minutes: 21, concepts: ['culture'], framework: [] },
      { id: 'group C', chapter: 1, minutes: 10, concepts: covered, framework: FRAMEWORK },
    ]);
    expect(report.firstWindow?.missing).toEqual(['culture']);
    expect(report.gaps).toEqual([
      { from: 30, until: 33, missing: ['culture'] },
      { from: 42, until: 43, missing: [...covered, ...FRAMEWORK] },
    ]);
    expect(report.gapMinutes).toBe(4);
  });

  it('expires an action at its exact boundary even when it is the last window', () => {
    const report = auditPath([
      { id: 'all', chapter: 1, minutes: 0.2, concepts: CONCEPTS, framework: FRAMEWORK },
      { id: 'finish', chapter: 1, minutes: 30, concepts: [], framework: [] },
    ]);
    expect(report.firstWindow?.missing).toEqual([]);
    expect(report.gaps).toEqual([{ from: 30.2, until: null, missing: [...CONCEPTS, ...FRAMEWORK] }]);
    expect(report.gapMinutes).toBe(0);
  });

  it('reports incomplete paths and rejects invalid durations', () => {
    const step: PathStep = { id: 'short', chapter: 1, minutes: 2, concepts: [], framework: [] };
    expect(auditPath([step]).firstWindow).toBeNull();
    expect(auditPath([]).gaps).toEqual([]);
    expect(() => auditPath([step], 0)).toThrow(RangeError);
    expect(() => auditPath([{ ...step, minutes: Number.NaN }])).toThrow(RangeError);
  });

  it('places Elsbet’s optional reels and the Island fair after the required chapter steps', () => {
    const explorer = playPath(pack, 'explorer').map((step) => step.id);
    expect(explorer).toContain('voices.finish');
    expect(explorer).toContain('island.log');
    expect(explorer.indexOf('voices.elsbet.heard')).toBeGreaterThan(explorer.indexOf('voices.finish'));
    expect(explorer.indexOf('lanternfair.island.o.check')).toBeGreaterThan(explorer.indexOf('island.log'));
  });

  it('keeps inferred framework support and repeated actions visible in the first window', () => {
    const repeated: PathStep = {
      id: 'repeatable gauge', chapter: 1, minutes: 10, concepts: ['evidence'], framework: ['methods-and-tools', 'scope'],
      inferredFramework: true, action: 'read gauge', levels: LEARN['crossing:lamb'],
    };
    const explicit: PathStep = { id: 'limits', chapter: 1, minutes: 10, concepts: [], framework: ['scope'] };
    const { firstWindow } = auditPath([repeated, repeated, explicit]);
    expect(firstWindow?.singleAction).toEqual(['evidence', 'methods-and-tools']);
    expect(firstWindow?.inferredOnly).toEqual(['methods-and-tools']);
    expect(firstWindow?.profile).toMatchObject({
      steps: 3, actions: { 'read gauge': 2 }, withoutActionTag: 1, withoutLevelTags: 1,
      levels: { dok: { 2: 2 }, bloom: { apply: 2 }, fink: { application: 2 }, solo: { multistructural: 2 } },
    });
  });

  it.each(PLAY_STYLES)('reports exact coverage and distinct actions on the %s path', (style) => {
    const path = playPath(pack, style);
    expect(path.length).toBeGreaterThan(80);
    expect(new Set(path.map((step) => step.chapter))).toEqual(new Set(Array.from({ length: 15 }, (_, index) => index + 1)));
    const audit = auditPath(path);
    const first = audit.firstWindow;
    if (!first) throw new Error('The planned campaign did not reach its first complete window.');
    const plannedStop = {
      story: undefined, social: 'nexus.handle.checked', explorer: 'nexus.ribbon.checked',
      puzzler: 'nexus.print.checked', cozy: 'nexus.rest.checked',
    }[style];
    const opening = audit.encounters.filter(({ minute }) => minute <= 30);
    if (plannedStop) expect(opening.map(({ step }) => step.id)).toContain(plannedStop);
    if (import.meta.env.MODE === 'tok-report') console.log([
      `\n${style} (${audit.minutes} estimated minutes, ${audit.gapMinutes} with a trailing-window gap)`,
      `Completions in the first 30m: ${opening.map(({ minute, step }) => `${minute}m ${step.id}`).join(', ')}`,
      `Missing in the first 30m: ${first.missing.join(', ') || 'none on this path'}`,
      `Framework parts inferred only in the first 30m: ${first.inferredOnly.join(', ') || 'none'}`,
      `One supporting action in the first 30m: ${first.singleAction.join(', ') || 'none'}`,
      `One supporting action in at least one full window: ${audit.singleAction.join(', ') || 'none'}`,
      `Framework parts inferred only in at least one full window: ${audit.inferredOnly.join(', ') || 'none'}`,
      `First-window action profile: ${JSON.stringify(first.profile)}`,
      `Whole-path action profile: ${JSON.stringify(audit.profile)}`,
      'Trailing gaps by window ending time:',
      ...audit.gaps.map(({ from, until, missing }) => {
        const step = (audit.encounters.find(({ minute }) => minute > from) ?? audit.encounters.at(-1))!.step;
        return `  ${from}m ${until === null ? 'through the final window' : `to before ${until}m`} near ch. ${step.chapter} ${step.id}: ${missing.join(', ')}`;
      }),
    ].join('\n'));
    expect(first.missing).toEqual([]);
    expect(first.inferredOnly).toEqual([]);
    const added = style === 'explorer' ? Math.max(0, audit.minutes - explorerBaselineMinutes) : 0;
    expect(audit.gapMinutes).toBeLessThanOrEqual(baseline[style] + added);
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
