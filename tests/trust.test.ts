import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

describe('lost trust that can be won back (decision X-007)', () => {
  it('checks a character\'s trust with lte and gte', () => {
    const d = new Driver();
    d.s.relations['merchant-corvan'] = -2;
    expect(check({ trust: 'merchant-corvan', lte: -1 }, d.s)).toBe(true);
    expect(check({ trust: 'merchant-corvan', gte: 0 }, d.s)).toBe(false);
    expect(check({ trust: 'smith-hesper', gte: 0 }, d.s)).toBe(true);
  });
  it('lets the player mend Corvan\'s trust after exposing him, once', () => {
    const d = new Driver();
    const node = d.e.node('corvan.after.down');
    const mend = node.options!.find((o) => o.next === 'corvan.mend')!;
    d.s.relations['merchant-corvan'] = -2;
    expect(check(mend.if, d.s)).toBe(true);
    d.s.flags['corvan.trust.mended'] = true;
    expect(check(mend.if, d.s)).toBe(false);
    d.s.flags = {};
    d.s.relations['merchant-corvan'] = 1;
    expect(check(mend.if, d.s)).toBe(false);
  });
});
