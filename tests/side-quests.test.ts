import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { totalXP } from '../src/domain/permanent';

function playWell(d: Driver, plan: string, reflect: string) {
  d.talk('well-keeper', 'What do you need');
  d.talk('fruit-seller');
  d.talk('smith-hesper');
  expect(d.done('well.o1.listen')).toBe(true);
  d.talk('well-keeper', plan);
  d.run({ type: 'SetFlag', flag: 'well.east.read', value: true });
  d.run({ type: 'SetFlag', flag: 'well.west.read', value: true });
  expect(d.done('well.o3.act')).toBe(true);
  d.talk('well-keeper', reflect);
  d.talk('guildmaster-orrin');
  expect(d.done('well.o5.show')).toBe(true);
}

describe('side quest: The East Well (habits of a community project, spec 92.3)', () => {
  it('listening comes first: "close the forge" leads back to asking', () => {
    const d = new Driver();
    d.talk('well-keeper', 'Close the forge', 'You\'re right');
    expect(d.s.flags['well.heard.keeper']).toBe(true);
  });
  it('both plans and every reflection give the same credit, a badge and a private entry', () => {
    const xp = [['Measure both', 'Listening first'], ['use less water', 'not sure']].map(([plan, r]) => {
      const d = new Driver();
      playWell(d, plan, r);
      expect(d.p.awards['badge.east-well']).toBeTruthy();
      expect(d.p.portfolio.find((e) => e.title.startsWith('The East Well'))?.shared).toBe(false);
      return totalXP(d.p);
    });
    expect(new Set(xp).size).toBe(1);
  });
  it('says plainly that play is not CAS (CAS-001)', () => {
    const d = new Driver();
    playWell(d, 'Measure both', 'people');
    const text = JSON.stringify(d.e.node('well.show')) + JSON.stringify(d.p.portfolio);
    expect(text).toMatch(/not (real service|CAS)/);
  });
});

describe('Question Stones (KQ-003)', () => {
  it('a step with a question records a way, and Lumen names the question', () => {
    const d = new Driver();
    playWell(d, 'Measure both', 'Listening first');
    expect(d.p.stones['KQ-NEW-006']).toEqual(['WORLD-02|community']);
    expect(d.p.stones['KQ-NEW-003']).toEqual(['WORLD-02|fieldwork']);
    expect(d.events.some((e) => e.kind === 'stone' && e.question === 'KQ-NEW-006' && e.newWay)).toBe(true);
  });
  it('the same way twice does not make a stone brighter', () => {
    const d = new Driver();
    d.p = { ...d.p, stones: { 'KQ-NEW-006': ['WORLD-02|community'] } };
    d.talk('well-keeper', 'What do you need'); d.talk('fruit-seller'); d.talk('smith-hesper');
    expect(d.p.stones['KQ-NEW-006']).toEqual(['WORLD-02|community']);
  });
});
