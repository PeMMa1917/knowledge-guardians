import {
  mouldSurfaces,
  mouldPressures,
  traceMould,
} from '../src/domain/orchardMould';
import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { carryFlag, specimenToolId } from '../src/domain/specimenGear';
import { PERKINS_KEY } from '../src/content/readingWorks';
import {
  chestFaces,
  chestPoses,
  chestPose,
  chestStep,
  turnChest,
  homePose,
  PLUM_LOFT,
  oppositeFace,
  beatEffects,
  orchardBeat,
  currentOrchardBar,
  type Beat,
  type ChestMove,
  type Turn,
  type Pose,
} from '../src/domain/plumChest';

function visit(d: Driver, room = PLUM_LOFT) {
  d.s.mapId = room;
  d.run({ type: 'VisitPlace', name: MAPS[room].name });
}
function move(d: Driver, ...moves: ChestMove[]) {
  for (const move of moves) d.run({ type: 'WorkPlumChest', move });
}
function stroke(d: Driver, ...beats: Beat[]) {
  for (const beat of beats) d.run({ type: 'StrikeOrchardBeat', beat });
}
function open(d: Driver, drawer: 'brass' | 'quiet') {
  move(d, 'set-down', 'right');
  if (drawer === 'brass') move(d, 'long');
  else move(d, 'up', 'up', 'short');
  move(d, 'slide', 'up', 'press');
}
function read(d: Driver, node: string, phrase: string) {
  d.walk('plum.' + node, [phrase]);
}
describe('The Last Plum in the Orchestra', () => {
  it('has precisely 24 physical orientations and two independent sets of fittings', () => {
    const inverses: Record<Turn, Turn> = {
      left: 'right',
      right: 'left',
      down: 'up',
      up: 'down',
    };
    const d = new Driver();
    expect(() => move(d, 'left')).toThrow(/loft/);
    expect(() => stroke(d, 'rest')).toThrow(/loft/);
    expect(() => chestStep({}, 'throw' as ChestMove)).toThrow(/Choose/);
    expect(() => orchardBeat({}, 'double' as Beat)).toThrow(/Choose/);
    expect(chestPose({ 'plum.pose': 'boot.plum.comb' })).toEqual(homePose);
    expect(chestPoses.size).toBe(24);
    for (const front of chestFaces) {
      const group = [...chestPoses.values()].filter((p) => p[0] === front);
      expect(new Set(group.map((p) => p[1])).size).toBe(4);
      expect(
        group.every((p) => p[1] !== oppositeFace[front] && p[1] !== front),
      ).toBe(true);
    }
    for (const [key, p] of chestPoses) {
      for (const t of Object.keys(inverses) as Turn[]) {
        const next = turnChest(p, t);
        expect(chestPoses.has(next.join('.'))).toBe(true);
        expect(turnChest(next, inverses[t])).toEqual(p);
        let cycle: Pose = p;
        for (let step = 0; step < 4; step++) cycle = turnChest(cycle, t);
        expect(cycle).toEqual(p);
      }
      for (const ring of ['short', 'long']) {
        const flags = { 'plum.pose': key, 'plum.ring': ring };
        const catchFace =
          p[0] === 'bell' && p[1] === 'plum' && ring === 'long'
            ? 'plum'
            : p[0] === 'comb' && p[1] === 'moon' && ring === 'short'
              ? 'moon'
              : undefined;
        expect(chestStep(flags, 'slide').effects).toEqual(
          catchFace
            ? [{ setFlag: 'plum.catch.' + catchFace, value: true }]
            : [],
        );
        expect(chestStep(flags, 'press').effects).toEqual([]);
        for (const catchName of ['plum', 'moon']) {
          const f = { ...flags, ['plum.catch.' + catchName]: true };
          expect(chestStep(f, 'press').effects).toEqual(
            p[0] === catchName
              ? [{ setFlag: 'plum.open.' + catchName, value: true }]
              : [],
          );
        }
        expect(chestStep(flags, 'trace').effects).toEqual([
          { setFlag: 'plum.felt.' + p[0], value: true },
        ]);
      }
    }
  });
  it('lets either player open either drawer first and keeps an unsuccessful attempt in the diary', () => {
    for (const first of ['brass', 'quiet'] as const) {
      const d = new Driver();
      visit(d);
      move(d, 'press');
      expect(d.s.adventureDiary.entries.at(-1)?.event?.outcome).toEqual(
        'tried',
      );
      open(d, first);
      expect(d.done('plum.turn')).toBe(true);
      expect(d.done('plum.quiet')).toBe(false);
      open(d, first === 'brass' ? 'quiet' : 'brass');
      expect(d.done('plum.quiet')).toBe(true);
      expect(d.s.flags['plum.open.plum']).toBe(true);
      expect(d.s.flags['plum.open.moon']).toBe(true);
    }
  });
  it('lets the same rest carry a count and a performer’s own timing', () => {
    const d = new Driver();
    visit(d);
    const beats = ['rim', 'board', 'rest'] as const;
    let calls = 0;
    for (const a of beats)
      for (const b of beats)
        for (const c of beats)
          for (const end of beats) {
            const prefix = [a, b, c].reduce(
              (bar, beat) => orchardBeat({ 'plum.bar': bar }, beat).bar,
              '',
            );
            const s = { ...d.s, flags: { 'plum.bar': prefix } };
            const effects = beatEffects(s, {
              type: 'StrikeOrchardBeat',
              beat: end,
            });
            const special =
              a === b && b === c && end === 'rest' && a !== 'rest';
            expect(effects.length).toBe(special ? 2 : 1);
            if (special) calls++;
          }
    expect(calls).toBe(2);
    expect(currentOrchardBar({ 'plum.bar': 'a corrupt bar' })).toBe('');
    open(d, 'brass');
    open(d, 'quiet');
    stroke(d, 'board', 'board');
    const saved = structuredClone(d.s);
    visit(d, 'stage.gallery');
    d.s = saved;
    expect(currentOrchardBar(d.s.flags)).toBe('BB');
    stroke(d, 'board', 'rest');
    expect(d.s.flags['plum.played.board']).toBe(true);
    expect(
      d.e
        .visibleOptions('plum.score', d.s)
        .some((o) => o.option.next === 'plum.meter'),
    ).toBe(false);
    d.walk('plum.score', ['stretch the rest']);
    stroke(d, 'rim', 'clear', 'rim', 'rim', 'rim', 'rest');
    read(d, 'score', 'fixed three taps');
    read(d, 'score', 'under both readings');
    expect(d.done('plum.score')).toBe(true);
    expect(
      d.s.adventureDiary.entries.some((o) =>
        o.text.includes('felt under the drum'),
      ),
    ).toBe(true);
  });
  it('lets a company and two audiences revise four different performance endings', () => {
    const d = new Driver();
    visit(d);
    expect(d.e.visibleOptions('plum.commission', d.s)).toHaveLength(1);
    open(d, 'quiet');
    stroke(d, 'board', 'board', 'board', 'rest');
    d.talk('plum-tallowheel', 'Wait through');
    for (const [place, commission, door, dest, node, action, home] of [
      [
        'road',
        'on wheels',
        'plum-road-door',
        'stage.gallery',
        'cart',
        'under the cart',
        'home-road',
      ],
      [
        'road',
        'on wheels',
        'plum-road-door',
        'stage.gallery',
        'cart',
        'on your shoulder',
        'home-tree',
      ],
      [
        'roots',
        'into the clearing',
        'plum-root-trap',
        'forest.community',
        'grove',
        'falling fruit',
        'home-roots',
      ],
      [
        'roots',
        'into the clearing',
        'plum-root-trap',
        'forest.community',
        'grove',
        'sounding plank',
        'home-board',
      ],
    ]) {
      read(d, 'commission', commission);
      const prop = MAPS[PLUM_LOFT].interactables.find((p) => p.id === door)!;
      expect(check(prop.visibleIf, d.s)).toBe(true);
      expect(
        check(
          MAPS[PLUM_LOFT].interactables.find(
            (p) =>
              p.id === (place === 'road' ? 'plum-root-trap' : 'plum-road-door'),
          )!.visibleIf,
          d.s,
        ),
      ).toBe(false);
      expect(prop.to!.map).toBe(dest);
      visit(d, dest);
      read(d, node, action);
      visit(d);
      expect(d.e.talkEntry('plum-fen', d.s)).toBe('plum.' + home);
      expect(d.e.talkEntry('plum-tallowheel', d.s)).toBe('plum.snail-' + place);
      expect(d.done('plum.performance')).toBe(true);
    }
  });
  it('returns two translations to the actor who can change the fruit and the beat', () => {
    const d = new Driver();
    visit(d);
    open(d, 'brass');
    read(d, 'verse', 'under the three');
    read(d, 'verse', 'drop, plum, drop');
    read(d, 'verse', 'meaning slip');
    visit(d, 'forest.community');
    const pia = MAPS[d.s.mapId].npcs.find((n) => n.id === 'plum-pia')!;
    expect(check(pia.visibleIf, d.s)).toBe(true);
    d.talk('plum-pia', 'longer line');
    expect(d.e.talkEntry(pia.id, d.s)).toBe('plum.pia-long-home');
    d.talk('plum-pia', 'different version', 'three-beat');
    expect(d.e.talkEntry(pia.id, d.s)).toBe('plum.pia-home');
    d.talk('plum-pia', 'other line', 'longer line');
    expect(d.s.flags['plum.pia.last']).toBe('long');
    expect(d.done('plum.pia')).toBe(true);
  });
  it('keeps Fen’s worn mould separate from the historical Perkins volume and links only the encounter', () => {
    const d = new Driver();
    visit(d);
    const source = 'HIS-READING-WORKS-PERKINS-PROCEDE',
      louis = MAPS[PLUM_LOFT].npcs.find(
        (n) => n.id === 'orchard-louis-braille',
      )!;
    expect(check(louis.visibleIf, d.s)).toBe(false);
    expect(() =>
      d.run({
        type: 'DrawOrchardStylus',
        surface: 'fresh',
        pressure: 'working',
      }),
    ).toThrow(/Perkins/);
    const volume = d.e.pack.exhibits.find(
      (o) => o.specimen?.key === PERKINS_KEY,
    )!;
    d.s.objectivesDone.push(volume.specimen!.objective);
    d.run({ type: 'InspectExhibit', exhibit: volume.id });
    d.run({ type: 'ClaimSpecimen', exhibit: volume.id });
    d.s.flags[carryFlag(PERKINS_KEY)] = false;
    expect(check(louis.visibleIf, d.s)).toBe(false);
    d.s.flags[carryFlag(PERKINS_KEY)] = true;
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(PERKINS_KEY) });
    expect(check(louis.visibleIf, d.s)).toBe(true);
    expect(
      adventureJournalView(d.e.pack, d.s, []).encyclopedia.some(
        (e) => e.name === 'Louis Braille' && e.encounter === 'met',
      ),
    ).toBe(false);
    expect(
      d.e
        .visibleOptions('plum.braille', d.s)
        .some((o) => o.option.next === 'plum.fresh'),
    ).toBe(false);
    for (const surface of mouldSurfaces)
      for (const pressure of mouldPressures) {
        const r = traceMould(surface, pressure);
        expect(r.first).toHaveLength(7);
        expect(r.second).toHaveLength(7);
        expect(r.same).toBe(
          pressure === 'heavy' ||
            (surface === 'worn' && pressure === 'working'),
        );
        expect(r.first[3] === r.second[3]).toBe(r.same);
        d.run({ type: 'DrawOrchardStylus', surface, pressure });
      }
    d.talk(louis.id, 'lighter draw');
    expect(d.done('plum.hand')).toBe(true);
    d.talk(louis.id, 'fresh practice mould');
    expect(
      d.e
        .visibleOptions('plum.braille', d.s)
        .some((o) => o.option.next === 'plum.credit'),
    ).toBe(false);
    d.talk(louis.id, 'worn practice mould');
    d.talk(louis.id, 'two mould states');
    expect(d.done('plum.book')).toBe(true);
    expect(
      d.s.adventureDiary.entries.some((e) =>
        e.event?.sourceIds?.includes(source),
      ),
    ).toBe(true);
    expect(adventureJournalView(d.e.pack, d.s, []).encyclopedia).toContainEqual(
      expect.objectContaining({ name: 'Louis Braille', encounter: 'met' }),
    );
    expect(d.e.pack.sources.find((s) => s.id === source)?.mla?.container).toBe(
      'Perkins School for the Blind',
    );
  });
});
