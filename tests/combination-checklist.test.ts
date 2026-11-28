import { describe, it, expect } from 'vitest';
// @ts-expect-error audit tools run as native JavaScript.
import { boardFor, boardKey, cellKey, depths, levels, mergeLedger, saveLedger, reviewTotals } from '../tools/combination-checklist.mjs';
// @ts-expect-error audit tools run as native JavaScript.
import { readReviewReference, reviewedLedger, reviewReference } from '../tools/combination-checklist.mjs';
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
  it('checks only the chapter, exact selection and cognition reviewed, even when two observations share an action',()=>{
    const beat={members:ids,chapter:1,actionId:'one-act',bloom:'create',dok:4,act:'compose',views:['front','wings'],consequence:'send',map:'stage',target:'score',source:'test',anchor:'stage'};
    const ledger=reviewedLedger({members,beats:[beat,{...beat,act:'repeat'}]});
    expect(ledger.records).toHaveLength(1);
    expect(ledger.records[0].actions).toEqual(['one-act']);
    expect(mergeLedger(members,new Map(),ledger).size).toBe(1);
    const prior=mergeLedger(members,new Map(),{version:1,records:[{...record,checked:false,updated:'2026-01-01T00:00:00.000Z',evidence:'Awaiting a second opinion.'}]});
    const merged=mergeLedger(members,prior,ledger);
    expect(saveLedger(merged).records[0].evidence).toBe('Awaiting a second opinion.');
    expect(saveLedger(merged).records[0].checked).toBe(false);
  });
  it('references the exact chapter, order and cognitive cell without including a private review', () => {
    const ordered = boardFor(members, {chapter:4,ids,steps:[ids,ids.slice(0,2)]});
    const ref = reviewReference(ordered, {bloom:'create',dok:4});
    expect(ref).not.toContain(record.evidence);
    expect(readReviewReference(members, 'file:///offline.html'+ref)).toEqual({board:ordered,cell:{bloom:'create',dok:4}});
    expect(readReviewReference(members, reviewReference(board))).toEqual({board});
    expect(() => readReviewReference(members, ref.replace('dok=4','dok=8'))).toThrow();
    expect(() => readReviewReference(members, ref.replace('chapter=4','chapter=0'))).toThrow();
    expect(() => readReviewReference(members, ref.replace('micro%3A1200','unknown'))).toThrow();
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
