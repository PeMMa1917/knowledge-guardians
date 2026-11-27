import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { Engine, newCampaign, type Command } from '../src/domain/engine';
import { newPermanent } from '../src/domain/permanent';
import { emptyPair, migrateCampaign, parsePair, serialisePair, writeCheckpoint, writeSuspend } from '../src/domain/saves';
import { hasSpecimen, SPECIMEN_BASE } from '../src/domain/specimenGear';
import { journalEvidence, specimenReferences } from '../src/domain/specimenReferences';
import { CAMPAIGN_SCHEMA, type CampaignState } from '../src/domain/types';
import { adventureDocx } from '../src/ui/adventureDocx';
import { adventureExportSnapshot } from '../src/ui/adventureExport';

const pack = buildPack();
const startedAt = '2026-11-26T06:00:00.000Z';
const later = '2026-11-26T06:12:00.000Z';

function adventure() {
  const engine = new Engine(pack);
  let state = newCampaign(pack, 'Ren & Lin', 'player-a', 7);
  let permanent = newPermanent();
  return {
    get state() { return state; },
    get permanent() { return permanent; },
    action(command: Command, at = startedAt) {
      const result = engine.dispatch(command, state, permanent, at);
      state = result.state;
      permanent = result.permanent;
      return result;
    },
    view() { return adventureJournalView(pack, state, engine.visibleObjectives(state)); },
  };
}

describe('Adventure diary', () => {
  it('dates actual arrivals, significant dialogue choices and quest completion in first person', () => {
    const d = adventure();
    d.action({ type: 'VisitPlace', name: 'The Nexus: Archive Hall' });
    d.action({ type: 'VisitPlace', name: 'The Nexus: Archive Hall' }, later);
    d.action({ type: 'ChooseDialogueOption', node: 'cold.open3', index: 1 }, later);
    d.action({ type: 'EnterNode', node: 'ise.start3' }, later);
    const diary = d.view().entries;
    expect(diary.filter((entry) => entry.id === 'place:nexus.archive')).toEqual([expect.objectContaining({
      at: startedAt, kind: 'experience', mapId: 'nexus.archive', text: 'I arrived at The Nexus: Archive Hall.',
    })]);
    expect(diary).toContainEqual(expect.objectContaining({
      at: later, kind: 'choice', text: expect.stringContaining('I chose “Someone I trust told me to come.”'),
    }));
    expect(diary).toContainEqual(expect.objectContaining({
      at: later, kind: 'quest', id: 'quest:m01.o1.look', text: expect.stringMatching(/^I\b/),
    }));
  });

  it('quotes just the remark heard in passing and keeps another story from that speaker available', () => {
    const d = adventure();
    d.action({ type: 'SetFlag', flag: 'puzzle.tipped-cart.done', value: true });
    d.action({ type: 'SetFlag', flag: 'puzzle.echo-bridge.done', value: true });
    d.action({ type: 'HearWorldMemory', id: 'cart.idris' });
    const seen = d.view().entries.filter((entry) => entry.id.startsWith('overheard:'));
    expect(seen.map((entry) => entry.id)).toEqual(['overheard:cart.idris']);
    expect(seen[0].text).toContain(pack.memories!.find((memory) => memory.id === 'cart.idris')!.line);
    expect(seen[0].reflections?.length).toBeGreaterThan(0);
    expect(d.state.flags['mem.echo.idris']).toBeUndefined();
    d.action({ type: 'HearWorldMemory', id: 'echo.idris' }, later);
    d.action({ type: 'HearWorldMemory', id: 'cart.idris' }, later);
    expect(d.view().entries.filter((entry) => entry.id.startsWith('overheard:'))).toHaveLength(2);
  });

  it('keeps a more specific line and its fallback separate in the exported diary', () => {
    const d = adventure();
    d.action({ type: 'HearWorldMemory', id: 'visitor.pen.revised' });
    expect(d.state.flags['mem.visitor.pen.revised']).toBeUndefined();
    d.action({ type: 'SetFlag', flag: 'label.pen.failedOnce', value: true });
    d.action({ type: 'SetFlag', flag: 'label.pen.holds', value: true });
    d.action({ type: 'HearWorldMemory', id: 'visitor.pen.revised' });
    d.action({ type: 'HearWorldMemory', id: 'visitor.pen' });
    expect(d.state.flags['mem.visitor.pen']).toBe(true);
    expect(d.view().entries.filter((entry) => entry.id.startsWith('overheard:')).map((entry) => entry.id))
      .toEqual(['overheard:visitor.pen.revised']);
    const word = unzipSync(adventureDocx(d.view(), { includeNotes: true, placeName: () => 'Archive Hall' }));
    const document = strFromU8(word['word/document.xml']);
    expect(document).toContain('Your new pen label is clearer');
    expect(document).not.toContain('I read your pen label twice.');
    const returned = migrateCampaign(JSON.parse(JSON.stringify(d.state))).state;
    expect(returned.adventureDiary.entries.filter((entry) => entry.id.startsWith('overheard:'))).toHaveLength(1);
  });

  it('keeps failed commands and repeat reads out of the diary', () => {
    const d = adventure();
    const bad = d.action({ type: 'ChooseDialogueOption', node: 'cold.open3', index: 700 });
    expect(bad.events).toEqual([expect.objectContaining({ kind: 'error' })]);
    expect(d.view().entries).toEqual([]);
    d.action({ type: 'ChooseDialogueOption', node: 'cold.open3', index: 0 });
    d.action({ type: 'ChooseDialogueOption', node: 'cold.open3', index: 0 }, later);
    expect(d.view().entries).toHaveLength(1);
    expect(d.view().entries[0].at).toBe(startedAt);
  });

  it('shows currently visible quest steps, withholds future steps and keeps private questions editable', () => {
    const d = adventure();
    const first = d.view().quests.find((quest) => quest.id === 'KG-CH1-M01');
    expect(first?.question).toContain('?');
    expect(first?.steps).not.toContain('Inspect the three exhibits. Each one says \'The first ballpoint pen\'.');
    expect(d.view().quests.some((quest) => quest.id === 'KG-CH1-M02')).toBe(false);
    const note = 'I wonder how a filing date differs from an object date.\nI want a second source.';
    d.action({ type: 'AddNote', kind: 'reflection', text: note });
    d.action({ type: 'AddNote', kind: 'question', text: 'How far could the model travel?' }, later);
    expect(d.view().notes).toMatchObject([
      { kind: 'reflection', index: 0, text: note, mapId: 'nexus.archive', resolved: false, at: startedAt },
      { kind: 'question', index: 1, text: 'How far could the model travel?', mapId: 'nexus.archive', resolved: false, at: later },
    ]);
    expect(JSON.stringify(d.permanent)).not.toContain(note);
    const wrongNote = d.action({ type: 'SetDiaryQuestion', index: 0, resolved: true });
    expect(wrongNote.events).toEqual([expect.objectContaining({ kind: 'error' })]);
    d.action({ type: 'SetDiaryQuestion', index: 1, resolved: true });
    expect(d.view().notes[1]).toMatchObject({ resolved: true, at: later });
  });

  it('migrates earlier notes and quest progress without inventing times, and keeps both slots', () => {
    const d = adventure();
    const old = { ...d.state, schema: 4, notes: ['A plain note', 'Reflection: Keep both sources', 'Question for Sefa: What does the song omit?'],
      objectivesDone: ['m01.o1.look'], journal: ['j.m01.start'] } as Partial<CampaignState>;
    delete old.adventureDiary;
    const migrated = migrateCampaign(old);
    expect(migrated.migrated).toBe(true);
    expect(migrated.state.schema).toBe(CAMPAIGN_SCHEMA);
    expect(migrated.state.notes).toEqual(old.notes);
    const view = adventureJournalView(pack, migrated.state, []);
    expect(view.entries).toContainEqual(expect.objectContaining({ id: 'quest:m01.o1.look', at: null, mapId: null }));
    expect(view.notes.map(({ kind, at }) => [kind, at])).toEqual([['note', null], ['reflection', null], ['question', null]]);
    const slot = { kind: 'checkpoint' as const, label: 'Previous adventure', location: 'Nexus', savedAt: startedAt };
    const checkpoint = writeCheckpoint(emptyPair(), { ...slot, state: old as CampaignState });
    d.action({ type: 'VisitPlace', name: 'The Nexus: Archive Hall' }, later);
    d.action({ type: 'AddNote', kind: 'question', text: 'Still open?' }, later);
    const continued = writeSuspend(checkpoint, { ...slot, state: d.state });
    const read = parsePair(serialisePair(continued));
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(Object.keys(read.pair).sort()).toEqual(['continue', 'recovery', 'revision']);
    expect(read.pair.recovery?.state.notes).toEqual(old.notes);
    expect(read.pair.continue?.state.adventureDiary).toEqual(d.state.adventureDiary);
  });

  it('writes a valid Word package with quest questions and opt-in private writing', () => {
    const d = adventure();
    d.action({ type: 'VisitPlace', name: 'The Nexus: Archive Hall' });
    d.action({ type: 'AddNote', kind: 'reflection', text: 'Only me: <keep> A & B.\nNext line. 🦉' });
    d.action({ type: 'AddNote', kind: 'question', text: 'My private question?' }, later);
    const view = d.view();
    const options = { includeNotes: true, placeName: () => 'Archive Hall' };
    const withNotes = unzipSync(adventureDocx(view, options));
    expect(Object.keys(withNotes)).toEqual(expect.arrayContaining(['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml']));
    const document = strFromU8(withNotes['word/document.xml']);
    expect(document).toContain('Ren &amp; Lin’s Adventure Journal');
    expect(document).toContain('2026-11-26 06:00 UTC');
    expect(document).toContain('Open quests and questions');
    expect(document).toContain('Only me: &lt;keep&gt; A &amp; B.');
    expect(document).toContain('<w:br/>');
    expect(document).toContain('🦉');
    expect(document).toContain('My private question?');
    expect(document).toContain('<w:pgSz w:w="11906" w:h="16838"/>');
    const withoutNotes = strFromU8(unzipSync(adventureDocx(view, { ...options, includeNotes: false }))['word/document.xml']);
    expect(withoutNotes).not.toContain('Only me');
    expect(withoutNotes).not.toContain('My private question?');
  });

  it('exports the full journal by default and can omit personal writing for a shared copy', () => {
    const d = adventure();
    d.action({ type: 'VisitPlace', name: 'The Nexus: Archive Hall' });
    d.action({ type: 'AddNote', text: 'Private directions.' }, later);
    d.action({ type: 'AddNote', kind: 'question', text: 'Already answered?' }, later);
    d.action({ type: 'AddNote', kind: 'question', text: 'Still to check?' }, later);
    d.action({ type: 'SetDiaryQuestion', index: 1, resolved: true }, later);
    const view = d.view();
    const options = { placeName: () => 'The Nexus' };
    const standard = adventureExportSnapshot(view, options);
    expect(standard.title).toBe('Ren & Lin’s Adventure Journal');
    expect(standard.entries[0].details).toBe('Experience · 2026-11-26 06:00 UTC · The Nexus');
    expect(standard.quests).toEqual(view.quests);
    const shareable = adventureExportSnapshot(view, { ...options, includeNotes: false });
    expect(shareable.notes).toEqual([]);
    expect(shareable.questions).toEqual([]);
    expect(standard.notes).toMatchObject([
      { details: 'Note · 2026-11-26 06:12 UTC · The Nexus', text: 'Private directions.' },
      { details: 'Resolved question · 2026-11-26 06:12 UTC · The Nexus', text: 'Already answered?' },
      { details: 'Open question · 2026-11-26 06:12 UTC · The Nexus', text: 'Still to check?' },
    ]);
    expect(standard.questions).toEqual(['Still to check?']);
    expect(adventureExportSnapshot(view, options)).toEqual(standard);
  });

  it('keeps exact MLA links for collected exhibits only, including when a specimen is shelved', () => {
    const [exhibit, unearned] = pack.exhibits.filter(hasSpecimen);
    const d = adventure();
    d.action({ type: 'InspectExhibit', exhibit: unearned.id });
    d.action({ type: 'InspectExhibit', exhibit: exhibit.id });
    expect(d.view().references).toEqual([]);
    expect(journalEvidence(pack, d.state).map(({ card }) => card.id)).not.toContain(unearned.grantsCard);
    expect(d.action({ type: 'ClaimSpecimen', exhibit: exhibit.id }).events).toContainEqual(expect.objectContaining({ kind: 'error' }));
    d.state.objectivesDone.push(exhibit.specimen.objective);
    d.action({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    d.state.mapId = SPECIMEN_BASE;
    d.action({ type: 'CarrySpecimen', key: exhibit.specimen.key, carry: false });
    const view = d.view();
    const official = pack.sources.find((source) => source.id === exhibit.specimen.source)!;
    expect(view.references).toEqual([expect.objectContaining({
      key: exhibit.specimen.key, label: expect.stringContaining(exhibit.specimen.accession), url: official.url,
      text: expect.stringContaining(exhibit.name),
      runs: expect.arrayContaining([expect.objectContaining({ href: official.url }), expect.objectContaining({ cite: true })]),
    })]);
    expect(specimenReferences(pack)).toHaveLength(pack.exhibits.filter(hasSpecimen).length);
    expect(journalEvidence(pack, d.state)).toContainEqual({
      card: expect.objectContaining({ id: exhibit.grantsCard }), includeSources: false,
    });
    expect(adventureExportSnapshot(view, { placeName: () => undefined }).references).toEqual(view.references);
  });

  it('preserves italics and an external Word hyperlink for the exact collection source without exporting private writing', () => {
    const exhibit = pack.exhibits.find(hasSpecimen)!;
    const d = adventure();
    d.action({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.state.objectivesDone.push(exhibit.specimen.objective);
    d.action({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    d.action({ type: 'AddNote', text: 'This paragraph stays private.' });
    const url = 'https://collection.example/item?id=2&view=exact';
    const fixture = { ...pack, sources: pack.sources.map((source) => source.id === exhibit.specimen.source
      ? { ...source, url, accessed: '2026-11-26', mla: { kind: 'artwork' as const, title: exhibit.name, author: 'Maker, Known',
        container: 'The Museum', workDate: exhibit.dateText, showAccessDate: true } } : source) };
    const references = specimenReferences(fixture, d.state);
    expect(references[0].text).toContain('Maker, Known. ');
    expect(references[0].text).toContain('Accessed 26 Nov. 2026.');
    const exported = unzipSync(adventureDocx({ ...d.view(), references }, { placeName: () => undefined, includeNotes: false }));
    const document = strFromU8(exported['word/document.xml']);
    const relations = strFromU8(exported['word/_rels/document.xml.rels']);
    expect(document).toContain('Works Cited');
    expect(document).toContain('<w:hyperlink r:id="rId2">');
    expect(document).toContain('<w:i/>');
    expect(document).not.toContain('This paragraph stays private');
    expect(relations).toContain('Target="https://collection.example/item?id=2&amp;view=exact" TargetMode="External"');
    expect(relations).toContain('Id="rId1"');
  });
});
