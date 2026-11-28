import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { mothReturns } from '../src/content/mothPerchReturns';
import { seeTray, type Tray } from '../src/domain/bakeryTrays';
import {
  perches,
  linings,
  traceMoth,
  inviteMoth,
  type Perch,
} from '../src/domain/mothPerches';

const homes = Object.keys(perches) as Perch[];
const roomIds = {
  lamp: 'forest.station',
  desk: 'stage.foyer',
  case: 'preserved.archive',
} as const;
const watch = (d: Driver, perch: Perch) =>
  d.run({ type: 'LorelingWatch', loreling: 'glimmermoth', sighting: perch });
function befriend(d: Driver, perch: Perch) {
  d.s.mapId = 'nexus.archive';
  watch(d, perch);
  watch(
    d,
    homes.find((x) => x !== perch)!,
  );
  d.run({ type: 'TryMothPerch', perch, lining: 'glass', shutter: 'open' });
  d.run({ type: 'TryMothPerch', perch, lining: 'cuff', shutter: 'open' });
  d.run({ type: 'WelcomeMoth', perch });
}
describe('Kip’s folding perch', () => {
  it('keeps the lit glass and worn cuff apart in all eighteen setups', () => {
    for (const perch of homes)
      for (const lining of Object.keys(linings) as (keyof typeof linings)[])
        for (const shutter of ['open', 'hooded'] as const) {
          expect(traceMoth({ perch, lining, shutter }).lands).toBe(
            lining !== 'glass',
          );
        }
    const d = new Driver();
    watch(d, 'lamp');
    expect(() =>
      d.run({
        type: 'TryMothPerch',
        perch: 'lamp',
        lining: 'cuff',
        shutter: 'open',
      }),
    ).toThrow(/second place/);
    watch(d, 'case');
    expect(() =>
      d.run({
        type: 'TryMothPerch',
        perch: 'desk',
        lining: 'cuff',
        shutter: 'open',
      }),
    ).toThrow(/Visit that perch/);
    d.run({
      type: 'TryMothPerch',
      perch: 'lamp',
      lining: 'glass',
      shutter: 'open',
    });
    expect(inviteMoth(d.s, 'lamp').ok).toBe(false);
    d.run({
      type: 'TryMothPerch',
      perch: 'lamp',
      lining: 'brass',
      shutter: 'hooded',
    });
    expect(inviteMoth(d.s, 'lamp').ok).toBe(false);
    d.run({
      type: 'TryMothPerch',
      perch: 'lamp',
      lining: 'brass',
      shutter: 'open',
    });
    expect(inviteMoth(d.s, 'lamp').ok).toBe(true);
    expect(d.s.flags['fray.shadow-twins']).toBeTruthy();
    expect(
      d.s.adventureDiary?.entries.some(
        (e) => e.event?.key === 'moth-perch:lamp.glass.open',
      ),
    ).toBe(true);
  });
  it.each(homes)(
    'takes the %s resting place to a receiver, lets both outcomes stand and admits a later revision',
    (perch) => {
      const d = new Driver(),
        room = roomIds[perch],
        work = MAPS[room].interactables.find(
          (p) => p.id === 'moth-work-' + perch,
        )!;
      expect(check(work.visibleIf, d.s)).toBe(false);
      befriend(d, perch);
      expect(d.s.flags['moth.perch.home']).toBe(perch);
      expect(d.done('lor.o2.friend')).toBe(true);
      d.s.mapId = room;
      d.run({ type: 'LorelingField', loreling: 'glimmermoth', out: false });
      expect(check(work.visibleIf, d.s)).toBe(false);
      d.run({ type: 'LorelingField', loreling: 'glimmermoth', out: true });
      expect(check(work.visibleIf, d.s)).toBe(true);
      const id = 'moth.return.' + perch,
        options = mothReturns[perch].options;
      for (const [i, option] of options.entries()) {
        d.walk(
          i ? id + '.' + options[0].id + '.again' : id,
          i ? ['Try another', option.act] : [option.act],
        );
        expect(d.s.flags[id]).toBe(option.id);
        expect(d.done(id)).toBe(true);
        const receipts = MAPS[room].interactables
          .filter((x) => x.id.startsWith('moth-receipt-' + perch))
          .filter((x) => check(x.visibleIf, d.s));
        expect(receipts.map((x) => x.id)).toEqual([
          'moth-receipt-' + perch + '-' + option.id,
        ]);
        d.run({ type: 'LorelingField', loreling: 'glimmermoth', out: false });
        expect(check(receipts[0].visibleIf, d.s)).toBe(true);
        expect(d.e.visibleOptions(receipts[0].node!, d.s)).toHaveLength(1);
        d.run({ type: 'LorelingField', loreling: 'glimmermoth', out: true });
      }
    },
  );
  it('lets an earlier named companion find a new home without a second award or replacing the active companion', () => {
    const d = new Driver();
    watch(d, 'lamp');
    watch(d, 'desk');
    const rec = d.e.pack.lorelings.find((x) => x.id === 'glimmermoth')!;
    for (const q of rec.questions)
      d.run({
        type: 'LorelingNote',
        loreling: rec.id,
        question: q.id,
        option: q.answer,
      });
    d.run({ type: 'LorelingOffer', loreling: rec.id, place: 'handle' });
    d.run({ type: 'LorelingName', loreling: rec.id, name: 'Marigold' });
    d.s.flags['lor.out'] = 'stiltfrog';
    const credit = { ...d.p.credit };
    befriend(d, 'case');
    expect(d.s.flags['moth.perch.home']).toBe('case');
    expect(d.s.flags['lor.glimmermoth.name']).toBe('Marigold');
    expect(d.s.flags['lor.out']).toBe('stiltfrog');
    expect(d.p.credit).toEqual(credit);
    expect(
      d.s.adventureDiary?.entries.some(
        (e) => e.event?.key === 'moth-perch:home:case',
      ),
    ).toBe(true);
  });
});
describe('Della’s trays and the tea seller’s correction', () => {
  it('checks units at the six doors, on the scale and after removing one loaf', () => {
    const d = new Driver();
    expect(() =>
      d.run({ type: 'MoveBakeryTray', tray: 'large', action: 'weigh' }),
    ).toThrow(/Emberford/);
    d.s.mapId = 'aethelgard.emberford';
    for (const tray of ['small', 'large'] as Tray[]) {
      const count = tray === 'small' ? 6 : 3;
      d.run({ type: 'MoveBakeryTray', tray, action: 'weigh' });
      expect(seeTray(d.s, tray).weight).toBe(6);
      for (let n = 0; n < count; n++)
        d.run({ type: 'MoveBakeryTray', tray, action: 'deliver' });
      expect(seeTray(d.s, tray)).toEqual({
        delivered: count,
        remaining: 0,
        weight: 0,
      });
      expect(() =>
        d.run({ type: 'MoveBakeryTray', tray, action: 'deliver' }),
      ).toThrow(/Every loaf/);
      d.run({ type: 'MoveBakeryTray', tray, action: 'return' });
      d.run({ type: 'MoveBakeryTray', tray, action: 'weigh' });
      expect(seeTray(d.s, tray).weight).toBe(6 / count);
    }
    expect(
      d.s.adventureDiary?.entries.some(
        (e) => e.event?.key === 'tally-tray:large:weigh:2',
      ),
    ).toBe(true);
  });
  it.each([
    ['kettle', 'Tie a dated'],
    ['quiet', 'Walk the correction'],
    ['margin', 'Fold the four'],
  ])(
    'takes a correction to the %s edition after separating four tellers from one source',
    (edition, pick) => {
      const d = new Driver();
      d.talk('villager-1', 'Any news');
      d.talk('porter-idris');
      d.talk('stallkeeper-hana', 'Follow the four');
      d.walk('rumour.chalk', ['Unfold']);
      d.run({ type: 'SetFlag', flag: 'rumour.record', value: true });
      d.talk('villager-1', 'I found where', 'One test blade', pick);
      expect(d.s.flags['rumour.edition']).toBe(edition);
      expect(d.done('rum.o4.tell')).toBe(true);
      expect(d.p.credit['crit.truth.rumour']).toBe(5);
      expect(
        d.s.adventureDiary?.entries.some(
          (e) => e.event?.key === 'conversation:rumour.after.' + edition,
        ),
      ).toBe(true);
    },
  );
});
