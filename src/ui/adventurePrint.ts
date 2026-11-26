import type { AdventureJournalView } from '../domain/adventureJournal';
import { adventureExportSnapshot, journalUtc, type AdventureExportOptions } from './adventureExport';
import { h } from './dom';
import './adventurePrint.css';

let closeActivePrint: (() => void) | undefined;

/** Use the current page's browser print dialog, with only the chosen diary released to it. */
export function printAdventureJournal(
  view: AdventureJournalView, options: AdventureExportOptions, onUnavailable: () => void,
): void {
  closeActivePrint?.();
  const { title, entries, notes, quests, questions } = adventureExportSnapshot(view, options);
  const printedAt = new Date().toISOString();
  const snapshot = h('main', { class: 'adventure-print' },
    h('header', {}, h('h1', {}, title),
      h('p', { class: 'print-details' }, 'Knowledge Guardians · Prepared ',
        h('time', { datetime: printedAt }, journalUtc(printedAt)))),
    h('section', {}, h('h2', {}, 'Adventure diary'),
      entries.length ? entries.map((entry) => h('article', {}, h('h3', {}, entry.title),
        h('p', { class: 'print-details' }, entry.details), h('p', {}, entry.text)))
        : h('p', {}, 'I have yet to make a diary entry on this adventure.')),
    notes.length ? h('section', {}, h('h2', {}, 'My notes and reflections'),
      notes.map((note) => h('article', {}, h('p', { class: 'print-details' }, note.details),
        h('p', { class: 'print-writing' }, note.text)))) : null,
    h('section', {}, h('h2', {}, 'Open quests and questions'),
      !quests.length && !questions.length ? h('p', {}, 'There are no open quests or questions in this journal.') : null,
      quests.map((quest) => h('article', {}, h('h3', {}, quest.title),
        quest.question ? h('p', {}, quest.question) : null,
        h('ul', {}, quest.steps.map((step) => h('li', {}, step))))),
      questions.length ? h('article', {}, h('h3', {}, 'My open questions'),
        h('ul', { class: 'print-writing' }, questions.map((question) => h('li', {}, question)))) : null));

  const root = document.documentElement;
  const oldTitle = document.title;
  let opened = false;
  const started = () => { opened = true; };
  const clear = () => {
    window.clearTimeout(previewTimeout);
    window.removeEventListener('beforeprint', started);
    window.removeEventListener('afterprint', clear);
    snapshot.remove();
    root.classList.remove('adventure-printing');
    document.title = oldTitle;
    closeActivePrint = undefined;
  };
  // Embedded views can decline a native print request without throwing.
  const previewTimeout = window.setTimeout(() => {
    if (opened) return;
    clear();
    onUnavailable();
  }, 2000);
  closeActivePrint = clear;
  window.addEventListener('beforeprint', started, { once: true });
  window.addEventListener('afterprint', clear, { once: true });
  document.body.append(snapshot);
  root.classList.add('adventure-printing');
  document.title = 'Adventure Journal - Knowledge Guardians';
  try {
    window.print();
  } catch {
    clear();
    onUnavailable();
  }
}
