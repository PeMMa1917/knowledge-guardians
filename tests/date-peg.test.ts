import { describe, expect, it } from 'vitest';
import { DATE_PEG_CASES, datePegProof } from '../src/content/datePegCases';
import { datePegs, onDatePeg, sharedWindow } from '../src/domain/datePeg';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
}

function move(d: Driver, id: string) {
  const passage = prop(d, id);
  if (!passage?.to || !check(passage.openIf, d.s)) throw new Error(`No passage: ${id}`);
  d.s.mapId = passage.to.map;
}

describe('Two Dates at a Peg', () => {
  it('uses inclusive intervals and exposes identical, partial and disjoint bounds', () => {
    const first = { first: 1860, last: 1869 };
    const second = { first: 1865, last: 1866 };
    expect(sharedWindow(first, second)).toEqual(second);
    expect(datePegs(first, second)).toEqual([1865, 1860]);
    expect(datePegs(second, second)).toEqual([1865, 1867]);
    expect(onDatePeg(second, 1866)).toBe(true);
    expect(onDatePeg(second, 1867)).toBe(false);
    const third = { first: 1889, last: 1889 };
    expect(sharedWindow(second, third)).toBeNull();
    expect(datePegs(second, third)).toEqual([1865, 1889]);
  });

  it('keeps the optional annex and harbour boards shut before the harbour correction', () => {
    const d = new Driver();
    d.s.mapId = 'sea.harbour';
    expect(prop(d, 'sea-date-market')).toBeUndefined();
    expect(prop(d, 'sea-date-dock')).toBeUndefined();
    move(d, 'sea-chartroom-path');
    expect(prop(d, 'sea-date-annex')).toBeUndefined();
    d.s.objectivesDone.push('sea.finish');
    move(d, 'sea-date-annex');
    expect(d.s.mapId).toBe('sea.date-room');
  });

  it.each(DATE_PEG_CASES)('checks each exact object and the two routes for $slug', (record) => {
    for (const [pick, route, otherRoute] of [[2, 'market', 'dock'], [3, 'dock', 'market']] as const) {
      const d = new Driver();
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      d.s.mapId = 'sea.chartroom';
      d.s.objectivesDone.push('sea.finish');
      move(d, 'sea-date-annex');
      expect(() => choose(record.nodes.board, 0)).toThrow(/not available/);
      expect(() => choose(record.nodes.board, pick)).toThrow(/not available/);
      record.docs.forEach((item, index) => {
        const cabinet = prop(d, `date-case-${record.slug}-${index + 1}`);
        expect(cabinet?.exhibit).toBe(item.exhibit);
        d.run({ type: 'InspectExhibit', exhibit: item.exhibit });
        expect(d.s.cards).toContain(item.card);
      });
      expect(prop(d, `date-bench-${record.slug}`)?.game).toBe(`date-peg:${record.slug}`);
      choose(record.nodes.board, 0);
      choose(record.nodes.board, 0);
      expect(d.s.flags[`${record.flag}.year`]).toBe(record.pegs[0]);
      expect(() => choose(record.nodes.board, pick)).toThrow(/not available/);
      choose(record.nodes.board, 1);
      choose(record.nodes.board, pick);
      expect(d.s.flags[`${record.flag}.year`]).toBe(record.pegs[1]);
      expect(d.s.inventory[record.item]).toBe(1);
      expect(() => choose(record.nodes.board, pick)).toThrow(/not available/);
      expect(d.done(record.objective)).toBe(false);
      move(d, 'sea-date-annex-return');
      move(d, 'sea-chartroom-return');
      expect(prop(d, `sea-date-${route}`)?.game).toBe(`date-peg:${route}`);
      expect(check(datePegProof(record, route), d.s)).toBe(true);
      expect(check(datePegProof(record, otherRoute), d.s)).toBe(false);
      expect(() => choose(record.nodes[otherRoute], 0)).toThrow(/not available/);
      choose(record.nodes[route], 0);
      expect(d.s.inventory[record.item] ?? 0).toBe(0);
      expect(d.s.flags[`${record.flag}.received`]).toBe(route);
      expect(d.done(record.objective)).toBe(true);
      expect(d.s.journal).toContain(`j.${record.objective}`);
      expect(check(datePegProof(record, route), d.s)).toBe(false);
    }
  });
});
