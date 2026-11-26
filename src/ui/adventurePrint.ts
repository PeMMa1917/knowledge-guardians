import type { AdventureJournalView } from '../domain/adventureJournal';
import { CONCEPT_COLOURS, splitConceptText } from '../domain/conceptText';
import { adventureExportSnapshot, journalUtc, type AdventureExportOptions } from './adventureExport';
import { h } from './dom';
import { adventureReferences } from './adventureReferences';
import './adventurePrint.css';

let closeActivePrint: (() => void) | undefined;

function printProse(text: string) {
  return splitConceptText(text).map(({ text, concept }) => concept
    ? h('strong', { class: 'print-concept', style: { color: CONCEPT_COLOURS[concept].onLight } }, h('u', {}, text))
    : text);
}

function printReflections(items?: readonly { prompt: string; response?: string }[]) {
  return (items ?? []).map(({ prompt, response }) => h('div', { class: 'print-reflection' },
    h('p', { class: 'print-details' }, 'Reflection prompt'), h('p', {}, printProse(prompt)),
    response === undefined ? null : [h('p', { class: 'print-details' }, 'My response'), h('p', {}, printProse(response))]));
}

/** Use the current page's browser print dialog, with only the chosen diary released to it. */
export function printAdventureJournal(
  view: AdventureJournalView, options: AdventureExportOptions, onUnavailable: () => void,
): void {
  closeActivePrint?.();
  const { title, entries, notes, portfolio, quests, questions, references, encyclopedia } = adventureExportSnapshot(view, options);
  const printedAt = new Date().toISOString();
  const snapshot = h('main', { class: 'adventure-print' },
    h('header', {}, h('h1', {}, printProse(title)),
      h('p', { class: 'print-details' }, 'Knowledge Guardians · Prepared ',
        h('time', { datetime: printedAt }, journalUtc(printedAt)))),
    h('section', {}, h('h2', {}, 'Adventure diary'),
      entries.length ? entries.map((entry) => h('article', {}, h('h3', {}, printProse(entry.title)),
        h('p', { class: 'print-details' }, printProse(entry.details)), h('p', {}, printProse(entry.text)), printReflections(entry.reflections)))
        : h('p', {}, 'I have yet to make a diary entry on this adventure.')),
    notes.length ? h('section', {}, h('h2', {}, 'My notes and reflections'),
      notes.map((note) => h('article', {}, h('p', { class: 'print-details' }, printProse(note.details)),
        h('p', {}, printProse(note.text)), printReflections(note.reflections)))) : null,
    portfolio.length ? h('section', {}, h('h2', {}, 'My Portfolio writing'),
      portfolio.map((entry) => h('article', {}, h('h3', {}, printProse(entry.title)),
        h('p', { class: 'print-details' }, printProse(entry.details)), h('p', {}, printProse(entry.text))))) : null,
    h('section', {}, h('h2', {}, 'Open quests and questions'),
      !quests.length && !questions.length ? h('p', {}, 'There are no open quests or questions in this journal.') : null,
      quests.map((quest) => h('article', {}, h('h3', {}, printProse(quest.title)),
        quest.question ? h('p', {}, printProse(quest.question)) : null,
        h('ul', {}, quest.steps.map((step) => h('li', {}, printProse(step)))))),
      questions.length ? h('article', {}, h('h3', {}, 'My open questions'),
        h('ul', {}, questions.map((question) => h('li', {}, printProse(question))))) : null),
    references.length ? h('section', {}, h('h2', {}, 'Works Cited'), adventureReferences(references, printProse)) : null,
    encyclopedia.length ? h('section', {}, h('h2', {}, 'Wikipedia links from my adventure'),
      h('ul', { class: 'print-encyclopedia' }, encyclopedia.map((link) => h('li', {}, printProse(link.label), ' · ',
        h('a', { href: link.url, target: '_blank', rel: 'noopener noreferrer' }, printProse(link.title)))))) : null);

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
