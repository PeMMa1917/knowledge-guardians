import type { SpecimenReference } from '../domain/specimenReferences';
import { h } from './dom';

export function adventureReferences(references: readonly SpecimenReference[]): HTMLElement {
  return h('ul', { class: 'diary-references' }, ...references.map((reference) => h('li', {},
    h('p', { class: 'diary-reference-label' }, reference.label),
    h('p', { class: 'diary-citation' }, reference.runs.map((part) => part.href
      ? h('a', { href: part.href, target: '_blank', rel: 'noopener noreferrer' }, part.text)
      : part.cite ? h('cite', {}, part.text) : part.text)))));
}
