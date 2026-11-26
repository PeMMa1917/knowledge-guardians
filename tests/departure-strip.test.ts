import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const kit = 'departure-strip';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!entry || !check(entry.visibleIf, d.s) || !check(entry.openIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return entry;
}

function enter(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry.to) throw new Error(`${id} is not a passage`);
  d.s.mapId = entry.to.map;
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
}

function inspect(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry.exhibit) throw new Error(`${id} is not an exhibit`);
  d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
}

function scene(d: Driver, id: string, choice: string) {
  const entry = prop(d, id);
  if (!entry.node) throw new Error(`${id} does not open a scene`);
  d.walk(entry.node, [choice]);
}

// Entry from Aethelgard to the Nexus is a portal zone. The engine driver resolves
// its authored gate and target, while the browser smoke plays the zone itself.
function reachCoast(d: Driver) {
  enter(d, 'ferry-road-back');
  const portal = MAPS[d.s.mapId].zones.find(({ id }) => id === 'portal-stone');
  expect(portal?.to?.map).toBe('nexus.archive');
  expect(check(portal?.if, d.s)).toBe(true);
  d.s.mapId = portal!.to!.map;
  enter(d, 'observatory-door');
  enter(d, 'coast-archive-path');
}

describe('The Departure Strip and The Name on the Back', () => {
  it('keeps a catalogue attribution, a later scholarly reconstruction and a Ngāi Tahu source separate', () => {
    const pack = buildPack();
    const cards = Object.fromEntries(pack.cards.filter(({ id }) => id.startsWith('card.departure.')).map((card) => [card.id, card]));
    expect(cards['card.departure.tupaia']).toMatchObject({
      historicalLabel: 'documented', claimKind: 'observation', sources: ['HIS-DEPART-01', 'HIS-DEPART-02'],
    });
    expect(cards['card.departure.tupaia'].text).toContain('Add MS 21593 C');
    expect(cards['card.departure.tupaia'].limits).toContain('who made the surviving copy');
    expect(cards['card.departure.reading']).toMatchObject({
      historicalLabel: 'scholarly-interpretation', claimKind: 'interpretation', sources: ['HIS-DEPART-03'],
      person: { name: 'Tupaia', place: 'Ra‘iātea' },
    });
    expect(cards['card.departure.reading'].text).toContain('They propose');
    expect(cards['card.departure.pere']).toMatchObject({
      historicalLabel: 'documented', claimKind: 'observation', sources: ['HIS-DEPART-04'],
    });
    expect(cards['card.departure.pere'].text).toContain('Hone Tututaua Pere and Hoani Te Hau Pere');
    expect(cards['card.departure.pere'].text).toContain('Taare Parata recorded');
    expect(pack.sources.find(({ id }) => id === 'HIS-DEPART-04')?.locator).toContain('MS7-002');
  });

  const routes = [
    ['paired', 'Pin one route', 'ferry-departure-paired', 'packer’s initials', 'cross', 'Link both drawer', 'Match the two index', 'index', 'right drawer'],
    ['paired', 'Pin one route', 'ferry-departure-paired', 'packer’s initials', 'desk', 'Leave both original', 'Match the loan tablet', 'desk', 'when the desk is open'],
    ['named', 'Send a tag', 'ferry-departure-wenna', 'Take Wenna’s checked', 'cross', 'Link both drawer', 'Match the two index', 'index', 'right drawer'],
    ['named', 'Send a tag', 'ferry-departure-wenna', 'Take Wenna’s checked', 'desk', 'Leave both original', 'Match the loan tablet', 'desk', 'when the desk is open'],
  ] as const;

  it.each(routes)('verifies the %s ferry handoff beginning with %s',
    (ferry, chooseFerry, ferryReceipt, readFerry, archive, chooseArchive, readArchive, reply, message) => {
      const d = new Driver();
      const startCredit = { ...d.p.credit };
      d.s.mapId = 'aethelgard.emberford';
      d.s.objectivesDone.push('m01.o6.label', 'preserved.publish');
      d.s.flags['seal.found'] = true;
      d.s.flags['clue.oldmap.folded-map'] = true;
      d.s.flags['ferry.copy.place'] = 'ledger';
      d.s.flags['coast.notice'] = 'signal';
      d.s.flags['coast.archive.edition'] = 'timeline';
      enter(d, 'ferry-road');

      inspect(d, 'ferry-departure-catalogue');
      expect(() => prop(d, 'ferry-departure-table')).toThrow();
      expect(() => prop(d, 'ferry-departure-road')).toThrow();
      inspect(d, 'ferry-departure-reading');
      scene(d, 'ferry-departure-table', 'Leave the tag');
      expect(d.s.flags['departure.ferry.tag']).toBeUndefined();
      scene(d, 'ferry-departure-table', 'Take Tova’s blank');
      scene(d, 'ferry-departure-road', 'Set the tag beside the green');
      expect(d.done('departure.ferry.compare')).toBe(false);
      expect(() => prop(d, 'ferry-departure-dispatch')).toThrow();
      scene(d, 'ferry-departure-stair', 'Set the tag beside the oar');
      expect(d.done('departure.ferry.compare')).toBe(true);
      expect(check(prop(d, 'ferry-departure-stair').artOpen?.if, d.s)).toBe(true);
      scene(d, 'ferry-departure-dispatch', chooseFerry);
      expect(d.s.flags['departure.ferry.route']).toBe(ferry);
      expect(d.done('departure.ferry.checked')).toBe(false);
      expect(() => d.run({ type: 'EquipPerspective', keepsake: kit })).toThrow('not earned');
      expect(() => prop(d, ferry === 'paired' ? 'ferry-departure-wenna' : 'ferry-departure-paired')).toThrow();
      scene(d, ferryReceipt, readFerry);
      expect(d.done('departure.ferry.checked')).toBe(true);
      expect(d.s.flags[`keepsake.${kit}`]).toBe(true);
      expect(d.s.journal).toContain('j.departure.ferry');

      reachCoast(d);
      d.run({ type: 'EquipPerspective', keepsake: kit });
      expect(() => prop(d, 'coast-departure-route')).toThrow();
      inspect(d, 'coast-departure-southern-bays');
      d.run({ type: 'EquipPerspective', keepsake: null });
      expect(() => prop(d, 'coast-departure-loan')).toThrow();
      d.run({ type: 'EquipPerspective', keepsake: kit });
      scene(d, 'coast-departure-route', 'Slide the departure strip');
      expect(d.done('departure.archive.compare')).toBe(false);
      expect(() => prop(d, 'coast-departure-place')).toThrow();
      scene(d, 'coast-departure-loan', 'Set the strip against');
      expect(d.done('departure.archive.compare')).toBe(true);
      scene(d, 'coast-departure-place', chooseArchive);
      expect(d.s.flags['departure.archive.route-plan']).toBe(archive);
      expect(d.done('departure.archive.checked')).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: null });
      expect(() => prop(d, archive === 'desk' ? 'coast-departure-cross' : 'coast-departure-desk')).toThrow();
      scene(d, `coast-departure-${archive}`, readArchive);
      expect(d.s.flags['departure.archive.readback']).toBe(archive);
      expect(d.done('departure.archive.checked')).toBe(true);
      expect(d.s.journal).toContain('j.departure.archive');
      expect(d.p.credit).toEqual(startCredit);
      expect(d.s.flags['coast.archive.edition']).toBe('timeline');
      expect(d.s.flags['coast.notice']).toBe('signal');

      enter(d, 'coast-archive-return');
      enter(d, 'coast-nexus-return');
      const portal = MAPS[d.s.mapId].zones.find(({ id }) => id === 'portal');
      expect(portal?.to?.map).toBe('aethelgard.emberford');
      expect(check(portal?.if, d.s)).toBe(true);
      d.s.mapId = portal!.to!.map;
      enter(d, 'ferry-road');
      expect(prop(d, `ferry-departure-archive-${reply}`).text).toContain(message);
      expect(d.s.flags['ferry.copy.place']).toBe('ledger');
      expect(() => prop(d, 'ferry-departure-file-return')).toThrow();
      d.run({ type: 'EquipPerspective', keepsake: kit });
      scene(d, 'ferry-departure-file-return', 'Line up W-17');
      expect(d.s.flags['departure.ferry.clipped']).toBe(true);
      expect(check(prop(d, 'ferry-departure-file-return').artOpen?.if, d.s)).toBe(true);
    });
});
