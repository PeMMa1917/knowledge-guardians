import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { CAMERA_BLOCKING, FILM_READER, filmEdit, filmTake } from '../src/domain/filmCuts';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function visible(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function cross(d: Driver, id: string) {
  const door = visible(d, id);
  if (!door?.to || !check(door.openIf, d.s)) throw new Error('No passage: ' + id);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function scene(d: Driver, id: string, choice: string) {
  const prop = visible(d, id);
  if (!prop?.node) throw new Error('No scene: ' + id);
  d.walk(prop.node, [choice]);
}

function read(d: Driver, id: string): string {
  const prop = visible(d, id);
  if (prop?.kind !== 'sign') throw new Error('No notice: ' + id);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  return prop.text ?? '';
}

const item = 'item.film.cut';
const actor = 'film-door-reader';

function rehearsal(): Driver {
  const d = new Driver();
  d.s.objectivesDone.push('sea.finish');
  cross(d, 'stage-door');
  cross(d, 'stage-rehearsal-path');
  return d;
}

describe('The First Frame', () => {
  it('keeps the same action in both lenses and the same frames in both edits', () => {
    const front = filmTake('front');
    const wing = filmTake('wing');
    expect(front.map(({ time, cart }) => ({ time, cart }))).toEqual(wing.map(({ time, cart }) => ({ time, cart })));
    expect(front[0].left).toBeLessThan(CAMERA_BLOCKING.keeper);
    expect(wing[0].left).toBeGreaterThan(CAMERA_BLOCKING.keeper);
    expect(front[0].description).toContain('raises a palm');
    expect(wing[0].description).toContain('outside this frame');

    const cue = filmEdit('cue');
    const motion = filmEdit('motion');
    expect(cue.map(({ time }) => time)).toEqual([1, 2, 3]);
    expect(motion).toEqual([cue[1], cue[0], cue[2]]);
    expect(FILM_READER.cue).toContain('pauses at the stripe');
    expect(FILM_READER.motion).toContain('finds the doorway at once');
  });

  it('validates the exact NASA records and preserves their different evidence kinds', () => {
    const pack = buildPack();
    const cards = pack.cards.filter(({ id }) => id.startsWith('card.film.'));
    expect(cards.map(({ sources, claimKind }) => ({ sources, claimKind }))).toEqual([
      { sources: ['HIS-FILM-01'], claimKind: 'observation' },
      { sources: ['HIS-FILM-02'], claimKind: 'interpretation' },
    ]);
    expect(pack.sources.find(({ id }) => id === 'HIS-FILM-01')?.locator).toContain('AS11-40-5903');
    expect(pack.sources.find(({ id }) => id === 'HIS-FILM-02')?.locator).toContain('PIA04413');
  });

  it('requires both camera positions and both screened orders in the rehearsal', () => {
    const d = rehearsal();
    expect(visible(d, 'stage-film-front')).toBeUndefined();
    expect(() => d.run({ type: 'CaptureFilmTake', station: 'front' })).toThrow(/first/);
    scene(d, 'stage-film-catalogue', 'Keep the photo’s caption');
    d.run({ type: 'CaptureFilmTake', station: 'wing' });
    expect(visible(d, 'stage-film-editor')).toBeUndefined();
    expect(() => d.run({ type: 'ScreenFilmCut', cut: 'cue' })).toThrow(/both camera positions/);
    d.run({ type: 'CaptureFilmTake', station: 'front' });
    expect(visible(d, 'stage-film-editor')).toBeDefined();
    d.run({ type: 'ScreenFilmCut', cut: 'cue' });
    expect(() => d.run({ type: 'PostFilmCut', cut: 'motion' })).toThrow(/both editing orders/);
    cross(d, 'stage-rehearsal-return');
    expect(() => d.run({ type: 'ScreenFilmCut', cut: 'motion' })).toThrow(/Rehearsal Room/);
  });

  const placements = [
    ['cue', 'view'], ['cue', 'cue'], ['motion', 'view'], ['motion', 'cue'],
  ] as const;

  it.each(placements)('posts the %s cut and independently chooses the %s harbour layout', (cut, layout) => {
    const d = rehearsal();
    const credit = { ...d.p.credit };
    scene(d, 'stage-film-catalogue', 'Keep the photo’s caption');
    d.run({ type: 'CaptureFilmTake', station: 'front' });
    d.run({ type: 'CaptureFilmTake', station: 'wing' });
    d.run({ type: 'ScreenFilmCut', cut: 'cue' });
    d.run({ type: 'ScreenFilmCut', cut: 'motion' });
    d.run({ type: 'PostFilmCut', cut });
    expect(d.s.inventory[item]).toBeUndefined();

    cross(d, cut === 'cue' ? 'stage-rehearsal-to-gallery' : 'stage-rehearsal-return');
    const reader = MAPS[d.s.mapId].npcs.find(({ id }) => id === actor);
    expect(reader && check(reader.visibleIf, d.s)).toBe(true);
    expect(read(d, cut === 'cue' ? 'stage-film-cue' : 'stage-film-motion')).toMatch(/beat/i);
    d.talk(actor, cut === 'cue' ? 'Take the cue-first copy' : 'Take the doorway-first copy');
    expect(d.s.inventory[item]).toBe(1);
    expect(d.done('film.stage.received')).toBe(true);
    expect(d.done('stage.perform')).toBe(false);

    if (cut === 'cue') cross(d, 'stage-gallery-return');
    cross(d, 'stage-nexus-return');
    d.s.objectivesDone.push('preserved.publish');
    cross(d, 'observatory-door');
    expect(visible(d, 'coast-film-still')).toBeUndefined();
    scene(d, 'coast-film-handoff', 'Leave the two frames here');
    expect(read(d, 'coast-film-still')).toContain('open at that time');
    expect(visible(d, 'coast-film-place')).toBeUndefined();
    expect(read(d, 'coast-film-live')).toContain('The lower ledge is shut');
    scene(d, 'coast-film-place', layout === 'cue' ? 'Lead with today’s wait' : 'Lead with the labelled landmark');
    expect(d.done('film.coast.received')).toBe(false);
    expect(read(d, 'coast-film-' + layout)).toContain(layout === 'cue' ? 'first thing she could read' : 'separate stair sign');
    expect(d.done('film.coast.received')).toBe(true);
    expect(d.p.credit).toEqual(credit);
    expect(d.s.inventory[item]).toBe(1);
    expect(d.done('coast.revise')).toBe(false);
  });
});
