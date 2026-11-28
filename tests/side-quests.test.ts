import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
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
  it('lets an explorer read the sticks in either order before meeting the people', () => {
    const d = new Driver();
    for (const id of ['rope-west', 'rope-east']) {
      const stick = MAPS['aethelgard.emberford'].interactables.find((p) => p.id === id)!;
      d.run({ type: 'ReadWorldSign', id, title: stick.label, text: stick.text!, readFlag: stick.flag });
    }
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.start');
    d.talk('well-keeper', 'What do you need');
    d.talk('fruit-seller');
    d.talk('smith-hesper');
    d.talk('well-keeper', 'use less water');
    expect(d.done('well.o3.act')).toBe(true);
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.reflect');
  });

  it.each(['measure', 'trial'] as const)('delivers the actual %s record and lets the water turn change later', (plan) => {
    const d = new Driver();
    d.talk('well-keeper', 'What do you need');
    d.talk('fruit-seller');
    d.talk('smith-hesper');
    d.talk('well-keeper', plan === 'trial' ? 'use less water' : 'Measure both');
    expect(d.e.talkEntry('well-keeper', d.s)).toBe(plan === 'trial' ? 'well.plan.trial' : 'well.plan.ok');
    for (const side of ['east', 'west']) d.run({ type: 'SetFlag', flag: 'well.' + side + '.read', value: true });
    d.talk('well-keeper', 'not sure');
    const available = d.e.visibleOptions('well.orrin', d.s);
    expect(available.map(({ option }) => option.next)).toEqual(['well.receipt.' + plan, null]);
    const record = d.e.node(available[0].option.next!);
    expect(record.text).toContain(plan === 'trial' ? 'jar caught rain' : 'usual two buckets');
    expect(record.next).toBe('well.jug');

    d.talk('guildmaster-orrin', available[0].option.text, 'while I think');
    expect(d.done('well.o5.show')).toBe(false);
    d.talk('guildmaster-orrin', available[0].option.text, 'porters', 'Keep the closing');
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.jug.late');
    const earned = totalXP(d.p);
    d.talk('well-keeper', 'change its bell', 'soup kettle', 'Keep the dawn');
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.jug.dawn');
    expect(totalXP(d.p)).toBe(earned);
    expect(d.p.portfolio.filter((entry) => entry.title.startsWith('The East Well'))).toHaveLength(1);
  });
  it('keeps the original well-keeper visit available for a completed older save', () => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'well.shared', value: true });
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.done');
    d.talk('well-keeper', 'tomorrow’s covered jug', 'porters', 'Keep the closing');
    expect(d.e.talkEntry('well-keeper', d.s)).toBe('well.jug.late');
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
