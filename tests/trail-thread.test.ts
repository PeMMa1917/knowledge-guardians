import { describe, it, expect } from 'vitest';
import { Driver } from './driver';
import { trailMarkers, threadRecap, tiedThread, threadKey } from '../src/domain/trailThread';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { diaryQuestions } from '../src/domain/diaryReflection';
import type { CampaignState } from '../src/domain/types';

describe('a ribbon for an unfinished lead', () => {
  it('offers a distinct object and listening illustration at each of the sixteen chapter or hub places', () => {
    const d = new Driver();
    const worlds = [...new Set(d.e.pack.missions.map((m) => m.world))].sort();
    expect(Object.keys(trailMarkers).sort()).toEqual(worlds);
    expect(new Set(Object.values(trailMarkers).flatMap((m) => [m.thing, m.voice])).size).toBe(
      worlds.length * 2,
    );
  });
  it('pins a visible step, remembers the player’s side and lets them change or remove the thread', () => {
    const d = new Driver();
    const open = d.e.visibleObjectives(d.s).filter((o) => !o.complete);
    const step = open.find((o) => o.id !== d.e.currentObjective(d.s)?.id)!;
    expect(step).toBeDefined();
    d.run({ type: 'TieJournalThread', step: step.id, face: 'voice' });
    expect(d.e.currentObjective(d.s)?.id).toBe(step.id);
    const copy = JSON.parse(JSON.stringify(d.s)) as CampaignState;
    expect(tiedThread(d.e.pack, copy)?.face).toBe('voice');
    expect(threadRecap(d.e.pack, copy, open)).toContain('You marked this for your return. ' + step.title);
    const view = adventureJournalView(d.e.pack, copy, open);
    const entry = view.entries.find((e) => e.event?.key.startsWith('trail-thread:tied:'))!;
    expect(entry.text).toContain(step.title);
    expect(Object.keys(diaryQuestions(entry))).toEqual(['voice']);
    const count = () =>
      d.s.adventureDiary.entries.filter((e) => e.event?.key.startsWith('trail-thread:')).length;
    const before = count();
    d.run({ type: 'TieJournalThread', step: step.id, face: 'voice' });
    expect(count()).toBe(before);
    d.run({ type: 'TieJournalThread', step: step.id, face: 'thing' });
    expect(count()).toBe(before + 1);
    const untied = d.e.currentObjective({ ...d.s, flags: { ...d.s.flags, [threadKey]: false } })?.id;
    d.run({ type: 'UntieJournalThread' });
    expect(d.e.currentObjective(d.s)?.id).toBe(untied);
    expect(tiedThread(d.e.pack, d.s)).toBeUndefined();
    expect(count()).toBe(before + 2);
  });
  it('handles finishing, temporarily unavailable branches, and old or retired step IDs', () => {
    const d = new Driver();
    expect(threadRecap(d.e.pack, d.s, [])).toEqual([]);
    const all = d.e.visibleObjectives(d.s);
    const step = all.find((o) => !o.complete)!;
    d.run({ type: 'TieJournalThread', step: step.id, face: 'thing' });
    expect(threadRecap(d.e.pack, d.s, []).join(' ')).toContain('quiet for now');
    const after = { ...d.s, objectivesDone: [...d.s.objectivesDone, step.id] };
    const remaining = all.filter((o) => o.id !== step.id);
    expect(threadRecap(d.e.pack, after, remaining).join(' ')).toContain('finished the step');
    expect(() => d.run({ type: 'TieJournalThread', step: 'retired-story', face: 'thing' })).toThrow(/open/);
    expect(tiedThread(d.e.pack, d.s)?.objective.id).toBe(step.id);
    d.s.flags[threadKey] = 'retired-story';
    expect(threadRecap(d.e.pack, d.s, all)).toEqual([]);
  });
});
