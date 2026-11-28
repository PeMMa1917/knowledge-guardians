import { describe, expect, it } from 'vitest';
import lifetimes from '../src/content/historical-lifetimes.json';
import encyclopedia from '../src/content/encyclopedia.json';
import { LANTERN_PEOPLE } from '../src/domain/lamplight';
import { buildPack } from '../src/content';
import { historicalEncounters } from '../src/domain/historicalEncounters';
import { Driver } from './driver';

describe('historical casting', () => {
  it('has one dated biography for each recurring guest, linked to the same human as their encyclopedia entry', () => {
    const people = new Map(lifetimes.map((person) => [person.id, person]));
    expect(new Set(LANTERN_PEOPLE.map((guest) => guest.character)).size).toBe(
      250,
    );
    expect(people.size).toBe(lifetimes.length);
    const characters = new Set(
      encyclopedia.people.flatMap((entry) => entry.characters),
    );
    const biographies = new Set(
      encyclopedia.people.flatMap((entry) => entry.biographies),
    );
    for (const entry of encyclopedia.people) {
      const dated = people.get(entry.wikidata);
      expect(dated?.article, entry.title).toBe(entry.title);
      expect(dated?.period, entry.title).toMatch(/\d/);
    }
    const pack = buildPack();
    for (const person of pack.characters.filter((p) => p.mode === 'historical'))
      expect(characters.has(person.id), person.name).toBe(true);
    for (const card of pack.cards.filter(
      (c) => c.person && !biographies.has(c.id),
    )) {
      const localRecord = people.get(card.id);
      expect(localRecord?.name, card.id).toBe(card.person!.name);
      expect(card.sources, card.id).toContain(localRecord?.source);
    }
    for (const guest of LANTERN_PEOPLE) {
      const link = encyclopedia.people.find((person) =>
        person.characters.includes(guest.character),
      )!;
      expect(people.get(link.wikidata), guest.name).toMatchObject({
        name: guest.name,
        article: link.title,
      });
      const period = people.get(link.wikidata)!.period;
      expect(period).toMatch(/\d/);
      expect(period).not.toMatch(/\bb\.|present|contemporary|living|born/i);
    }
  });
  it('keeps an older conversation and source receipt from awarding an encounter with their new subject', () => {
    const d = new Driver();
    d.s.flags['node.ink.q219368'] = true;
    d.s.flags['lamplight.met.ink-q219368'] = true;
    for (const id of ['card.birdside.memory', 'card.seam.garjjat']) {
      d.s.cards.push(id);
      d.s.flags['read.biography.' + id] = true;
    }
    const history = historicalEncounters(d.e.pack, d.s);
    expect(history.peopleMet).toEqual([]);
    expect(history.biographiesRead).toEqual([]);
    expect(
      buildPack().characters.some(
        (person) => person.name === 'Magnus Hirschfeld',
      ),
    ).toBe(true);
  });
});
