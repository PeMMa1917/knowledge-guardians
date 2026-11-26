import { describe, expect, it } from 'vitest';
import {
  BASKET_CREDITS, BASKET_GOODS, basketCost, basketReceipt, creditTerms, sealedBasket, type BasketForm, type BasketGood,
} from '../src/domain/marketBasket';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { MARKET_SQUARE } from '../src/maps/market';
import { Driver } from './driver';

const PREFIX = 'market.basket';

function issue(d: Driver, form: BasketForm, extra: BasketGood = 'oil') {
  d.s.mapId = MARKET_SQUARE.id;
  d.run({ type: 'SealMarketBasket', extra });
  d.run({ type: 'QuoteMarketBasket', quote: 'next' });
  d.run({ type: 'QuoteMarketBasket', quote: 'opening' });
  d.run({ type: 'IssueBasketTicket', form });
}

function counter(form: BasketForm) {
  return EMBERFORD.interactables.find((prop) => prop.id === `market-basket-${form}`)!;
}

describe('Three Goods, Two Bells', () => {
  it('keeps the same quantities and credit amount across all valid two-bell price comparisons', () => {
    expect(BASKET_CREDITS).toBe(8);
    for (const extra of BASKET_GOODS) {
      const basket = sealedBasket(extra);
      expect(Object.values(basket).reduce((a, b) => a + b)).toBe(4);
      expect(basket[extra]).toBe(2);
      expect(basketCost(basket, 'opening')).toBe(8);
      expect(basketCost(basket, 'next')).toBe(extra === 'oil' ? 14 : extra === 'wick' ? 10 : 12);
    }
  });

  it('requires both dates after any repack and keeps the Smithsonian evidence separate', () => {
    const d = new Driver();
    d.s.mapId = MARKET_SQUARE.id;
    expect(() => d.run({ type: 'SealMarketBasket', extra: 'oil' })).toThrow(/measure is checked/);
    d.s.objectivesDone.push('market.finish');
    d.run({ type: 'SealMarketBasket', extra: 'oil' });
    d.run({ type: 'QuoteMarketBasket', quote: 'opening' });
    expect(() => d.run({ type: 'IssueBasketTicket', form: 'voucher' })).toThrow(/both dated prices/);
    d.run({ type: 'SealMarketBasket', extra: 'wick' });
    d.run({ type: 'QuoteMarketBasket', quote: 'next' });
    expect(d.s.flags[`${PREFIX}.quoted.opening`]).toBe(false);
    expect(() => d.run({ type: 'IssueBasketTicket', form: 'voucher' })).toThrow(/both dated prices/);
    d.run({ type: 'QuoteMarketBasket', quote: 'opening' });
    expect(d.done(`${PREFIX}.compare`)).toBe(true);

    const exhibit = d.e.pack.exhibits.find((record) => record.id === 'OBJ-BASKET-ZWL-100T')!;
    expect(exhibit.dateKind).toContain('printed');
    expect(exhibit.sources).toEqual(['HIS-BASKET-01']);
    const source = d.e.pack.sources.find((record) => record.id === exhibit.sources[0])!;
    expect(source.url).toBe('https://americanhistory.si.edu/collections/object/nmah_1694052');
    expect(d.e.pack.cards.find((card) => card.id === exhibit.grantsCard)?.limits).toContain('first circulation date');
  });

  it('carries a saved physical voucher to Oduya, keeps all four units and consumes one ticket', () => {
    const d = new Driver();
    d.s.marks = 21;
    d.s.objectivesDone.push('market.finish');
    expect(check(counter('voucher').visibleIf, d.s)).toBe(false);
    issue(d, 'voucher');
    expect(d.s.inventory['item.market.basket.voucher']).toBe(1);
    expect(check(counter('voucher').visibleIf, d.s)).toBe(true);
    expect(check(counter('credit').visibleIf, d.s)).toBe(false);
    expect(() => d.run({ type: 'RedeemBasketTicket', form: 'voucher' })).toThrow(/Emberford/);
    const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Co-op voucher', location: MARKET_SQUARE.name,
      savedAt: '2026-11-26T06:00:00Z', state: d.s });
    const saved = parsePair(serialisePair(pair));
    if (!saved.ok || !saved.pair.continue) throw new Error('Could not reload the signed voucher');
    d.s = saved.pair.continue.state;
    d.s.mapId = EMBERFORD.id;
    d.run({ type: 'RedeemBasketTicket', form: 'voucher' });
    expect(basketReceipt(d.s.flags, 'voucher')).toEqual({ basket: { oil: 2, wick: 1, flour: 1 }, quote: 'reserved', spent: null, remainder: null });
    expect(d.s.inventory['item.market.basket.voucher']).toBeUndefined();
    expect(check(counter('voucher').artOpen?.if, d.s)).toBe(true);
    expect(() => d.run({ type: 'RedeemBasketTicket', form: 'voucher' })).toThrow(/matching signed ticket/);
    expect(d.s.marks).toBe(21);
    expect(d.done(`${PREFIX}.collect`)).toBe(true);
  });

  it('allows the co-op to repack at the receiving bell or pay with the capped later review on another run', () => {
    const d = new Driver();
    d.s.objectivesDone.push('market.finish');
    issue(d, 'credit');
    d.s.mapId = EMBERFORD.id;
    expect(creditTerms(d.s.flags)).toEqual({ quote: 'next', credits: 8 });
    expect(check(counter('credit').visibleIf, d.s)).toBe(true);
    expect(check(counter('voucher').visibleIf, d.s)).toBe(false);
    expect(() => d.run({ type: 'RedeemBasketTicket', form: 'credit', basket: sealedBasket('oil') })).toThrow(/costs more/);
    expect(d.s.inventory['item.market.basket.credit']).toBe(1);
    const mix = { oil: 0, flour: 2, wick: 2 };
    d.run({ type: 'RedeemBasketTicket', form: 'credit', basket: mix });
    expect(basketReceipt(d.s.flags, 'credit')).toEqual({ basket: mix, quote: 'next', spent: 8, remainder: 0 });

    issue(d, 'credit', 'wick');
    d.s.mapId = EMBERFORD.id;
    d.run({ type: 'ReviewBasketCredit' });
    expect(creditTerms(d.s.flags)).toEqual({ quote: 'review', credits: 11 });
    expect(() => d.run({ type: 'ReviewBasketCredit' })).toThrow(/already has its review/);
    const later = sealedBasket('wick');
    d.run({ type: 'RedeemBasketTicket', form: 'credit', basket: later });
    expect(basketReceipt(d.s.flags, 'credit')).toEqual({ basket: later, quote: 'review', spent: 11, remainder: 0 });
    expect(d.s.inventory['item.market.basket.credit']).toBeUndefined();
    expect(d.s.marks).toBe(0);
    expect(d.p.credit).toEqual({});
  });
});
