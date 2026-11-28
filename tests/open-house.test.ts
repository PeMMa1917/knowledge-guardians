import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { houseFieldGates, doorPeople } from '../src/content/openHouse';
import { creatureTrails, nightFriends, nightFriendFlag, trailMark } from '../src/domain/nightRegister';
import {
  floorSeam,
  townSeam,
  measureWalk,
  cartPosition,
  cardHook,
  cardStep,
  chairs,
  destinations,
  fieldMemo,
  floorReach,
  houseEffects,
  houseFlag,
  houseGuest,
  houseNote,
  housePorch,
  houseRoom,
  houseSites,
  household,
  issuedHouse,
  lightingLine,
  membership,
  modelFloors,
  nextTile,
  openings,
  pastLamps,
  postedWelcome,
  reached,
  roomGuestLine,
  sight,
  sketch,
  spin,
  stepTile,
  turns,
  type Destination,
  type HouseCommand,
} from '../src/domain/openHouse';
import type { CampaignState } from '../src/domain/types';

type Action = HouseCommand extends infer T ? (T extends HouseCommand ? Omit<T, 'type'> : never) : never;
type Layout = keyof typeof modelFloors;
const act = (d: Driver, c: Action) => d.run({ type: 'FitMiddleDoor', ...c });
const gates = ['m02.o1.arrive', 'sea.arrival', 'voices.arrival'];
function inn() {
  const d = new Driver();
  d.s.mapId = houseRoom;
  d.s.objectivesDone.push(...gates);
  return d;
}
function issue(d: Driver, layout: Layout = 'lunch', purpose: Destination = 'tea') {
  d.s.mapId = houseRoom;
  act(d, { act: 'template', layout });
  act(d, { act: 'chalk', visitor: 'foot' });
  act(d, { act: 'chalk', visitor: 'wheel' });
  act(d, { act: 'issue', purpose });
}
function wheel(d: Driver, stop: Destination) {
  d.s.mapId = houseSites.cart;
  for (const face of floorReach(issuedHouse(d.s)!, 'wheel', cartPosition(d.s)).get(destinations[stop].cell)!)
    act(d, { act: 'step', face });
  act(d, { act: 'park' });
}
function lamps(d: Driver, spot = 1) {
  d.s.mapId = houseSites.light;
  const f = issuedHouse(d.s)!;
  const other = [...floorReach(f, 'foot').keys()].find((i) => sight(f, i).join() !== sight(f, spot).join())!;
  for (const cell of [other, spot]) {
    act(d, { act: 'place', cell });
    act(d, { act: 'light' });
  }
  act(d, { act: 'file' });
}
describe('the inn under the mat', () => {
  it('matches every joining door in both directions, keeps the cart across the grain on its side and distinguishes straight light from a walk', () => {
    for (const floor of Object.values(modelFloors)) {
      for (let tile = 0; tile < 9; tile++) {
        expect(spin(spin(spin(spin(floor, tile, 1), tile, 1), tile, 1), tile, 1)).toBe(floor);
        expect(spin(spin(floor, tile, 1), tile, -1)).toBe(floor);
        for (const [i, face] of turns.entries()) {
          const other = nextTile(floor, tile, face);
          if (other !== undefined) expect(nextTile(floor, other, turns[(i + 2) % 4])).toBe(tile);
        }
        expect(sight(floor, tile).every((i) => floorReach(floor, 'foot', tile).has(i))).toBe(true);
      }
      expect(floorReach(floor, 'foot').size).toBe(9);
      expect(sight(floor, 3).length).toBeLessThan(floorReach(floor, 'foot').size);
    }
    expect(stepTile(modelFloors.lunch, 3, 'east', 'foot')).toBe(4);
    expect(stepTile(modelFloors.lunch, 3, 'east', 'wheel')).toBeUndefined();
    expect(floorReach(modelFloors.lunch, 'wheel').get(5)).toHaveLength(6);
    expect(floorReach(modelFloors.lunch, 'foot').get(5)).toHaveLength(4);
  });
  it('requires both visitors to try the exact draft and keeps the physical floor while a new sketch is turned', () => {
    const d = inn();
    expect(() => act(d, { act: 'issue', purpose: 'tea' })).toThrow(/Walk this plan/);
    issue(d);
    expect(issuedHouse(d.s)).toBe(modelFloors.lunch);
    act(d, { act: 'turn', cell: 0, by: 1 });
    act(d, { act: 'chalk', visitor: 'foot' });
    expect(() => act(d, { act: 'issue', purpose: 'garden' })).toThrow(/flat shoe and the handcart/);
    expect(sketch(d.s)).not.toBe(issuedHouse(d.s));
    expect(membership(d.s)).toBe('Keeper of a spare seat');
  });
  it('keeps the same mathematical path while the east seam changes the physical distance measured by the cart crew', () => {
    const d = inn();
    issue(d);
    const f = issuedHouse(d.s)!;
    const short = measureWalk(f, 'wheel', 'tea', 'folded')!,
      long = measureWalk(f, 'wheel', 'tea', 'stretched')!;
    expect(long.cells).toEqual(short.cells);
    expect(long.steps).toBe(6);
    expect(short.paces).toBe(6);
    expect(long.paces).toBe(9);
    act(d, { act: 'measure', visitor: 'wheel', to: 'tea' });
    act(d, { act: 'seam', seam: 'stretched' });
    act(d, { act: 'measure', visitor: 'foot', to: 'tea' });
    expect(d.done('middlehouse.tape')).toBe(false);
    act(d, { act: 'measure', visitor: 'wheel', to: 'tea' });
    expect(d.done('middlehouse.tape')).toBe(true);
    expect(floorSeam(d.s)).toBe('stretched');
    expect(townSeam(d.s)).toBe('folded');
    act(d, { act: 'issue', purpose: 'tea' });
    wheel(d, 'tea');
    lamps(d);
    d.s.mapId = houseSites.table;
    act(d, { act: 'table', who: 'loft' });
    expect(houseFlag(d.s, 'porchJourney')).toContain('9 paces');
  });
  it('keeps a blocked cart in place, can reverse a loop and reads the end it actually reached', () => {
    const d = inn();
    issue(d);
    d.s.mapId = houseSites.cart;
    expect(() => act(d, { act: 'step', face: 'east' })).toThrow(/raised grain/);
    expect(cartPosition(d.s)).toBe(3);
    expect(() => act(d, { act: 'park' })).toThrow(/where a doorway/);
    act(d, { act: 'step', face: 'south' });
    act(d, { act: 'step', face: 'north' });
    expect(houseFlag(d.s, 'cart.path')).toBe('3');
    act(d, { act: 'step', face: 'south' });
    act(d, { act: 'undo' });
    expect(cartPosition(d.s)).toBe(3);
    wheel(d, 'garden');
    expect(fieldMemo(d.s).r).toBe('garden');
    expect(d.done('middlehouse.cart')).toBe(true);
    expect(membership(d.s)).toBe('House runner');
  });
  it('requires two geometrically different, tried hooks and another journey after reissuing the floor', () => {
    const d = inn();
    issue(d);
    d.s.mapId = houseSites.light;
    act(d, { act: 'light' });
    act(d, { act: 'light' });
    expect(pastLamps(d.s)).toEqual([3]);
    expect(() => act(d, { act: 'file' })).toThrow(/different lines/);
    const f = issuedHouse(d.s)!;
    lamps(d, 1);
    const seen = lightingLine(f, 1);
    expect(seen).not.toBe(lightingLine(f, 5));
    d.s.mapId = houseSites.table;
    expect(() => act(d, { act: 'table', who: 'tea' })).toThrow(/actual cart/);
    wheel(d, 'garden');
    expect(membership(d.s)).toBe('Neighbour with two keys');
    d.s.mapId = houseSites.table;
    act(d, { act: 'table', who: 'loft' });
    const receipt = postedWelcome(d.s);
    expect(receipt).toContain(seen);
    expect(receipt).toContain('back garden');
    issue(d);
    expect(postedWelcome(d.s)).toBe(receipt);
    issue(d, 'song', 'loft');
    expect(fieldMemo(d.s).r).toBeUndefined();
    expect(pastLamps(d.s)).toEqual([]);
    expect(fieldMemo(d.s).spot).toBeUndefined();
    expect(houseFlag(d.s, 'porchStop')).toBe('garden');
    expect(houseFlag(d.s, 'porchLamp')).toBe(seen);
    expect(membership(d.s)).toBe('Keeper of the middle door');
  });
  it.each(Object.entries(modelFloors))(
    'takes both signed arrivals in %s back to their actual homes',
    (layout, f) => {
      for (const to of Object.keys(destinations) as Destination[]) {
        if (!openings(f, destinations[to].cell).includes(destinations[to].edge)) continue;
        const d = inn();
        issue(d, layout as Layout, to);
        wheel(d, to);
        expect(reached(f, cartPosition(d.s))).toBe(to);
        lamps(d, destinations[to].cell);
        d.s.mapId = houseSites.table;
        act(d, { act: 'table', who: to });
        const porch = MAPS[housePorch],
          prop = porch.interactables.find((p) => p.id === 'middlehouse-porch-' + to)!;
        expect(check(prop.visibleIf, d.s)).toBe(true);
        expect(
          porch.interactables.filter((p) => p.game === 'middlehouse-porch' && check(p.visibleIf, d.s)),
        ).toHaveLength(1);
        expect(
          check(MAPS[houseRoom].interactables.find((p) => p.id === 'middlehouse-to-porch')!.visibleIf, d.s),
        ).toBe(true);
      }
    },
  );
  it('hands over nine distinct evenings, keeps the public receipts and gives the same standing to every judgement', () => {
    const endings = new Set(),
      titles = new Set();
    for (const purpose of Object.keys(destinations) as Destination[])
      for (const who of Object.keys(destinations) as Destination[]) {
        const d = inn();
        issue(d, 'lunch', purpose);
        wheel(d, 'tea');
        lamps(d);
        d.s.mapId = houseSites.table;
        act(d, { act: 'table', who });
        expect(d.done('middlehouse.night')).toBe(true);
        endings.add(houseFlag(d.s, 'houseEcho'));
        titles.add(membership(d.s));
        const entries = adventureJournalView(d.e.pack, d.s, []).entries.filter(
          (j) => j.event?.ref === 'middlehouse',
        );
        expect(entries.some((e) => e.text.includes(String(houseFlag(d.s, 'houseEcho'))))).toBe(true);
        expect(
          entries.every(
            (e) => Object.keys(diaryQuestions(e)).length >= 1 && Object.keys(diaryQuestions(e)).length <= 3,
          ),
        ).toBe(true);
      }
    expect(endings.size).toBe(9);
    expect(titles.size).toBe(1);
  });
  it('gives all 240 earned residents three distinct jobs and keeps each travelling companion out of the room until it comes back', () => {
    const d = inn();
    expect(nightFriends).toHaveLength(240);
    for (const f of nightFriends) {
      const s: CampaignState = { ...d.s, flags: { [nightFriendFlag(f)]: true } };
      const run = (a: Action) => {
        for (const e of houseEffects(s, { type: 'FitMiddleDoor', ...a }))
          if ('setFlag' in e) s.flags[e.setFlag] = e.value;
      };
      expect(() =>
        houseEffects({ ...s, flags: {} }, { type: 'FitMiddleDoor', act: 'seat', guest: f.id, chair: 'mat' }),
      ).toThrow(/own register/);
      for (const chair of chairs) {
        run({ act: 'seat', guest: f.id, chair });
        expect(household(s)).toHaveLength(1);
        s.flags['lor.out'] = f.id;
        expect(household(s)[0].here).toBe(false);
        expect(() => run({ act: 'hear', chair })).toThrow(/when they are home/);
        s.flags['lor.out'] = '';
        run({ act: 'hear', chair });
        expect(houseNote(s, chair)?.id).toBe(f.id);
        expect(roomGuestLine(s, f, chair)).toContain(f.name);
      }
      const pair = creatureTrails.get(f.id)!;
      expect(roomGuestLine(s, f, 'hearth')).toContain('The far work can stay a surprise.');
      for (const w of pair) s.flags[trailMark(f, w)] = w.id + '|' + f.family.mode + '|0|' + f.id;
      for (const w of pair) expect(roomGuestLine(s, f, 'hearth')).toContain(w.title);
      run({ act: 'clear', chair: 'hearth' });
      expect(household(s)).toHaveLength(0);
      expect(s.flags[nightFriendFlag(f)]).toBe(true);
    }
  });
  it('sends a resident’s actual next step and sightline into town and reopens the hearth version independently of the issued version', () => {
    const d = inn(),
      [a, b, c] = nightFriends;
    for (const f of [a, b, c]) d.s.flags[nightFriendFlag(f)] = true;
    issue(d);
    for (const [i, chair] of chairs.entries()) {
      act(d, { act: 'seat', guest: [a, b, c][i].id, chair });
      act(d, { act: 'hear', chair });
    }
    expect(d.done('middlehouse.guests')).toBe(true);
    expect(houseGuest(d.s, 'sill')?.id).toBe(b.id);
    d.s.mapId = houseSites.cart;
    act(d, { act: 'route-note', to: 'tea' });
    expect(cardStep(d.s, 'tea')).toHaveLength(6);
    for (const face of cardStep(d.s, 'tea')!) act(d, { act: 'step', face });
    expect(cardStep(d.s, 'tea')).toEqual([]);
    expect(cardStep(d.s, 'loft')).toBeUndefined();
    d.s.mapId = houseSites.light;
    act(d, { act: 'lamp-note', to: 'garden' });
    const spot = cardHook(d.s, 'garden')!;
    expect(sight(modelFloors.lunch, spot)).toContain(destinations.garden.cell);
    expect(pastLamps(d.s)).toEqual([]);
    issue(d, 'song', 'tea');
    act(d, { act: 'unfold' });
    expect(sketch(d.s)).toBe(modelFloors.lunch);
    expect(issuedHouse(d.s)).toBe(modelFloors.song);
  });
  it('puts the historical guests in both places, attaches the public readings to the visits and keeps the new landing closed before a gathering', () => {
    const d = inn(),
      room = MAPS[houseRoom];
    expect(check(room.interactables.find((p) => p.id === 'middlehouse-to-porch')!.visibleIf, d.s)).toBe(
      false,
    );
    for (const [id, site] of [
      [doorPeople.jane, houseSites.cart],
      [doorPeople.zaha, houseSites.light],
    ]) {
      const npc = d.e.pack.characters.find((n) => n.id === id)!;
      for (const map of [houseRoom, site]) {
        expect(MAPS[map].npcs.some((n) => n.id === id)).toBe(true);
        d.s.mapId = map;
        expect(d.e.talkEntry(id, d.s)).toBe(npc.localGreeting![map]);
      }
    }
    d.s.mapId = houseRoom;
    d.talk(doorPeople.zaha, 'fire station');
    d.talk(doorPeople.jane, 'Walk with the kettle');
    expect(d.e.node('middlehouse.zaha.vitra').text).toContain('Weil am Rhein');
    for (const key of ['HADID', 'JACOBS', 'WALK'])
      expect(d.e.pack.sources.find((s) => s.id === 'HIS-HOUSE-' + key)?.mla).toBeDefined();
    expect(Object.values(houseFieldGates).every((g) => !check(g, d.s))).toBe(true);
    issue(d);
    expect(Object.values(houseFieldGates).every((g) => check(g, d.s))).toBe(true);
  });
});
