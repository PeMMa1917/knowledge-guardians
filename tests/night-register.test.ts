import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { nightFamilies } from '../src/content/nightFamilies';
import {
  activeFriend,
  creatureTrails,
  trailMark,
  drawerAddress,
  missingCaption,
  nightEffects,
  nightEdition,
  nightFriends,
  nightJob,
  nightParcel,
  nightReceipt,
  nightSites,
  nightWorks,
  signedNames,
  traceMemory,
  type NightCommand,
} from '../src/domain/nightRegister';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { specimenItemId, specimenToolId, carryFlag } from '../src/domain/specimenGear';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { microSkillId } from '../src/domain/skills';

const type = 'WorkNightRegister' as const;
type Move = NightCommand extends infer T ? (T extends NightCommand ? Omit<T, 'type'> : never) : never;
const choices = [0, 1] as const;
const commit = (d: Driver, move: Move) => d.run({ type, ...move });
const roundTrip = (d: Driver) => {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
};

describe('the night register', () => {
  it('has 240 named individuals, 16 field tools and 1,020 single-accession objects in accessible drawers', () => {
    expect(nightSites).toHaveLength(15);
    expect(nightFriends).toHaveLength(240);
    expect(new Set(nightFriends.map((f) => f.name)).size).toBe(240);
    expect(new Set(nightFamilies.map((f) => f.mode)).size).toBe(16);
    expect(new Set(nightWorks.map((w) => w.accession)).size).toBe(1020);
    for (const site of nightSites)
      expect(new Set(nightWorks.filter((w) => w.site === site).map(drawerAddress)).size).toBe(68);
  });
  it('lets every individual travel and rest after either bond, and rejects recruiting from a different perch', () => {
    const d = new Driver();
    for (const f of nightFriends)
      for (const bond of ['courier', 'scout'] as const) {
        let s = { ...d.s, mapId: f.site.room };
        function go(move: Move) {
          s = apply(nightEffects({ type, ...move }, s), s, emptyOutputs());
        }
        expect(() => go({ action: 'befriend', friend: f.id, bond })).toThrow();
        go({ action: 'watch', friend: f.id });
        go({ action: 'befriend', friend: f.id, bond });
        expect(activeFriend(s)?.id).toEqual(f.id);
        expect(s.flags['night.bond.' + f.id]).toBe(bond);
        const otherJob = bond === 'scout' ? 'courier' : 'scout';
        go({ action: 'retrain', friend: f.id, bond: otherJob });
        expect(s.flags['night.bond.' + f.id]).toBe(otherJob);
        s = { ...s, mapId: nightSites[(f.site.index + 1) % 15].room };
        expect(() => go({ action: 'befriend', friend: f.id, bond })).toThrow();
        go({ action: 'rest', friend: f.id });
        expect(activeFriend(s)).toBeUndefined();
        go({ action: 'travel', friend: f.id });
        expect(activeFriend(s)).toBe(f);
      }
  });
  it('accepts either local use and either downstream reader at every other chapter for each accession', () => {
    const d = new Driver();
    for (const w of nightWorks) {
      const key = nightJob(w);
      // Each work reaches the recipient through the same validated state machine as a physical interaction.
      const opened = { ...d.s, mapId: w.site.room, flags: { ['inspected.' + w.exhibit]: true } };
      const method = nightFamilies[w.slot % nightFamilies.length].mode;
      const play = (s: typeof d.s, move: Move) =>
        apply(nightEffects({ type, ...move }, s), s, emptyOutputs());
      const checked = play(play(opened, { action: 'trial', work: w.id, method }), {
        action: 'whole',
        work: w.id,
        method,
      });
      for (const choice of choices) {
        const sent = play(checked, { action: 'send', work: w.id, choice });
        const packed = play(sent, { action: 'carry', work: w.id });
        expect(nightEdition(packed, key + '.edition')?.choice).toBe(choice);
        for (const site of nightSites.filter((s) => s !== w.site)) {
          const here = { ...packed, mapId: site.room };
          for (const reader of choices) {
            const result = play(here, { action: 'receive', choice: reader });
            const receipt = nightReceipt(result, site)!;
            if (
              receipt.work !== w ||
              receipt.choice !== reader ||
              receipt.edition.choice !== choice ||
              receipt.edition.family.mode !== method ||
              nightParcel(result)
            )
              throw Error(w.accession + ' at ' + site.site);
          }
        }
      }
    }
  }, 60000);
  it('keeps the courier edition, the owned object, the latest home reading and the signed hearing distinct through recovery', () => {
    const d = new Driver(),
      [a, b, c, e] = nightSites,
      w = nightWorks[0],
      helper = nightFriends[0],
      key = nightJob(w);
    const go = (move: Move) => commit(d, move);
    expect(() => d.run({ type: 'InspectExhibit', exhibit: w.exhibit })).toThrow();
    d.s.mapId = a.room;
    go({ action: 'watch', friend: helper.id });
    go({ action: 'befriend', friend: helper.id, bond: 'courier' });
    expect(() => go({ action: 'trial', work: w.id, method: 'left' })).toThrow();
    d.run({ type: 'InspectExhibit', exhibit: w.exhibit });
    expect(() => go({ action: 'whole', work: w.id, method: 'left' })).toThrow();
    go({ action: 'trial', work: w.id, method: 'left' });
    expect(() => go({ action: 'send', work: w.id, choice: 0 })).toThrow();
    go({ action: 'whole', work: w.id, method: 'left' });
    go({ action: 'send', work: w.id, choice: 0 });
    go({ action: 'carry', work: w.id });
    d.run({ type: 'ClaimSpecimen', exhibit: w.exhibit });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(w.key) });
    go({ action: 'trial', work: w.id, method: 'date' });
    go({ action: 'whole', work: w.id, method: 'date' });
    go({ action: 'send', work: w.id, choice: 1 });
    expect(nightEdition(d.s, key + '.edition')!.family.mode).toBe('date');
    expect(() => go({ action: 'receive', choice: 1 })).toThrow();
    for (const dest of [b, c, e]) {
      d.s.mapId = dest.room;
      if (dest !== b) go({ action: 'recall', friend: helper.id });
      go({ action: 'receive', choice: 0 });
      expect(() => go({ action: 'receive', choice: 0 })).toThrow();
      for (const trace of ['keeper', 'copy', 'home'] as const) go({ action: 'read-memory', trace });
      expect(traceMemory(d.s, dest, 'keeper')).toContain(dest.replies[0]);
      expect(traceMemory(d.s, dest, 'copy')).toContain(a.replies[0]);
      expect(traceMemory(d.s, dest, 'home')).toContain(a.replies[1]);
      expect(nightReceipt(d.s, dest)?.edition.helper).toBe(helper);
    }
    expect(d.p.skills[microSkillId(1115)]?.length).toBe(3);
    go({ action: 'resolve', choice: 0 });
    const before = signedNames(d.s);
    expect(before).toHaveLength(3);
    roundTrip(d);
    expect(signedNames(d.s)).toEqual(before);
    go({ action: 'lend', work: w.id });
    go({ action: 'receive', choice: 1 });
    expect(nightReceipt(d.s, e)?.edition.family.mode).toBe('date');
    go({ action: 'resolve', choice: 1 });
    expect(signedNames(d.s)).not.toEqual(before);
    go({ action: 'resolve', choice: 0 });
    expect(signedNames(d.s)).toEqual(before);
    d.s.flags[carryFlag(w.key)] = false;
    expect(() => go({ action: 'lend', work: w.id })).toThrow();
    d.s.flags[carryFlag(w.key)] = true;
    delete d.s.inventory[specimenItemId(w.key)];
    expect(() => go({ action: 'lend', work: w.id })).toThrow();
    const entry = d.s.adventureDiary.entries.find((e) => e.event?.key.includes(':receive:'))!;
    expect(entry.text).toContain(w.accession);
    expect(Object.keys(diaryQuestions(entry)).length).toBeGreaterThan(0);
  });
  it('returns an orphaned image to its particular source, supports another try, and grants equal credit for either filing', () => {
    for (const choice of choices) {
      const d = new Driver(),
        [w, other] = nightWorks,
        go = (move: Move) => commit(d, move);
      d.s.mapId = w.site.room;
      go({ action: 'find-caption', work: w.id });
      d.run({ type: 'InspectExhibit', exhibit: other.exhibit });
      expect(() => go({ action: 'bind-caption', work: other.id, choice })).toThrow();
      expect(missingCaption(d.s, w.site)).toBe(w);
      roundTrip(d);
      d.run({ type: 'InspectExhibit', exhibit: w.exhibit });
      go({ action: 'bind-caption', work: w.id, choice });
      expect(missingCaption(d.s, w.site)).toBeUndefined();
      expect(d.s.flags[nightJob(w) + '.caption']).toBe(choice);
      expect(d.p.skills[microSkillId(1003)]).toHaveLength(1);
      expect(() => go({ action: 'bind-caption', work: w.id, choice })).toThrow();
    }
  });
  it('lets all fifteen keepers remember either morning and preserves their other greetings outside the register', () => {
    const d = new Driver(),
      guest = nightFriends[0];
    for (const site of nightSites) {
      d.s.mapId = site.room;
      const entry = d.e.talkEntry(site.actor, d.s)!;
      expect(entry).toBe(site.room + '.keeper');
      expect(d.e.visibleOptions(entry, d.s).map(({ option }) => option.next)).toEqual([
        entry + '.trace', entry + '.shift', 'secondink.' + site.site + '.case',
      ]);
      expect(() => commit(d, { action: 'favour', choice: 1 })).toThrow();
      const w = nightWorks.find((w) => w.site !== site)!;
      d.s.flags['night.delivering'] = [w.id, guest.family.mode, 0, ''].join('|');
      commit(d, { action: 'receive', choice: 0 });
      for (const choice of choices) {
        commit(d, { action: 'favour', choice });
        const mornings = d.e.visibleOptions(entry, d.s).map(({ option }) => option.next)
          .filter((next) => next?.startsWith(entry + '.morning.'));
        expect(mornings).toEqual([entry + '.morning.' + choice]);
        expect(d.e.node(mornings[0]!).text).toBe(site.nextMorning[choice]);
      }
      d.s.mapId = site.doorMap;
      if (!site.actor.startsWith('register-')) expect(d.e.talkEntry(site.actor, d.s)).not.toBe(entry);
    }
  });
  it('opens each companion’s own comparison at both frames in either order and preserves the edition it saw', () => {
    const d = new Driver();
    const ids = new Set<number>();
    for (const f of nightFriends) {
      const [home, away] = creatureTrails.get(f.id)!;
      expect(home.site).toBe(f.site);
      expect(away.site).not.toBe(f.site);
      expect(away.kind).toBe(home.kind);
      expect(away.medium).not.toBe(home.medium);
      expect(away.maker).not.toBe(home.maker);
      ids.add(home.id);
      ids.add(away.id);
      for (const path of [
        [home, away],
        [away, home],
      ]) {
        let s: typeof d.s = {
          ...d.s,
          flags: { ...d.s.flags, ['lor.' + f.id + '.friend']: true, 'lor.out': f.id },
        };
        const play = (move: Move) => {
          s = apply(nightEffects({ type, ...move }, s), s, emptyOutputs());
        };
        for (const work of path) {
          s.mapId = work.site.room;
          s.flags['inspected.' + work.exhibit] = true;
          play({ action: 'trial', work: work.id, method: f.family.mode });
          play({ action: 'whole', work: work.id, method: f.family.mode });
          play({ action: 'send', work: work.id, choice: 0 });
        }
        expect(nightEdition(s, trailMark(f, home))?.helper).toBe(f);
        expect(nightEdition(s, trailMark(f, away))?.helper).toBe(f);
        const w = path[1];
        play({ action: 'rest', friend: f.id });
        play({ action: 'trial', work: w.id, method: 'date' });
        play({ action: 'whole', work: w.id, method: 'date' });
        play({ action: 'send', work: w.id, choice: 1 });
        expect(nightEdition(s, trailMark(f, w))?.choice).toBe(0);
      }
    }
    expect(ids.size).toBe(480);
  });
});
