import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const ember = MAPS['aethelgard.emberford'];
const market = MAPS['market.square'];
const nexus = MAPS['nexus.archive'];
const item = 'item.round-tray-tab';

function prop(d: Driver, map: MapDef, id: string) {
  const entry = map.interactables.find((s) => s.id === id);
  if (!entry) throw new Error(`Unknown map prop ${id}`);
  return { entry, visible: check(entry.visibleIf, d.s) };
}

function use(d: Driver, map: MapDef, id: string, ...picks: string[]) {
  const { entry, visible } = prop(d, map, id);
  if (!visible) throw new Error(`Hidden prop ${id}`);
  if (entry.kind === 'scene' && entry.node) {
    d.walk(entry.node, picks);
  } else if (entry.flag) {
    d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  }
  return entry.text;
}

function visitEmberford(d: Driver) {
  d.s.mapId = ember.id;
  d.run({ type: 'Reach', zone: 'emberford' });
}

function enterMarket(d: Driver) {
  const { entry, visible } = prop(d, nexus, 'market-door');
  expect(visible).toBe(false);
  d.resumeAfter('stage.finish');
  expect(prop(d, nexus, 'market-door').visible).toBe(true);
  d.s.mapId = entry.to!.map;
  d.run({ type: 'SetFlag', flag: entry.flag!, value: true });
}

const routes = [
  { early: 'tab', setup: 'Loop a round tab', pickup: 'Point to the round tab', late: 'shelf', arrange: 'Put the tab at the low rest', load: 'Show the low tab' },
  { early: 'voice', setup: 'Move the tray to the rear peg', pickup: 'Say “mek” here', late: 'attendant', arrange: 'Put an attendant', load: 'Say “Lamp here,”' },
];

describe('A Tray at Either Side and Ready Means Ready', () => {
  it.each(routes)('uses $early in Emberford and $late in Lantern Square', ({ early, setup, pickup, late, arrange, load }) => {
    const d = new Driver();
    const credits = { ...d.p.credit };
    expect(prop(d, ember, 'ember-pickup-front').visible).toBe(false);
    visitEmberford(d);
    expect(prop(d, ember, 'ember-pickup-back').visible).toBe(false);
    use(d, ember, 'ember-pickup-front', 'Leave the return tray');
    expect(d.s.flags['ember.pickup.point']).toBeUndefined();
    use(d, ember, 'ember-pickup-front', 'Point to the return tray');
    expect(d.e.visibleOptions('ember.pickup.back', d.s).some(({ option }) => option.text.includes('Say'))).toBe(false);
    use(d, ember, 'ember-pickup-back', 'Point to the same tray', 'Give the stall some room');
    expect(d.s.flags['ember.pickup.missed']).toBe(true);
    expect(prop(d, ember, 'ember-pickup-fix').visible).toBe(false);
    use(d, ember, 'ember-pickup-back', 'Say “mek” once');
    expect(d.done('ember.pickup.compare')).toBe(true);
    use(d, ember, 'ember-pickup-fix', setup);
    expect(d.s.flags['ember.pickup.layout']).toBe(early);
    expect(d.s.inventory[item]).toBeUndefined();
    expect(prop(d, ember, `ember-pickup-${early === 'tab' ? 'voice' : 'tab'}`).visible).toBe(false);
    use(d, ember, `ember-pickup-${early}`, pickup);
    expect(d.done('ember.pickup.done')).toBe(true);
    expect(d.s.inventory[item]).toBe(1);
    expect(use(d, ember, `ember-pickup-${early}-done`)).toContain(early === 'tab' ? 'without speaking' : 'hears the pickup call');
    expect(prop(d, ember, `ember-pickup-${early}`).visible).toBe(false);

    enterMarket(d);
    expect(prop(d, market, 'market-pickup-release').visible).toBe(false);
    expect(use(d, market, 'market-pickup-carrier')).toContain('both my hands');
    expect(prop(d, market, 'market-pickup-plan').visible).toBe(false);
    expect(use(d, market, 'market-pickup-clerk')).toContain('separate check slip');
    use(d, market, 'market-pickup-plan', 'Clip Mara’s round tab', 'Leave the tab clipped');
    expect(d.s.flags['market.pickup.source']).toBe('ember');
    expect(d.s.inventory[item] ?? 0).toBe(0);
    expect(prop(d, market, `market-pickup-${late}`).visible).toBe(false);
    use(d, market, 'market-pickup-plan', 'Arrange the rest', arrange);
    expect(d.s.flags['market.pickup.layout']).toBe(late);
    expect(use(d, market, 'market-pickup-ember-marker')).toContain('This counter tracks the same lamp');
    use(d, market, `market-pickup-${late}`, load);
    expect(d.done('market.pickup.accepted')).toBe(true);
    expect(d.done('market.pickup.done')).toBe(false);
    expect(use(d, market, `market-pickup-${late}-proof`)).toContain(late === 'shelf' ? 'marks its arrival' : 'arrival aloud');
    use(d, market, 'market-pickup-release', 'Leave the lamp');
    expect(prop(d, market, 'market-pickup-ready').visible).toBe(false);
    use(d, market, 'market-pickup-release', 'Match the loop-marked ready slip');
    expect(d.done('market.pickup.done')).toBe(true);
    expect(use(d, market, 'market-pickup-ready')).toContain('The intake tick stays with the day’s arrivals');
    expect(d.done('market.finish')).toBe(false);
    expect(d.p.credit).toEqual(credits);
  });

  it('lets a player who missed the stall complete the handback with Dagny’s spare', () => {
    const d = new Driver();
    enterMarket(d);
    use(d, market, 'market-pickup-clerk');
    use(d, market, 'market-pickup-carrier');
    const options = d.e.visibleOptions('market.pickup.plan', d.s).map(({ option }) => option.text);
    expect(options.join(' ')).not.toContain('Mara’s');
    use(d, market, 'market-pickup-plan', 'Clip Dagny’s spare tab', 'Put the tab at the low rest');
    expect(use(d, market, 'market-pickup-local-marker')).toContain('Dagny’s spare is in the rail');
    use(d, market, 'market-pickup-shelf', 'Show the low tab');
    use(d, market, 'market-pickup-release', 'Match the loop-marked ready slip');
    expect(d.done('market.pickup.done')).toBe(true);
    expect(d.done('ember.pickup.done')).toBe(false);
  });
});
