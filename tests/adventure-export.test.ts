import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import type { AdventureJournalView } from '../src/domain/adventureJournal';
import { CONCEPT_COLOURS } from '../src/domain/conceptText';
import { adventureDocx } from '../src/ui/adventureDocx';
import { adventureExportSnapshot, safeJournalLink } from '../src/ui/adventureExport';

const options = { placeName: () => 'Archive Hall' };
const at = '2026-11-26T06:12:30.000Z';
const mapId = 'nexus.archive';
const source = 'https://collection.example/item?id=2&view=exact#part';
const article = 'https://en.wikipedia.org/wiki/Ada_Lovelace';
const search = 'https://en.wikipedia.org/w/index.php?search=Unknown+object';
const terms = Object.keys(CONCEPT_COLOURS).join(' ');
const long = '  🦉 <draft> & 漢字\r\n\t' + 'Long line.\n'.repeat(62) + 'Final line Ω.  \n';
const wikiTitle = 'Ada Lovelace';
const response = `I used EvIDeNCe.\n\n${long}`;

function fixture(): AdventureJournalView {
  return {
    name: 'A & B',
    entries: [
      { id: 'event:001', kind: 'experience', title: 'First evidence', text: `I recorded all terms.\n${terms}\nMy event ends here.`, at, mapId,
        reflections: [
          { id: 'p1', prompt: 'Where did the truth appear?', response },
          { id: 'p2', prompt: 'What could change your perspective?' },
        ] },
      { id: 'event:002', kind: 'choice', title: 'Second event', text: 'I checked a second explanation.', at, mapId },
    ],
    notes: [
      { index: 1, kind: 'note', at, mapId, text: `Writing about culture.\n${long}`, resolved: false,
        reflections: [{ id: 'n1', prompt: 'What evidence did you keep?', response: `I kept it.\n${long}` }] },
      { index: -1, kind: 'note', at: null, mapId: null, text: `Draft uses values.\n${long}`, resolved: false, draft: true },
    ],
    portfolioWriting: [
      { id: 'portfolio:1', title: 'Power on the shelf', text: `Portfolio shows responsibility.\n${long}`, at, mapId },
    ],
    quests: [{ id: 'q1', title: 'An open explanation', question: 'Where does certainty belong?', steps: ['Consider objectivity.'] }],
    references: [
      { key: 'earned:1', label: 'Tested evidence', url: source, text: 'Title and source', runs: [
        { text: 'Evidence of a place', cite: true }, { text: ' Museum link', href: source },
        { text: ' Suspect link', href: 'javascript:alert(1)' },
      ] },
    ],
    encyclopedia: [
      { key: 'encounter:ad', entity: 'person', name: wikiTitle, title: wikiTitle, kind: 'article', encounter: 'met', url: article },
      { key: 'encounter:unknown', entity: 'object', name: 'Unknown object', title: 'Unknown object',
        kind: 'search', encounter: 'inspected', url: search },
      { key: 'encounter:bad', entity: 'object', name: 'Forged identity', title: 'Spoof',
        kind: 'article', encounter: 'inspected', url: 'https://en.wikipedia.org.spoof.example/wiki/Ada_Lovelace' },
    ],
  };
}

function readWord(view: AdventureJournalView, includeNotes?: boolean) {
  const files = unzipSync(adventureDocx(view, { ...options, includeNotes }));
  return {
    document: strFromU8(files['word/document.xml']),
    rels: strFromU8(files['word/_rels/document.xml.rels']),
  };
}

function paragraphs(xml: string): string[] {
  // Read the OOXML text and line-control elements that our renderer emits.
  return [...xml.matchAll(/<w:p>([\s\S]*?)<\/w:p>/g)].map(([, p]) =>
    [...p.matchAll(/<w:t xml:space="preserve">([\s\S]*?)<\/w:t>|<w:br\/>|<w:tab\/>/g)].map(([tag, content]) => {
      if (tag === '<w:br/>') return '\n';
      if (tag === '<w:tab/>') return '\t';
      return content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }).join(''));
}

describe('full adventure journal export', () => {
  it('preserves every event, optional prompt, response, long note, open draft and attributable Portfolio entry', () => {
    const view = fixture();
    const { document, rels } = readWord(view);
    const lines = paragraphs(document);
    expect(lines.indexOf(view.entries[0].title)).toBeLessThan(lines.indexOf(view.entries[1].title));
    for (const body of [
      ...view.entries.map(({ text }) => text), ...view.notes.map(({ text }) => text), view.portfolioWriting![0].text,
      view.entries[0].reflections![0].prompt, response, view.entries[0].reflections![1].prompt,
      view.notes[0].reflections![0].prompt, view.notes[0].reflections![0].response!,
    ]) expect(lines).toContain(body.replace(/\r\n/g, '\n'));
    expect(lines.filter((text) => text === 'What could change your perspective?')).toHaveLength(1);
    expect(lines).toContain('Draft note');
    expect(document).toContain('&lt;draft&gt; &amp; 漢字');
    expect(document).toContain('<w:tab/>');
    expect(document).toContain('<w:br/><w:br/>');
    expect(rels).toContain('https://collection.example/item?id=2&amp;view=exact#part');
    expect(rels).toContain(article);
    expect(rels).toContain(search);
    expect(rels).not.toContain('javascript:');
    expect(rels).not.toContain('spoof.example');
    expect(document).toContain('<w:i/>');
  });

  it('omits drafts, personal answers and Portfolio writing on request while keeping public prompts and links', () => {
    const view = fixture();
    const snapshot = adventureExportSnapshot(view, { ...options, includeNotes: false });
    expect(snapshot.notes).toEqual([]);
    expect(snapshot.portfolio).toEqual([]);
    expect(snapshot.entries[0].reflections).toEqual([
      { prompt: 'Where did the truth appear?' }, { prompt: 'What could change your perspective?' },
    ]);
    const { document, rels } = readWord(view, false);
    expect(paragraphs(document)).toContain('Where did the truth appear?');
    expect(document).not.toContain('My response');
    expect(document).not.toContain('Final line');
    expect(document).not.toContain('My Portfolio writing');
    expect(rels).toContain(article);
    expect(rels).toContain('https://collection.example');
    expect(view.entries[0].reflections![0].response).toBe(response);
  });

  it('gives Word and the shared print snapshot only matching encounters and their source links', () => {
    const view = fixture();
    Object.assign(view.entries[0], {
      topics: { concepts: ['evidence'], framework: ['methods-and-tools'], areas: ['HIS'], themes: ['LAN'] },
      specimenReference: view.references[0].key, encyclopedia: view.encyclopedia[0],
    });
    Object.assign(view.entries[1], { topics: { concepts: ['explanation'] }, encyclopedia: view.encyclopedia[1] });
    const scopedOptions = { ...options, includeNotes: false, selection: {
      now: new Date(at), time: { kind: 'session' as const, startedAt: Date.parse(at) },
      topics: { concepts: ['evidence', 'truth'] as const, framework: ['methods-and-tools'] as const,
        areas: ['HIS'] as const, themes: ['LAN'] as const },
    } };
    const snapshot = adventureExportSnapshot(view, scopedOptions);
    expect(snapshot.entries.map(({ title }) => title)).toEqual(['First evidence']);
    expect(snapshot.entries[0].reflections?.[0]).toEqual({ prompt: 'Where did the truth appear?' });
    expect(snapshot.references.map(({ url }) => url)).toEqual([source]);
    expect(snapshot.encyclopedia.map(({ url }) => url)).toEqual([article]);
    expect(snapshot.quests).toEqual([]);
    expect(snapshot.portfolio).toEqual([]);
    const files = unzipSync(adventureDocx(view, scopedOptions));
    const doc = strFromU8(files['word/document.xml']);
    const rels = strFromU8(files['word/_rels/document.xml.rels']);
    expect(paragraphs(doc)).toContain('First evidence');
    expect(paragraphs(doc)).not.toContain('Second event');
    expect(doc).not.toContain('Final line');
    expect(rels).toContain(article);
    expect(rels).not.toContain(search);
    expect(rels).toContain('https://collection.example/item?id=2&amp;view=exact#part');
  });

  it('renders all concept forms as bold, underlined palette colours and retains citation italics', () => {
    const { document } = readWord(fixture());
    for (const [concept, colours] of Object.entries(CONCEPT_COLOURS)) {
      const hex = colours.onLight.slice(1).toUpperCase();
      expect(document).toContain(`<w:rPr><w:b/><w:color w:val="${hex}"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${concept}</w:t>`);
    }
    expect(document).toContain('<w:rPr><w:b/><w:i/><w:color w:val="714A00"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">Evidence</w:t>');
    expect(document).toContain('>EvIDeNCe</w:t>');
  });

  it('accepts exact HTTPS catalogue links without authorizing active schemes, passwords or malformed URLs', () => {
    expect(safeJournalLink(source)).toBe(true);
    for (const url of ['javascript:alert(1)', 'data:text/html,x', ' https://museum.example', 'https://',
      'https://museum.example/a\nb', 'https://visitor:pass@museum.example', 'https://museum.example\\article']) {
      expect(safeJournalLink(url)).toBe(false);
    }
  });
});
