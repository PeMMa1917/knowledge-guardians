import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { callers, callingPage } from '../src/domain/callingBook';
import { LANTERN_PEOPLE, LANTERN_SITES, lanternRef } from '../src/domain/lamplight';
import { guestInstrument } from '../src/domain/lanternInstruments';

describe('the journal calling book', () => {
  it('opens through a meeting or heard line and withholds every other guest, reading and destination', () => {
    const d = new Driver(),
      [a, b] = LANTERN_PEOPLE,
      [harbour] = LANTERN_SITES;
    expect(callers(d.e.pack, d.e.dialogueById, d.s)).toEqual([]);
    expect(callingPage(d.e.pack, d.e.dialogueById, d.s, b.character)).toBeUndefined();
    d.s.mapId = harbour.map;
    d.run({ type: 'WorkWithLantern', site: harbour.id, person: a.id, stage: 'meet' });
    expect(callers(d.e.pack, d.e.dialogueById, d.s).map((c) => c.id)).toEqual([a.character]);
    const card = callingPage(d.e.pack, d.e.dialogueById, d.s, a.character)!;
    expect(card.visits.map((v) => v.place)).toEqual([harbour.place]);
    expect(card.visits[0].active?.material).toEqual([]);
    expect(card.visits[0].last).toBeUndefined();
    expect(card.sources.map((s) => s.id)).toEqual(['HIS-INK-' + a.id]);
    expect(callingPage(d.e.pack, d.e.dialogueById, d.s, b.character)).toBeUndefined();
  });
  it('recovers the signed material alongside an unfinished change, includes the actual recipient and does not reveal an unused alternative', () => {
    const d = new Driver(),
      person = LANTERN_PEOPLE[0],
      kit = guestInstrument(person.id)!,
      sites = LANTERN_SITES.slice(0, 2);
    for (const site of sites) {
      d.s.mapId = site.map;
      const base = { type: 'WorkWithLantern' as const, person: person.id, site: site.id };
      d.run({ ...base, stage: 'meet' });
      d.run({ ...base, stage: 'pin', piece: 2 });
      d.run({ ...base, stage: 'pin', piece: 0 });
      d.run({ ...base, stage: 'trace', option: 1 });
      d.run({ ...base, stage: 'use', option: 0 });
      d.run({ ...base, stage: 'pin', piece: 1 });
    }
    const card = callingPage(d.e.pack, d.e.dialogueById, d.s, person.character)!;
    expect(card.visits).toHaveLength(2);
    for (const [i, v] of card.visits.entries()) {
      expect(v.last).toMatchObject({
        material: [kit.pieces[2].label, kit.pieces[0].label],
        request: person.folds[1].action,
        response: sites[i].uses[0].reply,
      });
      expect(v.active?.material).toEqual([kit.pieces[0].label, kit.pieces[1].label]);
      expect(JSON.stringify(v)).not.toContain(sites[i].uses[1].reply);
    }
  });
  it('works with old local-only meeting records and restricts scene memory to the actual speaker', () => {
    const d = new Driver(),
      person = LANTERN_PEOPLE[1],
      site = LANTERN_SITES[1];
    d.s.flags[lanternRef(site.id, person.id) + '.met'] = true;
    const lines = d.e.pack.dialogue.filter((n) =>
      d.e.pack.characters.some((c) => c.id === n.speaker && c.mode === 'fictional'),
    );
    const first = lines[0],
      second = lines.find((n) => n.speaker !== first.speaker)!;
    d.s.flags['node.' + first.id] = true;
    d.s.flags['node.' + second.id] = true;
    const heard = callingPage(d.e.pack, d.e.dialogueById, d.s, first.speaker)!;
    expect(heard.past.map((n) => n.id)).toEqual([first.id]);
    expect(heard.visits).toEqual([]);
    expect(callers(d.e.pack, d.e.dialogueById, d.s).map((c) => c.id)).toEqual([
      second.speaker,
      first.speaker,
      person.character,
    ]);
    expect(callingPage(d.e.pack, d.e.dialogueById, d.s, person.character)!.visits).toHaveLength(1);
  });
  it('keeps all 250 distinct commission titles short and keeps the actual instruction on each question route', () => {
    const d = new Driver(),
      titles = [];
    for (const person of LANTERN_PEOPLE) {
      const kit = guestInstrument(person.id)!,
        site = LANTERN_SITES.find((s) => s.id === kit.home)!;
      const goal = d.e.pack.missions
        .flatMap((m) => m.objectives)
        .find((o) => o.id === lanternRef(site.id, person.id) + '.received')!;
      expect(goal.title).toContain(person.name);
      expect(goal.title).toContain(site.bench);
      expect(goal.title.split(/\s+/).length).toBeLessThan(23);
      expect(goal.questionWays?.[0].action).toContain(person.title);
      titles.push(goal.title);
    }
    expect(new Set(titles).size).toBe(250);
  });
});
