import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { COPIES_LANDING } from '../src/maps/copies';
import { MARKET_SQUARE } from '../src/maps/market';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

type CopiesPlan = 'panel' | 'host';
type MarketPlan = 'path' | 'guide';
const PROP = 'welcome-';
const SLIP = 'item.welcome.scope-slip';

function find(map: MapDef, id: string) {
  const prop = map.interactables.find((it) => it.id === PROP + id);
  if (!prop) throw new Error(`Missing ${id} in ${map.id}`);
  return prop;
}

function visible(d: Driver, map: MapDef, id: string) {
  return check(find(map, id).visibleIf, d.s);
}

function use(d: Driver, map: MapDef, id: string, pick: string) {
  expect(d.s.mapId).toBe(map.id);
  const prop = find(map, id);
  expect(check(prop.visibleIf, d.s), id).toBe(true);
  if (!prop.node) throw new Error(`Missing scene at ${id}`);
  d.walk(prop.node, [pick]);
}

function arrive(d: Driver, area: 'copies' | 'market') {
  d.s.mapId = area === 'copies' ? COPIES_LANDING.id : MARKET_SQUARE.id;
  d.s.objectivesDone.push(area + '.arrival');
}

function copies(d: Driver, plan: CopiesPlan) {
  expect(visible(d, COPIES_LANDING, 'copies-start')).toBe(false);
  arrive(d, 'copies');
  use(d, COPIES_LANDING, 'copies-start', 'Lift the visitor’s scrap');
  expect(visible(d, COPIES_LANDING, 'copies-desk')).toBe(false);
  use(d, COPIES_LANDING, 'copies-reader', 'Lay the small copy');
  expect(visible(d, COPIES_LANDING, 'copies-desk')).toBe(false);
  use(d, COPIES_LANDING, 'copies-mender', 'Copy the invitation');
  expect(d.done('welcome.copies.o.read')).toBe(true);
  use(d, COPIES_LANDING, 'copies-desk', plan === 'panel' ? 'Mount a low welcome board' : 'Give the host the welcome strip');
  expect(d.s.inventory[SLIP]).toBeUndefined();
  expect(visible(d, COPIES_LANDING, plan === 'panel' ? 'copies-check-host' : 'copies-check-panel')).toBe(false);
  use(d, COPIES_LANDING, `copies-check-${plan}`, plan === 'panel' ? 'Point out the clamp tray' : 'Pass the spoken welcome');
  expect(visible(d, COPIES_LANDING, `copies-${plan}`)).toBe(true);
  expect(d.s.inventory[SLIP]).toBe(1);
  expect(d.done('welcome.copies.o.send')).toBe(true);
}

function market(d: Driver, source: CopiesPlan | 'local', plan: MarketPlan) {
  expect(visible(d, MARKET_SQUARE, 'market-start')).toBe(false);
  arrive(d, 'market');
  const start = source === 'local' ? 'Take Dagny’s spare strip' : source === 'panel' ? 'Clip on the printed welcome board' : 'Clip on the Copies host’s';
  use(d, MARKET_SQUARE, 'market-start', start);
  expect(d.s.flags['welcome.market.source']).toBe(source);
  use(d, MARKET_SQUARE, 'market-bench', 'Walk from the road turn');
  expect(visible(d, MARKET_SQUARE, 'market-desk')).toBe(false);
  use(d, MARKET_SQUARE, 'market-tally', 'Put the counting boundary');
  expect(d.done('welcome.market.o.route')).toBe(true);
  use(d, MARKET_SQUARE, 'market-desk', plan === 'path' ? 'Unroll the public mat' : 'Keep the covered bench');
  expect(d.done('welcome.market.o.try')).toBe(false);
  use(d, MARKET_SQUARE, `market-check-${plan}`, plan === 'path' ? 'Tie the direction' : 'Hang the two-sided strip');
  expect(visible(d, MARKET_SQUARE, plan === 'path' ? 'market-path' : 'market-guide')).toBe(true);
  expect(visible(d, MARKET_SQUARE, plan === 'path' ? 'market-guide' : 'market-path')).toBe(false);
  expect(d.done('welcome.market.o.try')).toBe(true);
}

describe('Where the Welcome Goes', () => {
  it.each([['panel', 'path'], ['panel', 'guide'], ['host', 'path'], ['host', 'guide']] as const)(
    'takes the %s welcome slip to a different %s access choice in the Market', (copied, placed) => {
      const d = new Driver();
      copies(d, copied);
      const p = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Copies welcome', location: COPIES_LANDING.name,
        savedAt: '2026-11-26T06:00:00.000Z', state: d.s });
      const resumed = parsePair(serialisePair(p));
      if (!resumed.ok || !resumed.pair.continue) throw new Error('Could not resume from the landing');
      d.s = resumed.pair.continue.state;

      market(d, copied, placed);
      expect(d.s.inventory[SLIP]).toBe(1);
      expect(d.s.cards).not.toContain('card.welcome.langar');
      expect(d.s.cards).not.toContain('card.welcome.archabbey');
      expect(d.s.objectivesDone.filter((id) => /^(copies|market)\./.test(id))).toEqual(['copies.arrival', 'market.arrival']);
      expect(d.p.credit).toEqual({});
      expect(d.s.marks).toBe(0);
    });

  it('opens a locally checked welcome when the imported slip is absent and can receive it later', () => {
    const d = new Driver();
    market(d, 'local', 'guide');
    expect(visible(d, MARKET_SQUARE, 'market-return')).toBe(false);
    copies(d, 'panel');
    d.s.mapId = MARKET_SQUARE.id;
    use(d, MARKET_SQUARE, 'market-return', 'Clip the later slip');
    expect(d.s.flags['welcome.market.late']).toBe(true);
    expect(d.s.flags['welcome.market.plan']).toBe('guide');
    expect(visible(d, MARKET_SQUARE, 'market-guide')).toBe(true);
    expect(d.s.inventory[SLIP]).toBe(1);
  });

  it('keeps the two public sources separate and usable in either visit order', () => {
    const d = new Driver();
    arrive(d, 'market');
    use(d, MARKET_SQUARE, 'market-source', 'Keep the abbey’s visitor guide');
    expect(visible(d, MARKET_SQUARE, 'market-readers')).toBe(false);
    arrive(d, 'copies');
    use(d, COPIES_LANDING, 'copies-source', 'Keep the source card');
    d.s.mapId = MARKET_SQUARE.id;
    use(d, MARKET_SQUARE, 'market-readers', 'Clip the two named accounts');
    expect(visible(d, MARKET_SQUARE, 'market-filed')).toBe(true);
    expect(d.done('welcome.market.o.sources')).toBe(true);
    expect(d.s.journal).toContain('j.welcome.sources');
    expect(d.s.inventory[SLIP]).toBeUndefined();
    expect(d.s.flags['welcome.market.plan']).toBeUndefined();
    expect(d.e.pack.cards.find((c) => c.id === 'card.welcome.langar')?.sources).toEqual(['REL-WELCOME-01']);
    expect(d.e.pack.cards.find((c) => c.id === 'card.welcome.archabbey')?.sources).toEqual(['REL-WELCOME-02', 'REL-WELCOME-03']);
    expect(d.p.met.subjects['world-religions']).toBe(1);
    expect(d.p.credit).toEqual({});
  });
});
