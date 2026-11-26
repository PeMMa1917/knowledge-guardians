import type { AdventureJournalView } from '../domain/adventureJournal';

export interface AdventureExportOptions {
  includeNotes?: boolean;
  placeName: (mapId: string) => string | undefined;
}

export function journalUtc(at: string | null): string {
  return at ? `${new Date(at).toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'Earlier in this adventure';
}

const kindLabels = { quest: 'Quest', choice: 'Choice', experience: 'Experience', note: 'Note', reflection: 'Reflection' };

/** Select the same release of the diary for both Word and print. Private writing is opt-in. */
export function adventureExportSnapshot(view: AdventureJournalView, options: AdventureExportOptions) {
  const notes = options.includeNotes === true ? view.notes : [];
  const details = (kind: string, at: string | null, mapId: string | null) =>
    [kind, journalUtc(at), mapId ? options.placeName(mapId) : null].filter(Boolean).join(' · ');
  return {
    title: `${view.name}’s Adventure Journal`,
    entries: view.entries.map((entry) => ({
      title: entry.title, details: details(kindLabels[entry.kind], entry.at, entry.mapId), text: entry.text,
    })),
    notes: notes.map((note) => ({
      details: details(note.kind === 'question' ? (note.resolved ? 'Resolved question' : 'Open question') : kindLabels[note.kind],
        note.at, note.mapId),
      text: note.text,
    })),
    quests: view.quests,
    questions: notes.filter((note) => note.kind === 'question' && !note.resolved).map((note) => note.text),
    references: view.references,
  };
}
