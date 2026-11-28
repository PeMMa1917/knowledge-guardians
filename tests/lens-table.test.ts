import { describe, expect, it } from 'vitest';
import { LENSES, OBJECTS, TITLES, account, leftOut } from '../src/domain/lensTable';

const pairs = <T,>(xs: T[]): T[][] => xs.flatMap((a, i) => xs.slice(i + 1).map((b) => [a, b]));

describe('The Lens Table (chapter 9, C-004)', () => {
  it('has a line for every lens and object pair', () => {
    for (const l of LENSES) for (const o of OBJECTS) expect(account([l.id], [o.id])[0], `${l.id}.${o.id}`).toBeTruthy();
  });
  it('gives every choice of two lenses and two objects a four-line account', () => {
    for (const ls of pairs(LENSES.map((l) => l.id))) for (const os of pairs(OBJECTS.map((o) => o.id))) {
      expect(account(ls, os)).toHaveLength(4);
    }
  });
  it('always says what an account leaves out, unless it holds the reason, the rope and the cost', () => {
    expect(leftOut(['actor', 'box'], ['prompt', 'ledger'])[0]).toMatch(/why the show stopped/);
    expect(leftOut(['stage', 'actor'], ['rigging', 'ledger'])).toEqual([]);
    expect(TITLES.every((t) => t.reply.length > 40)).toBe(true);
  });
});
