import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { adventureJournalView } from '../src/domain/adventureJournal';
import {
  allStamped,
  cards,
  clockDock,
  clockPosition,
  clockRoom,
  compareLeaves,
  tracing,
  furniture,
  impression,
  mothOrder,
  planFor,
  plansRead,
  proposals,
  quays,
  quayReading,
  signedFloorPlan,
  stamped,
  tideEffects,
  turns,
  type Card,
  type TideCommand,
} from '../src/domain/tideClock';
type Move = TideCommand extends infer T ? (T extends TideCommand ? Omit<T, 'type'> : never) : never;
function dock() {
  const d = new Driver();
  d.s.mapId = clockRoom;
  d.s.flags['wire.everReceived'] = true;
  d.s.objectivesDone.push('island.arrival');
  return d;
}
const act = (d: Driver, move: Move) => d.run({ type: 'WorkTideClock', ...move });
function turnsTo(d: Driver, phase: number) {
  while (clockPosition(d.s).phase !== phase) act(d, { act: 'wait' });
}
function scope(d: Driver) {
  turnsTo(d, 2);
  act(d, { act: 'go', quay: 'slip' });
  act(d, { act: 'listen' });
  act(d, { act: 'stamp' });
  turnsTo(d, 5);
  act(d, { act: 'go', quay: 'rail' });
  act(d, { act: 'listen' });
  act(d, { act: 'stamp' });
}
function orders<T>(items: readonly T[]): T[][] {
  return items.flatMap((a, i) =>
    items.flatMap((b, j) => (i === j ? [] : [[a, b, items.find((v) => v !== a && v !== b)!]])),
  );
}
function setOrder(d: Driver, wanted: Card[]) {
  for (const [dest, card] of wanted.entries())
    while (mothOrder(d.s).indexOf(card) > dest) act(d, { act: 'reorder', card, direction: 'earlier' });
}
describe('the quarter that comes back', () => {
  it('keeps the five playable question routes attached to the installed side story', () => {
    const d = dock(),
      job = d.e.pack.missions.find((m) => m.id === 'the-quarter-that-comes-back')!;
    const routes = Object.fromEntries(
      job.objectives.map((o) => [o.id, o.questionWays?.map((link) => link.id)]),
    );
    expect(routes).toMatchObject({
      'quarter.watch': ['KQ-ROUTE-12'],
      'quarter.moth': ['KQ-ROUTE-32'],
      'quarter.plan': ['KQ-ROUTE-35'],
      'quarter.leaves': ['KQ-ROUTE-34'],
      'quarter.after': ['KQ-ROUTE-02'],
    });
  });
  it('keeps the phase on the observed pad, clears the loose take on rewind, and preserves the stamped hearing and two-way forgotten stair', () => {
    const d = dock(),
      stair = MAPS[clockRoom].interactables.find((p) => p.id === 'quarter-hidden-step')!,
      other = MAPS['sea.listening-wheel'].interactables.find((p) => p.id === 'quarter-sea-step')!;
    expect(check(stair.visibleIf, d.s)).toBe(false);
    expect(() => act(d, { act: 'stamp' })).toThrow(/tube/);
    scope(d);
    expect(impression(d.s)).toEqual({ quay: 'rail', phase: 5 });
    expect(check(stair.visibleIf, d.s)).toBe(false);
    act(d, { act: 'wait' });
    expect(clockPosition(d.s)).toMatchObject({
      quay: 'awning',
      phase: 0,
      lap: 1,
    });
    expect(impression(d.s)).toBeNull();
    expect(stamped(d.s, 'slip', 2)).toBe(true);
    expect(stamped(d.s, 'rail', 5)).toBe(true);
    expect(d.done('quarter.watch')).toBe(true);
    expect(check(stair.visibleIf, d.s)).toBe(true);
    expect(check(other.visibleIf, d.s)).toBe(true);
    expect(stair.to?.map).toBe('sea.listening-wheel');
    expect(other.to?.map).toBe(clockRoom);
    const notes = adventureJournalView(d.e.pack, d.s, []).entries.filter(
      (v) => v.event?.ref === 'tide-clock',
    );
    expect(notes.some((v) => v.text.includes('early') || v.text.includes('deck crew'))).toBe(true);
    expect(
      notes.some((v) => v.text.includes('first hour') || v.text.includes('stamps were still in my pocket')),
    ).toBe(true);
  });
  it('lets a player record all eighteen places and times, including a genuinely quiet hearing with no inferred workers', () => {
    const d = dock();
    for (let phase = 0; phase < 6; phase++) {
      for (const quay of quays) {
        act(d, { act: 'go', quay });
        act(d, { act: 'listen' });
        act(d, { act: 'stamp' });
      }
      act(d, { act: 'wait' });
    }
    expect(allStamped(d.s)).toHaveLength(18);
    expect(quayReading(1, 'slip').people).toEqual([]);
    expect(quayReading(2, 'slip').people).toContain('Siv');
    expect(quayReading(5, 'rail').people).toContain('Joss');
    expect(new Set(quays.flatMap((q) => turns.map((_, phase) => quayReading(phase, q).line))).size).toBe(18);
  });
  it('performs all six programmes in both directions exactly as stepped by hand, including a first stamp on an empty pad', () => {
    const seen = new Set<string>();
    for (const order of orders(cards))
      for (const reverse of [false, true]) {
        const d = dock();
        setOrder(d, order);
        if (reverse) act(d, { act: 'reverse' });
        const expected = new Driver();
        expected.s = structuredClone(d.s);
        act(d, { act: 'round' });
        for (let i = 0; i < 18; i++) act(expected, { act: 'step' });
        expect(allStamped(d.s)).toEqual(allStamped(expected.s));
        expect(clockPosition(d.s)).toEqual(clockPosition(expected.s));
        expect(impression(d.s)).toEqual(impression(expected.s));
        seen.add(JSON.stringify(allStamped(d.s)));
        if (order.join('.') !== cards.join('.')) expect(d.done('quarter.moth')).toBe(true);
      }
    expect(seen.size).toBeGreaterThan(3);
    const d = dock();
    act(d, { act: 'reorder', card: 'stamp', direction: 'earlier' });
    act(d, { act: 'reorder', card: 'stamp', direction: 'earlier' });
    act(d, { act: 'step' });
    expect(d.s.flags['tideclock.mothNote']).toBe('blank');
    expect(allStamped(d.s)).toEqual([]);
  });
  it('allows all six fittings plans once both crews walk the same layout, and keeps the issued copy through edits, recovery and both later encounters', () => {
    const d = dock();
    scope(d);
    const endings = new Set<string>();
    for (const order of orders(furniture)) {
      d.s.mapId = clockRoom;
      for (const [i, f] of order.entries()) act(d, { act: 'place', fixture: f, quay: quays[i] });
      act(d, { act: 'try', team: 'crew' });
      act(d, { act: 'try', team: 'pilots' });
      act(d, { act: 'issue' });
      expect(signedFloorPlan(d.s)).toBe(true);
      expect(planFor(d.s, true)).toEqual(order);
      d.s = JSON.parse(JSON.stringify(d.s));
      const old = d.s.flags['tideclock.issued'];
      act(d, { act: 'place', fixture: order[1], quay: quays[0] });
      expect(d.s.flags['tideclock.issued']).toBe(old);
      expect(() => act(d, { act: 'issue' })).toThrow(/both shifts/);
      d.s.mapId = clockDock;
      for (const team of ['crew', 'pilots'] as const) act(d, { act: 'read', team });
      expect(d.done('quarter.after')).toBe(true);
      const reached = plansRead(order);
      endings.add(JSON.stringify(reached));
      expect(
        adventureJournalView(d.e.pack, d.s, []).entries.some((e) => e.text.includes(reached.pilots)),
      ).toBe(true);
    }
    expect(endings.size).toBe(6);
  });
  it('requires two genuinely different, fully walked layouts and preserves conflicting access criteria in two independent readings', () => {
    const d = dock();
    scope(d);
    const walk = () => {
      act(d, { act: 'try', team: 'crew' });
      act(d, { act: 'try', team: 'pilots' });
    };
    expect(() => act(d, { act: 'trace', leaf: 'blue' })).toThrow(/both shifts/);
    expect(() => act(d, { act: 'compare', promise: 'mark' })).toThrow(/one blue/);
    act(d, { act: 'proposal', team: 'crew' });
    walk();
    act(d, { act: 'trace', leaf: 'blue' });
    act(d, { act: 'trace', leaf: 'rust' });
    expect(() => act(d, { act: 'compare', promise: 'mark' })).toThrow(/same floor/);
    act(d, { act: 'proposal', team: 'pilots' });
    expect(() => act(d, { act: 'trace', leaf: 'rust' })).toThrow(/both shifts/);
    walk();
    act(d, { act: 'trace', leaf: 'rust' });
    d.s = JSON.parse(JSON.stringify(d.s));
    expect(tracing(d.s, 'blue')).toEqual(proposals.crew);
    expect(tracing(d.s, 'rust')).toEqual(proposals.pilots);
    act(d, { act: 'compare', promise: 'rest' });
    act(d, { act: 'compare', promise: 'mark' });
    expect(d.done('quarter.leaves')).toBe(false);
    act(d, { act: 'compare', promise: 'shelter' });
    expect(d.done('quarter.leaves')).toBe(true);
    expect(compareLeaves(d.s, 'mark')).toMatch(/blue.*one plank away.*rust.*within reach/s);
    expect(compareLeaves(d.s, 'shelter')).toMatch(/blue.*within reach.*rust.*one plank away/s);
    expect(compareLeaves(d.s, 'rest')).toMatch(/blue.*within reach.*rust.*two planks away/s);
    act(d, { act: 'place', fixture: 'bench', quay: 'rail' });
    expect(tracing(d.s, 'blue')).toEqual(proposals.crew);
    const texts = adventureJournalView(d.e.pack, d.s, []).entries.map((v) => v.text);
    expect(texts.some((line) => line.includes('Ivo asks') && line.includes('one plank away'))).toBe(true);
  });
  it('takes either crew proposal, preserves the record of a signed walk, and refuses a stale or unknown saved plan', () => {
    const d = dock();
    act(d, { act: 'proposal', team: 'crew' });
    expect(planFor(d.s)).toEqual(proposals.crew);
    expect(() => act(d, { act: 'try', team: 'crew' })).toThrow(/slipway/);
    scope(d);
    act(d, { act: 'try', team: 'crew' });
    act(d, { act: 'proposal', team: 'pilots' });
    act(d, { act: 'try', team: 'pilots' });
    expect(() => act(d, { act: 'issue' })).toThrow(/both shifts/);
    act(d, { act: 'try', team: 'crew' });
    act(d, { act: 'issue' });
    d.s.mapId = clockDock;
    act(d, { act: 'read', team: 'crew' });
    const last = d.s.flags['tideclock.readPlan.crew'];
    d.s.flags['tideclock.issued'] = 'unknown|bench|board';
    expect(signedFloorPlan(d.s)).toBe(false);
    expect(() => act(d, { act: 'read', team: 'pilots' })).toThrow(/signed/);
    expect(d.s.flags['tideclock.readPlan.crew']).toBe(last);
    d.s.mapId = 'nexus.archive';
    expect(() => tideEffects(d.s, { type: 'WorkTideClock', act: 'listen' })).toThrow(/pier/);
  });
});
