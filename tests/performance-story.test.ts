import { describe, expect, it } from 'vitest';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { selectDiary } from '../src/domain/diarySelection';
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
    expect(d.p.skills['SK-MICRO-0710']).toContainEqual(expect.stringContaining('stage.finish'));
    const journal = adventureJournalView(d.e.pack, d.s, d.e.visibleObjectives(d.s));
    const selection = selectDiary(journal, {
      now: new Date(), time: { kind: 'all' }, topics: { framework: ['methods-and-tools'], areas: ['ART'], themes: ['LAN'] },
    });
    const found = selection.view?.entries.map(e => e.id);
    expect(found).toContain('quest:stage.compare');
    expect(found).not.toContain('quest:stage.perform');
    const ethics = selectDiary(journal, { now: new Date(), time: { kind: 'all' }, topics: { framework: ['ethics'], areas: ['ART'] } });
    expect(ethics.view?.entries.map(e => e.id)).toContain('quest:stage.perform');
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

describe('The Call at the Side Bench', () => {
  const stand = 'stage-side-call';
  const replies = ['stage-side-call-spoken', 'stage-side-call-rail'];

  it.each([
    ['spoken', 'Give Hari a spoken cue', /before the first line/],
    ['rail', 'Clip a sightline slip', /passes it along/],
  ])('lets the gallery-first player make and verify the %s handoff', (mode, choice, reaction) => {
    const d = enter();
    d.s.mapId = gallery;
    const credit = { ...d.p.credit };
    expect(visible(d, [stand, ...replies])).toEqual([]);
    sign(d, 'stage-vantage');
    expect(visible(d, [stand, ...replies])).toEqual([stand]);
    use(d, stand, 'Leave the slip here');
    expect(visible(d, [stand, ...replies])).toEqual([stand]);

    const depths = Array.from({ length: 4 }, () => {
      const reply = d.run({ type: 'RequestHint', objective: 'stage.call.audience' }).events.find((event) => event.kind === 'hint');
      return reply?.kind === 'hint' ? reply.hint.depth : undefined;
    });
    expect(depths).toEqual([1, 2, 3, 4]);
    use(d, stand, choice);
    expect(d.done('stage.call.audience')).toBe(false);
    const readback = `${stand}-${mode}`;
    expect(visible(d, [stand, ...replies])).toEqual([readback]);
    expect(MAPS[gallery].interactables.find((item) => item.id === readback)?.text).toMatch(reaction);
    sign(d, readback);

    expect(d.done('stage.call.audience')).toBe(true);
    expect(d.s.journal).toContain('j.stage.call');
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['stage.seats.plan']).toBeUndefined();
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

  function finishBothReadings(d: Driver) {
    d.s.mapId = rehearsal;
    sign(d, 'stage-light-maker');
    use(d, 'stage-light-stand', 'Set the lamp to face');
    sign(d, 'stage-light-view-front');
    use(d, 'stage-light-stand', 'Lower the lamp');
    sign(d, 'stage-light-view-side');
    d.s.mapId = foyer;
  }

  it.each([
    ['shadow', 'Hang the side-lit relief', 'stage.relief-side'],
    ['craft', 'Hang the front-lit relief', 'stage.relief-front'],
  ])('hangs a bounded %s account with its corresponding light and neutral credit', (display, choice, art) => {
    const d = enter();
    const credit = { ...d.p.credit };
    finishBothReadings(d);
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

  it.each([
    ['shadow', 'Hang the side-lit relief', 'side', 'front', 'Bring the light round', 'paper foot to rise', 'trying so hard to carry'],
    ['craft', 'Hang the front-lit relief', 'front', 'side', 'Move the lamp into', 'hear what’s inside', 'feel the wait more'],
  ] as const)('keeps the posted %s and lets both first-look arrangements change the scene in either order',
    (display, hang, first, other, move, quietReply, shownReply) => {
      for (const order of [['quiet', 'shown'], ['shown', 'quiet']] as const) {
        const d = enter();
        const credit = { ...d.p.credit };
        expect(d.e.visibleOptions('stage.light.stand', d.s).some(({ option }) => option.text.includes('next visitor'))).toBe(false);
        finishBothReadings(d);
        use(d, 'stage-light-proof', hang);
        d.s.mapId = rehearsal;
        const bench = 'stage.light.stand';
        expect(d.e.visibleOptions(bench, d.s).filter(({ option }) => option.text.includes('next visitor'))).toHaveLength(1);
        d.walk(bench, ['Set a first look', 'Put the', 'Leave this first position']);
        expect(visible(d, views)).toEqual([`stage-light-view-${first}`]);
        expect(d.s.flags['stage.light.visitor']).toBeUndefined();
        for (const mode of order) {
          if (mode === 'quiet') d.walk(bench, ['Set a first look', 'quiet first look']);
          else d.walk(bench, ['Set a first look', 'Put the', move]);
          expect(visible(d, views)).toEqual([`stage-light-view-${mode === 'quiet' ? first : other}`]);
          expect(d.s.flags['stage.light.visitor']).toBe(mode);
          expect(d.s.journal).toContain(`j.stage.light.visitor.${mode}`);
          const readback = d.e.node(`stage.light.visitor.${display}.${mode}`);
          expect(readback.text).toContain(mode === 'quiet' ? quietReply : shownReply);
        }
        d.s.mapId = foyer;
        expect(visible(d, displays)).toEqual([`stage-light-${display}-display`]);
        expect(d.p.credit).toEqual(credit);
        expect(d.s.flags['stage.response']).toBeUndefined();
      }
    });
});
