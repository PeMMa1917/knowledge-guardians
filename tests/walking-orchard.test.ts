import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { earnedResearchReadings } from '../src/domain/specimenReferences';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { grovePeople } from '../src/content/walkingOrchard';
import {
  afterWalk,
  barrowPrint,
  beds,
  comparisonLine,
  countsReady,
  dates,
  delivery,
  editionFace,
  editionNames,
  frostDifference,
  orchardEffects,
  orchardFlag,
  orchardSquare,
  orchardYard,
  publishedReading,
  requests,
  rootCard,
  seasons,
  seasonCount,
  shutterLight,
  type Band,
  type OrchardCommand,
} from '../src/domain/walkingOrchard';
type Move = OrchardCommand extends infer T ? (T extends OrchardCommand ? Omit<T, 'type'> : never) : never;
const act = (d: Driver, cmd: Move) => d.run({ type: 'TendWalkingOrchard', ...cmd });
function setup() {
  const d = new Driver();
  d.s.mapId = orchardYard;
  d.s.objectivesDone.push('forest.arrival');
  return d;
}
function checkBooks(d: Driver) {
  for (const year of seasons)
    for (const bed of beds) for (const date of dates) act(d, { act: 'peek', season: year, bed, date });
  for (const comparison of ['spade', 'frost', 'poster'] as const) act(d, { act: 'join', comparison });
}
function setMask(d: Driver, mask: number) {
  (['yard', 'hours', 'job'] as Band[]).forEach((band, i) => {
    if (mask & (1 << i)) act(d, { act: 'shutter', band });
  });
}
const door = (room: string, name: string) =>
  MAPS[room].interactables.find((p) => p.id === 'walking-grove-' + name)!;
describe('The orchard that got up', () => {
  it('separates unvisited tubs, witnessed losses and missing records, and bounds two springs at matching dates', () => {
    const d = setup();
    expect(rootCard(d.s, 'ash', 'kiln', 'frost')).toBeNull();
    expect(seasonCount(d.s, 'ash', 'frost')).toMatchObject({
      unvisited: 12,
      no: 0,
      absent: 0,
      min: 0,
      max: 12,
    });
    expect(() => act(d, { act: 'join', comparison: 'spade' })).toThrow(/same dated page/);
    act(d, { act: 'join', comparison: 'poster' });
    act(d, { act: 'peek', season: 'ash', bed: 'kiln', date: 'frost' });
    expect(seasonCount(d.s, 'ash', 'frost')).toEqual({
      unvisited: 8,
      yes: 2,
      no: 1,
      absent: 1,
      min: 2,
      max: 11,
    });
    expect(() => act(d, { act: 'join', comparison: 'frost' })).toThrow(/three beds/);
    checkBooks(d);
    expect(countsReady(d.s)).toBe(true);
    expect(seasonCount(d.s, 'ash', 'frost')).toEqual({
      unvisited: 0,
      yes: 4,
      no: 3,
      absent: 5,
      min: 4,
      max: 9,
    });
    expect(seasonCount(d.s, 'ribbon', 'frost')).toEqual({
      unvisited: 0,
      yes: 7,
      no: 3,
      absent: 2,
      min: 7,
      max: 9,
    });
    expect(frostDifference(d.s)).toEqual({ min: -2, max: 5 });
    for (const y of seasons)
      expect(seasonCount(d.s, y, 'planting')).toMatchObject({ yes: 12, min: 12, max: 12 });
    expect(comparisonLine(d.s, 'poster')).toContain('change in the counting rule');
    expect(d.done('grove.springs')).toBe(true);
  });
  it('keeps the four controlled barrow runs outside the worker count and separates a sufficient mechanism from a claim about the missing caller', () => {
    const d = setup();
    expect(() => act(d, { act: 'account', story: 'cart' })).toThrow(/four prints/);
    for (const load of ['leaf', 'bare'] as const)
      for (const boot of ['hanging', 'tied'] as const) {
        act(d, { act: 'load', load });
        act(d, { act: 'boot', boot });
        act(d, { act: 'roll' });
        expect(barrowPrint(load, boot).heels).toBe(boot === 'tied' ? 1 : 0);
        expect(orchardFlag(d.s, 'rolled.' + load + '.' + boot)).toBe(true);
      }
    expect(barrowPrint('bare', 'tied').heels).toBe(barrowPrint('leaf', 'tied').heels);
    act(d, { act: 'account', story: 'open' });
    act(d, { act: 'account', story: 'cart' });
    expect(d.done('grove.wheel')).toBe(true);
    expect(seasonCount(d.s, 'ash', 'frost').unvisited).toBe(12);
  });
  it('keeps every grower’s terms and every small group inside the counting cloth across all twenty-four shutter combinations', () => {
    const d = setup();
    const sizes = [12, 4, 6, 2, 6, 2, 3, 1];
    for (const who of requests)
      for (let mask = 0; mask < 8; mask++) {
        act(d, { act: 'request', who });
        setMask(d, mask);
        const light = shutterLight(d.s);
        expect(light.count).toBe(sizes[mask]);
        expect(light.small).toBe(sizes[mask] < 3);
        const allowed = who === 'canvas' ? !(mask & 1) : who === 'wheels' ? !(mask & 2) : mask === 0;
        expect(light.detail.length === 0).toBe(allowed);
        act(d, { act: 'light' });
        if (allowed && !light.small) {
          act(d, { act: 'reserve', how: 'count' });
          expect(orchardFlag(d.s, 'draftWindow')).toContain(sizes[mask] + ' matching slips');
        } else {
          const before = orchardFlag(d.s, 'draftWindow');
          expect(() => act(d, { act: 'reserve', how: 'count' })).toThrow(/withheld|Too few/);
          expect(orchardFlag(d.s, 'draftWindow')).toBe(before);
        }
        act(d, { act: 'reserve', how: 'closed' });
        expect(orchardFlag(d.s, 'draftWindow')).toBe('The rota stays inside the shade.');
      }
    expect(d.done('grove.shade')).toBe(true);
    expect(JSON.stringify(d.s.adventureDiary)).not.toMatch(/"index":|working hours: early|"job":"carry"/);
  });
  it('earns the NIST reading from a successfully folded rota and keeps unrelated source IDs out of the journal', () => {
    const d = setup();
    act(d, { act: 'light' });
    expect(earnedResearchReadings(d.e.pack, d.s)).toEqual([]);
    act(d, { act: 'reserve', how: 'closed' });
    const entry = d.s.adventureDiary.entries.find((e) => e.event?.key.startsWith('walking-grove:reserve:'))!;
    entry.event!.sourceIds!.push('HIS-GROVE-BELT');
    expect(earnedResearchReadings(d.e.pack, d.s).map((r) => r.key)).toEqual(['HIS-GROVE-ROTA']);
    delete d.s.flags['grove.draftWindow'];
    expect(earnedResearchReadings(d.e.pack, d.s)).toEqual([]);
  });
  it('lets the player hang three defensible readings independently of all three public projects and pursue any later handover', () => {
    const d = setup();
    checkBooks(d);
    const base = structuredClone(d.s);
    for (const pane of ['poster', 'spade', 'frost'] as const)
      for (const route of ['shade', 'parade', 'return'] as const) {
        d.s = structuredClone(base);
        expect(() => act(d, { act: 'pledge', route })).toThrow(/roll|rota/);
        act(d, { act: 'reserve', how: 'closed' });
        expect(() => act(d, { act: 'pledge', route })).toThrow(/witnessed reading/);
        act(d, { act: 'hang', pane });
        act(d, { act: 'pledge', route });
        expect(publishedReading(d.s)).toBe(comparisonLine(d.s, pane));
        expect(check(door(orchardSquare, 'installed-' + route).visibleIf, d.s)).toBe(true);
        expect(
          Object.keys(editionNames).filter((k) =>
            check(door(orchardSquare, 'installed-' + k).visibleIf, d.s),
          ),
        ).toEqual([route]);
        d.s.mapId = orchardSquare;
        d.s.objectivesDone.push('civic.arrival');
        expect(() => act(d, { act: 'answer', route: 'invite' })).toThrow(/different things/);
        act(d, { act: 'visit', who: 'pella' });
        act(d, { act: 'visit', who: 'gresa' });
        expect(delivery[route].gresa).not.toBe(delivery[route].pella);
        for (const answer of ['keep', 'move', 'invite'] as const) {
          act(d, { act: 'answer', route: answer });
          expect(orchardFlag(d.s, 'answer')).toBe(answer);
          expect(afterWalk(route, answer).length).toBeGreaterThan(35);
        }
        expect(d.done('grove.turn')).toBe(true);
      }
    expect(
      new Set(
        (['shade', 'parade', 'return'] as const).flatMap((r) =>
          (['keep', 'move', 'invite'] as const).map((a) => afterWalk(r, a)),
        ),
      ).size,
    ).toBe(9);
  });
  it('keeps an installed edition after later nursery edits and reload, and asks the two walkers back when a new edition is issued', () => {
    const d = setup();
    checkBooks(d);
    act(d, { act: 'hang', pane: 'frost' });
    act(d, { act: 'reserve', how: 'count' });
    act(d, { act: 'pledge', route: 'shade' });
    d.s.mapId = orchardSquare;
    act(d, { act: 'visit', who: 'gresa' });
    act(d, { act: 'visit', who: 'pella' });
    act(d, { act: 'answer', route: 'move' });
    const first = editionFace(d.s);
    d.s.mapId = orchardYard;
    act(d, { act: 'reserve', how: 'closed' });
    act(d, { act: 'hang', pane: 'poster' });
    d.s = JSON.parse(JSON.stringify(d.s));
    expect(editionFace(d.s)).toBe(first);
    expect(publishedReading(d.s)).toContain('possible change');
    act(d, { act: 'pledge', route: 'return' });
    expect(editionFace(d.s)).toBe('The rota stays inside the shade.');
    expect(publishedReading(d.s)).toContain('counting rule');
    expect(orchardFlag(d.s, 'visit.pella')).toBe(false);
    d.s.mapId = orchardSquare;
    expect(() => act(d, { act: 'answer', route: 'move' })).toThrow(/different things/);
    const entries = adventureJournalView(d.e.pack, d.s, []).entries.filter(
      (v) => v.event?.ref === 'walking-grove',
    );
    expect(entries.some((e) => e.text.includes('7 to 9'))).toBe(true);
    expect(entries.some((e) => e.text.includes('twelve planting-night tubs'))).toBe(true);
    expect(entries.some((e) => e.text.includes('I asked Gresa'))).toBe(true);
    expect(entries.every((e) => (e.reflections?.length ?? 0) > 0)).toBe(true);
  });
  it('unlocks the old cartway in both directions only after the boots, singers, chalk, purchased evening and arrival in the Civic Machine', () => {
    const d = setup(),
      from = door(orchardYard, 'cartway'),
      back = door(orchardSquare, 'cartway-back');
    for (const b of beds) act(d, { act: 'track', bed: b });
    expect(d.done('grove.tracks')).toBe(true);
    checkBooks(d);
    act(d, { act: 'hang', pane: 'spade' });
    act(d, { act: 'reserve', how: 'closed' });
    act(d, { act: 'pledge', route: 'parade' });
    expect(check(from.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('civic.arrival');
    expect(check(from.visibleIf, d.s)).toBe(true);
    expect(check(back.visibleIf, d.s)).toBe(true);
    expect(from.to?.map).toBe(orchardSquare);
    expect(back.to?.map).toBe(orchardYard);
    delete d.s.flags['grove.track.bath'];
    expect(check(back.visibleIf, d.s)).toBe(false);
    d.s.mapId = 'civic.dispatch';
    expect(() =>
      orchardEffects(d.s, {
        type: 'TendWalkingOrchard',
        act: 'peek',
        season: 'ash',
        bed: 'steps',
        date: 'frost',
      }),
    ).toThrow(/nursery/);
  });
  it('keeps the Kenyan and Brazilian sources and both returning people with their own voices, providing a conditional memory of the freight-stage story', () => {
    const d = setup();
    for (const [name, id] of Object.entries(grovePeople)) {
      expect(d.e.talkEntry(id, d.s)).toBe('grove.' + name);
      const square = d.e.pack.characters.find((p) => p.id === id)?.localGreeting?.[orchardSquare];
      expect(square).toBe('grove.' + name + '.square');
    }
    expect(d.e.visibleOptions('grove.pella', d.s).some((o) => o.option.next === 'grove.pella.freight')).toBe(
      false,
    );
    d.s.flags['courier.family'] = 'receipt';
    expect(d.e.visibleOptions('grove.pella', d.s).some((o) => o.option.next === 'grove.pella.freight')).toBe(
      true,
    );
    expect(d.e.node('grove.wangari.crew').citationSource).toBe('HIS-GROVE-BELT');
    expect(d.e.node('grove.paulo.seat').citationSource).toBe('HIS-GROVE-DIALOGUE');
    expect(d.e.pack.sources.find((s) => s.id === 'HIS-GROVE-LECTURE')?.mla?.author).toBe('Maathai, Wangari');
    const qs = Object.fromEntries(
      d.e.pack.missions
        .filter((m) => m.id === 'the-orchard-that-got-up' || m.id === 'the-third-turn-of-the-orchard')
        .flatMap((m) => m.objectives.map((o) => [o.id, o.questionWays?.map((q) => q.id)])),
    );
    expect(qs).toEqual({
      'grove.wheel': ['KQ-ROUTE-23'],
      'grove.shade': ['KQ-ROUTE-16'],
      'grove.promise': ['KQ-ROUTE-35'],
      'grove.tracks': ['KQ-ROUTE-22'],
      'grove.springs': ['KQ-ROUTE-25'],
      'grove.turn': ['KQ-ROUTE-02'],
    });
  });
});
