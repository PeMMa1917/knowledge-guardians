import { describe, expect, it } from 'vitest';
import stories from '../src/content/neighbours.json';
import { neighbourInvitation } from '../src/domain/neighbours';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { Driver } from './driver';

describe('Neighbours met while following other business', () => {
  it('places every speaker on a campaign map and preserves their usual conversation', () => {
    const d = new Driver();
    const actors = Object.values(MAPS).flatMap((m) => m.npcs.map((npc) => npc.id));
    const cast = stories.flatMap((s) => s.people);
    expect(new Set(cast.map((p) => p.id)).size).toBe(cast.length);
    for (const person of cast) {
      expect(actors, person.id).toContain(person.id);
      expect(d.e.talkEntry(person.id, d.s), person.id).toBeTruthy();
      const visit = neighbourInvitation(person.id, d.s.flags)!;
      expect(visit.text).toBe(person.hook);
      d.walk(visit.node, ['Give them a little time.']);
      expect(neighbourInvitation(person.id, d.s.flags)).toEqual(visit);
    }
    expect(neighbourInvitation('warden-ise', {})).toBeUndefined();
  });

  it('preserves only encountered neighbour stories in topic-filterable, personal journal entries', () => {
    const d = new Driver();
    const pick = stories.flatMap((s) => s.people).find((p) => p.id === 'civic-clerk')!;
    d.walk(neighbourInvitation(pick.id, d.s.flags)!.node, [pick.choices[1].action]);
    const view = adventureJournalView(d.e.pack, d.s, d.e.visibleObjectives(d.s));
    const heard = view.entries.find((entry) => entry.id === 'conversation:neighbour.civic-clerk')!;
    expect(heard.topics?.themes).toContain('TEC');
    expect(heard.topics?.concepts).toContain('interpretation');
    expect(heard.reflections?.some((r) => r.prompt.includes('open door'))).toBe(true);
    expect(view.entries.some((entry) => entry.id.startsWith('conversation:neighbour.civic-operator'))).toBe(false);
    const heardByAde = neighbourInvitation('civic-operator', d.s.flags)!.node;
    d.walk(heardByAde, ['Leave them to it.']);
    const after = adventureJournalView(d.e.pack, d.s, d.e.visibleObjectives(d.s));
    expect(after.entries.find((entry) => entry.id === 'conversation:' + heardByAde)?.topics).toEqual(heard.topics);
  });

  for (const story of stories) it(story.title + ' can begin with either person and keep four different households', () => {
    for (const order of [story.people, [...story.people].reverse()]) {
      const [one, two] = order;
      for (const initial of one.choices) for (const answer of two.choices) {
        const d = new Driver();
        const ordinary = d.e.talkEntry(one.id, d.s);
        const entry = neighbourInvitation(one.id, d.s.flags)!;
        d.walk(entry.node, [initial.action]);
        expect(d.s.flags[entry.node]).toBe(initial.id);
        expect(neighbourInvitation(one.id, d.s.flags)).toBeUndefined();
        expect(d.e.talkEntry(one.id, d.s)).toBe(ordinary);
        const reply = neighbourInvitation(two.id, d.s.flags)!;
        expect(d.e.node(reply.node).text).toBe(initial.neighbour);
        d.walk(reply.node, ['Leave them to it.']);
        d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
        const second = neighbourInvitation(two.id, d.s.flags)!;
        expect(d.e.node(second.node).text).toBe(two.opening);
        d.walk(second.node, [answer.action]);
        const returnVisit = neighbourInvitation(one.id, d.s.flags)!;
        expect(d.e.node(returnVisit.node).text).toBe(answer.neighbour);
        d.walk(returnVisit.node);
        expect(neighbourInvitation(one.id, d.s.flags)).toBeUndefined();
        expect(neighbourInvitation(two.id, d.s.flags)).toBeUndefined();
        expect(d.s.adventureDiary.entries.find((e) => e.id === 'conversation:' + returnVisit.node)?.text).toContain(answer.neighbour);
        expect(d.e.visibleOptions(entry.node, d.s).map((o) => o.option.text)).toEqual(['Give them a little time.']);
      }
    }
  });
});
