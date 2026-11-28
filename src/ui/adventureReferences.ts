import type { CitationPart } from '../domain/mla';
import type { SpecimenReference } from '../domain/specimenReferences';
import { h, type Child } from './dom';

export function adventureReferences(references: readonly SpecimenReference[], prose: (text: string) => Child[] = (text) => [text]): HTMLElement {
  return h('ul', { class: 'diary-references' }, ...references.map((reference) => h('li', {},
    h('p', { class: 'diary-reference-label' }, prose(reference.label)),
    citationLine(reference.runs, prose))));
}

export function citationLine(runs: CitationPart[], prose: (text: string) => Child[] = (text) => [text]) {
  return h('p', { class: 'diary-citation' }, runs.flatMap((part) => {
    const text = prose(part.text);
    const formatted = part.cite ? [h('cite', {}, text)] : text;
    return part.href ? [h('a', { href: part.href, target: '_blank', rel: 'noopener noreferrer' }, formatted)] : formatted;
  }));
}
