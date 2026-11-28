import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const hall = 'nile.hall';
const weir = 'water.gatehouse';

function visit(d: Driver, map: string) {
  d.s.mapId = map;
  d.run({ type: 'VisitPlace', name: MAPS[map].name });
}

function current(d: Driver) {
  const visible = MAPS[d.s.mapId].interactables
    .filter(({ id, visibleIf }) => id.startsWith('lower-rail-') && check(visibleIf, d.s));
  expect(visible.length).toBeLessThan(2);
  return visible[0];
}

function read(d: Driver, id: string) {
  const sign = MAPS[d.s.mapId].interactables.find((place) => place.id === id);
  if (!sign?.flag || !sign.text || !check(sign.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'ReadWorldSign', id: sign.id, title: sign.label, text: sign.text, readFlag: sign.flag });
}

function follow(d: Driver, ...choices: string[]) {
  const place = current(d);
  if (!place?.node) throw new Error(`No visible Lower Rail scene in ${d.s.mapId}`);
  d.walk(place.node, choices);
}

function restore(d: Driver) {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
}

function reachTheDrawer(d: Driver) {
  const door = MAPS['nexus.archive'].interactables.find(({ id }) => id === 'water-door')!;
  expect(check(door.visibleIf, d.s)).toBe(false);
  // The earlier Market chapter is outside this route. Earn the Water trials and read the drawer below.
  d.resumeAfter('market.finish');
  expect(check(door.visibleIf, d.s)).toBe(true);
  visit(d, door.to!.map);
  d.run({ type: 'SetFlag', flag: door.flag!, value: true });
  expect(d.done('water.arrival')).toBe(true);
  expect(current(d)).toBeUndefined();
  expect(() => read(d, 'harrowmere-order')).toThrow('Cannot read');
  d.run({ type: 'RunWaterTrial', setting: 'fields' });
  expect(d.done('water.drought')).toBe(false);
  d.run({ type: 'RunWaterTrial', setting: 'split' });
  expect(d.done('water.drought')).toBe(true);
  expect(current(d)).toBeUndefined();
  read(d, 'harrowmere-order');
}

describe('The Lower Rail', () => {
  it.each(['wide', 'hinge'] as const)('carries the early comparison to Omi and leaves the %s reading at the original case', (design) => {
    const d = new Driver();
    visit(d, hall);
    expect(current(d)).toBeUndefined();
    read(d, 'nile-old-label');
    expect(d.s.flags['harrowmere.found']).toBeUndefined();
    expect(current(d)?.art).toBe('lower-rail.empty');

    const { node } = current(d)!;
    d.run({ type: 'EnterNode', node: node! });
    d.run({ type: 'ChooseDialogueOption', node: node!, index: 0 });
    expect(current(d)?.art).toBe('lower-rail.masked');
    expect(d.s.inventory['item.lower-rail']).toBeUndefined();
    restore(d);
    follow(d, 'Lift the practice window');
    expect(d.s.inventory['item.lower-rail']).toBe(1);
    expect(d.done('lower-rail.sample')).toBe(true);
    expect(current(d)?.art).toBe('lower-rail.open');
    expect(d.e.node('lower-rail.paired').text).toContain('I still can’t give the old scrape a name');

    reachTheDrawer(d);
    expect(current(d)?.id).toBe('lower-rail-watch');
    follow(d, 'Fit Leila’s window', 'come back to the choice later');
    expect(d.done('lower-rail.choose')).toBe(false);
    expect(current(d)?.id).toBe('lower-rail-watch-tested');
    restore(d);
    follow(d, design === 'wide' ? 'spare full-width backing' : 'working hinge to Leila');
    const weirArt = current(d)?.art;
    expect(weirArt).toBe(`lower-rail.${design}`);
    expect(d.done('lower-rail.choose')).toBe(true);
    expect(d.s.flags['ise.harrowmere']).toBeUndefined();
    expect(d.s.flags['tail.water']).toBeUndefined();

    visit(d, hall);
    expect(current(d)?.id).toBe(`lower-rail-${design}-return`);
    restore(d);
    if (design === 'wide') {
      follow(d, 'Fasten Omi’s whole notice');
      expect(current(d)?.art).toBe('lower-rail.wide');
      expect(d.e.node(current(d)!.node!).text).toContain('both hands full');
    } else {
      follow(d, 'Fit the hinge', 'Lift the hinge', 'Leave the rail here');
      expect(current(d)?.art).toBe('lower-rail.hinge');
      expect(d.e.node(current(d)!.node!).text).toContain('until the watch bell');
      follow(d, 'Lower the practice rail', 'Leave the rail here');
      expect(current(d)?.art).toBe('lower-rail.masked');
      restore(d);
      follow(d, 'Lift the hinge', 'Leave the rail here');
      expect(current(d)?.art).toBe('lower-rail.hinge');
    }
    expect(d.done('lower-rail.return')).toBe(true);
    expect(d.s.journal.filter((id) => id.startsWith('j.lower-rail.return'))).toEqual([`j.lower-rail.return-${design}`]);
    expect(d.s.inventory['item.lower-rail']).toBe(1);
    expect(MAPS[hall].interactables.find(({ id }) => id === 'nile-old-label')?.kind).toBe('sign');
    visit(d, weir);
    expect(current(d)?.art).toBe(weirArt);
  });

  it('leaves the Harrowmere reveal and Ise’s original conversation accessible when skipped', () => {
    const d = new Driver();
    reachTheDrawer(d);
    expect(current(d)).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.harrowmere');
    d.talk('warden-ise', 'Then tell the story yourself');
    expect(d.s.flags['ise.harrowmere']).toBe('herself');
  });

  it('keeps the two new scene locations clear of existing props and registers every art state', () => {
    const keys = new Set(artKeys());
    for (const [id, x, y] of [[hall, 21, 5], [weir, 10, 6]] as const) {
      const map = MAPS[id];
      expect(map.floor(x, y)).toBeTruthy();
      expect(map.floor(x, y + 1)).toBeTruthy();
      expect(map.npcs.some((actor) => actor.x === x && actor.y === y)).toBe(false);
      for (const prop of map.interactables) {
        if (prop.id.startsWith('lower-rail-')) {
          expect([prop.x, prop.y]).toEqual([x, y]);
          expect(prop.walkThrough).toBe(true);
          expect(keys.has(prop.art!)).toBe(true);
        } else if (x >= prop.x && x < prop.x + prop.w) {
          expect(y < prop.y - 1 || y >= prop.y + prop.h).toBe(true);
        }
      }
    }
  });
});
