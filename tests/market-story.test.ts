import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const market = MAPS['market.square'];

function enter() {
  const d = new Driver();
  const passage = MAPS['nexus.archive'].interactables.find(({ id }) => id === 'market-door')!;
  expect(check(passage.visibleIf, d.s)).toBe(false);
  expect(d.e.activeMissions(d.s).some(({ id }) => id === 'KG-CH10-M01')).toBe(false);
  d.s.objectivesDone.push('stage.finish');
  expect(check(passage.visibleIf, d.s)).toBe(true);
  d.s.mapId = passage.to!.map;
  d.run({ type: 'SetFlag', flag: passage.flag!, value: true });
  expect(d.done('market.arrival')).toBe(true);
  return d;
}

function read(d: Driver, id: string) {
  const sign = market.interactables.find((prop) => prop.id === id && prop.kind === 'sign');
  if (!sign?.text || !check(sign.visibleIf, d.s)) throw new Error(`Unable to read ${id} here`);
  if (sign.flag) d.run({ type: 'SetFlag', flag: sign.flag, value: true });
  return sign.text;
}

describe('The Price of a Basket', () => {
  it('needs both weight comparisons, both grading rules and the whole-lot terms before publication', () => {
    const d = enter();
    d.run({ type: 'WeighMarketLots', basis: 'net' });
    expect(d.e.talkEntry('market-assayer', d.s)).toBe('market.assayer.welcome');
    read(d, 'market-grade-sorting');
    expect(d.e.talkEntry('market-clerk', d.s)).toBe('market.clerk.trace');
    read(d, 'market-grade-display');
    d.talk('market-clerk', 'Name what each grade does');
    expect(d.done('market.terms')).toBe(true);
    read(d, 'market-practice-purse');
    expect(d.e.talkEntry('market-clerk', d.s)).toBe('market.clerk.wait-check');
    d.run({ type: 'WeighMarketLots', basis: 'gross' });
    d.talk('market-assayer', 'Put the net figures first');
    expect(d.done('market.compare')).toBe(true);
    expect(d.e.talkEntry('market-clerk', d.s)).toBe('market.clerk.decide');
  });

  it.each([
    ['window', 'Hang the prices by the window', 'market-result-window', 'Household queue'],
    ['desk', 'Open the comparison at the trade desk', 'market-result-desk', 'Trade desk'],
  ])('puts the comparison at the %s and revises it after a buyer reads it', (route, publish, result, heading) => {
    const d = enter();
    d.run({ type: 'WeighMarketLots', basis: 'gross' });
    d.run({ type: 'WeighMarketLots', basis: 'net' });
    d.talk('market-assayer', 'Set both pairs');
    read(d, 'market-grade-sorting');
    read(d, 'market-grade-display');
    d.talk('market-clerk', 'Put both grade rules');
    read(d, 'market-practice-purse');
    expect(() => read(d, 'market-buyer-note')).toThrow();
    d.talk('market-clerk', publish);
    expect(d.done('market.publish')).toBe(true);
    expect(d.s.flags['market.response']).toBe(route);
    expect(read(d, result)).toContain(heading);
    expect(d.e.talkEntry('market-clerk', d.s)).toBe('market.clerk.wait');
    expect(d.done('market.finish')).toBe(false);
    read(d, 'market-buyer-note');
    d.talk('market-clerk', 'Add a whole-lot line');
    expect(d.done('market.finish')).toBe(true);
    expect(read(d, 'market-revised')).toContain('The eight-credit purse reaches A');
    expect(d.p.credit['credit.market.publish']).toBe(8);
    expect(d.p.credit['credit.market.finish']).toBe(8);
    d.talk('market-clerk', 'Leave a larger four-line key');
    expect(d.done('market.access')).toBe(true);
    expect(read(d, 'market-access-key')).toContain('whole-lot price');
    d.run({ type: 'WeighMarketLots', basis: 'wick' });
    d.talk('market-clerk', 'Clip the wick-length tally');
    expect(d.done('market.wick')).toBe(true);
    expect(read(d, 'market-wick-note')).toContain('480 grams for A and 760 grams for B');
  });

  it.each([
    ['Hang the prices by the window', 'Add the totals and leave a reweigh ticket', 'reweigh', 'blank tally'],
    ['Open the comparison at the trade desk', 'Add a whole-lot line', 'posted', 'intake number'],
  ])('carries a checked Market procedure to the council runner', (publish, revise, rule, expected) => {
    const d = enter();
    d.run({ type: 'WeighMarketLots', basis: 'gross' });
    d.run({ type: 'WeighMarketLots', basis: 'net' });
    d.talk('market-assayer', 'Set both pairs');
    read(d, 'market-grade-sorting');
    read(d, 'market-grade-display');
    d.talk('market-clerk', 'Name what each grade does');
    read(d, 'market-practice-purse');
    d.talk('market-clerk', publish);
    read(d, 'market-buyer-note');
    expect(() => read(d, `market-quote-${rule}`)).toThrow();
    d.talk('market-clerk', revise);
    expect(d.done('market.finish')).toBe(true);
    expect(read(d, `market-quote-${rule}`)).toMatch(/next/i);
    expect(d.p.credit['credit.market.finish']).toBe(8);

    const waterDoor = MAPS['nexus.archive'].interactables.find(({ id }) => id === 'water-door')!;
    expect(check(waterDoor.visibleIf, d.s)).toBe(true);
    d.s.mapId = waterDoor.to!.map;
    d.run({ type: 'SetFlag', flag: waterDoor.flag!, value: true });
    d.run({ type: 'RunWaterTrial', setting: 'fields' });
    d.run({ type: 'RunWaterTrial', setting: 'split' });
    for (const flag of ['water.farm.note', 'water.channel.note']) d.run({ type: 'SetFlag', flag, value: true });
    d.s.mapId = 'water.council';
    const handovers = () => MAPS[d.s.mapId].interactables.filter(({ id, visibleIf }) => id.startsWith('water-market-') && check(visibleIf, d.s));
    expect(handovers()).toEqual([]);
    d.talk('water-scribe', 'Split it five and five');
    expect(d.done('water.publish')).toBe(true);
    expect(handovers().map(({ id }) => id)).toEqual([`water-market-${rule}`]);
    expect(handovers()[0].text).toContain(expected);
    expect(d.p.credit['credit.water.publish']).toBe(8);
    expect(d.p.awards['badge.field.next-count']).toBeUndefined();
    d.run({ type: 'SetFlag', flag: handovers()[0].flag!, value: true });
    expect(d.done('water.market.copy')).toBe(true);
    expect(d.p.awards['badge.field.next-count']).toBeDefined();
    const slip = MAPS['civic.dispatch'].interactables.find(({ id }) => id === 'civic-next-count')!;
    expect(check(slip.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('civic.compare');
    expect(check(slip.visibleIf, d.s)).toBe(true);
    expect(slip.text).toContain('walking round');
  });
});
