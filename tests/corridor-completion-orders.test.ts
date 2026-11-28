import { it, expect } from 'vitest';
import { Driver } from './driver';
import { corridorOpen, PASSAGES } from '../src/domain/corridor';

it('admits all 725,760 completion orders, allows revisits, and waits for the last case and gift', () => {
  const base = new Driver().s;
  const complete = (1 << 14) - 1;
  const ways = new Map<number, number>([[0, 1]]);
  for (let mask = 0; mask <= complete; mask++) {
    const count = ways.get(mask);
    if (!count) continue;
    const state = { ...base, flags: { ...base.flags }, objectivesDone: [] as string[] };
    state.flags['study.letter'] = !!(mask & 1);
    for (let i = 0; i < 14; i++) if (mask & (1 << i)) {
      state.objectivesDone.push(PASSAGES[i].finish);
      state.flags['temple.gift.' + (i+1)] = true;
    }
    expect(corridorOpen(state,15)).toBe(mask === complete);
    for (let i = 0; i < 14; i++) {
      const bit = 1 << i;
      if (mask & bit) expect(corridorOpen(state,i+1)).toBe(true);
      else if (corridorOpen(state,i+1)) ways.set(mask | bit,(ways.get(mask | bit) ?? 0) + count);
      if (mask === complete) expect(corridorOpen({...state,flags:{...state.flags,['temple.gift.'+(i+1)]:false}},15)).toBe(false);
    }
  }
  expect(ways.size).toBe(528);
  expect(ways.get(complete)).toBe(725760);
});
