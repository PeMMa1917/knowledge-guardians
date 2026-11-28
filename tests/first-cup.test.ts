import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { adventureJournalView } from '../src/domain/adventureJournal';
import {
  cupEffects,
  cupShop,
  cupStops,
  cupVotes,
  dispatchedCup,
  meanBid,
  mixDegrees,
  streetDegrees,
  type CupCommand,
  type CupStop,
} from '../src/domain/firstCup';
import { cupHosts } from '../src/content/firstCup';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';

type Move = CupCommand extends infer C ? (C extends CupCommand ? Omit<C, 'type'> : never) : never;
function action(d: Driver, m: Move) {
  return d.run({ type: 'WorkFirstCup', ...m });
}
function stock(d: Driver) {
  d.s.mapId = cupShop;
  for (const carafe of ['warm', 'cool', 'cool', 'warm'] as const) action(d, { act: 'pour', carafe });
  action(d, { act: 'wrap', wrap: 'felt' });
  for (const ticket of ['eight', 'blank', 'two'] as const) action(d, { act: 'tip', bench: 'mill', ticket });
  action(d, { act: 'rain' });
}
function move(d: Driver, stop: CupStop) {
  action(d, { act: 'roll', stop });
  d.s.mapId = cupStops[stop];
}
function read(d: Driver) {
  action(d, { act: 'taste', spot: 'inside' });
  action(d, { act: 'taste', spot: 'street' });
}
describe('The first cup', () => {
  it('can pour every four-scoop mixture and keep each route, sleeve and selling arrangement', () => {
    const d = new Driver();
    for (let code = 0; code < 16; code++) {
      const pour = code.toString(2).padStart(4, '0').replaceAll('0', 'c').replaceAll('1', 'w');
      expect(mixDegrees(pour)).toBe(18 + 9 * Array.from(pour).filter((c) => c === 'w').length);
      for (const wrap of ['bare', 'felt'] as const)
        for (const stop of ['weir', 'steps'] as const) {
          const s = {
            ...d.s,
            mapId: cupShop,
            flags: {
              ...d.s.flags,
              'cup.rain': true,
              'cup.wrap': wrap,
              'cup.pour': pour,
              'cup.steps.two': true,
              'cup.steps.eight': true,
              'cup.steps.blank': true,
            },
          };
          const apply = (cmd: CupCommand) => {
            for (const effect of cupEffects(s, cmd)) {
              if ('setFlag' in effect) (s.flags as Record<string, unknown>)[effect.setFlag] = effect.value;
            }
          };
          apply({ type: 'WorkFirstCup', act: 'roll', stop });
          s.mapId = cupStops[stop];
          expect(dispatchedCup(s)).toEqual({ pour, stop, wrap });
          for (const spot of ['street', 'inside'] as const) apply({ type: 'WorkFirstCup', act: 'taste', spot });
          for (const sign of ['slips', 'chalk'] as const) {
            apply({ type: 'WorkFirstCup', act: 'serve', sign });
            expect((s.flags as Record<string, unknown>)['cup.served.' + stop + '.' + sign]).toBe(true);
          }
          expect(streetDegrees(mixDegrees(pour)!, stop, wrap)).toBeGreaterThanOrEqual(18);
          expect(streetDegrees(mixDegrees(pour)!, stop, wrap)).toBeLessThanOrEqual(mixDegrees(pour)!);
        }
    }
  });
  it('lets a mistaken pour or destination be corrected and preserves the actual travelling jug after later edits', () => {
    const d = new Driver();
    stock(d);
    action(d, { act: 'takeBack' });
    action(d, { act: 'pour', carafe: 'cool' });
    move(d, 'weir');
    expect(dispatchedCup(d.s)?.pour).toBe('wccc');
    d.s.mapId = cupShop;
    action(d, { act: 'takeBack' });
    action(d, { act: 'pour', carafe: 'warm' });
    expect(dispatchedCup(d.s)?.pour).toBe('wccc');
    expect(() => move(d, 'steps')).toThrow(/still on the street/);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    d.s.mapId = cupStops.weir;
    action(d, { act: 'bringBack' });
    expect(dispatchedCup(d.s)).toBeUndefined();
    d.s.mapId = cupShop;
    move(d, 'steps');
    expect(dispatchedCup(d.s)?.pour).toBe('wccw');
    read(d);
    action(d, { act: 'serve', sign: 'slips' });
    const before = JSON.stringify(d.p);
    action(d, { act: 'serve', sign: 'chalk' });
    expect(d.done('cup.serve.steps')).toBe(true);
    expect(JSON.stringify(d.p)).toBe(before);
  });
  it('keeps individual reasons, instrument offset and audience separate through both performances', () => {
    const d = new Driver();
    stock(d);
    for (const stop of ['weir', 'steps'] as const) {
      move(d, stop);
      expect(() => action(d, { act: 'serve', sign: 'slips' })).toThrow(/Compare/);
      expect(d.e.talkEntry(cupHosts.daniel, d.s)).toBe('cup.daniel.return');
      d.talk(cupHosts.amos, 'Get the mill');
      read(d);
      action(d, { act: 'serve', sign: 'chalk' });
      action(d, { act: 'unfold', seat: 'heavy' });
      action(d, { act: 'unfold', seat: 'loose' });
      expect(() => action(d, { act: 'hang', first: 'offers' })).toThrow(/dials/);
      action(d, { act: 'compareGauge' });
      action(d, { act: 'taste', spot: 'street' });
      action(d, { act: 'hang', first: 'dial' });
      expect(d.done('cup.facing.' + stop)).toBe(true);
      action(d, { act: 'hang', first: 'offers' });
      action(d, { act: 'bringBack' });
      d.s.mapId = cupShop;
      // Start a second shift with an unadjusted instrument and unopened participant accounts.
      d.s.flags['cup.gauge'] = false;
      d.s.flags['cup.seat.heavy'] = false;
      d.s.flags['cup.seat.loose'] = false;
    }
    expect(meanBid(cupVotes.mill.two)).toBe(6);
    expect(meanBid(cupVotes.mill.eight)).toBe(7);
    const view = adventureJournalView(d.e.pack, d.s, []);
    const entries = view.entries.filter((e) => e.event?.key.startsWith('first-cup:'));
    expect(entries.length).toBeGreaterThan(19);
    for (const e of entries) expect(e.reflections?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(entries.some((e) => e.text.includes('original') || e.text.includes('unadjusted'))).toBe(true);
    expect(entries.some((e) => e.text.includes('individual bid'))).toBe(true);
  });
  it('keeps absent offers separate from the nine drawn tickets for either crew', () => {
    const d = new Driver();
    stock(d);
    for (const bench of ['mill', 'steps'] as const) {
      for (const ticket of ['blank', 'two', 'eight'] as const) action(d, { act: 'tip', bench, ticket });
      action(d, { act: 'passers', bench, view: 'footsteps' });
      expect(d.done('cup.passers.' + bench)).toBe(false);
      action(d, { act: 'passers', bench, view: 'cups' });
      expect(d.done('cup.passers.' + bench)).toBe(true);
      expect(cupVotes[bench].blank).toHaveLength(3);
    }
    const entries = adventureJournalView(d.e.pack, d.s, []).entries;
    expect(entries.some((e) => e.text.includes('6 empty places'))).toBe(true);
  });
  it('places the people and cart on the chosen street and leaves a way home after a wrong turning', () => {
    const d = new Driver();
    stock(d);
    expect(d.e.talkEntry(cupHosts.daniel, d.s)).toBe('cup.daniel');
    const places = () =>
      [cupShop, cupStops.weir, cupStops.steps].filter((map) =>
        MAPS[map]!.npcs.some((n) => n.id === cupHosts.cen && (!n.visibleIf || check(n.visibleIf, d.s))),
      );
    expect(places()).toEqual([cupShop]);
    move(d, 'steps');
    expect(places()).toEqual([cupStops.steps]);
    expect(() => {
      d.s.mapId = cupStops.weir;
      action(d, { act: 'taste', spot: 'street' });
    }).toThrow(/where you sent/);
    d.s.mapId = cupStops.steps;
    action(d, { act: 'bringBack' });
    expect(places()).toEqual([cupShop]);
    const lane = MAPS[cupStops.steps]!.interactables.find((p) => p.id === 'first-cup-return-steps')!;
    expect(check(lane.visibleIf!, d.s)).toBe(true);
    expect(() => {
      d.s.mapId = cupShop;
      action(d, { act: 'readTin' });
    }).toThrow(/Equip/);
  });
});
