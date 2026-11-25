import { describe, expect, it } from 'vitest';
import { CHARGES, DEFAULT_CREST, MOTTOS, crestPixels, decodeCrest, encodeCrest } from '../src/domain/crest';

describe('crest designer (spec 47.4)', () => {
  it('round-trips and rejects anything not from the lists', () => {
    const c = { ...DEFAULT_CREST, shape: 'kite' as const, division: 'quarterly' as const, charge: 'moth', motto: 3 };
    expect(decodeCrest(encodeCrest(c))).toEqual(c);
    expect(decodeCrest('heater.plain.violet.gold.lamp.gold.99')).toBeNull();
    expect(decodeCrest('heater.plain.violet.gold.<script>.gold.0')).toBeNull();
    expect(decodeCrest(undefined)).toBeNull();
  });
  it('every charge is a 9 x 9 symbol, and mottos are preset phrases', () => {
    Object.values(CHARGES).forEach((ch) => { expect(ch.rows).toHaveLength(9); ch.rows.forEach((r) => expect(r).toHaveLength(9)); });
    expect(MOTTOS.length).toBeGreaterThanOrEqual(10);
  });
  it('paints a shield with transparent corners and the charge in the ink colour', () => {
    const px = crestPixels({ ...DEFAULT_CREST, shape: 'round' }, 30);
    expect(px[3]).toBe(0); // top-left corner is outside a round shield
    const mid = (15 * 30 + 15) * 4;
    expect(px[mid + 3]).toBe(255);
  });
});
