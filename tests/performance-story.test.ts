import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const foyer = 'stage.foyer';
const rehearsal = 'stage.rehearsal';
const gallery = 'stage.gallery';
const director = 'stage-director';
const host = 'stage-host';
const programmes = ['stage-response-pause', 'stage-response-move'];

function enter() {
  const d = new Driver();
  const crossing = MAPS['nexus.archive'].interactables.find((item) => item.to?.map === foyer)!;
  expect(check(crossing.visibleIf, d.s)).toBe(false);
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH9-M01')).toBe(false);
  d.s.objectivesDone.push('sea.finish');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  expect(d.done('stage.arrival')).toBe(true);
  return d;
}

function sign(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Unable to read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function visible(d: Driver, ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

function use(d: Driver, id: string, choice: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop?.node || !check(prop.visibleIf, d.s)) throw new Error(`Unable to use ${id} here`);
  d.walk(prop.node, [choice]);
}

describe('The Doorway Pause', () => {
  it('needs both performances and a comparison of audience and actor sightlines', () => {
    const d = enter();
    expect(() => d.run({ type: 'RunStageRehearsal', cue: 'move' })).toThrow(/cue table/);
    d.s.mapId = rehearsal;
    d.run({ type: 'RunStageRehearsal', cue: 'pause' });
    expect(d.e.talkEntry(director, d.s)).toBe('stage.director.welcome');
    sign(d, 'stage-blocking');
    d.s.mapId = gallery;
    expect(d.e.talkEntry(host, d.s)).toBe('stage.host.welcome');
    expect(visible(d, ['stage-reader-note'])).toEqual([]);
    sign(d, 'stage-vantage');
    d.talk(host, 'Keep the side view');
    expect(d.done('stage.sightline')).toBe(true);
    expect(d.e.talkEntry(host, d.s)).toBe('stage.host.pending');
    d.s.mapId = rehearsal;
    d.run({ type: 'RunStageRehearsal', cue: 'move' });
    d.talk(director, 'Set the two movement marks');
    expect(d.done('stage.compare')).toBe(true);
    expect(d.e.talkEntry(host, d.s)).toBe('stage.host.choose');
  });

  it.each([
    ['pause', 'Circle the pause', 'Keep a front-seat view', 'Stage the silence', 'Add the pause cue'],
    ['move', 'Set the two movement marks', 'Keep the side view', 'Stage the crate move', 'Add the movement cue'],
  ])('%s gives the audience its own framing and the same capped report credit',
  (performance, compare, vantage, call, revise) => {
    const d = enter();
    d.s.mapId = rehearsal;
    d.run({ type: 'RunStageRehearsal', cue: 'pause' });
    d.run({ type: 'RunStageRehearsal', cue: 'move' });
    d.talk(director, compare);
    sign(d, 'stage-blocking');
    d.s.mapId = gallery;
    sign(d, 'stage-vantage');
    d.talk(host, vantage);
    expect(visible(d, programmes)).toEqual([]);
    d.talk(host, call);
    expect(d.s.flags['stage.response']).toBe(performance);
    expect(visible(d, programmes)).toEqual([`stage-response-${performance}`]);
    expect(d.e.talkEntry(host, d.s)).toBe('stage.host.wait');

    sign(d, 'stage-reader-note');
    d.talk(host, revise);
    expect(d.done('stage.finish')).toBe(true);
    expect(visible(d, ['stage-followup-notice'])).toEqual(['stage-followup-notice']);
    expect(d.p.credit['credit.stage.perform']).toBe(8);
    expect(d.p.credit['credit.stage.finish']).toBe(8);

    d.talk(host, 'Leave the understudy');
    expect(d.done('stage.access')).toBe(true);
    expect(visible(d, ['stage-cue-copy'])).toEqual(['stage-cue-copy']);
    expect(d.p.credit['credit.stage.finish']).toBe(8);
  });
});

describe('The Seat before the Bell', () => {
  it('can be found gallery-first and needs both the visitor’s request and the post check', () => {
    const d = enter();
    d.s.mapId = gallery;
    expect(visible(d, ['stage-seat-request', 'stage-seat-post', 'stage-seat-desk']))
      .toEqual(['stage-seat-request', 'stage-seat-post']);
    use(d, 'stage-seat-post', 'Check where the post');
    expect(visible(d, ['stage-seat-desk'])).toEqual([]);
    use(d, 'stage-seat-request', 'Keep the folded request');
    expect(d.done('stage.seats.o.inspect')).toBe(true);
    expect(visible(d, ['stage-seat-desk'])).toEqual(['stage-seat-desk']);
    expect(d.s.flags['stage.vantage']).toBeUndefined();
  });

  it.each([
    ['reserve', 'Reserve the aisle place', /held until the opening bell/],
    ['queue', 'Move the queue post', /open in order/],
  ])('gives the %s choice a concrete notice without changing the rehearsal or sightlines', (plan, choice, noticeText) => {
    const d = enter();
    d.s.mapId = gallery;
    const credit = { ...d.p.credit };
    use(d, 'stage-seat-request', 'Keep the folded request');
    use(d, 'stage-seat-post', 'Check where the post');
    use(d, 'stage-seat-desk', choice);

    expect(d.s.flags['stage.seats.plan']).toBe(plan);
    expect(d.done('stage.seats.o.place')).toBe(true);
    expect(visible(d, ['stage-seat-request', 'stage-seat-post', 'stage-seat-desk', 'stage-seat-reserve', 'stage-seat-queue']))
      .toEqual([`stage-seat-${plan}`]);
    expect(MAPS[gallery].interactables.find((item) => item.id === `stage-seat-${plan}`)?.text).toMatch(noticeText);
    expect(d.s.journal).toContain('j.stage.seats');
    expect(d.p.moments['mom.stage.seats']).toBeTruthy();
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['stage.audience']).toBeUndefined();
    expect(d.s.flags['stage.response']).toBeUndefined();
    expect(d.e.talkEntry(host, d.s)).toBe('stage.host.welcome');
  });
});

describe('The Same Door in Two Lights', () => {
  const views = ['stage-light-view-side', 'stage-light-view-front'];
  const displays = ['stage-light-shadow-display', 'stage-light-craft-display'];

  it('changes the view at one fixed relief and requires observing both lights and the maker’s date', () => {
    const d = enter();
    d.s.mapId = rehearsal;
    expect(visible(d, views)).toEqual([]);
    use(d, 'stage-light-stand', 'Lower the lamp');
    expect(visible(d, views)).toEqual(['stage-light-view-side']);
    sign(d, 'stage-light-view-side');
    use(d, 'stage-light-stand', 'Set the lamp to face');
    expect(visible(d, views)).toEqual(['stage-light-view-front']);
    sign(d, 'stage-light-view-front');
    expect(d.done('stage.light.o.compare')).toBe(false);
    sign(d, 'stage-light-maker');
    expect(d.done('stage.light.o.compare')).toBe(true);

    const [side, front] = MAPS[rehearsal].interactables.filter((item) => views.includes(item.id));
    expect([side.x, side.y]).toEqual([front.x, front.y]);
    expect(side.art).not.toBe(front.art);
    expect(d.s.flags['stage.rehearsal.pause']).toBeUndefined();
    expect(d.s.flags['stage.rehearsal.move']).toBeUndefined();
  });

  it.each([
    ['shadow', 'Hang the side-lit relief', 'stage.relief-side'],
    ['craft', 'Hang the front-lit relief', 'stage.relief-front'],
  ])('hangs a bounded %s account with its corresponding light and neutral credit', (display, choice, art) => {
    const d = enter();
    const credit = { ...d.p.credit };
    d.s.mapId = rehearsal;
    sign(d, 'stage-light-maker');
    use(d, 'stage-light-stand', 'Set the lamp to face');
    sign(d, 'stage-light-view-front');
    use(d, 'stage-light-stand', 'Lower the lamp');
    sign(d, 'stage-light-view-side');

    d.s.mapId = foyer;
    use(d, 'stage-light-proof', choice);
    const copy = `stage-light-${display}-display`;
    expect(visible(d, displays)).toEqual([copy]);
    const displayProp = MAPS[foyer].interactables.find((item) => item.id === copy);
    expect(displayProp?.art).toBe(art);
    expect(displayProp?.text).toContain('pictured arrival has no recorded date');
    expect(d.s.journal).toContain('j.stage.light');
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['stage.response']).toBeUndefined();
  });
});
