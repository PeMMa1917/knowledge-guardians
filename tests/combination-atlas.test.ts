import { describe, expect, it } from 'vitest';
// @ts-expect-error audit tools run as native JavaScript.
import { additionalMembers, matchesOrder, requirements, spaceCount, unrankCombination } from '../tools/combination-space.mjs';
// @ts-expect-error audit tools run as native JavaScript.
import { buildAtlas, lookup } from '../tools/combination-atlas.mjs';
// @ts-expect-error audit tools run as native JavaScript.
import { loadAudit } from '../tools/audit-cross-weave.mjs';
const kinds = [
  'concept',
  'framework',
  'area',
  'theme',
  'story',
  'game',
  'question',
  'bias',
  'bias',
];
const members = kinds.map((kind, i) => ({ id: kind + i, kind }));
const allSets = Array.from({ length: 2 ** members.length }, (_, mask) =>
  members.filter((_, i) => mask & (1 << i)).map((x) => x.id),
);
describe('documented TOK combination space', () => {
  it('agrees with exhaustive enumeration for sets, arbitrary same-family selections and their orders', () => {
    for (const design of [
      'joint',
      'any',
      'story',
      'game',
      'story-only',
      'game-only',
      'neither',
    ]) {
      for (const question of ['context', 'selected']) {
        const opt = { design, question };
        const expected = allSets.filter(
          (ids) => requirements(members, ids, opt).valid,
        );
        expect(spaceCount(members, opt)).toBe(BigInt(expected.length));
        const length = 6,
          atSize = expected.filter((x) => x.length === length);
        expect(
          spaceCount(members, { ...opt, length, order: 'permutation' }),
        ).toBe(BigInt(atSize.length * 720));
        const addressed = atSize
          .map((_, i) => unrankCombination(members, length, i, opt).join(','))
          .sort();
        expect(addressed).toEqual(atSize.map((x) => x.join(',')).sort());
      }
    }
  });
  it('addresses every anchored extension exactly once, including empty and very large ranks', () => {
    const ids=members.map(m=>m.id);
    for(let length=0;length<=ids.length;length++){
      const expected=allSets.filter(s=>s.length===length);
      const got=expected.map((_,i)=>additionalMembers(ids,length,BigInt(i)).join(','));
      expect(got.sort()).toEqual(expected.map(s=>s.join(',')).sort());
    }
    expect(()=>additionalMembers(ids,2,-1n)).toThrow();
    const pool=Array.from({length:1200},(_,i)=>String(i+1));
    expect(additionalMembers(pool,12,309752320478994335005794n)).toHaveLength(12);
    expect(additionalMembers(pool,1,1199n)).toEqual(['1200']);
  });
  it('requires either area or theme and honours finite lengths for revisits', () => {
    expect(
      requirements(members, ['concept0', 'framework1', 'theme3'], {
        design: 'any',
      }).valid,
    ).toBe(true);
    expect(
      requirements(members, ['concept0', 'framework1', 'bias7'], {
        design: 'any',
      }).missing,
    ).toEqual(['area-or-theme']);
    const triad = members.slice(0, 3);
    expect(
      spaceCount(triad, {
        design: 'any',
        order: 'repeated-sequence',
        length: 4,
      }),
    ).toBe(36n);
    expect(() =>
      spaceCount(triad, { design: 'any', order: 'repeated-sequence' }),
    ).toThrow(/finite/);
    expect(() => unrankCombination(triad, 3, 1, { design: 'any' })).toThrow(
      /Rank/,
    );
    expect(matchesOrder([['a'], ['b']], [['a', 'b']])).toBe(false);
    expect(matchesOrder([['a'], ['a']], [['a'], ['b'], ['a']])).toBe(true);
    expect(matchesOrder([[], ['a']], [[], ['a']])).toBe(false);
  });
  it('keeps the live inventory, all objective anchors and the setting-to-decision order traceable', async () => {
    const atlas = buildAtlas(await loadAudit({ activities: true }));
    expect(
      atlas.activities.filter((a: {gaps: string[]}) => a.gaps.length),
    ).toEqual([]);
    expect(new Set(atlas.members.map((m: {id: string}) => m.id)).size).toBe(
      atlas.members.length,
    );
    const first = ['bias:halo', 'fallacy:wealth', 'story:25', 'game:238'];
    const second = [
      'story:11',
      'game:22',
      'area:ART',
      'concept:perspective',
      'framework:perspectives',
    ];
    const ids = [...first, ...second];
    const result = lookup(atlas, ids, { order: [first, second], chapter: 2 });
    expect(result.beats).toHaveLength(0);
    expect(result.routes.map((r: {id: string}) => r.id)).toContain(
      'blue-fringe',
    );
    expect(
      lookup(atlas, ids, { order: [second, first], chapter: 2 }).routes,
    ).toHaveLength(0);
    expect(
      lookup(atlas, [...first, ...second.slice(2)], {
        bloom: 'analyse',
        dok: 2,
      }).distinctActions,
    ).toBe(1);
    expect(
      lookup(atlas, ids, {
        order: [first, second],
        chapter: 2,
        bloom: 'create',
        dok: 4,
      }).routes,
    ).toHaveLength(0);
    expect(
      atlas.members.filter(
        (e: {kind: string, url?:string}) => e.kind === 'etymology' && e.url,
      ),
    ).toHaveLength(51);
  }, 90000);
});
