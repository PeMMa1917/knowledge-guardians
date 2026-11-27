import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { CALLBOARD_CASES } from '../src/content/callboardCases';
import { ferryCommissions } from '../src/content/ferryCommissions';
import {
  activePrint,
  ferryEffects,
  ferryMap,
  ferrySheets,
  moon,
  printedSailing,
  shoreMap,
  turnWheel,
  wheelPose,
  windows,
  type FerryCommand,
  type FerrySheet,
} from '../src/domain/pictureFerry';
import {
  billEffects,
  billIdentity,
  billOrder,
  billParts,
  heardPages,
  slotSheet,
  type BillPart,
} from '../src/domain/ferryBill';

function turn(d: Driver, slug: string, ...actions: FerryCommand['action'][]) {
  for (const action of actions)
    d.run({ type: 'TurnPictureFerry', slug, action });
}
function cross(d: Driver, sheet: FerrySheet, route: 'sail' | 'moor' = 'sail') {
  if (sheet.item) d.s.inventory[sheet.item] = 1;
  d.s.mapId = ferryMap;
  turn(d, sheet.slug, 'fit', 'rail', 'bunk', route);
}
function arrange(d: Driver, part: BillPart, sheet: FerrySheet) {
  d.run({ type: 'HangFerryPrint', part, slug: sheet.slug });
}
describe('the two windows on the picture ferry', () => {
  it('has six arrangements and reversible moves, with a distinct leaf in each of the two windows and the fold', () => {
    const poses = Array.from({ length: 6 }, (_, i) => i);
    expect(new Set(poses.map((p) => JSON.stringify(windows(p)))).size).toBe(6);
    for (const p of poses) {
      expect(new Set(Object.values(windows(p))).size).toBe(3);
      expect(turnWheel(turnWheel(turnWheel(p, 'turn'), 'turn'), 'turn')).toBe(
        p,
      );
      const rev = turnWheel(p, 'reverse');
      expect(windows(rev).rail).toBe(windows(p).rail);
      expect(windows(rev).bunk).toBe(windows(p).inside);
      expect(turnWheel(rev, 'reverse')).toBe(p);
    }
    for (const p of [-1, 7, NaN, 1.2]) expect(() => windows(p)).toThrow();
  });
  it('reaches the gangway and both branches through real rooms and local conversations', () => {
    const d = new Driver();
    const pier = MAPS[shoreMap],
      boat = MAPS[ferryMap],
      gallery = MAPS['stage.gallery'];
    expect(
      pier.interactables.find((p) => p.id === 'picture-ferry-gangway')?.to?.map,
    ).toBe(ferryMap);
    const jobs = boat.interactables.filter(
      (p) => p.game === 'picture-ferry-wheel',
    );
    expect(
      jobs.find((p) => p.id === 'picture-ferry-print-case')?.visibleIf,
    ).toBeDefined();
    for (const id of ['ferry-tova', 'callboard-reader', 'picture-boy']) {
      expect(boat.npcs.some((n) => n.id === id)).toBe(true);
      d.s.mapId = ferryMap;
      expect(d.e.talkEntry(id, d.s)).toMatch(/^picture-ferry\./);
    }
    for (const route of ['sail', 'moor'] as const) {
      cross(d, ferrySheets[0], route);
      expect(
        boat.interactables.filter(
          (p) => p.to?.map === gallery.id && check(p.visibleIf, d.s),
        ).length,
      ).toBe(1);
      expect(
        gallery.interactables.filter(
          (p) =>
            p.id.startsWith('picture-ferry-playbill') &&
            check(p.visibleIf, d.s),
        ).length,
      ).toBe(1);
    }
  });
  it('restores an unfinished view and requires both windows at the chosen setting before departure', () => {
    const d = new Driver();
    d.s.mapId = ferryMap;
    expect(() => turn(d, moon, 'rail')).toThrow(/Fit/);
    turn(d, moon, 'fit', 'turn', 'rail');
    d.s = JSON.parse(JSON.stringify(d.s));
    expect(activePrint(d.s).slug).toBe(moon);
    expect(wheelPose(d.s, moon)).toBe(1);
    expect(() => turn(d, moon, 'sail')).toThrow(/both/);
    turn(d, moon, 'bunk', 'reverse');
    expect(() => turn(d, moon, 'moor')).toThrow(/both/);
    turn(d, moon, 'rail', 'bunk', 'moor', 'turn');
    expect(printedSailing(d.s, ferrySheets[0])?.pose).toBe(4);
    expect(wheelPose(d.s, moon)).toBe(5);
    d.s.mapId = shoreMap;
    turn(d, moon, 'unfold');
    expect(d.s.flags['picture-ferry.real-receipt']).toBeUndefined();
    expect(
      d.s.adventureDiary.entries
        .filter((e) => e.event?.ref === 'ferry.paper-moon')
        .every((e) => !e.event?.sourceIds?.length),
    ).toBe(true);
    expect(() => turn(d, moon, 'turn')).toThrow(/aboard/);
  });
  it('takes every signed print ashore with its own object, named source, individual commission and two accessible outcomes', () => {
    expect(ferrySheets).toHaveLength(CALLBOARD_CASES.length + 1);
    expect(
      new Set(Object.values(ferryCommissions).map((w) => w.request)).size,
    ).toBe(ferrySheets.length);
    expect(
      new Set(Object.values(ferryCommissions).map((w) => w.answer)).size,
    ).toBe(ferrySheets.length);
    for (const sheet of ferrySheets.filter((s) => s.item)) {
      const d = new Driver();
      d.s.mapId = ferryMap;
      expect(() =>
        ferryEffects(d.s, {
          type: 'TurnPictureFerry',
          action: 'fit',
          slug: sheet.slug,
        }),
      ).toThrow(/signed/);
      for (const [route, reply] of [
        ['moor', 'unfold'],
        ['sail', 'hear'],
      ] as const) {
        cross(d, sheet, route);
        expect(d.s.inventory[sheet.item!]).toBe(1);
        d.s.mapId = shoreMap;
        turn(d, sheet.slug, reply);
        const receipt = d.s.adventureDiary.entries.find((e) =>
          e.event?.key.startsWith(
            'picture-ferry:' + sheet.slug + ':receipt:' + route,
          ),
        );
        expect(receipt?.event?.sourceIds).toEqual([sheet.source]);
        expect(receipt?.text).toContain(ferryCommissions[sheet.slug].answer);
        expect(d.s.flags['picture-ferry.' + sheet.slug + '.hand']).toBe(reply);
        expect(d.s.objectivesDone).toContain('picture-ferry.returned');
      }
    }
  }, 120000);
  it('keeps a three-object bill distinct, replaces and moves a single sheet, and resumes halfway through the performance', () => {
    const d = new Driver(),
      [a, b, c, e] = ferrySheets.slice(1, 5);
    for (const sh of [a, b, c, e]) cross(d, sh);
    d.s.mapId = shoreMap;
    turn(d, a.slug, 'hear');
    d.s.mapId = ferryMap;
    expect(() =>
      billEffects(d.s, { type: 'HangFerryPrint', slug: moon, part: 'call' }),
    ).toThrow(/signed/);
    arrange(d, 'call', a);
    arrange(d, 'ticket', a);
    expect(slotSheet(d.s, 'call')).toBeUndefined();
    expect(() => d.run({ type: 'OpenFerryBill', first: 'rail' })).toThrow(
      /three/,
    );
    arrange(d, 'call', b);
    arrange(d, 'afterword', c);
    arrange(d, 'call', e);
    expect(d.s.flags['picture-bill.replaced']).toBe(true);
    d.run({ type: 'OpenFerryBill', first: 'bunk' });
    const before = billIdentity(d.s, true);
    expect(billOrder(d.s)).toEqual(['afterword', 'call', 'ticket']);
    arrange(d, 'call', b);
    expect(billIdentity(d.s, true)).toBe(before);
    const ids = billParts.map((p) => slotSheet(d.s, p, true)?.source);
    d.s.mapId = 'stage.gallery';
    d.run({ type: 'HearFerryBill', action: 'turn' });
    d.run({ type: 'HearFerryBill', action: 'turn' });
    d.s = JSON.parse(JSON.stringify(d.s));
    expect(heardPages(d.s)).toBe(2);
    expect(d.s.objectivesDone).not.toContain('picture-ferry.encore');
    d.run({ type: 'HearFerryBill', action: 'turn' });
    expect(d.s.objectivesDone).toContain('picture-ferry.encore');
    expect(
      d.s.adventureDiary.entries
        .filter((e) => e.event?.key.startsWith('picture-bill:heard:'))
        .map((e) => e.event?.sourceIds?.[0])
        .sort(),
    ).toEqual(ids.sort());
    expect(() => d.run({ type: 'HearFerryBill', action: 'turn' })).toThrow(
      /last page/,
    );
    d.run({ type: 'HearFerryBill', action: 'reopen' });
    expect(heardPages(d.s)).toBe(0);
    d.s.mapId = ferryMap;
    d.run({ type: 'OpenFerryBill', first: 'rail' });
    expect(billIdentity(d.s, true)).not.toBe(before);
    expect(billOrder(d.s)).toEqual(billParts);
    expect(heardPages(d.s)).toBe(0);
  });
});
