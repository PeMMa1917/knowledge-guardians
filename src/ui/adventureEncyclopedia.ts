import { encyclopediaEncounterLabel, encyclopediaLinkLabel, isEncyclopediaURL, type EncyclopediaLink } from '../domain/encyclopedia';
import { h } from './dom';

export function wikipediaLink(link: EncyclopediaLink): HTMLElement | null {
  return isEncyclopediaURL(link.url, link.kind)
    ? h('a', { href: link.url, target: '_blank', rel: 'noopener noreferrer' }, encyclopediaLinkLabel(link)) : null;
}

export function adventureEncyclopedia(links: readonly EncyclopediaLink[]): HTMLElement {
  const details = h('details', { class: 'diary-source-list' }, h('summary', {}, 'Wikipedia lookups from my encounters'));
  if (!links.length) {
    details.append(h('p', {}, 'Meet a historical person, open a biography, or inspect a documented exhibit to add a lookup.'));
    return details;
  }
  const list = h('ul', { class: 'diary-references' });
  const more = h('button', { type: 'button', onclick: () => showMore() }, 'More Wikipedia lookups');
  let shown = 0;
  function showMore() {
    const part = links.slice(shown, shown + 24);
    list.append(...part.map((link) => h('li', {}, h('p', { class: 'diary-reference-label' },
      `${encyclopediaEncounterLabel(link)} · ${link.name}`), h('p', {}, wikipediaLink(link)))));
    shown += part.length;
    more.hidden = shown >= links.length;
  }
  details.append(list, more);
  showMore();
  return details;
}
