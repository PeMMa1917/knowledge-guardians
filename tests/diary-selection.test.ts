import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameController } from '../src/app/controller';
import { adventureJournalView, type AdventureJournalView } from '../src/domain/adventureJournal';
import { selectDiary, type DiaryTime, type DiaryTopics } from '../src/domain/diarySelection';
import { migrateCampaign, memoryStore } from '../src/domain/saves';

const iso = (month: number, day: number, hour = 0, minute = 0) => new Date(2026, month - 1, day, hour, minute).toISOString();
const now = new Date(2026, 10, 26, 12);
const mapId = 'nexus.archive';

const entries: AdventureJournalView['entries'] = [
  { id: 'legacy', kind: 'quest', title: 'An undated record', text: 'Evidence mentioned in a separate record.', at: null, mapId: null },
  { id: 'old', kind: 'choice', title: 'On Sunday', text: 'A decision before the week.', at: iso(11, 22, 23, 59), mapId,
    topics: { concepts: ['evidence'], framework: ['ethics'], areas: ['HIS'], themes: ['POL'] } },
  { id: 'week-start', kind: 'quest', title: 'Monday at midnight', text: 'Recorded comparison.', at: iso(11, 23), mapId,
    topics: { concepts: ['evidence'], framework: ['scope'], areas: ['HIS'], themes: ['LAN'] } },
  { id: 'inside', kind: 'experience', title: 'Session work', text: 'Different evidence.', at: iso(11, 26, 11), mapId,
    topics: { concepts: ['perspective'], framework: ['scope'], areas: ['NAT'], themes: ['LAN'] } },
  { id: 'week-end', kind: 'quest', title: 'Sunday at midnight', text: 'A Sunday record.', at: iso(11, 29), mapId,
    topics: { concepts: ['evidence'], framework: ['scope'], areas: ['HUM'], themes: ['TEC'] } },
  { id: 'next-week', kind: 'experience', title: 'Next Monday', text: 'A later event.', at: iso(11, 30), mapId },
];

const view: AdventureJournalView = {
  name: 'Guardian', entries, quests: [], references: [], encyclopedia: [],
  notes: [
    { index: 0, kind: 'note', text: 'Earlier writing with no timestamp.', at: null, mapId: null, resolved: false },
    { index: 1, kind: 'note', text: '\n New writing.  \n', at: iso(11, 26, 11), mapId, resolved: false },
  ],
  portfolioWriting: [{ id: 'p', title: 'A draft', text: '  A current draft  ', at: iso(11, 26, 11), mapId, draft: true }],
};

function filtered(time: DiaryTime, topics?: DiaryTopics) {
  const result = selectDiary(view, { time, now, topics });
  if (!result.view) throw new Error(result.error);
  return result.view;
}

describe('diary export selection', () => {
  it('retains the unrestricted journal and uses local Monday-to-Monday calendar boundaries', () => {
    expect(filtered({ kind: 'all' })).toBe(view);
    const week = filtered({ kind: 'week' });
    expect(week.entries.map(({ id }) => id)).toEqual(['week-start', 'inside', 'week-end']);
    expect(week.notes.map(({ text }) => text)).toEqual(['\n New writing.  \n']);
    expect(week.portfolioWriting?.[0].text).toBe('  A current draft  ');
  });

  it('includes the whole end date and an exact leap day while detecting invalid or reversed input', () => {
    expect(filtered({ kind: 'dates', from: '2026-11-23', through: '2026-11-26' }).entries.map(({ id }) => id))
      .toEqual(['week-start', 'inside']);
    expect(filtered({ kind: 'dates', from: '2026-11-26', through: '2026-11-26' }).entries.map(({ id }) => id)).toEqual(['inside']);
    const leapView = { ...view, entries: [
      { ...entries[0], id: 'leap', at: new Date(2024, 1, 29, 23, 59, 59, 999).toISOString() },
      { ...entries[0], id: 'march', at: new Date(2024, 2, 1).toISOString() },
    ] };
    expect(selectDiary(leapView, { now, time: { kind: 'dates', from: '2024-02-29', through: '2024-02-29' } }).view?.entries.map(({ id }) => id))
      .toEqual(['leap']);
    expect(selectDiary(view, { now, time: { kind: 'dates', from: '2026-02-29', through: '2026-03-01' } }).error).toMatch(/start date/);
    expect(selectDiary(view, { now, time: { kind: 'dates', from: '2026-11-24', through: '2026-11-23' } }).error).toMatch(/on or after/);
  });

  it('separates dates from tagging and intersects dimensions with any selection within each group', () => {
    const scope = filtered({ kind: 'week' }, {
      concepts: ['evidence', 'perspective'], framework: ['scope'], areas: ['HIS', 'NAT'], themes: ['LAN'],
    });
    expect(scope.entries.map(({ id }) => id)).toEqual(['week-start', 'inside']);
    expect(scope.notes).toEqual([]);
    expect(scope.portfolioWriting).toEqual([]);
    expect(filtered({ kind: 'all' }, { concepts: ['evidence'], framework: ['scope'], areas: ['NAT'] }).entries).toEqual([]);
    expect(filtered({ kind: 'all' }, { concepts: ['evidence'] }).entries.map(({ id }) => id)).toEqual(['old', 'week-start', 'week-end']);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function testController() {
  const store = memoryStore();
  vi.stubGlobal('window', { localStorage: { getItem: store.get, setItem: store.set } });
  const controller = new GameController();
  controller.newGame('Guardian', 'player-a');
  return controller;
}

function session(controller: GameController) {
  return selectDiary(diary(controller), {
    now: new Date(), time: { kind: 'session', startedAt: controller.diarySessionStartedAt },
  }).view;
}

function diary(controller: GameController) {
  const { pack, state, engine } = controller;
  return adventureJournalView(pack, state, engine.visibleObjectives(state));
}

describe('recorded adventure sessions', () => {
  it('keeps the session through saving and starts a separate one on Continue and recovery', () => {
    vi.useFakeTimers().setSystemTime(new Date(iso(11, 26, 9)));
    const controller = testController();
    const started = controller.diarySessionStartedAt;
    vi.setSystemTime(new Date(iso(11, 26, 10)));
    controller.dispatch({ type: 'AddNote', text: '  Before the checkpoint.  ' });
    expect(controller.checkpoint('After the note')).toBe(true);
    vi.setSystemTime(new Date(iso(11, 26, 11)));
    controller.dispatch({ type: 'SetDiaryNoteDraft', text: ' Draft after checkpoint.\n\nSecond line. ', kind: 'note' });
    expect(controller.suspend()).toBe(true);
    expect(controller.diarySessionStartedAt).toBe(started);
    expect(session(controller)?.notes.map(({ text }) => text)).toEqual(['  Before the checkpoint.  ', ' Draft after checkpoint.\n\nSecond line. ']);

    vi.setSystemTime(new Date(iso(11, 26, 12)));
    const reopened = new GameController();
    expect(reopened.diarySessionStartedAt).toBeNull();
    reopened.loadContinue();
    expect(session(reopened)?.notes).toEqual([]);
    reopened.dispatch({ type: 'AddNote', text: 'From this session.' });
    expect(session(reopened)?.notes.map(({ text }) => text)).toEqual(['From this session.']);
    vi.setSystemTime(new Date(iso(11, 26, 13)));
    expect(reopened.loadRecovery()).toBe(true);
    expect(reopened.diarySessionStartedAt).toBe(Date.now());
    expect(session(reopened)?.notes).toEqual([]);
  });

  it('leaves an older draft undated and dates the next edit without changing the writing', () => {
    vi.useFakeTimers().setSystemTime(new Date(iso(11, 26, 11)));
    const controller = testController();
    const raw = structuredClone(controller.state);
    raw.schema = 6;
    raw.adventureDiary.noteDraft = { kind: 'note', text: '  Older draft.\n\n' };
    controller.state = migrateCampaign(raw).state;
    expect(diary(controller).notes[0]).toMatchObject({ text: '  Older draft.\n\n', at: null });
    controller.dispatch({ type: 'SetDiaryNoteDraft', kind: 'note', text: '  Older draft.\n\n' });
    expect(session(controller)?.notes).toEqual([]);
    controller.dispatch({ type: 'SetDiaryNoteDraft', kind: 'note', text: '  Revised draft.\n\n' });
    expect(session(controller)?.notes[0]).toMatchObject({ text: '  Revised draft.\n\n', at: iso(11, 26, 11), mapId });
  });

  it('projects actual recorded quest weave and leaves an unclassified visit available in date scopes', () => {
    vi.useFakeTimers().setSystemTime(now);
    const controller = testController();
    controller.dispatch({ type: 'VisitPlace', name: 'The Nexus' });
    controller.dispatch({ type: 'SetFlag', flag: 'nexus.rest.used', value: true });
    const view = diary(controller);
    const arrival = view.entries.find(({ event }) => event?.kind === 'arrival');
    const completed = view.entries.find(({ event }) => event?.key === 'quest:nexus.rest.checked');
    const objective = controller.pack.missions.flatMap(({ objectives }) => objectives).find(({ id }) => id === 'nexus.rest.checked');
    expect(arrival).toBeDefined();
    expect(arrival?.topics).toBeUndefined();
    expect(completed?.at).toBe(now.toISOString());
    expect(completed?.topics?.concepts?.length).toBeGreaterThan(0);
    expect(completed?.topics?.concepts).toEqual(objective?.weave?.concepts);
    expect(completed?.topics?.framework).toEqual(objective?.weave?.framework);
    const result = selectDiary(view, { now, time: { kind: 'week' }, topics: { concepts: completed?.topics?.concepts } });
    expect(result.view?.entries).toContain(completed);
    expect(result.view?.entries).not.toContain(arrival);
  });
});
