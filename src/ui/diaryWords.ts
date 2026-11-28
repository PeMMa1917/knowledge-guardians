import type { JournalEntry } from '../domain/adventureJournal';
import { AOK_NAMES } from '../domain/curriculum';
import type { Concept, GlossaryEntry } from '../domain/types';
import { h } from './dom';

export function wordHistory(entry: GlossaryEntry): HTMLElement | null {
  if (!entry.history) return null;
  return h('details', { class: 'fine' }, h('summary', {}, 'Word history'),
    h('p', {}, entry.history.note, ' ',
      h('a', { href: entry.history.url, target: '_blank', rel: 'noopener noreferrer' }, 'Dictionary entry')));
}

/** Find an earlier, actually recorded action in another place that brings in a different discipline. */
export function earlierUse(history: readonly JournalEntry[], entry: JournalEntry, concept: Concept) {
  const areas = entry.topics?.areas;
  if (!entry.mapId || !areas?.length || !entry.at) return;
  for (let i = history.indexOf(entry) - 1; i >= 0; i--) {
    const prior = history[i];
    if (!prior.at || !prior.mapId || prior.mapId === entry.mapId || prior.text === entry.text ||
      !prior.topics?.concepts?.includes(concept) || !prior.topics.areas?.some(area => !areas.includes(area))) continue;
    return prior;
  }
}

export function diaryWords(entry: JournalEntry, history: readonly JournalEntry[], glossary: readonly GlossaryEntry[]) {
  const concepts = entry.topics?.concepts;
  if (!concepts?.length) return null;
  const fold = h('details', { class: 'diary-words' }, h('summary', {}, 'Words for this moment'));
  fold.addEventListener('toggle', () => {
    if (!fold.open || fold.childElementCount > 1) return;
    for (const concept of new Set(concepts)) {
      const term = glossary.find(g => g.id === concept);
      if (!term) continue;
      const word = h('details', {}, h('summary', {}, term.term));
      word.addEventListener('toggle', () => {
        if (!word.open || word.childElementCount > 1) return;
        word.append(h('p', {}, term.text));
        const earlier = earlierUse(history, entry, concept);
        if (earlier) {
          const names = earlier.topics!.areas!.map(a => AOK_NAMES[a]).join(' · ');
          word.append(h('details', {}, h('summary', {}, 'Read alongside “' + earlier.title + '”'),
            h('p', { class: 'fine' }, names), h('blockquote', {}, earlier.text)));
        }
        const origin = wordHistory(term);
        if (origin) word.append(origin);
      });
      fold.append(word);
    }
  });
  return fold;
}
