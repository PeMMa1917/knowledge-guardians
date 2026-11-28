import { journalShelves } from '../src/ui/journalNavigation';
import { describe, expect, it } from 'vitest';
import { earlierUse } from '../src/ui/diaryWords';
import type { JournalEntry } from '../src/domain/adventureJournal';
import type { DiaryTopics } from '../src/domain/diarySelection';

function page(n: number, mapId: string, areas: NonNullable<DiaryTopics['areas']>, concepts: NonNullable<DiaryTopics['concepts']> = ['evidence']): JournalEntry {
  return { id: 'entry' + n, title: 'Case ' + n, kind: 'choice', text: 'My dated return ' + n,
    at: new Date(86400000 * n).toISOString(), mapId, topics: { concepts, areas } };
}

describe('reading a word beside an earlier action', () => {
  it('connects the most recent different discipline the Guardian actually visited', () => {
    const history = [page(1, 'nile', ['HIS']), page(2, 'weir', ['NAT', 'HIS']), page(3, 'village', ['MAT'], ['certainty']),
      page(4, 'forest', ['MAT']), page(5, 'forest', ['NAT']), page(6, 'port', ['ART'])];
    expect(earlierUse(history, history[4], 'evidence')).toBe(history[1]);
    expect(earlierUse(history, history[0], 'evidence')).toBeUndefined();
  });
  it('omits undated reconstructions, the same record repeated, and entries without matching topics', () => {
    const latest = page(4, 'weir', ['NAT']);
    const history = [{...page(1, 'nile', ['HIS']), at: null}, {...page(2, 'forest', ['ART']), text: latest.text},
      page(3, 'port', ['HUM'], ['power']), latest];
    expect(earlierUse(history, latest, 'evidence')).toBeUndefined();
    expect(earlierUse(history, {...latest,topics:undefined}, 'power')).toBeUndefined();
  });
});

it('keeps each existing journal destination in one shelf and reveals Afterwards only after the Council', () => {
  const shelves = journalShelves(true);
  expect(shelves.map(s => s.name)).toEqual(['Story', 'Evidence', 'Me', 'Help']);
  const all = shelves.flatMap(s => s.pages.map(([id]) => id));
  expect(all.length).toBe(new Set(all).size);
  expect([...all].sort()).toEqual('diary notes open-quests story conversations entries cards moments portfolio atlas skills lorelings bestiary stones lore letters crossings afterwards glossary views awards sources'.split(' ').sort());
  expect(journalShelves(false).flatMap(s => s.pages.map(([id]) => id))).toEqual(all.filter(id => id !== 'afterwards'));
});
