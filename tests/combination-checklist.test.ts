import { describe, it, expect } from 'vitest';
// @ts-expect-error audit tools run as native JavaScript.
import { boardFor, boardKey, cellKey, depths, levels, mergeLedger, saveLedger, reviewTotals } from '../tools/combination-checklist.mjs';
const ids = [
  'concept:truth',
  'framework:scope',
  'theme:knower',
  'micro:1200',
  'story:150',
  'game:288',
];
const members = ids.map((id) => ({ id, kind: id.split(':')[0] }));
const board = boardFor(members, { chapter: 1, ids });
const record = {
  board,
  bloom: 'create',
  dok: 4,
  evidence: 'Tried both entrances.',
  updated: '2026-11-28T00:00:00.000Z',
  checked: true,
};
describe('portable reviewer checklist', () => {
  it('canonicalises simultaneous members and keeps chapter, ordering and revisits independent', () => {
    expect(boardKey(board)).toBe(
      boardKey(boardFor(members, { chapter: 1, ids: [...ids].reverse() })),
    );
    expect(boardKey(board)).not.toBe(boardKey({ ...board, chapter: 2 }));
    const a = boardFor(members, {
      chapter: 1,
      ids,
      steps: [ids.slice(0, 3), ids.slice(3), ids.slice(0, 3)],
    });
    expect(boardKey(a)).not.toBe(boardKey(board));
    expect(() =>
      boardFor(members, { chapter: 1, ids, steps: [ids.slice(0, 3)] }),
    ).toThrow();
    expect(
      new Set(
        levels.flatMap((b: string) =>
          depths.map((d: number) => cellKey(board, b, d)),
        ),
      ).size,
    ).toBe(24);
  });
  it('round trips precisely, leaves unchecked cells independent and refuses a partial or conflicting import', () => {
    const ledger = mergeLedger(members, new Map(), {
      version: 1,
      records: [record],
    });
    expect(reviewTotals(ledger, 'micro:1200', 1).create).toEqual([0, 0, 0, 1]);
    expect(reviewTotals(ledger, 'micro:1200', 2).create).toEqual([0, 0, 0, 0]);
    expect(
      saveLedger(
        mergeLedger(
          members,
          new Map(),
          JSON.parse(JSON.stringify(saveLedger(ledger))),
        ),
      ),
    ).toEqual(saveLedger(ledger));
    const uncheck = {
      ...record,
      updated: '2026-11-28T01:00:00.000Z',
      checked: false,
    };
    expect(
      reviewTotals(
        mergeLedger(members, ledger, {
          version: 1,
          records: [uncheck, record],
        }),
        'micro:1200',
        1,
      ).create[3],
    ).toBe(0);
    expect(() =>
      mergeLedger(members, ledger, {
        version: 1,
        records: [{ ...record, checked: false }],
      }),
    ).toThrow(/disagree/);
    expect(() =>
      mergeLedger(members, ledger, {
        version: 1,
        records: [
          uncheck,
          { ...record, board: { ...board, ids: ['unknown'] } },
        ],
      }),
    ).toThrow();
    expect(saveLedger(ledger).records[0].checked).toBe(true);
  });
});
