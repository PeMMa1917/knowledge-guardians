import { describe, expect, it } from 'vitest';
import { CLAIMS, KINDS, PRINTS, REPORTS, SIZE, SOUNDINGS, claimAt, featureSquares, found, reportTrue, squareKey } from '../src/domain/fogChart';

describe('The Fog Chart (chapter 8, C-004)', () => {
  it('fits every feature in the bay without overlap, and leaves enough soundings with some to spare', () => {
    const seen = new Set<string>();
    for (const c of CLAIMS) for (const [x, y] of c.cells) {
      expect(x >= 0 && x < SIZE && y >= 0 && y < SIZE).toBe(true);
      expect(seen.has(squareKey(x, y))).toBe(false);
      seen.add(squareKey(x, y));
    }
    expect(featureSquares()).toBeLessThan(SOUNDINGS);
    expect(SOUNDINGS).toBeLessThan(SIZE * SIZE);
  });
  it('gives each feature a different kind of support, each with a keeper reply', () => {
    expect(new Set(CLAIMS.map((c) => c.kind)).size).toBe(CLAIMS.length);
    for (const c of CLAIMS) expect(KINDS[c.kind], c.id).toBeTruthy();
  });
  it('finds a feature only when all its squares are sounded', () => {
    const reef = CLAIMS.find((c) => c.id === 'reef')!;
    const s = new Set(reef.cells.slice(0, 2).map(([x, y]) => squareKey(x, y)));
    expect(found(reef, s)).toBe(false);
    s.add(squareKey(reef.cells[2][0], reef.cells[2][1]));
    expect(found(reef, s)).toBe(true);
    expect(claimAt(0, 0)).toBeNull();
  });
  it('has exactly one false sailor report, and a reply for every print choice', () => {
    expect(REPORTS.filter((r) => !reportTrue(r.x, r.y))).toHaveLength(1);
    for (const p of PRINTS) expect(p.reply.length).toBeGreaterThan(60);
  });
});
