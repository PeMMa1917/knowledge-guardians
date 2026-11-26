import type { GameController } from '../app/controller';
import { adventureJournalView, type AdventureJournalView, type JournalNote } from '../domain/adventureJournal';
import type { DiaryNoteKind } from '../domain/types';
import { MAPS } from '../maps';
import { adventureDocx, ADVENTURE_DOCX_TYPE } from './adventureDocx';
import { printAdventureJournal } from './adventurePrint';
import { clear, h } from './dom';

type DiaryTab = 'diary' | 'notes' | 'open-quests';
const entryLabels = { quest: 'Quest', choice: 'Choice', experience: 'Experience' };
const noteLabels: Record<DiaryNoteKind, string> = { note: 'Note', reflection: 'Reflection', question: 'Question' };
const formatTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function entryDetails(kind: string, at: string | null, mapId: string | null): HTMLElement {
  const place = mapId ? MAPS[mapId]?.name : undefined;
  return h('p', { class: 'fine diary-meta' }, kind, ' · ',
    at ? h('time', { datetime: at, title: at }, formatTime.format(new Date(at))) : 'Earlier in this adventure',
    place ? ` · ${place}` : '');
}

function exportControls(view: AdventureJournalView): HTMLElement {
  const include = h('input', { type: 'checkbox' });
  const status = h('p', { role: 'status', class: 'fine' });
  const options = () => ({ includeNotes: include.checked, placeName: (id: string) => MAPS[id]?.name });
  const download = h('button', { type: 'button', onclick: () => {
    download.disabled = true;
    try {
      const bytes = adventureDocx(view, options());
      const url = URL.createObjectURL(new Blob([bytes], { type: ADVENTURE_DOCX_TYPE }));
      const name = view.name.replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-+|-+$/g, '');
      const link = h('a', { href: url, download: `adventure-journal${name ? `-${name}` : ''}.docx` });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Word journal downloaded.';
    } catch (err) {
      status.textContent = `Could not make the Word journal. ${err instanceof Error ? err.message : ''}`;
    } finally {
      download.disabled = false;
    }
  } }, 'Download journal (.docx)');
  const print = h('button', { type: 'button', onclick: () => {
    status.textContent = '';
    printAdventureJournal(view, options(), () => {
      status.textContent = 'Print preview could not open. You can download the Word journal.';
    });
  } }, 'Print or save as PDF');
  return h('div', { class: 'diary-export' },
    h('label', { class: 'check' }, include, ' Include my private notes, reflections, and questions in this export'),
    h('div', { class: 'row' }, download, print), status);
}

function diaryFeed(view: AdventureJournalView, refresh: (tab: DiaryTab) => void): HTMLElement {
  const entries = [...view.entries].reverse();
  const select = h('select', { 'aria-label': 'Show diary entries' },
    h('option', { value: 'all' }, 'All diary entries'),
    h('option', { value: 'quest' }, 'Quests'),
    h('option', { value: 'choice' }, 'Choices'),
    h('option', { value: 'experience' }, 'Experiences'));
  const list = h('ol', { class: 'diary-feed' });
  const empty = h('p', {});
  const more = h('button', { type: 'button', onclick: () => showMore() }, 'Show earlier entries');
  let shown = 0;
  let results = entries;
  function showMore() {
    const part = results.slice(shown, shown + 24);
    list.append(...part.map((entry) => h('li', {}, h('h3', {}, entry.title),
      entryDetails(entryLabels[entry.kind], entry.at, entry.mapId), h('p', {}, entry.text))));
    shown += part.length;
    more.hidden = shown >= results.length;
    empty.hidden = results.length > 0;
    empty.textContent = entries.length ? 'No entries of this kind yet.' : 'Your diary fills as you explore, make choices, and finish quests.';
  }
  select.addEventListener('change', () => {
    clear(list);
    shown = 0;
    results = select.value === 'all' ? entries : entries.filter((entry) => entry.kind === select.value);
    showMore();
  });
  showMore();
  return h('section', { class: 'adventure-journal' },
    h('div', { class: 'diary-tools' }, h('div', {}, h('h3', {}, 'Adventure diary'),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => refresh('notes') }, 'Write a note'),
        h('button', { type: 'button', onclick: () => refresh('open-quests') }, 'Open quests and questions'))),
    exportControls(view)),
    h('label', { class: 'diary-filter' }, 'Show ', select), empty, list, more);
}

function questionButton(note: JournalNote, controller: GameController, refresh: () => void): HTMLElement | null {
  if (note.kind !== 'question') return null;
  return h('button', { type: 'button', class: 'mini', onclick: () => {
    const result = controller.dispatch({ type: 'SetDiaryQuestion', index: note.index, resolved: !note.resolved });
    if (!result.some((event) => event.kind === 'error')) refresh();
  } }, note.resolved ? 'Reopen question' : 'Mark question resolved');
}

function diaryNotes(view: AdventureJournalView, controller: GameController, refresh: () => void): HTMLElement {
  const kind = h('select', { id: 'diary-note-kind' }, ...Object.entries(noteLabels).map(([value, label]) => h('option', { value }, label)));
  const text = h('textarea', { id: 'diary-note-text', rows: '4', maxlength: '500', required: true });
  const form = h('form', { class: 'diary-note-form', onsubmit: (event: SubmitEvent) => {
    event.preventDefault();
    const result = controller.dispatch({ type: 'AddNote', text: text.value, kind: kind.value as DiaryNoteKind });
    if (!result.some((entry) => entry.kind === 'error')) refresh();
  } }, h('label', { for: 'diary-note-kind' }, 'Entry type'), kind,
  h('label', { for: 'diary-note-text' }, 'Your note'), text,
  h('button', { type: 'submit' }, 'Save note'));
  return h('section', { class: 'adventure-journal' }, h('h3', {}, 'My notes, reflections, and questions'),
    h('p', { class: 'fine' }, 'Private entries saved with this adventure.'), form,
    view.notes.length ? h('ol', { class: 'diary-feed diary-notes' }, ...[...view.notes].reverse().map((note) => h('li', {},
      entryDetails(note.kind === 'question' ? (note.resolved ? 'Resolved question' : 'Open question') : noteLabels[note.kind], note.at, note.mapId),
      h('p', {}, note.text), questionButton(note, controller, refresh)))) : h('p', {}, 'You have no personal entries yet.'));
}

function openQuests(view: AdventureJournalView, controller: GameController, refresh: () => void): HTMLElement {
  const questions = view.notes.filter((note) => note.kind === 'question' && !note.resolved);
  return h('section', { class: 'adventure-journal' }, h('h3', {}, 'Open quests and questions'),
    view.quests.length ? h('ol', { class: 'diary-feed' }, ...view.quests.map((quest) => h('li', {}, h('h3', {}, quest.title),
      quest.question ? h('p', {}, quest.question) : null,
      h('ul', {}, ...quest.steps.map((step) => h('li', {}, step)))))) : h('p', {}, 'You have no open quests.'),
    h('h3', {}, 'My open questions'),
    questions.length ? h('ul', { class: 'diary-feed diary-notes' }, ...questions.map((note) => h('li', {},
      h('p', {}, note.text), questionButton(note, controller, refresh)))) : h('p', {}, 'You have no personal questions open.'));
}

export function adventureJournalTab(tab: DiaryTab, controller: GameController, refresh: (tab: DiaryTab) => void): HTMLElement {
  const view = adventureJournalView(controller.pack, controller.state, controller.engine.visibleObjectives(controller.state));
  if (tab === 'notes') return diaryNotes(view, controller, () => refresh(tab));
  if (tab === 'open-quests') return openQuests(view, controller, () => refresh(tab));
  return diaryFeed(view, refresh);
}
