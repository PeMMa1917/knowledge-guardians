import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { KUNIT_KEY } from '../src/content/turningTable';
import { riverPeople } from '../src/content/riverNames';
import {
  letterMask,
  markEffects,
  markFlag,
  stampedText,
  unpacked,
  type MarkCommand,
} from '../src/domain/riverPostmark';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { PERSPECTIVE_FLAG, carryFlag, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { earnedResearchReadings } from '../src/domain/specimenReferences';
import { diaryQuestions } from '../src/domain/diaryReflection';
import {
  sources,
  contributors,
  editionOf,
  landings,
  namesLane,
  namesQuay,
  places,
  proposed,
  readersInBlock,
  releases,
  riverDiary,
  riverFlag,
  sealedWalks,
  walked,
  walkResult,
  warmfinTrail,
  type NameForm,
  type RiverCommand,
  type Water,
} from '../src/domain/riverNames';
type Move = RiverCommand extends infer T ? (T extends RiverCommand ? Omit<T, 'type'> : never) : never;
const act = (d: Driver, move: Move) => d.run({ type: 'WalkRiverNames', ...move });
function enter(d: Driver, map: string) {
  d.s.mapId = map;
  d.run({ type: 'VisitPlace', name: MAPS[map].name });
}
const routes: Record<Water, number[]> = { ebb: [10, 11, 12], flood: [16, 17, 18] };
function sew(d: Driver, water: Water, steps = routes[water]) {
  act(d, { act: 'water', water });
  act(d, { act: 'clear' });
  for (const cell of steps) act(d, { act: 'step', cell });
  act(d, { act: 'walk' });
}
function commission(d: Driver, form: NameForm = 'paired') {
  enter(d, namesLane);
  for (const water of landings) {
    sew(d, water);
    act(d, { act: 'hear', reader: water === 'ebb' ? 'emlet' : 'rialla' });
    act(d, { act: 'offer', form });
    act(d, { act: 'map', scale: 'block' });
    act(d, { act: 'simulate' });
  }
}
describe('the two addresses and the people who can change them', () => {
  it('keeps low and high water threads separate, permits a failed delivery and lets the skate help find a dry way back', () => {
    const d = new Driver();
    enter(d, namesLane);
    expect(() => act(d, { act: 'step', cell: 12 })).toThrow(/next square/);
    expect(() => act(d, { act: 'step', cell: Infinity })).toThrow();
    expect(() => act(d, { act: 'back' })).toThrow();
    sew(d, 'flood', [10, 11, 12]);
    expect(walkResult(walked(d.s), 'flood').text).toContain('Water covers Reed Stair');
    expect(d.done('rivernames.walks')).toBe(false);
    expect(warmfinTrail(d.s)).toContain('back past Reed Stair');
    sew(d, 'ebb');
    act(d, { act: 'water', water: 'flood' });
    expect(walked(d.s)).toEqual([15, 10, 11, 12]);
    act(d, { act: 'clear' });
    expect(warmfinTrail(d.s)).toContain('Lower Walk');
    for (const cell of routes.flood) act(d, { act: 'step', cell });
    expect(() => act(d, { act: 'step', cell: 17 })).toThrow(/Lift/);
    act(d, { act: 'walk' });
    expect(d.done('rivernames.walks')).toBe(true);
    const event = d.s.adventureDiary.entries.find((x) =>
      x.event?.key.includes('walk.flood.15-10-11-12'),
    )!;
    expect(event.text).toContain('Water covers');
    expect(Object.keys(diaryQuestions(event))).toHaveLength(2);
  });
  it('counts individual doors for each scale and tide, so the same public block can reveal a single receiving household', () => {
    expect(readersInBlock('ebb', 'block')).toEqual([12, 13]);
    expect(readersInBlock('flood', 'block')).toEqual([13]);
    expect(readersInBlock('ebb', 'door')).toEqual([13]);
    expect(readersInBlock('flood', 'district')).toEqual([6, 8, 13, 19]);
    const d = new Driver();
    enter(d, namesLane);
    act(d, { act: 'map', scale: 'block' });
    act(d, { act: 'simulate' });
    act(d, { act: 'simulate' });
    expect(d.done('rivernames.smallblock')).toBe(false);
    act(d, { act: 'water', water: 'flood' });
    act(d, { act: 'simulate' });
    expect(d.done('rivernames.smallblock')).toBe(true);
  });
  it('leaves a refused pin with its first author and requires each walker to sign the actual proposal and walk', () => {
    const d = new Driver();
    commission(d, 'pin');
    expect(contributors(d.s)).toEqual(['emlet', 'rialla']);
    expect(riverFlag(d.s, 'refusedPin')).toBe(true);
    expect(proposed(d.s)).toBeUndefined();
    expect(() => act(d, { act: 'release', release: 'window' })).toThrow(/both walkers/);
    act(d, { act: 'offer', form: 'paired' });
    act(d, { act: 'water', water: 'ebb' });
    act(d, { act: 'offer', form: 'thread' });
    expect(proposed(d.s)).toBeUndefined();
    act(d, { act: 'offer', form: 'paired' });
    expect(proposed(d.s)).toBe('paired');
    sew(d, 'ebb', [16, 17, 12]);
    expect(proposed(d.s)).toBeUndefined();
    act(d, { act: 'offer', form: 'paired' });
    expect(proposed(d.s)).toBe('paired');
    act(d, { act: 'leaf', leaf: 'names' });
    expect(d.done('rivernames.placename')).toBe(false);
    act(d, { act: 'leaf', leaf: 'plan' });
    expect(d.done('rivernames.placename')).toBe(true);
  });
  it.each(releases)(
    'carries the signed %s edition across chapters, preserves the routes after corrections and leaves different work to its recipients',
    (release) => {
      const d = new Driver();
      commission(d, 'thread');
      if (release === 'district') {
        expect(() => act(d, { act: 'release', release })).toThrow(/district stamp/);
        act(d, { act: 'map', scale: 'district' });
        act(d, { act: 'simulate' });
      }
      act(d, { act: 'release', release });
      expect(editionOf(d.s)).toBe(release);
      const before = sealedWalks(d.s);
      expect(d.done('rivernames.mapmakers')).toBe(false);
      act(d, { act: 'leaf', leaf: 'names' });
      expect(d.done('rivernames.mapmakers')).toBe(true);
      expect(before).toEqual([
        'Low water · West Rope → Reed Stair → Stone Lip → Old Oven',
        'High water · West Rope → Lower Walk → Ferry Ring → Red Window',
      ]);
      expect(() => act(d, { act: 'receive' })).toThrow(/letter quay/);
      sew(d, 'ebb', [16, 17, 12]);
      expect(sealedWalks(d.s)).toEqual(before);
      enter(d, namesQuay);
      expect(() => act(d, { act: 'receive' })).toThrow(/Carry/);
      enter(d, namesLane);
      act(d, { act: 'carry' });
      enter(d, namesQuay);
      const receivers = MAPS[namesQuay].interactables.filter(
        (p) => p.game === 'river-names-receive' && check(p.visibleIf, d.s),
      );
      expect(receivers.map((p) => p.id)).toEqual(['river-names-receive-' + release]);
      act(d, { act: 'receive' });
      expect(() => act(d, { act: 'council', turn: 'neighbour' })).toThrow();
      for (const share of ['post', 'guide', 'bread'] as const) act(d, { act: 'portion', share });
      expect(d.done('rivernames.quay')).toBe(true);
      act(d, { act: 'leaf', leaf: 'partners' });
      for (const turn of ['pair', 'neighbour'] as const) {
        act(d, { act: 'council', turn });
        expect(riverFlag(d.s, 'council.turn')).toBe(turn);
      }
      expect(d.done('rivernames.partners')).toBe(true);
      const recorded = d.s.adventureDiary.entries.filter((x) => x.event?.key.startsWith('river-names:'));
      const returned = recorded.find((x) => x.event?.ref === 'river-names.receive')!;
      expect(returned.text).toContain(before[0]);
      expect(recorded.find((x) => x.event?.key.endsWith('leaf.partners'))?.event?.sourceIds).toEqual([
        sources.partners,
      ]);
      expect(d.e.talkEntry(riverPeople.pendlow, d.s)).toBe('rivernames.pendlow.return');
    },
  );
  it('tests the same two written words with each reader, carries revised media between towns and keeps a practised gesture distinct from an explicit public destination', () => {
    const d = new Driver();
    commission(d);
    act(d, { act: 'release', release: 'window' });
    act(d, { act: 'carry' });
    const mark = (
      c: MarkCommand extends infer T ? (T extends MarkCommand ? Omit<T, 'type'> : never) : never,
    ) => d.run({ type: 'FoldRiverPostmark', ...c });
    expect(letterMask(d.s)).toBe(1);
    expect(stampedText(1, 'ebb')).toBe(stampedText(1, 'flood'));
    mark({ work: 'send' });
    enter(d, namesQuay);
    for (const water of landings)
      for (const person of ['stranger', 'neighbour', 'apprentice'] as const) {
        mark({ work: 'listen', water, person });
        expect(unpacked(d.s, water, person).candidates).toEqual([12, 18]);
      }
    enter(d, namesLane);
    act(d, { act: 'leaf', leaf: 'plan' });
    mark({ work: 'press', piece: 'gesture' });
    mark({ work: 'send' });
    mark({ work: 'learn', water: 'ebb' });
    enter(d, namesQuay);
    mark({ work: 'listen', person: 'apprentice', water: 'ebb' });
    mark({ work: 'listen', person: 'apprentice', water: 'flood' });
    expect(unpacked(d.s, 'ebb', 'apprentice').candidates).toEqual([12]);
    expect(unpacked(d.s, 'flood', 'apprentice').candidates).toEqual([12, 18]);
    expect(d.done('rivernames.postmark')).toBe(false);
    enter(d, namesLane);
    mark({ work: 'learn', water: 'flood' });
    enter(d, namesQuay);
    for (const water of landings)
      for (const person of ['neighbour', 'stranger', 'apprentice'] as const)
        mark({ work: 'listen', water, person });
    expect(unpacked(d.s, 'flood', 'apprentice').candidates).toEqual([18]);
    expect(unpacked(d.s, 'flood', 'stranger').candidates).toEqual([12, 18]);
    expect(d.done('rivernames.postmark')).toBe(true);
    enter(d, namesLane);
    mark({ work: 'press', piece: 'address' });
    expect(markFlag(d.s, 'sealed')).toBe(3);
    mark({ work: 'send' });
    enter(d, namesQuay);
    expect(unpacked(d.s, 'flood', 'stranger').candidates).toEqual([18]);
    expect(() => mark({ work: 'send' })).toThrow(/oven/);
    const initial = new Driver();
    expect(() =>
      markEffects(initial.s, {
        type: 'FoldRiverPostmark',
        work: 'listen',
        person: 'stranger',
        water: 'ebb',
      }),
    ).toThrow();
  });
  it('credits only the specific institutional or author leaf unfolded by this Guardian in the selected encounter', () => {
    const d = new Driver();
    enter(d, namesLane);
    expect(earnedResearchReadings(d.e.pack, d.s)).toEqual([]);
    act(d, { act: 'leaf', leaf: 'names' });
    const readings = () => earnedResearchReadings(d.e.pack, d.s);
    expect(readings().map((r) => r.key)).toEqual([sources.names]);
    expect(readings()[0].encounterKeys).toEqual(['river-names:reading:leaf.names']);
    expect(readings()[0].text).toContain('Inuit Heritage Trust');
    const article = d.s.adventureDiary.entries.find((e) => e.event?.ref === 'river-names.leaf')!;
    article.event!.sourceIds!.push(sources.partners);
    expect(readings().map((r) => r.key)).toEqual([sources.names]);
    act(d, { act: 'leaf', leaf: 'plan' });
    act(d, { act: 'leaf', leaf: 'partners' });
    expect(
      readings()
        .map((r) => r.key)
        .sort(),
    ).toEqual(Object.values(sources).sort());
  });
  it('keeps Kunit’s Tunumiit attribution and lets only an equipped coast piece open the two-sided practice rack', () => {
    const d = new Driver();
    enter(d, namesLane);
    expect(() => act(d, { act: 'touch' })).toThrow(/Kunit/);
    d.s.inventory[specimenItemId(KUNIT_KEY)] = 1;
    d.s.flags[carryFlag(KUNIT_KEY)] = true;
    d.s.flags[PERSPECTIVE_FLAG] = specimenToolId(KUNIT_KEY);
    act(d, { act: 'touch' });
    act(d, { act: 'touch' });
    expect(riverFlag(d.s, 'felt.both')).toBeUndefined();
    act(d, { act: 'reverse' });
    act(d, { act: 'touch' });
    expect(riverFlag(d.s, 'felt.both')).toBe(true);
    const leaf = riverDiary(d.s, { type: 'WalkRiverNames', act: 'touch' });
    expect(leaf.text).toContain('right hand');
    expect(leaf.event?.sourceIds).toEqual(['HIS-KUNIT-HOLM']);
    expect(d.e.pack.sources.find((v) => v.id === sources.names)?.url).toContain('ihti.ca');
  });
  it('keeps the new doors reachable from their existing approaches and the bridge gaps solid outside the two crossings', () => {
    const d = new Driver();
    for (const [outside, id, inside] of [
      ['sea.turning-room', 'river-names-arch', namesLane],
      ['water.gatehouse', 'river-names-forwarding', namesQuay],
    ]) {
      const map = MAPS[outside],
        door = map.interactables.find((x) => x.id === id)!;
      expect(door.to?.map).toBe(inside);
      expect(map.interactables.filter((x) => x.x === door.x && x.y === door.y)).toHaveLength(1);
      expect(map.npcs.some((x) => x.x === door.x && x.y === door.y)).toBe(false);
      expect(MAPS[inside].interactables.filter((x) => x.to?.map === outside)).toHaveLength(1);
      expect(MAPS[inside].npcs.map((n) => n.id).sort()).toEqual(Object.values(riverPeople).sort());
      expect(MAPS[inside].floor(5, 8)).toBe('water-bridge');
      expect(
        MAPS[inside].blocks.some(([x, y, w, h]) => 6 >= x && 6 < x + w && 8 >= y && 8 < y + h),
      ).toBe(true);
    }
    for (const m of d.e.pack.missions.filter((m) => m.id.includes('RIVER-NAMES')))
      for (const o of m.objectives)
        expect(d.e.pack.hints.filter((h) => h.objective === o.id)).toHaveLength(4);
    expect(places).toHaveLength(20);
  });
});
