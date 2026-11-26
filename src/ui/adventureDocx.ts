import { strToU8, zipSync } from 'fflate';
import type { AdventureJournalView } from '../domain/adventureJournal';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const PACKAGE_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

export const ADVENTURE_DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function escapeXml(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function paragraph(text: string, style = 'Normal'): string {
  const lines = text.split(/\r\n|\n|\r/).map((line) => `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`);
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r>${lines.join('<w:br/>')}</w:r></w:p>`;
}

function stamp(at: string | null): string {
  return at ? `${new Date(at).toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'Earlier in this adventure';
}

const kindLabels = { quest: 'Quest', choice: 'Choice', experience: 'Experience', note: 'Note', reflection: 'Reflection', question: 'Question' };

const styles = `${xmlHeader}<w:styles xmlns:w="${WORD}">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Lexend" w:hAnsi="Lexend" w:eastAsia="Lexend" w:cs="Lexend"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="140" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="223234"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:after="280"/></w:pPr><w:rPr><w:b/><w:color w:val="254746"/><w:sz w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="125"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="245A55"/><w:sz w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="185" w:after="70"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="JournalDetails"><w:name w:val="Journal details"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:after="90"/></w:pPr><w:rPr><w:color w:val="486666"/><w:sz w:val="19"/></w:rPr></w:style>
</w:styles>`;

interface DocxOptions {
  includeNotes: boolean;
  placeName: (mapId: string) => string | undefined;
}

/** Pack a real Office Open XML document. The ZIP and document are made in memory. */
export function adventureDocx(view: AdventureJournalView, options: DocxOptions): Uint8Array<ArrayBuffer> {
  const meta = (kind: string, at: string | null, mapId: string | null) =>
    [kind, stamp(at), mapId ? options.placeName(mapId) : null].filter(Boolean).join(' · ');
  const blocks = [paragraph(`${view.name}’s Adventure Journal`, 'Title'), paragraph('Knowledge Guardians')];
  blocks.push(paragraph('Adventure diary', 'Heading1'));
  if (!view.entries.length) blocks.push(paragraph('I have yet to make a diary entry on this adventure.'));
  for (const entry of view.entries) {
    blocks.push(paragraph(entry.title, 'Heading2'), paragraph(meta(kindLabels[entry.kind], entry.at, entry.mapId), 'JournalDetails'), paragraph(entry.text));
  }
  if (options.includeNotes && view.notes.length) {
    blocks.push(paragraph('My notes and reflections', 'Heading1'));
    for (const note of view.notes) {
      const label = note.kind === 'question' ? (note.resolved ? 'Resolved question' : 'Open question') : kindLabels[note.kind];
      blocks.push(paragraph(meta(label, note.at, note.mapId), 'JournalDetails'), paragraph(note.text));
    }
  }
  blocks.push(paragraph('Open quests and questions', 'Heading1'));
  const questions = options.includeNotes ? view.notes.filter((note) => note.kind === 'question' && !note.resolved) : [];
  if (!view.quests.length && !questions.length) blocks.push(paragraph('There are no open quests or questions in this journal.'));
  for (const quest of view.quests) {
    blocks.push(paragraph(quest.title, 'Heading2'));
    if (quest.question) blocks.push(paragraph(quest.question));
    for (const step of quest.steps) blocks.push(paragraph(`• ${step}`));
  }
  if (questions.length) {
    blocks.push(paragraph('My open questions', 'Heading2'));
    for (const note of questions) blocks.push(paragraph(`• ${note.text}`));
  }
  const document = `${xmlHeader}<w:document xmlns:w="${WORD}"><w:body>${blocks.join('')}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="425" w:footer="425" w:gutter="0"/></w:sectPr>
    </w:body></w:document>`;
  const contentTypes = `${xmlHeader}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>`;
  const relationship = (type: string, target: string) => `${xmlHeader}<Relationships xmlns="${PACKAGE_REL}"><Relationship Id="rId1" Type="${OFFICE_REL}/${type}" Target="${target}"/></Relationships>`;
  const bytes = zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(relationship('officeDocument', 'word/document.xml')),
    'word/_rels/document.xml.rels': strToU8(relationship('styles', 'styles.xml')),
    'word/document.xml': strToU8(document),
    'word/styles.xml': strToU8(styles),
  });
  return new Uint8Array(bytes);
}
