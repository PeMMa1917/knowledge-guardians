import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView, newAdventureDiary } from '../src/domain/adventureJournal';
import { Engine, newCampaign, type Command } from '../src/domain/engine';
import { newPermanent } from '../src/domain/permanent';
import { emptyPair, migrateCampaign, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import type { CampaignState, DiaryEntry } from '../src/domain/types';

const pack = buildPack();
const engine = new Engine(pack);
const at = '2026-11-26T14:00:00.000Z';
function campaign() { return newCampaign(pack, 'Ren and Lin', 'player-a', 7); }
function view(state: CampaignState) { return adventureJournalView(pack, state, engine.visibleObjectives(state)); }
const longText = '  Another view < &.\n\n' + 'A much longer keeper’s line about trust and evidence. 🌿\n'.repeat(500) + '   \n';
const readBack = (state: CampaignState) => {
  const result = parsePair(serialisePair(writeSuspend(emptyPair(), {
    state, kind: 'suspend', savedAt: at, label: 'Nexus', location: 'Nexus',
  })));
  if (!result.ok || !result.pair.continue) throw new Error('No restored campaign');
  return result.pair.continue.state;
};

describe('optional private journal prompts', () => {
  it('uses context from actual arrivals, choices and quest completions', () => {
    const permanent = newPermanent();
    const commands: Command[] = [
      { type: 'VisitPlace', name: 'The Nexus: Archive Hall' },
      { type: 'ChooseDialogueOption', node: 'cold.open3', index: 1 },
      { type: 'EnterNode', node: 'ise.start3' },
    ];
    const state = commands.reduce((s, cmd) => engine.dispatch(cmd, s, permanent, at).state, campaign());
    const entries = view(state).entries;
    expect(entries.some((entry) => entry.id === 'place:nexus.archive'
      && entry.reflections?.[0].prompt.includes('The Nexus: Archive Hall'))).toBe(true);
    expect(entries.some((entry) => entry.id.startsWith('choice:cold.open3:')
      && entry.reflections?.some(({ prompt }) => prompt.includes('option you chose')))).toBe(true);
    expect(entries.find(({ id }) => id === 'quest:m01.o1.look')?.reflections).toEqual([
      { id: 'first-glance', prompt: expect.stringContaining('glowing label') },
    ]);
    expect(entries.every(({ reflections }) => reflections && reflections.length >= 1 && reflections.length <= 3)).toBe(true);
  });

  it('offers one contextual question across each recorded event family, without requiring source claims', () => {
    const state = campaign();
    const families = ['arrival', 'route', 'conversation', 'sign', 'inspection', 'choice', 'tool', 'finding', 'correction', 'quest'] as const;
    state.adventureDiary.entries = families.map((kind, index): DiaryEntry => ({
      id: `fixture-${index}`, kind: 'experience', title: `Signal bench ${index}`, text: 'I saw a lamp at the bench.',
      at, mapId: 'nexus.archive', event: { kind, key: `fixture-${index}`, ref: `lamp-${index}` },
    }));
    for (const [index, entry] of view(state).entries.entries()) {
      expect(entry.reflections).toEqual([{ id: families[index], prompt: expect.stringContaining(entry.title) }]);
    }
  });

  it('keeps separate repeat answers and writes them without granting progress', () => {
    const state = campaign();
    const permanent = newPermanent();
    const entry: DiaryEntry = {
      id: 'thread:nile-strike:return', kind: 'experience', title: 'The Workmen’s Thread', text: 'I read the stoppage.',
      at, mapId: 'nile.workyard', event: { kind: 'tool', key: 'thread:nile-strike:return', ref: 'nile-strike' },
    };
    const repeat = `${entry.id}@2`;
    state.adventureDiary.entries.push(entry, { ...entry, id: repeat });
    const write = (s: CampaignState, entry: string, text: string, prompt = 'stoppage') =>
      engine.dispatch({ type: 'SetDiaryReflection', entry, prompt, text }, s, permanent, at);
    const first = write(state, entry.id, '  The first reader stopped.\n');
    const second = write(first.state, repeat, longText);
    expect(second.permanent).toBe(permanent);
    expect(second.state.objectivesDone).toBe(first.state.objectivesDone);
    expect(second.events).toEqual([]);
    expect(write(second.state, 'quest:m01.o2.inspect', 'Not yet').events[0]?.kind).toBe('error');
    expect(write(second.state, repeat, 'Wrong question', 'fake').events[0]?.kind).toBe('error');
    const data = readBack(second.state);
    expect(view(data).entries.find(({ id }) => id === repeat)?.reflections?.[0].response).toBe(longText);
    expect(view(data).entries.find(({ id }) => id === entry.id)?.reflections?.[0].response).toBe('  The first reader stopped.\n');
    const edit = write(data, repeat, '\n  A new look. \n');
    expect(view(readBack(edit.state)).entries.find(({ id }) => id === repeat)?.reflections?.[0].response).toBe('\n  A new look. \n');
    expect(view(write(edit.state, repeat, '').state).entries.find(({ id }) => id === repeat)?.reflections?.[0].response).toBeUndefined();
  });

  it('preserves older source-free notes and supports reflecting on reconstructed objectives', () => {
    const old: Partial<CampaignState> = {
      ...campaign(), schema: 4, objectivesDone: ['m01.o1.look'], journal: ['j.m01.start'],
      notes: ['A plain note', 'Reflection: A second look', 'Question for Sefa: Can we ask again?'],
    };
    delete old.adventureDiary;
    const permanent = newPermanent();
    const { state } = migrateCampaign(old);
    const earlier = view(state).entries.find(({ id }) => id === 'quest:m01.o1.look');
    expect(earlier).toMatchObject({ at: null, mapId: null, reflections: [{ id: 'first-glance' }] });
    const recorded = engine.dispatch({ type: 'SetDiaryReflection', entry: earlier!.id, prompt: 'first-glance', text: 'My first visit.' },
      state, permanent, at);
    const note = engine.dispatch({ type: 'SetDiaryReflection', entry: 'note:1', prompt: 'reflection-return', text: 'Try another angle.' },
      recorded.state, permanent, at);
    const restored = view(readBack(note.state));
    expect(restored.entries.find(({ id }) => id === earlier!.id)?.reflections?.[0].response).toBe('My first visit.');
    expect(restored.notes.map(({ text, kind }) => [text, kind])).toEqual([
      [old.notes![0], 'note'], [old.notes![1], 'reflection'], [old.notes![2], 'question'],
    ]);
    expect(restored.notes[1].reflections?.[0].response).toBe('Try another angle.');
  });

  it('keeps a blocked route’s prompt distinct from a completed walk', () => {
    const state = campaign();
    state.adventureDiary.entries.push({
      id: 'blocked-route:nexus.archive:nile', kind: 'experience', title: 'Door Without a Name',
      text: 'I tried the door. It stayed closed.', at, mapId: 'nexus.archive',
      event: { kind: 'route', key: 'blocked-route:nexus.archive:nile', ref: 'nile', outcome: 'blocked' },
    });
    expect(view(state).entries[0].reflections?.[0].prompt).toContain('before trying “Door Without a Name” again');
  });

  it('keeps a long, unsaved note in the current journal, then moves it once under its saved type', () => {
    const state = campaign();
    state.notes = Array.from({ length: 200 }, (_, index) => `Earlier note ${index}`);
    state.adventureDiary = newAdventureDiary(state.notes);
    const permanent = newPermanent();
    const draft = engine.dispatch({ type: 'SetDiaryNoteDraft', kind: 'question', text: longText }, state, permanent, at);
    expect(draft.permanent).toBe(permanent);
    expect(draft.events).toEqual([]);
    const restored = readBack(draft.state);
    expect(view(restored).notes.at(-1)).toMatchObject({ kind: 'question', text: longText, draft: true });
    const saved = engine.dispatch({ type: 'AddNote', kind: 'question', text: longText, fromDraft: true }, restored, permanent, at);
    expect(saved.state.adventureDiary.noteDraft).toBeNull();
    expect(view(saved.state).notes).toHaveLength(201);
    expect(view(saved.state).notes.at(-1)).toMatchObject({ kind: 'question', text: longText, index: 200 });
    expect(view(saved.state).notes.at(-1)?.draft).toBeUndefined();
  });
});
