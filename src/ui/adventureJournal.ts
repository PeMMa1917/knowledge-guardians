import type { GameController } from '../app/controller';
import { adventureJournalView, type AdventureJournalView, type JournalNote, type JournalReflection } from '../domain/adventureJournal';
import { CONCEPTS, type DiaryNoteKind } from '../domain/types';
import { AOK_NAMES, CONCEPT_NAMES } from '../domain/curriculum';
import { FRAMEWORK, type FrameworkPart } from '../domain/learningLevels';
import { DIARY_AREAS, DIARY_THEMES, hasDiaryTopics, selectDiary, type DiarySelection, type DiaryTime } from '../domain/diarySelection';
import { MAPS } from '../maps';
import { adventureDocx, ADVENTURE_DOCX_TYPE } from './adventureDocx';
import type { AdventureExportOptions } from './adventureExport';
import { printAdventureJournal } from './adventurePrint';
import { adventureReferences } from './adventureReferences';
import { adventureEncyclopedia, wikipediaLink } from './adventureEncyclopedia';
import { clear, h } from './dom';
import { conceptEditor } from './conceptEditor';
import { bindJournalEditor, flushJournalWriting, queueJournalWriting } from './journalWriting';

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

function journalView(controller: GameController): AdventureJournalView {
  return adventureJournalView(controller.pack, controller.state, controller.engine.visibleObjectives(controller.state));
}

const frameworkNames: Record<FrameworkPart, string> = {
  scope: 'Scope', perspectives: 'Perspectives', 'methods-and-tools': 'Methods and tools', ethics: 'Ethics',
};

function topicOptions<T extends string>(title: string, values: readonly T[], labels: Record<T, string>) {
  const options = values.map((value) => ({ value, input: h('input', { type: 'checkbox' }) }));
  return {
    element: h('fieldset', {}, h('legend', {}, title),
      ...options.map(({ value, input }) => h('label', { class: 'check' }, input, ` ${labels[value]}`))),
    selected: () => options.filter(({ input }) => input.checked).map(({ value }) => value),
    clear: () => { for (const { input } of options) input.checked = false; },
  };
}

function exportControls(controller: GameController, initialView: AdventureJournalView): HTMLElement {
  const include = h('input', { type: 'checkbox', checked: true });
  const status = h('p', { role: 'status', class: 'fine' });
  const range = h('select', {},
    h('option', { value: 'all' }, 'All time'), h('option', { value: 'session' }, 'This session'),
    h('option', { value: 'week' }, 'This calendar week (Monday–Sunday)'), h('option', { value: 'dates' }, 'Custom dates'));
  const from = h('input', { type: 'date' });
  const through = h('input', { type: 'date' });
  const dates = h('div', { class: 'diary-export-dates', hidden: true },
    h('label', {}, 'From', from), h('label', {}, 'Through', through));
  const concepts = topicOptions('TOK concepts', CONCEPTS, CONCEPT_NAMES);
  const framework = topicOptions('Knowledge framework', FRAMEWORK, frameworkNames);
  const areas = topicOptions('Areas of knowledge', DIARY_AREAS, AOK_NAMES);
  const themes = topicOptions('Optional themes', DIARY_THEMES, AOK_NAMES);
  const groups = [concepts, framework, areas, themes];
  const topics = h('details', { class: 'diary-export-topics' }, h('summary', {}, 'Filter by TOK topics'),
    h('p', { class: 'fine' }, 'Choose any topics within a group. Entries must match each selected group. Private notes and Portfolio writing can be selected by date.'),
    h('div', { class: 'diary-export-groups' }, ...groups.map(({ element }) => element)));
  const filters = h('div', { class: 'diary-export-filters' }, h('label', {}, 'Export time range', range), dates, topics);

  function timeRange(): DiaryTime {
    switch (range.value) {
      case 'session': return { kind: 'session', startedAt: controller.diarySessionStartedAt };
      case 'week': return { kind: 'week' };
      case 'dates': return { kind: 'dates', from: from.value, through: through.value };
      default: return { kind: 'all' };
    }
  }

  function currentSelection(): DiarySelection {
    return { time: timeRange(), now: new Date(), topics: {
      concepts: concepts.selected(), framework: framework.selected(), areas: areas.selected(), themes: themes.selected(),
    } };
  }

  function readSelection(view: AdventureJournalView) {
    const selection = currentSelection();
    const result = selectDiary(view, selection);
    if (!result.view) { status.textContent = result.error; return null; }
    const filtered = selection.time.kind !== 'all' || hasDiaryTopics(selection.topics);
    const entryCount = result.view.entries.length;
    const personalCount = include.checked ? result.view.notes.length + (result.view.portfolioWriting?.length ?? 0) : 0;
    if (filtered && !entryCount && !personalCount) { status.textContent = 'No entries or writing match these filters.'; return null; }
    status.textContent = filtered ? `${entryCount} diary ${entryCount === 1 ? 'entry' : 'entries'} and ${personalCount} pieces of standalone writing match.` : '';
    const options: AdventureExportOptions = { selection, includeNotes: include.checked, placeName: (id) => MAPS[id]?.name };
    return { view, options };
  }

  function changed() {
    dates.hidden = range.value !== 'dates';
    readSelection(initialView);
  }
  filters.addEventListener('change', changed);
  include.addEventListener('change', changed);
  const reset = h('button', { type: 'button', onclick: () => {
    range.value = 'all';
    from.value = through.value = '';
    for (const group of groups) group.clear();
    changed();
  } }, 'Clear export filters');
  const download = h('button', { type: 'button', onclick: () => {
    download.disabled = true;
    try {
      const selected = readSelection(journalView(controller));
      if (!selected) return;
      const { view, options } = selected;
      const bytes = adventureDocx(view, options);
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
    const selected = readSelection(journalView(controller));
    if (!selected) return;
    printAdventureJournal(selected.view, selected.options, () => {
      status.textContent = 'Print preview could not open. You can download the Word journal.';
    });
  } }, 'Print or save as PDF');
  return h('div', { class: 'diary-export' },
    filters, reset,
    h('label', { class: 'check' }, include, ' Include my private writing in this export'),
    h('div', { class: 'row' }, download, print), status);
}

function diaryReflections(
  entry: string, reflections: JournalReflection[] | undefined, controller: GameController,
): HTMLElement | null {
  if (!reflections?.length) return null;
  const status = h('p', { class: 'fine', role: 'status' });
  const editors = reflections.map(({ id, prompt, response }) => {
    const fieldId = `reflection-${encodeURIComponent(entry)}-${encodeURIComponent(id)}`;
    const field = h('textarea', { id: fieldId, rows: 3 });
    field.value = response ?? '';
    const editor = conceptEditor(field);
    editor.hidden = !!response;
    const answer = h('p', { class: 'diary-response', hidden: !response }, response);
    const edit = h('button', { type: 'button', hidden: !response, onclick: () => {
      edit.hidden = answer.hidden = true;
      editor.hidden = false;
      field.focus();
    } }, 'Edit reflection');
    let stored = field.value;
    bindJournalEditor(field, (text) => {
      if (text === stored) return;
      const failure = controller.dispatch({ type: 'SetDiaryReflection', entry, prompt: id, text })
        .find((event) => event.kind === 'error');
      if (failure) { status.textContent = failure.message; return; }
      stored = text;
      queueJournalWriting(controller, status);
    }, () => {
      flushJournalWriting(controller);
      if (!stored || stored !== field.value) return;
      answer.textContent = stored;
      answer.hidden = edit.hidden = false;
      editor.hidden = true;
    });
    return h('div', { class: 'diary-reflection' }, h('label', { for: fieldId }, prompt), answer, edit, editor);
  });
  return h('details', { class: 'diary-reflections' },
    h('summary', {}, 'Optional reflections'), ...editors, status);
}

function diaryFeed(view: AdventureJournalView, controller: GameController, refresh: (tab: DiaryTab) => void): HTMLElement {
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
      entryDetails(entryLabels[entry.kind], entry.at, entry.mapId), h('p', {}, entry.text),
      entry.encyclopedia ? h('p', { class: 'fine' }, wikipediaLink(entry.encyclopedia)) : null,
      diaryReflections(entry.id, entry.reflections, controller))));
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
    exportControls(controller, view)),
    h('label', { class: 'diary-filter' }, 'Show ', select), empty, list, more,
    h('details', { class: 'diary-source-list' }, h('summary', {}, 'Sources for my collected specimens'),
      view.references.length ? adventureReferences(view.references) : h('p', {}, 'Collected specimens will add their catalogue references here.')),
    adventureEncyclopedia(view.encyclopedia));
}

function questionButton(note: JournalNote, controller: GameController, refresh: () => void): HTMLElement | null {
  if (note.kind !== 'question' || note.draft) return null;
  return h('button', { type: 'button', class: 'mini', onclick: () => {
    const result = controller.dispatch({ type: 'SetDiaryQuestion', index: note.index, resolved: !note.resolved });
    if (!result.some((event) => event.kind === 'error')) refresh();
  } }, note.resolved ? 'Reopen question' : 'Mark question resolved');
}

function diaryNotes(view: AdventureJournalView, controller: GameController, refresh: () => void): HTMLElement {
  const kind = h('select', { id: 'diary-note-kind' }, ...Object.entries(noteLabels).map(([value, label]) => h('option', { value }, label)));
  const text = h('textarea', { id: 'diary-note-text', rows: 4, required: true });
  const status = h('p', { class: 'fine', role: 'status' });
  const notes = view.notes.filter((note) => !note.draft);
  const draft = controller.state.adventureDiary.noteDraft;
  kind.value = draft?.kind ?? 'note';
  text.value = draft?.text ?? '';
  const saveDraft = (value: string) => {
    const selected = kind.value as DiaryNoteKind;
    const old = controller.state.adventureDiary.noteDraft;
    if ((old?.text ?? '') === value && (old?.kind ?? 'note') === selected) return;
    const failure = controller.dispatch({ type: 'SetDiaryNoteDraft', text: value, kind: selected })
      .find((event) => event.kind === 'error');
    if (failure) { status.textContent = failure.message; return; }
    queueJournalWriting(controller, status);
  };
  kind.addEventListener('change', () => saveDraft(text.value));
  bindJournalEditor(text, saveDraft, () => flushJournalWriting(controller));
  const form = h('form', { class: 'diary-note-form', onsubmit: (event: SubmitEvent) => {
    event.preventDefault();
    const failure = controller.dispatch({ type: 'AddNote', text: text.value, kind: kind.value as DiaryNoteKind, fromDraft: true })
      .find((entry) => entry.kind === 'error');
    if (failure) { status.textContent = failure.message; return; }
    queueJournalWriting(controller, status);
    flushJournalWriting(controller);
    refresh();
  } }, h('label', { for: 'diary-note-kind' }, 'Entry type'), kind,
    h('label', { for: 'diary-note-text' }, 'Your note'), conceptEditor(text),
    h('button', { type: 'submit' }, 'Save note'), status);
  return h('section', { class: 'adventure-journal' }, h('h3', {}, 'My notes, reflections, and questions'),
    h('p', { class: 'fine' }, 'Private entries saved with this adventure.'), form,
    notes.length ? h('ol', { class: 'diary-feed diary-notes' }, ...[...notes].reverse().map((note) => h('li', {},
      entryDetails(note.kind === 'question' ? (note.resolved ? 'Resolved question' : 'Open question') : noteLabels[note.kind], note.at, note.mapId),
      h('p', {}, note.text), questionButton(note, controller, refresh),
      diaryReflections(`note:${note.index}`, note.reflections, controller)))) : h('p', {}, 'You have no personal entries yet.'));
}

function openQuests(view: AdventureJournalView, controller: GameController, refresh: () => void): HTMLElement {
  const questions = view.notes.filter((note) => note.kind === 'question' && !note.resolved && !note.draft);
  return h('section', { class: 'adventure-journal' }, h('h3', {}, 'Open quests and questions'),
    view.quests.length ? h('ol', { class: 'diary-feed' }, ...view.quests.map((quest) => h('li', {}, h('h3', {}, quest.title),
      quest.question ? h('p', {}, quest.question) : null,
      h('ul', {}, ...quest.steps.map((step) => h('li', {}, step)))))) : h('p', {}, 'You have no open quests.'),
    h('h3', {}, 'My open questions'),
    questions.length ? h('ul', { class: 'diary-feed diary-notes' }, ...questions.map((note) => h('li', {},
      h('p', {}, note.text), questionButton(note, controller, refresh)))) : h('p', {}, 'You have no personal questions open.'));
}

export function adventureJournalTab(tab: DiaryTab, controller: GameController, refresh: (tab: DiaryTab) => void): HTMLElement {
  const view = journalView(controller);
  if (tab === 'notes') return diaryNotes(view, controller, () => refresh(tab));
  if (tab === 'open-quests') return openQuests(view, controller, () => refresh(tab));
  return diaryFeed(view, controller, refresh);
}
