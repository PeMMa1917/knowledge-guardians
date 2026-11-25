import { describe, expect, it } from 'vitest';
import { addActivity, calendarGrid, ledgerSums, shade, type Activity } from '../src/domain/ledger';
import { buildPack } from '../src/content';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const pack = buildPack();
const at = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const days = (list: [string, number, number][]): Activity => list.reduce<Activity>((a, [d, secs, xp]) => addActivity(a, d, { secs, xp }), {});

describe("The Guardian's Ledger", () => {
  it('sums today, the last 7 days, the month and all time', () => {
    const a = days([['2026-11-25', 600, 5], ['2026-11-20', 300, 2], ['2026-11-10', 60, 0], ['2026-10-31', 1200, 9]]);
    const s = ledgerSums(a, at('2026-11-25'));
    expect(s.today).toEqual({ secs: 600, xp: 5 });
    expect(s.week).toEqual({ secs: 900, xp: 7 });
    expect(s.month).toEqual({ secs: 960, xp: 7 });
    expect(s.total.xp).toBe(16);
    expect(s.activeDays).toBe(3); // 60 s and no XP is not an active day
  });
  it('a streak keeps going through a missed day when a freeze shield was earned', () => {
    const list: [string, number, number][] = [];
    for (let d = 1; d <= 7; d++) list.push([`2026-11-0${d}`, 400, 0]);
    list.push(['2026-11-09', 400, 0]); // 8 November missed: the shield is used
    const s = ledgerSums(days(list), at('2026-11-09'));
    expect(s.streak).toBe(8);
    expect(s.shields).toBe(0);
    // Without a shield, a missed day resets the streak.
    const t = ledgerSums(days([['2026-11-01', 400, 0], ['2026-11-03', 400, 0]]), at('2026-11-03'));
    expect(t.streak).toBe(1);
    expect(t.bestStreak).toBe(1);
  });
  it('today never breaks a streak', () => {
    const s = ledgerSums(days([['2026-11-23', 400, 0], ['2026-11-24', 400, 0]]), at('2026-11-25'));
    expect(s.streak).toBe(2);
  });
  it('the calendar has 12 weeks of 7 days, and shades by minutes', () => {
    const g = calendarGrid({}, at('2026-11-25'));
    expect(g).toHaveLength(12);
    expect(g.every((w) => w.length === 7)).toBe(true);
    expect(g[11].find((d) => d.day === '2026-11-25')).toBeTruthy();
    expect([0, 120, 600, 1200, 3600].map(shade)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('secrets and lore', () => {
  it('every secret is hidden somewhere on its own map, and is found once', () => {
    for (const x of pack.secrets!) expect(MAPS[x.map].interactables.some((i) => i.kind === 'secret' && i.secret === x.id), x.id).toBe(true);
    const d = new Driver();
    d.run({ type: 'FindSecret', secret: 'three-coins' });
    d.run({ type: 'FindSecret', secret: 'three-coins' });
    expect(d.s.flags['secrets.found']).toBe(1);
  });
});

describe("Sefa's Word Tiles", async () => {
  const { dealTiles, isPair, tileRank } = await import('../src/domain/tiles');
  it('deals the same tiles for the same run, six pairs, each word with its meaning', () => {
    const words = pack.glossary.map((g) => ({ id: g.id, term: g.term, text: g.text }));
    const a = dealTiles(words, 3), b = dealTiles(words, 3), c = dealTiles(words, 4);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a).toHaveLength(12);
    for (const t of a) expect(a.filter((u) => isPair(t, u))).toHaveLength(1);
    expect(tileRank(6, 6)).toBe('S');
    expect(tileRank(20, 6)).toBe('C');
  });
});

it('a meaning tile never shows its own word', async () => {
  const { hideTerm } = await import('../src/domain/tiles');
  expect(hideTerm('Something that someone says is true. A claim can be bigger.', 'Claim')).toBe('Something that someone says is true. A ___ can be bigger.');
  expect(hideTerm('Claims and more claims.', 'Claim')).toBe('___ and more ___.');
});

it('fog of war clears around the player, chunk by chunk', async () => {
  const { revealAround, isRevealed, explored } = await import('../src/domain/fog');
  let f = '';
  expect(isRevealed(f, 40, 28, 20, 20)).toBe(false);
  f = revealAround(f, 40, 28, 20, 20);
  expect(isRevealed(f, 40, 28, 20, 20)).toBe(true);
  expect(isRevealed(f, 40, 28, 24, 24)).toBe(true); // a neighbouring chunk
  expect(isRevealed(f, 40, 28, 0, 0)).toBe(false);
  expect(revealAround(f, 40, 28, 20, 20)).toBe(f);
  expect(explored(f, 40, 28)).toBeCloseTo(9 / 70);
});

it("today's challenge is one deal per day; the ghost replays your fastest run", async () => {
  const { dailySeed, dealTiles, decodeGhost, encodeGhost, ghostPairs } = await import('../src/domain/tiles');
  const words = pack.glossary.map((g) => ({ id: g.id, term: g.term, text: g.text }));
  const d1 = new Date(2026, 10, 25, 9), d1b = new Date(2026, 10, 25, 15), d2 = new Date(2026, 10, 26, 9);
  expect(dailySeed(d1)).toBe(dailySeed(d1b));
  expect(dealTiles(words, dailySeed(d1))).toEqual(dealTiles(words, dailySeed(d1b)));
  expect(dealTiles(words, dailySeed(d1))).not.toEqual(dealTiles(words, dailySeed(d2)));
  expect(dailySeed(new Date(2026, 0, 31))).not.toBe(dailySeed(new Date(2026, 1, 1)));
  const g = decodeGhost(encodeGhost([3.2, 7.9, 12, 20, 21, 30]));
  expect(g).toEqual([3, 8, 12, 20, 21, 30]);
  expect(ghostPairs(g, 10)).toBe(2);
  expect(decodeGhost(undefined)).toEqual([]);
});
