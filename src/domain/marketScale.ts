/** Fixed sample lots from the fictional Market of Measures. */
export const MARKET_BASES = ['gross', 'net', 'wick'] as const;
export type MarketBasis = typeof MARKET_BASES[number];

const lots = [
  { id: 'a', price: 8, gross: 960, basket: 360, short: 120 },
  { id: 'b', price: 10, gross: 900, basket: 100, short: 40 },
] as const;

export function marketComparison(basis: string) {
  if (basis !== 'gross' && basis !== 'net' && basis !== 'wick') {
    throw new Error('That measure does not belong to this test scale.');
  }
  return lots.map(({ id, price, gross, basket, short }) => {
    const net = gross - basket;
    const mass = basis === 'gross' ? gross : basis === 'net' ? net : net - short;
    return { id, price, mass };
  });
}

export function marketOffersWithin(purse: number) {
  return lots.filter(({ price }) => price <= purse).map(({ id }) => id);
}
