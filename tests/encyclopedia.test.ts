import { describe, expect, it } from 'vitest';
import matches from '../src/content/encyclopedia.json';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { encyclopediaForBiography, encyclopediaForCharacter, encyclopediaForDiaryEvent, encyclopediaForExhibit,
  encyclopediaLinkLabel, isEncyclopediaURL } from '../src/domain/encyclopedia';
import { migrateCampaign } from '../src/domain/saves';
import type { CampaignState } from '../src/domain/types';
import { Driver } from './driver';

function view(d: Driver, state = d.s) { return adventureJournalView(d.e.pack, state, []); }

describe('Encyclopedia links for actual encounters', () => {
  it('adds an inspected object to Wikipedia lookups before its institutional citation is earned', () => {
    const d = new Driver();
    const exhibit = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-NUMBER-LEAF-ishango')!;
    expect(view(d).encyclopedia).toEqual([]);
    d.s.cards.push(exhibit.grantsCard);
    expect(view(d).encyclopedia).toEqual([]);
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    expect(view(d).references).toEqual([]);
    expect(view(d).encyclopedia).toEqual([expect.objectContaining({
      key: 'object:rbins:ishango-bone-1950', kind: 'article', encounter: 'inspected', url: 'https://en.wikipedia.org/wiki/Ishango_bone',
    })]);
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    expect(view(d).encyclopedia).toHaveLength(1);
    d.s.objectivesDone.push(exhibit.specimen!.objective);
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    expect(view(d).references).toEqual([expect.objectContaining({ key: exhibit.specimen!.key, url: expect.stringContaining('naturalsciences.be') })]);
    expect(view(d).encyclopedia).toHaveLength(1);
  });

  it('distinguishes a historical speaker from a documentary biography the player opens', () => {
    const d = new Driver();
    d.run({ type: 'EnterNode', node: 'ise.start3' });
    expect(view(d).encyclopedia).toEqual([]);
    d.talk('model-record-maker-betty-shannon');
    expect(view(d).encyclopedia).toEqual([expect.objectContaining({ name: 'Betty Shannon', encounter: 'met', kind: 'article' })]);
    expect(view(d).encyclopedia.some(({ name }) => name === 'Claude Shannon')).toBe(false);
    const biography = 'card.person.haytham';
    expect(() => d.run({ type: 'ReadBiography', card: biography })).toThrow('Open a historical evidence card first');
    const exhibit = d.e.pack.exhibits.find(({ grantsCard }) => grantsCard === biography)!;
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    expect(view(d).encyclopedia.some(({ encounter }) => encounter === 'read')).toBe(false);
    const skillsBeforeReading = d.p.skills;
    d.run({ type: 'ReadBiography', card: biography });
    d.run({ type: 'ReadBiography', card: biography });
    expect(view(d).encyclopedia.filter(({ encounter }) => encounter === 'read')).toEqual([expect.objectContaining({
      name: 'Ibn al-Haytham', encounter: 'read', entity: 'person', kind: 'article',
    })]);
    expect(d.p.skills).toEqual(skillsBeforeReading);
  });

  it('uses recorded inspection and historical dialogue in a migrated save without inferring a biography read', () => {
    const d = new Driver();
    const exhibit = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-NILE-SALLIER')!;
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.talk('model-record-maker-moniac');
    const old = { ...d.s, schema: 4 } as Partial<CampaignState>;
    delete old.adventureDiary;
    const restored = migrateCampaign(old).state;
    expect(view(d, restored).encyclopedia).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Bill Phillips', encounter: 'met' }),
      expect.objectContaining({ name: 'Papyrus Sallier III', kind: 'related', encounter: 'inspected' }),
    ]));
    expect(view(d, restored).encyclopedia.some(({ encounter }) => encounter === 'read')).toBe(false);
  });

  it('binds every checked identity to current authored records and gives every documented exhibit a safe result', () => {
    const d = new Driver();
    const pack = d.e.pack;
    for (const match of matches.people) {
      expect(match.wikidata).toMatch(/^Q[1-9]\d*$/);
      for (const id of match.characters) expect(pack.characters.find((row) => row.id === id)?.mode).toBe('historical');
      for (const id of match.biographies) expect(pack.cards.find((row) => row.id === id)?.person).toBeDefined();
    }
    expect(new Set(matches.exhibits.map(({ id }) => id)).size).toBe(matches.exhibits.length);
    for (const { id, wikidata, basis } of matches.exhibits) {
      expect(pack.exhibits.find((row) => row.id === id)?.historicalLabel).toBe('documented');
      expect(wikidata).toMatch(/^Q[1-9]\d*$/);
      expect(basis).not.toBe('');
    }
    for (const exhibit of pack.exhibits) {
      const link = encyclopediaForExhibit(exhibit);
      if (exhibit.historicalLabel === 'documented') {
        expect(link?.entity).toBe('object');
        expect(link && isEncyclopediaURL(link.url, link.kind)).toBe(true);
        if (link?.kind === 'search') expect(encyclopediaLinkLabel(link)).toMatch(/^Search Wikipedia for /);
      } else expect(link).toBeUndefined();
    }
    for (const character of pack.characters.filter(({ mode }) => mode === 'historical')) expect(encyclopediaForCharacter(character)).toBeDefined();
    for (const card of pack.cards.filter(({ person }) => !!person)) expect(encyclopediaForBiography(card)).toBeDefined();
  });

  it('attaches the link to the relevant dated event and leaves a fictional conversation unlinked', () => {
    const d = new Driver();
    const events = [
      { kind: 'inspection', ref: 'OBJ-NILE-STONE', key: 'exhibit:OBJ-NILE-STONE' },
      { kind: 'inspection', ref: 'card.person.haytham', key: 'biography:card.person.haytham' },
      { kind: 'conversation', ref: 'model-record.theseus.wiring', key: 'conversation:model-record.theseus.wiring' },
      { kind: 'conversation', ref: 'ise.start3', key: 'conversation:ise.start3' },
    ] as const;
    const at = '2026-11-26T10:00:00.000Z';
    d.s.adventureDiary.entries = events.map((event) => ({ id: event.key,
      kind: 'experience' as const, at, mapId: 'nexus.archive', title: event.ref, text: 'A recorded visit.', event }));
    expect(view(d).entries.map((row) => [row.at, row.encyclopedia?.encounter])).toEqual([
      [at, 'inspected'], [at, 'read'], [at, 'met'], [at, undefined],
    ]);
    expect(encyclopediaForDiaryEvent(d.e.pack, { ...events[0], key: 'clue:OBJ-NILE-STONE' })).toBeUndefined();
  });

  it('marks a different edition or broad subject as contextual and identifies the exact German codex article', () => {
    const pack = new Driver().e.pack;
    const record = (id: string) => encyclopediaForExhibit(pack.exhibits.find((row) => row.id === id)!)!;
    expect(record('OBJ-READING-WORKS-IDRISI')).toMatchObject({ kind: 'related', title: 'Tabula Rogeriana' });
    expect(record('OBJ-PASSAGE-yirrkala-dhuwa')).toMatchObject({ kind: 'related', title: 'Yirrkala bark petitions' });
    expect(record('OBJ-PASSAGE-yirrkala-yirritja')).toMatchObject({ kind: 'related', title: 'Yirrkala bark petitions' });
    const codex = record('OBJ-CALL-quetzalecatzin');
    expect(codex).toMatchObject({ kind: 'article', language: 'de', url: 'https://de.wikipedia.org/wiki/Codex_Quetzalecatzin' });
    expect(isEncyclopediaURL(codex.url, codex.kind)).toBe(true);
    expect(encyclopediaLinkLabel(codex)).toContain('(German)');
    expect(record('OBJ-PRES-BINAK-X104841')).toMatchObject({ kind: 'search' });
  });

  it('links the exact Museo Egizio map and distinguishes it from a separate papyrus and printed editions', () => {
    const d = new Driver();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    const records = view(d).encyclopedia;
    expect(records).toContainEqual(expect.objectContaining({ key: 'object:museo-egizio:papyrus-document-9',
      kind: 'article', url: 'https://en.wikipedia.org/wiki/Turin_Papyrus_Map' }));
    expect(records).toContainEqual(expect.objectContaining({ key: 'object:OBJ-NILE-STRIKE',
      kind: 'related', url: 'https://en.wikipedia.org/wiki/Deir_el-Medina' }));
    expect(view(d).references).toEqual([]);
    const guide = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-DOOR-02')!;
    expect(encyclopediaForExhibit(guide)).toMatchObject({ kind: 'related', title: 'The Negro Motorist Green Book' });
  });

  it('accepts article routes and explicit searches over the approved Wikipedia hosts only', () => {
    expect(isEncyclopediaURL('https://en.wikipedia.org/w/index.php?search=Amunnakht', 'search')).toBe(true);
    expect(isEncyclopediaURL('https://it.wikipedia.org/wiki/Codice_Quetzalecatzin', 'article')).toBe(true);
    for (const url of ['http://en.wikipedia.org/wiki/Anything', 'https://en.wikipedia.org.example/wiki/Anything',
      'https://person@en.wikipedia.org/wiki/Anything', 'https://en.wikipedia.org/wiki/Special%3ASearch',
      'https://en.wikipedia.org/wiki/Anything?redirect=1', 'https://de.wikipedia.org/wiki/', 'https://en.wikipedia.org/wiki/Anything#unknown']) {
      expect(isEncyclopediaURL(url, 'article'), url).toBe(false);
    }
    for (const url of ['https://de.wikipedia.org/w/index.php?search=Amunnakht',
      'https://en.wikipedia.org/w/index.php?search=Amunnakht&other=x', 'https://en.wikipedia.org/w/index.php?search=%20']) {
      expect(isEncyclopediaURL(url, 'search'), url).toBe(false);
    }
  });
});
