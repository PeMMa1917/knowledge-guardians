import type { SourceRecord } from './types';

export interface CitationPart {
  text: string;
  cite?: true;
  href?: string;
}

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

/** Format the MLA entries used by the press for a catalogue page or online artwork. */
export function mlaCitation(source: SourceRecord): CitationPart[] {
  const work = source.mla;
  if (!work) return [];
  const parts: CitationPart[] = [];
  if (work.author) parts.push({ text: `${work.author}. ` });
  if (work.kind === 'page') parts.push({ text: `“${work.title}.” ` });
  else parts.push({ text: work.title, cite: true }, { text: '. ' });
  if (work.workDate) parts.push({ text: `${work.workDate.trimEnd().replace(/\.$/, '')}. ` });
  if (work.repository) parts.push({ text: `${work.repository.trimEnd().replace(/\.$/, '')}. ` });
  parts.push({ text: work.container, cite: true }, { text: ', ' },
    { text: source.url.replace(/^https:\/\//, ''), href: source.url }, { text: '.' });
  if (work.showAccessDate) {
    const [year, month, day] = source.accessed.split('-').map(Number);
    parts.push({ text: ` Accessed ${day} ${MONTHS[month - 1]} ${year}.` });
  }
  return parts;
}
