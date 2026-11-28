import { h } from './dom';

const shelves = [
  { name: 'Story', pages: { diary: 'Diary', notes: 'My notes', 'open-quests': 'Open quests', story: 'Story so far', conversations: 'Conversations', letters: 'Letters', afterwards: 'Afterwards' } },
  { name: 'Evidence', pages: { entries: 'Entries', cards: 'Evidence cards', sources: 'Sources', stones: 'Question Stones', lore: 'Lore' } },
  { name: 'Me', pages: { portfolio: 'Portfolio', moments: 'Moments', skills: 'Skill Atlas', lorelings: 'Lorelings', awards: 'Awards and XP', crossings: 'Crossings' } },
  { name: 'Help', pages: { atlas: 'Atlas', glossary: 'Glossary', views: 'Views', bestiary: 'Fray Bestiary' } },
];
export function journalShelves(afterCouncil: boolean) {
  return shelves.map(shelf => ({
    name: shelf.name,
    pages: Object.entries(shelf.pages).filter(([id]) => id !== 'afterwards' || afterCouncil),
  }));
}
export function journalNavigation(
  page: string, afterCouncil: boolean, focus: 'shelf' | 'tab' | undefined,
  open: (id: string, focus: 'shelf' | 'tab') => void,
) {
  const all = journalShelves(afterCouncil);
  const shelf = all.find(s => s.pages.some(([id]) => id === page)) ?? all[0];
  const sections = h('div', { class: 'journal-shelves', role: 'group', 'aria-label': 'Journal sections' },
    ...all.map(s => h('button', { type: 'button', 'aria-pressed': String(s === shelf),
      'data-autofocus': focus === 'shelf' && s === shelf,
      onclick: () => { if (s !== shelf) open(s.pages[0][0], 'shelf'); } }, s.name)));
  const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': shelf.name + ' pages' });
  shelf.pages.forEach(([id, label], i) => {
    const selected = page === id;
    tabs.append(h('button', { type: 'button', role: 'tab', id: 'journal-tab-' + id,
      'aria-controls': 'journal-page', 'aria-selected': String(selected), tabindex: selected ? 0 : -1,
      'data-autofocus': focus === 'tab' && selected,
      onclick: () => { if (!selected) open(id, 'tab'); },
      onkeydown: (e: KeyboardEvent) => {
        const n = shelf.pages.length;
        const target = { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
        if (target === undefined) return;
        e.preventDefault();
        e.stopPropagation();
        if (target !== i) open(shelf.pages[target][0], 'tab');
      },
    }, label));
  });
  return h('nav', { 'aria-label': 'Adventure journal' }, sections, tabs);
}
