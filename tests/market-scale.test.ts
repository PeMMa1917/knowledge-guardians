import { describe, expect, it } from 'vitest';
import { marketComparison, marketOffersWithin } from '../src/domain/marketScale';
import { Driver } from './driver';

describe('Market of Measures test scale', () => {
  it('keeps prices fixed as the mass being compared changes', () => {
    const withBaskets = marketComparison('gross');
    const allFibre = marketComparison('net');
    const wickFibre = marketComparison('wick');
    expect(withBaskets).toEqual([{ id: 'a', price: 8, mass: 960 }, { id: 'b', price: 10, mass: 900 }]);
    expect(allFibre).toEqual([{ id: 'a', price: 8, mass: 600 }, { id: 'b', price: 10, mass: 800 }]);
    expect(wickFibre).toEqual([{ id: 'a', price: 8, mass: 480 }, { id: 'b', price: 10, mass: 760 }]);
    const perCredit = (rows: ReturnType<typeof marketComparison>) => rows.map(({ mass, price }) => mass / price);
    expect(perCredit(withBaskets)).toEqual([120, 90]);
    expect(perCredit(allFibre)).toEqual([75, 80]);
    expect(perCredit(wickFibre)).toEqual([60, 76]);
    expect(() => marketComparison('unknown')).toThrow(/test scale/);
  });

  it('compares the purse with whole-lot prices independently of the scale reading', () => {
    expect(marketOffersWithin(7)).toEqual([]);
    expect(marketOffersWithin(8)).toEqual(['a']);
    expect(marketOffersWithin(10)).toEqual(['a', 'b']);
  });

  it('requires arrival and the market map, and records each basis once', () => {
    const d = new Driver();
    d.s.mapId = 'market.square';
    const weigh = () => d.run({ type: 'WeighMarketLots', basis: 'gross' });
    expect(weigh).toThrow(/test scale/);
    d.run({ type: 'SetFlag', flag: 'market.arrived', value: true });
    d.s.mapId = 'nexus.archive';
    expect(weigh).toThrow(/test scale/);
    d.s.mapId = 'market.square';
    weigh();
    expect(d.s.flags['market.weigh.gross']).toBe(true);
    expect(d.s.flags['market.weigh.net']).toBeUndefined();
    d.run({ type: 'WeighMarketLots', basis: 'net' });
    expect(d.s.flags['market.weigh.net']).toBe(true);
    const completed = d.s;
    weigh();
    expect(d.s).toEqual(completed);
  });
});
