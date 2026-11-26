import { strToU8, zipSync } from 'fflate';
import { CONCEPT_COLOURS, splitConceptText } from '../domain/conceptText';
import type { AdventureJournalView } from '../domain/adventureJournal';
import { adventureExportSnapshot, type AdventureExportOptions } from './adventureExport';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const PACKAGE_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

export const ADVENTURE_DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function escapeXml(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wordRun(text: string, properties = ''): string {
  const content = text.split(/(\r\n|\r|\n|\t)/).map((part) => {
    if (part === '\t') return '<w:tab/>';
    if (/^[\r\n]+$/.test(part)) return '<w:br/>';
    return part ? `<w:t xml:space="preserve">${escapeXml(part)}</w:t>` : '';
  }).join('');
  return `<w:r>${properties ? `<w:rPr>${properties}</w:rPr>` : ''}${content}</w:r>`;
}

function wordProse(text: string, style: { italic?: boolean; link?: boolean } = {}): string {
  return splitConceptText(text).map(({ text, concept }) => {
    const colour = concept ? CONCEPT_COLOURS[concept].onLight.slice(1).toUpperCase() : style.link ? '184E4B' : undefined;
    return wordRun(text, [
      concept ? '<w:b/>' : '',
      style.italic ? '<w:i/>' : '',
      colour ? `<w:color w:val="${colour}"/>` : '',
      concept || style.link ? '<w:u w:val="single"/>' : '',
    ].join(''));
  }).join('');
}

function styledParagraph(runs: string, style: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${runs}</w:p>`;
}

function paragraph(text: string, style = 'Normal'): string {
  return styledParagraph(wordProse(text), style);
}

const styles = `${xmlHeader}<w:styles xmlns:w="${WORD}">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Lexend" w:hAnsi="Lexend" w:eastAsia="Lexend" w:cs="Lexend"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="140" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="223234"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:after="280"/></w:pPr><w:rPr><w:b/><w:color w:val="254746"/><w:sz w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="125"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="245A55"/><w:sz w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="185" w:after="70"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="JournalDetails"><w:name w:val="Journal details"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:after="90"/></w:pPr><w:rPr><w:color w:val="486666"/><w:sz w:val="19"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="WorksCited"><w:name w:val="Works cited"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="140" w:line="480" w:lineRule="auto"/><w:ind w:left="720" w:hanging="720"/></w:pPr></w:style>
</w:styles>`;

/** Pack a real Office Open XML document. The ZIP and document are made in memory. */
export function adventureDocx(view: AdventureJournalView, options: AdventureExportOptions): Uint8Array<ArrayBuffer> {
  const { title, scoped, entries, notes, untaggedReflections, portfolio, quests, questions, references, encyclopedia } = adventureExportSnapshot(view, options);
  const links = new Map<string, string>();
  const hyperlink = (text: string, url: string, italic?: boolean) => {
    const id = links.get(url) ?? `rId${links.size + 2}`;
    links.set(url, id);
    return `<w:hyperlink r:id="${id}">${wordProse(text, { italic, link: true })}</w:hyperlink>`;
  };
  const blocks = [paragraph(title, 'Title'), paragraph('Knowledge Guardians')];
  const addReflections = (items?: readonly { prompt: string; response?: string }[]) => {
    for (const { prompt, response } of items ?? []) {
      blocks.push(paragraph('Reflection prompt', 'JournalDetails'), paragraph(prompt));
      if (response !== undefined) blocks.push(paragraph('My response', 'JournalDetails'), paragraph(response));
    }
  };
  blocks.push(paragraph('Adventure diary', 'Heading1'));
  if (!entries.length) blocks.push(paragraph(scoped ? 'No diary entries match this selection.' : 'I have yet to make a diary entry on this adventure.'));
  for (const entry of entries) {
    blocks.push(paragraph(entry.title, 'Heading2'), paragraph(entry.details, 'JournalDetails'), paragraph(entry.text));
    addReflections(entry.reflections);
  }
  if (notes.length) {
    blocks.push(paragraph('My notes and reflections', 'Heading1'));
    for (const note of notes) {
      blocks.push(paragraph(note.details, 'JournalDetails'), paragraph(note.text));
      addReflections(note.reflections);
    }
  }
  if (untaggedReflections.length) {
    blocks.push(paragraph('My reflections on untagged encounters', 'Heading1'));
    for (const entry of untaggedReflections) {
      blocks.push(paragraph(entry.title, 'Heading2'), paragraph(entry.details, 'JournalDetails'));
      addReflections(entry.reflections);
    }
  }
  if (portfolio.length) {
    blocks.push(paragraph('My Portfolio writing', 'Heading1'));
    for (const entry of portfolio) blocks.push(paragraph(entry.title, 'Heading2'), paragraph(entry.details, 'JournalDetails'), paragraph(entry.text));
  }
  if (!scoped || quests.length || questions.length) blocks.push(paragraph('Open quests and questions', 'Heading1'));
  if (!scoped && !quests.length && !questions.length) blocks.push(paragraph('There are no open quests or questions in this journal.'));
  for (const quest of quests) {
    blocks.push(paragraph(quest.title, 'Heading2'));
    if (quest.question) blocks.push(paragraph(quest.question));
    for (const step of quest.steps) blocks.push(paragraph(`• ${step}`));
  }
  if (questions.length) {
    blocks.push(paragraph('My open questions', 'Heading2'));
    for (const question of questions) blocks.push(paragraph(`• ${question}`));
  }
  if (references.length) {
    blocks.push(paragraph('Works Cited', 'Heading1'));
    for (const reference of references) {
      const runs = reference.runs.map((part) => part.href ? hyperlink(part.text, part.href, part.cite)
        : wordProse(part.text, { italic: part.cite }));
      blocks.push(paragraph(reference.label, 'JournalDetails'), styledParagraph(runs.join(''), 'WorksCited'));
    }
  }
  if (encyclopedia.length) {
    blocks.push(paragraph('Wikipedia links from my adventure', 'Heading1'));
    for (const link of encyclopedia) {
      blocks.push(paragraph(link.label, 'JournalDetails'), styledParagraph(hyperlink(link.title, link.url), 'Normal'));
    }
  }
  const document = `${xmlHeader}<w:document xmlns:w="${WORD}" xmlns:r="${OFFICE_REL}"><w:body>${blocks.join('')}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="425" w:footer="425" w:gutter="0"/></w:sectPr>
    </w:body></w:document>`;
  const contentTypes = `${xmlHeader}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>`;
  const relationship = (type: string, target: string, id = 'rId1', external = false) => `<Relationship Id="${id}" Type="${OFFICE_REL}/${type}" Target="${escapeXml(target).replace(/"/g, '&quot;')}"${external ? ' TargetMode="External"' : ''}/>`;
  const relationships = (...children: string[]) => `${xmlHeader}<Relationships xmlns="${PACKAGE_REL}">${children.join('')}</Relationships>`;
  const bytes = zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(relationships(relationship('officeDocument', 'word/document.xml'))),
    'word/_rels/document.xml.rels': strToU8(relationships(relationship('styles', 'styles.xml'),
      ...[...links].map(([url, id]) => relationship('hyperlink', url, id, true)))),
    'word/document.xml': strToU8(document),
    'word/styles.xml': strToU8(styles),
  });
  return new Uint8Array(bytes);
}
