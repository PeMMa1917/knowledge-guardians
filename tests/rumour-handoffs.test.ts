import { describe, expect, it } from 'vitest';
import { RUMOURS } from '../src/domain/rumours';
import { Driver } from './driver';

describe('the tea table runner', () => {
  for (const rumour of RUMOURS) {
    it(`routes and revises ${rumour.title} with equal credit and two distinct replies`, () => {
      const d = new Driver();
      d.s.mapId = 'aethelgard.emberford';
      const route = (desk: 'ledger' | 'ferry') => d.run({ type: 'RouteRumour', rumour: rumour.id, desk });
      expect(() => route('ledger')).toThrow(/listed sources/);
      for (const source of rumour.requiredSources) d.run({ type: 'CheckRumourSource', rumour: rumour.id, source });
      const marks = d.s.marks;
      route('ferry');
      expect(d.s.marks).toBe(marks + 5);
      expect(d.s.flags[`mill.${rumour.id}.desk`]).toBe('ferry');
      route('ledger');
      route('ledger');
      d.run({ type: 'JudgeRumour', rumour: rumour.id, verdict: rumour.best });
      expect(d.s.flags[`mill.${rumour.id}.desk`]).toBe('ledger');
      expect(d.s.flags['count.rumours']).toBe(1);
      expect(d.s.marks).toBe(marks + 5);
      expect(rumour.handoffs.ledger.reply).not.toBe(rumour.handoffs.ferry.reply);
      expect(d.s.adventureDiary.entries.filter((e) => e.id.startsWith(`rumour:${rumour.id}:`))).toHaveLength(2);
    });
  }

  it('accepts a slip traced in an earlier save without issuing a second reward', () => {
    const d = new Driver();
    const r = RUMOURS[0];
    d.s.flags[`mill.${r.id}.done`] = true;
    d.s.flags['count.rumours'] = 1;
    for (const index of r.requiredSources) d.s.flags[`mill.${r.id}.s${index}`] = true;
    const route = () => d.run({ type: 'RouteRumour', rumour: r.id, desk: 'ferry' });
    expect(route).toThrow(/tea table/);
    d.s.mapId = 'aethelgard.emberford';
    const marks = d.s.marks;
    route();
    expect(d.s.marks).toBe(marks);
    expect(d.s.flags['count.rumours']).toBe(1);
  });
});
