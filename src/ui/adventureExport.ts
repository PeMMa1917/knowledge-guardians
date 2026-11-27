import type { SpecimenReference } from '../domain/specimenReferences';
import type { AdventureJournalView } from '../domain/adventureJournal';
import { selectDiary, type DiarySelection } from '../domain/diarySelection';
import { encyclopediaEncounterLabel, encyclopediaLinkLabel, isEncyclopediaURL } from '../domain/encyclopedia';

type JournalReflection = NonNullable<AdventureJournalView['entries'][number]['reflections']>[number];

export interface AdventureExportOptions {
  includeNotes?: boolean;
  placeName: (mapId: string) => string | undefined;
  selection?: DiarySelection;
}

export function journalUtc(at: string | null): string {
  return at ? `${new Date(at).toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'Earlier in this adventure';
}

const kindLabels = { quest: 'Quest', choice: 'Choice', experience: 'Experience', note: 'Note', reflection: 'Reflection' };

export function safeJournalLink(url: string): boolean {
  if (!url.startsWith('https://') || /[\s\u0000-\u001f\u007f-\u009f\\]/u.test(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !!parsed.hostname && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

/** Select the same complete diary for Word and print. A shareable copy can omit personal writing. */
export function adventureExportSnapshot(view: AdventureJournalView, options: AdventureExportOptions) {
  const includePersonal = options.includeNotes !== false;
  const selection = !includePersonal && options.selection?.includeUntaggedWriting
    ? { ...options.selection, includeUntaggedWriting: false } : options.selection;
  const selected = selectDiary(view, selection);
  if (!selected.view) throw new Error(selected.error);
  const scoped = selected.view !== view;
  view = selected.view;
  const notes = includePersonal ? view.notes : [];
  const details = (kind: string, at: string | null, mapId: string | null) =>
    [kind, journalUtc(at), mapId ? options.placeName(mapId) : null].filter(Boolean).join(' · ');
  const reflections = (items?: readonly JournalReflection[]) => items?.length ? {
    reflections: items.filter((item) => includePersonal || !item.earlier).map(({ prompt, response }) => ({
      prompt, ...(includePersonal && response !== undefined ? { response } : {}),
    })),
  } : {};
  const references: SpecimenReference[] = view.references.map((reference) => ({
    ...reference,
    runs: reference.runs.map(({ href, ...part }) => (href && safeJournalLink(href) ? { ...part, href } : part)),
  }));
  return {
    title: `${view.name}’s Adventure Journal`,
    scoped,
    entries: view.entries.map((entry) => ({
      title: entry.title, details: details(kindLabels[entry.kind], entry.at, entry.mapId), text: entry.text,
      ...reflections(entry.reflections),
    })),
    notes: notes.map((note) => ({
      details: note.draft && !note.at ? 'Draft note' : details(note.draft ? 'Draft note'
        : note.kind === 'question' ? (note.resolved ? 'Resolved question' : 'Open question') : kindLabels[note.kind], note.at, note.mapId),
      text: note.text, ...reflections(note.reflections),
    })),
    untaggedReflections: includePersonal ? (selected.untaggedReflections ?? []).map((entry) => ({
      title: entry.title, details: details('Private reflection', entry.at, entry.mapId), ...reflections(entry.reflections),
    })) : [],
    portfolio: includePersonal ? (view.portfolioWriting ?? []).map((entry) => ({
      title: entry.title, text: entry.text,
      details: details(entry.draft ? 'Portfolio draft' : 'Portfolio reflection', entry.at ?? null, entry.mapId ?? null),
    })) : [],
    quests: view.quests,
    questions: notes.filter((note) => note.kind === 'question' && !note.resolved && !note.draft).map((note) => note.text),
    references,
    encyclopedia: (view.encyclopedia ?? []).filter((link) => safeJournalLink(link.url) && isEncyclopediaURL(link.url, link.kind))
      .map((link) => ({ label: `${encyclopediaEncounterLabel(link)} ${link.name}`, title: encyclopediaLinkLabel(link), url: link.url })),
  };
}
