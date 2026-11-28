import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { migrateCampaign } from '../src/domain/saves';
import { adventureExportSnapshot } from '../src/ui/adventureExport';
import { adventureDocx } from '../src/ui/adventureDocx';
import { strFromU8, unzipSync } from 'fflate';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { lensPeople } from '../src/content/lensLoan';
import {
  borrowed,
  fittingIds,
  issuedLens,
  lensBench,
  lensSamples,
  lensTheatre,
  lensTiles,
  quarterOrbit,
  notices,
  overlap,
  predictLamps,
  preset,
  projection,
  readKey,
  seenLamps,
  stageVoices,
  unpackRead,
  windows,
  type Fitting,
  type Frame,
  type LensCommand,
  type Slide,
  type Window,
} from '../src/domain/lensLoan';
type Action = LensCommand extends infer T ? (T extends LensCommand ? Omit<T, 'type'> : never) : never;
function action(d: Driver, cmd: Action) {
  return d.run({ type: 'WorkLensLoan', ...cmd });
}
function sign(d: Driver, a: Fitting, b: Fitting) {
  d.s.mapId = lensBench;
  action(d, { act: 'pick', fitting: a });
  action(d, { act: 'pick', fitting: b });
  action(d, { act: 'borrow' });
}
function trace(d: Driver, change: Action) {
  action(d, { act: 'trace', slot: 'amber' });
  action(d, change);
  action(d, { act: 'trace', slot: 'blue' });
  action(d, { act: 'blend' });
}
const take = (d: Driver) => action(d, { act: 'travel' });
const slides = Object.keys(lensSamples) as Slide[],
  fields = Object.keys(windows) as Window[];
describe('Mayle’s drawer with two places', () => {
  it('keeps the locator, wide and close coordinates readable through all turns, preparations and sleeve positions', () => {
    let n = 0;
    for (const slide of slides)
      for (let turn = 0; turn < 4; turn++)
        for (const cover of [true, false])
          for (const frame of ['eye', 'whole', 'close'] as Frame[])
            for (const window of frame === 'close' ? fields : (['centre'] as Window[])) {
              const r = { slide, turn, cover, frame, window },
                cells = lensTiles(r),
                read = unpackRead(readKey(r))!;
              expect(read).toEqual(r);
              expect(cells.length).toBe(frame === 'whole' ? 49 : 9);
              expect(new Set(cells.map((t) => t.x + ',' + t.y)).size).toBe(cells.length);
              expect(cells.every((t) => t.x >= 0 && t.x <= 6 && t.y >= 0 && t.y <= 6)).toBe(true);
              expect(overlap(r, { ...r, frame: 'whole' })).toEqual({ shared: cells.length, changed: 0 });
              expect(overlap(r, { ...r, turn: (r.turn + 4) % 4 }).changed).toBe(0);
              n++;
            }
    expect(n).toBe(224);
    expect(unpackRead('cloth~close~centre~-1~on')).toBeUndefined();
    expect(unpackRead('fresh~eye~east~0~on~x')).toBeUndefined();
  });
  it('keeps all six two-tool loans distinct at the curtain and preserves the sent impression after a new tracing or a return', () => {
    const views = new Set<string>();
    for (let i = 0; i < fittingIds.length; i++)
      for (let j = i + 1; j < fittingIds.length; j++) {
        const d = new Driver();
        sign(d, fittingIds[i], fittingIds[j]);
        trace(d, { act: 'slide', slide: 'petal' });
        take(d);
        const sent = issuedLens(d.s);
        action(d, { act: 'slide', slide: 'marks' });
        action(d, { act: 'trace', slot: 'amber' });
        expect(issuedLens(d.s)).toEqual(sent);
        d.s.mapId = lensTheatre;
        action(d, { act: 'project' });
        const pair = projection(d.s)!;
        expect(d.done('optics.project')).toBe(true);
        views.add(pair.caption);
        expect(pair.first.slide).toBe('cloth');
        expect(readKey(pair.first)).not.toBe(readKey(pair.second));
        action(d, { act: 'return' });
        expect(borrowed(d.s)).toEqual([]);
        expect(issuedLens(d.s)).toEqual(sent);
        expect(projection(d.s)).toEqual(pair);
        expect(() => action(d, { act: 'project' })).toThrow(/borrowed pair/);
      }
    expect(views.size).toBe(6);
  });
  it('changes one variable at a time and keeps a pressed crease and a fixed holder line apart', () => {
    const d = new Driver();
    sign(d, 'stage', 'sleeve');
    action(d, { act: 'trace', slot: 'amber' });
    action(d, { act: 'trace', slot: 'blue' });
    expect(() => action(d, { act: 'blend' })).toThrow(/two tracings/);
    trace(d, { act: 'turn' });
    expect(d.s.flags['optics.isolatedTurn']).toBe('cloth');
    expect(() => action(d, { act: 'isolate' })).toThrow(/sleeve/);
    trace(d, { act: 'cover' });
    action(d, { act: 'isolate' });
    expect(d.done('optics.scratch')).toBe(true);
    action(d, { act: 'slide', slide: 'fresh' });
    action(d, { act: 'trace', slot: 'amber' });
    action(d, { act: 'slide', slide: 'petal' });
    action(d, { act: 'turn' });
    action(d, { act: 'trace', slot: 'blue' });
    action(d, { act: 'blend' });
    expect(d.done('optics.crease')).toBe(false);
    trace(d, { act: 'slide', slide: 'fresh' });
    expect(d.done('optics.crease')).toBe(true);
    d.talk(lensPeople.cajal, 'matched fresh');
    expect(d.e.visibleOptions('optics.cajal', d.s).some((o) => o.option.next === 'optics.cajal.return')).toBe(
      true,
    );
    expect(() => action(d, { act: 'register' })).toThrow(/field lens/);
  });
  it('locates each close field inside the wider view and carries both preset marks through recovery', () => {
    const d = new Driver();
    d.s.mapId = lensBench;
    action(d, { act: 'pick', fitting: 'field' });
    action(d, { act: 'pick', fitting: 'close' });
    expect(() => action(d, { act: 'pick', fitting: 'sleeve' })).toThrow(/takes two/);
    action(d, { act: 'putMark', mark: 'knot' });
    action(d, { act: 'borrow' });
    for (const window of fields) {
      action(d, { act: 'frame', frame: 'whole' });
      action(d, { act: 'trace', slot: 'amber' });
      action(d, { act: 'frame', frame: 'close' });
      action(d, { act: 'pan', window });
      action(d, { act: 'trace', slot: 'blue' });
      action(d, { act: 'blend' });
      action(d, { act: 'register' });
      expect(unpackRead(d.s.flags['optics.register'])?.window).toBe(window);
    }
    expect(d.done('optics.registration')).toBe(true);
    action(d, { act: 'return' });
    action(d, { act: 'pick', fitting: 'field' });
    action(d, { act: 'pick', fitting: 'stage' });
    action(d, { act: 'putMark', mark: 'star' });
    action(d, { act: 'useMark', mark: 'knot' });
    action(d, { act: 'useMark', mark: 'star' });
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(preset(d.s, 'knot')).toEqual(['field', 'close']);
    expect(preset(d.s, 'star')).toEqual(['close', 'stage']);
    expect(d.done('optics.presets')).toBe(true);
    expect(() => action(d, { act: 'trace', slot: 'amber' })).toThrow(/Borrow two/);
  });
  it('returns every square after four turns and puts finite proof beside repeatable audience observations', () => {
    const d = new Driver();
    sign(d, 'stage', 'field');
    action(d, { act: 'frame', frame: 'whole' });
    action(d, { act: 'slide', slide: 'marks' });
    expect(() => action(d, { act: 'unroll' })).toThrow(/four quarter/);
    for (let i = 0; i < 4; i++) action(d, { act: 'turn' });
    action(d, { act: 'unroll' });
    for (let x = 0; x < 7; x++)
      for (let y = 0; y < 7; y++) {
        const orbit = quarterOrbit(x, y);
        expect(orbit[2]).toEqual([6 - x, 6 - y]);
        expect(orbit[4]).toEqual([x, y]);
      }
    expect(d.done('optics.fold')).toBe(true);
    trace(d, { act: 'slide', slide: 'cloth' });
    take(d);
    d.s.mapId = lensTheatre;
    expect(() => action(d, { act: 'margin' })).toThrow(/repeat slips/);
    for (const stop of ['broad', 'slit'] as const) {
      for (const drawing of ['rays', 'fronts'] as const)
        action(d, { act: 'forecast', stop, seat: 'wing', drawing });
      action(d, { act: 'rehearse' });
      action(d, { act: 'rehearse' });
    }
    action(d, { act: 'entrust', purpose: 'test' });
    action(d, { act: 'margin' });
    expect(d.done('optics.margins')).toBe(true);
  });
  it('requires both specific Cambridge case records and keeps the clips separate from imaginary fittings', () => {
    const d = new Driver();
    d.s.mapId = lensBench;
    expect(() => action(d, { act: 'fitCard' })).toThrow(/downstairs/);
    d.s.mapId = 'observatory.survey-depot';
    const ids = ['micro', 'micro-case'].map(
      (id) => d.e.pack.exhibits.find((e) => e.grantsCard === 'card.depot.' + id)!.id,
    );
    d.run({ type: 'InspectExhibit', exhibit: ids[0] });
    d.s.mapId = lensBench;
    expect(() => action(d, { act: 'fitCard' })).toThrow(/both readings/);
    d.s.mapId = 'observatory.survey-depot';
    d.run({ type: 'InspectExhibit', exhibit: ids[1] });
    d.s.mapId = lensBench;
    expect(adventureJournalView(d.e.pack, d.s, []).readings).toEqual([]);
    action(d, { act: 'fitCard' });
    expect(d.done('optics.sources')).toBe(true);
    const library = adventureJournalView(d.e.pack, d.s, []).readings!;
    expect(library.map((r) => r.key).sort()).toEqual(['HIS-DEPOT-Z408A', 'HIS-DEPOT-Z408J']);
    expect(library.every((r) => r.encounterKeys.includes('lens-loan:fitCard'))).toBe(true);
    const row = adventureJournalView(d.e.pack, d.s, []).entries.find(
      (e) => e.event?.key === 'lens-loan:fitCard',
    )!;
    expect(row.event?.sourceIds).toEqual(['HIS-DEPOT-Z408A', 'HIS-DEPOT-Z408J']);
    expect(row.text).toContain('16616');
    expect(row.text).toContain('30607');
  });
  it('keeps research attached to the conversation and day in which the player actually opened it', () => {
    const d = new Driver();
    d.s.mapId = lensBench;
    d.walk('optics.cajal', ['pencil instead']);
    d.walk('optics.cajal', ['petal studies']);
    d.walk('optics.huygens', ['chalk board']);
    const view = adventureJournalView(d.e.pack, d.s, []);
    const readings = view.readings!;
    expect(readings.map((r) => r.key).sort()).toEqual([
      'HIS-OPTICS-CAJAL',
      'HIS-OPTICS-LIFE',
      'HIS-OPTICS-SLIDE',
      'HIS-OPTICS-WAVE',
    ]);
    const target = view.entries.find((e) => e.event?.key === 'conversation:optics.cajal.draw')!;
    for (const row of view.entries) row.at = '2026-09-01T12:00:00Z';
    target.at = '2026-09-02T12:00:00Z';
    target.topics = { areas: ['ART'], concepts: ['evidence'] };
    const options = {
      placeName: () => undefined,
      selection: {
        now: new Date('2026-09-05T12:00:00Z'),
        time: { kind: 'dates' as const, from: '2026-09-02', through: '2026-09-02' },
        topics: { areas: ['ART' as const], concepts: ['evidence' as const] },
      },
    };
    const snapshot = adventureExportSnapshot(view, options);
    expect(snapshot.references.map((r) => r.key)).toEqual(['HIS-OPTICS-LIFE']);
    expect(snapshot.entries).toHaveLength(1);
    const doc = unzipSync(adventureDocx(view, options));
    const links = strFromU8(doc['word/_rels/document.xml.rels']);
    expect(links).toMatch(/cajal\/biographical/);
    expect(links).not.toMatch(/cajal\/lecture|huygenss-principle|article\/z408/);
    expect(
      adventureExportSnapshot(view, {
        ...options,
        selection: { ...options.selection, topics: { areas: ['HIS'] } },
      }).references,
    ).toEqual([]);
    expect(view.readings).toHaveLength(4);
    view.references.push({ ...readings[0], key: 'duplicate-research-credit' });
    expect(adventureExportSnapshot(view, { placeName: () => undefined }).references).toHaveLength(4);
  });
  it('lets the same slips support three different entrances, both lighting positions, both recipients and a changed edition', () => {
    const d = new Driver();
    sign(d, 'close', 'field');
    trace(d, { act: 'slide', slide: 'fresh' });
    take(d);
    d.s.mapId = lensTheatre;
    const heard = new Set<string>();
    for (const notice of Object.keys(notices) as (keyof typeof notices)[]) {
      action(d, { act: 'print', notice });
      for (const position of ['rear', 'side'] as const) {
        action(d, { act: 'lamp', position });
        for (const person of ['porter', 'understudy'] as const) {
          action(d, { act: 'listen', person });
          heard.add(stageVoices(d.s, person));
        }
      }
    }
    expect(heard.size).toBe(9);
    expect(d.done('optics.entrance')).toBe(true);
    expect(d.done('optics.audience')).toBe(true);
    d.s.mapId = lensBench;
    trace(d, { act: 'slide', slide: 'marks' });
    take(d);
    d.s.mapId = lensTheatre;
    expect(() => action(d, { act: 'listen', person: 'porter' })).toThrow(/Put this pair up/);
  });
  it('tests both chalk drawings at each aperture and three seats before entrusting the practical cue or the explanation', () => {
    const d = new Driver();
    sign(d, 'field', 'sleeve');
    trace(d, { act: 'slide', slide: 'petal' });
    take(d);
    d.s.mapId = lensTheatre;
    for (const seat of ['middle', 'wing', 'step'] as const) {
      for (const stop of ['broad', 'slit'] as const) {
        for (const drawing of ['rays', 'fronts'] as const) action(d, { act: 'forecast', stop, seat, drawing });
        const observed = seenLamps(stop, seat);
        for (let i = 0; i < 3; i++) {
          action(d, { act: 'rehearse' });
          expect(d.s.flags['optics.readings.' + stop + '.' + seat]).toBe(i + 1);
          expect(observed[i]).toBeLessThanOrEqual(4);
        }
        expect(() => action(d, { act: 'rehearse' })).toThrow(/All three/);
      }
      expect(predictLamps('broad', seat, 'rays')).toBe(predictLamps('broad', seat, 'fronts'));
      if (seat === 'middle') {
        expect(() => action(d, { act: 'entrust', purpose: 'test' })).toThrow(/wing or the step/);
        continue;
      }
      expect(predictLamps('slit', seat, 'rays')).not.toBe(predictLamps('slit', seat, 'fronts'));
      action(d, { act: 'entrust', purpose: 'cue' });
      expect(d.done('optics.drawings')).toBe(true);
      action(d, { act: 'entrust', purpose: 'test' });
      expect(d.s.flags['optics.trialSeat']).toBe(seat);
    }
    const cued = MAPS[lensTheatre].interactables.find((p) => p.id === 'optics-stitch')!,
      reserved = MAPS[lensTheatre].interactables.find((p) => p.id === 'optics-second-seat')!;
    expect(check(cued.visibleIf, d.s)).toBe(false);
    expect(check(reserved.visibleIf, d.s)).toBe(true);
  });
  it('uses the existing chapter gate, keeps the service stair on the same chapter gate and tells the same story after a reload', () => {
    const d = new Driver(),
      door = MAPS[lensBench].interactables.find((p) => p.id === 'optics-wing-door')!;
    expect(check(door.visibleIf, d.s)).toBe(false);
    sign(d, 'sleeve', 'close');
    trace(d, { act: 'slide', slide: 'marks' });
    take(d);
    expect(check(door.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('stage.arrival');
    expect(check(door.visibleIf, d.s)).toBe(true);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    const saved = issuedLens(d.s)!;
    expect(saved.blue.slide).toBe('marks');
    expect(MAPS[lensTheatre].interactables.find((p) => p.id === 'optics-back')?.to?.map).toBe(lensBench);
    expect(new Set(Object.values(lensPeople)).size).toBe(4);
    expect(
      d.e.pack.characters
        .filter((c) => Object.values(lensPeople).includes(c.id as typeof lensPeople.nim))
        .every((c) => c.localGreeting?.[lensBench] && c.localGreeting?.[lensTheatre]),
    ).toBe(true);
  });
});
