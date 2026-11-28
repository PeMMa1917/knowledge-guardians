import { lanternCase, lanternRef } from '../src/domain/lamplight';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameController } from '../src/app/controller';
import { buildPack } from '../src/content';
import { newCampaign, Engine, type Command } from '../src/domain/engine';
import { revealAround } from '../src/domain/fog';
import { addActivity, dayOf } from '../src/domain/ledger';
import { leaderboardFile, leaderboardPeriodRange, leaderboardSharing, leaderboardWithdrawal, LEADERBOARD_METRICS,
  mergeLeaderboardFiles, periodHistory, rankLeaderboard, readLeaderboard, type LeaderboardFile } from '../src/domain/leaderboard';
import { leaderboardIndex, recordLeaderboardAction, startLeaderboard } from '../src/domain/leaderboardTracking';
import { migratePermanent, newPermanent } from '../src/domain/permanent';
import { dealTiles, runNumber } from '../src/domain/tiles';
import type { PermanentRecord } from '../src/domain/types';

const board = buildPack();
const index = leaderboardIndex(board, [{ id: 'nexus.archive', width: 40, height: 32 }]);
const engine = new Engine(board);
const previous = new Date(2025, 11, 31, 14);
const today = new Date(2026, 0, 1, 15);
const next = new Date(2026, 0, 2, 15);
const future = new Date(2026, 0, 3, 15);

function sample(alias: string, id: string, values: Record<string, number>, now = today): PermanentRecord {
  const history = startLeaderboard(index, [], now);
  return { ...newPermanent(), leaderboard: leaderboardSharing({ ...history, days: { [dayOf(now)]: values } }, alias, () => id) };
}
const alpha = 'a'.repeat(32);
const beta = 'b'.repeat(32);
const gamma = 'c'.repeat(32);
function scoreCard(p: PermanentRecord, now: Date, metric?: string): Extract<LeaderboardFile, { kind: 'scores' }> {
  const file = leaderboardFile(p, 'weekly', now, metric);
  if (file?.kind !== 'scores') throw new Error('Expected a released scorecard');
  return file;
}

describe('Local leaderboard dates and consent', () => {
  it('keeps Monday week, calendar month, and YTD totals distinct across New Year', () => {
    let p = sample('Lantern Fox', alpha, { quests: 2 }, today);
    p = { ...p, activity: addActivity(addActivity(undefined, dayOf(previous), { xp: 6, secs: 30 }), dayOf(today), { xp: 4, secs: 15 }) };
    expect(leaderboardPeriodRange('weekly', today)).toEqual({ from: '2025-12-29', through: '2026-01-01' });
    expect(leaderboardPeriodRange('ytd', next)).toEqual({ from: '2026-01-01', through: '2026-01-02' });
    expect(periodHistory(p, 'weekly', today).values).toMatchObject({ xp: 10, 'active-seconds': 45, quests: 2 });
    expect(periodHistory(p, 'monthly', today).values).toMatchObject({ xp: 4, 'active-seconds': 15, quests: 2 });
    expect(periodHistory(p, 'ytd', next).values).toMatchObject({ xp: 4, 'active-seconds': 15, quests: 2 });
    expect(periodHistory(p, 'daily', next).values).toMatchObject({ xp: 0, 'active-seconds': 0, quests: 0 });
  });

  it('keeps legacy date coverage unknown and never dates old permanent totals', () => {
    const p = migratePermanent({ ...newPermanent(), schema: 4, credit: { some: 8 }, met: { ...newPermanent().met, concepts: { evidence: 47 } } });
    expect(p.schema).toBe(5);
    expect(p.leaderboard).toBeUndefined();
    expect(periodHistory(p, 'weekly', today)).toMatchObject({ availableFrom: null, values: { xp: null, quests: null, 'concept:evidence': null } });
    expect(p.credit.some).toBe(8);
    expect(p.met.concepts.evidence).toBe(47);
    expect(leaderboardFile(p, 'weekly', today)).toBeNull();
  });

  it('exports only the chosen aggregate and strips private or unexpected import fields', () => {
    const p = sample('Lantern Fox', alpha, { quests: 2, 'aok:HIS': 7 });
    const file = scoreCard(p, today, 'quests');
    expect(file.values).toEqual({ quests: 2 });
    const raw = { ...file, adventureDiary: 'private', name: 'private', values: { ...file.values, secret: 7 } };
    expect(readLeaderboard(raw)).toEqual({ ok: true, file });
    expect(readLeaderboard({ ...file, through: '2026-02-30' }).ok).toBe(false);
    expect(readLeaderboard({ ...file, values: { ...file.values, 'map-discovery': 101 } }).ok).toBe(false);
    expect(readLeaderboard({ ...file, alias: '<script>' }).ok).toBe(false);
    expect(readLeaderboard({ format: 'knowledge-guardians-progress', version: 1 }).ok).toBe(false);
  });

  it('preserves distinct metric files, ties and latest accepted period coverage', () => {
    const a = sample('Lantern Fox', alpha, { quests: 2, 'game:forecast-brier': 0.25 });
    const b = sample('Blue River', beta, { quests: 2, 'game:forecast-brier': 0.125 });
    const c = sample('Quiet Garden', gamma, { quests: 1 });
    const files = mergeLeaderboardFiles([], [scoreCard(a, today, 'quests'), scoreCard(a, next, 'game:forecast-brier'),
      scoreCard(b, today), scoreCard(a, today, 'quests'), scoreCard(c, today), scoreCard(c, future)]);
    expect(rankLeaderboard(files, 'weekly', 'quests', next).map(({ rank, value }) => [rank, value])).toEqual([[1, 2], [1, 2], [3, 1]]);
    expect(rankLeaderboard(files, 'weekly', 'game:forecast-brier', next)).toEqual([
      { id: beta, rank: 1, alias: 'Blue River', value: 0.125, availableFrom: dayOf(today), through: dayOf(today) },
      { id: alpha, rank: 2, alias: 'Lantern Fox', value: 0.25, availableFrom: dayOf(today), through: dayOf(next) },
    ]);
  });

  it('withdraws all earlier nickname scores even if they are imported again and can rejoin under a new alias', () => {
    const p = sample('Lantern Fox', alpha, { quests: 2 });
    const first = scoreCard(p, today, 'quests');
    const off = { ...p, leaderboard: leaderboardSharing(p.leaderboard!, null, () => beta) };
    expect(off.leaderboard?.sharing).toMatchObject({ enabled: false, id: alpha, alias: null });
    expect(leaderboardFile(off, 'weekly', today)).toBeNull();
    const removal = leaderboardWithdrawal(off, next)!;
    expect(removal).toEqual({ format: first.format, version: 1, id: alpha, exportedAt: next.toISOString(), revision: 2, kind: 'withdrawal' });
    const muted = mergeLeaderboardFiles([first], [removal, first]);
    expect(muted).toEqual([removal]);
    expect(rankLeaderboard(muted, 'weekly', 'quests', next)).toEqual([]);
    const on = { ...off, leaderboard: leaderboardSharing(off.leaderboard!, 'New Flame', () => beta) };
    const rejoined = mergeLeaderboardFiles(muted, [scoreCard(on, future, 'quests')]);
    expect(rankLeaderboard(rejoined, 'weekly', 'quests', future)[0]).toMatchObject({ alias: 'New Flame', id: alpha, value: 2 });
  });
});

describe('Leaderboard counts from actual actions and saves', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('counts a real mill and lantern guest once across chapters, returns, earlier local saves and school score cards', () => {
    const c = new GameController();
    c.newGame('Fictional Finch', 'player-a');
    const who='q153761', now=new Date();
    const count=()=>periodHistory(c.permanent,'daily',now).values['npcs-met'];
    c.dispatch({type:'WorkMillShift',action:'arrive'});
    expect(count()).toBe(0);
    c.state.mapId='night-register.nile';
    c.dispatch({type:'WorkMillShift',action:'arrive'});
    expect(count()).toBe(1);
    const lamp = lanternCase(lanternRef('archive',who)) ?? lanternCase(lanternRef('nile',who))!;
    c.state.mapId=lamp.site.map;
    c.dispatch({type:'WorkWithLantern',site:lamp.site.id,person:who,stage:'meet'});
    expect(count()).toBe(1);
    const idx=leaderboardIndex(c.pack,[]);
    const older=startLeaderboard(idx,[c.state],now);
    expect(older.seen).toContain('met:'+lamp.person.character);
    expect(older.days).toEqual({});
    expect(c.permanent.leaderboard?.sharing?.alias).toBeFalsy();
  });

  it('captures active time, unique physical greetings, explicit framework practice, and fog across rollback', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value) } });
    vi.useFakeTimers();
    vi.setSystemTime(today);
    const c = new GameController();
    c.newGame('Private Player', 'player-a');
    c.noteInput();
    vi.setSystemTime(new Date(today.getTime() + 15_000));
    c.tickActive(false);
    c.tickActive(true);
    c.dispatch({ type: 'ReadWorldSign', id: 'old-label', title: 'Old entrance label', text: 'Read the filed label', readFlag: 'read.oldlabel' });
    c.recordLeaderboardNpc('warden-ise');
    let node = c.engine.talkEntry('warden-ise', c.state);
    while (node) {
      c.dispatch({ type: 'EnterNode', node });
      const choice = c.engine.visibleOptions(node, c.state)[0];
      if (choice) {
        const response = c.dispatch({ type: 'ChooseDialogueOption', node, index: choice.index }) as ReturnType<GameController['dispatch']> & { nextNode?: string | null };
        node = response.nextNode ?? null;
      } else node = c.engine.node(node).next ?? null;
    }
    c.recordLeaderboardNpc('warden-ise');
    c.recordLeaderboardNpc('not-a-character');
    c.dispatch({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    c.dispatch({ type: 'InspectExhibit', exhibit: 'OBJ-001-B' });
    c.dispatch({ type: 'InspectExhibit', exhibit: 'OBJ-001-C' });
    c.dispatch({ type: 'UseLens', exhibit: 'OBJ-001-A' });
    c.dispatch({ type: 'UseLens', exhibit: 'OBJ-001-B' });
    const fog = revealAround('', 40, 32, 8, 10);
    c.dispatch({ type: 'SetFlag', flag: 'fog.nexus.archive', value: fog });
    const captured = periodHistory(c.permanent, 'daily', today).values;
    expect(captured).toMatchObject({ 'active-seconds': 15, 'npcs-met': 1, 'aok:HIS': 3, 'framework:methods-and-tools': 1 });
    expect(captured.xp).toBeGreaterThan(0);
    expect(captured['map-discovery']).toBeGreaterThan(0);
    expect(c.setLeaderboardSharing('Private Player')).toBe(false);
    expect(c.setLeaderboardSharing('Lantern Fox')).toBe(true);
    c.loadContinue();
    c.recordLeaderboardNpc('warden-ise');
    c.dispatch({ type: 'SetFlag', flag: 'fog.nexus.archive', value: fog });
    expect(periodHistory(c.permanent, 'daily', today).values).toEqual(captured);
    const stale = new GameController();
    expect(stale.permanent.leaderboard?.sharing).toEqual(c.permanent.leaderboard?.sharing);
    expect(stale.canExportLeaderboard()).toBe(true);
    expect(c.setLeaderboardSharing(null)).toBe(true);
    expect(stale.canExportLeaderboard()).toBe(false);
    expect(leaderboardWithdrawal(c.permanent, today)?.kind).toBe('withdrawal');
  });

  it('baseline does not count old quest, friendship, fog, or objectives as newly earned', () => {
    const old = newCampaign(board, 'Keeper', 'player-a', 72);
    const mission = board.missions.find(({ id }) => id === 'KG-CH1-M01')!;
    old.objectivesDone = mission.objectives.filter(step => step.essential).map(step => step.id);
    old.flags['lor.glimmermoth.friend'] = true;
    old.flags['fog.nexus.archive'] = revealAround('', 40, 32, 8, 10);
    const history = startLeaderboard(index, [old], today);
    expect(history.days).toEqual({});
    expect(history.seen).toContain('quest:KG-CH1-M01');
    expect(history.seen).toContain('friend:loreling:glimmermoth');
    const nextHistory = recordLeaderboardAction(history, index, { ...old, flags: {} }, old,
      { type: 'SetFlag', flag: 'fog.nexus.archive', value: String(old.flags['fog.nexus.archive']) }, [], today);
    expect(nextHistory).toBe(history);
  });

  it('counts a Loreling friendship and its quest only after the successful real offer', () => {
    let state = newCampaign(board, 'Keeper', 'player-a', 72);
    let permanent = newPermanent();
    let ledger = startLeaderboard(index, [], today);
    const run = (command: Command) => {
      const out = engine.dispatch(command, state, permanent, today.toISOString());
      ledger = recordLeaderboardAction(ledger, index, state, out.state, command, out.events, today);
      state = out.state; permanent = out.permanent;
      return out.events;
    };
    for (const sighting of ['lamp', 'desk', 'case']) run({ type: 'LorelingWatch', loreling: 'glimmermoth', sighting });
    run({ type: 'LorelingNote', loreling: 'glimmermoth', question: 'draws', option: 'touch' });
    run({ type: 'LorelingNote', loreling: 'glimmermoth', question: 'glow', option: 'worn' });
    run({ type: 'LorelingOffer', loreling: 'glimmermoth', place: 'brightest' });
    const before = periodHistory({ ...permanent, leaderboard: ledger }, 'daily', today).values;
    expect(before).toMatchObject({ 'npcs-met': 1, 'npcs-befriended': 0 });
    run({ type: 'LorelingOffer', loreling: 'glimmermoth', place: 'handle' });
    const after = periodHistory({ ...permanent, leaderboard: ledger }, 'daily', today).values;
    expect(after).toMatchObject({ 'npcs-met': 1, 'npcs-befriended': 1 });
    expect(after.quests).toBeGreaterThan(before.quests!);
    run({ type: 'LorelingOffer', loreling: 'glimmermoth', place: 'handle' });
    expect(periodHistory({ ...permanent, leaderboard: ledger }, 'daily', today).values).toEqual(after);
  });

  it('uses valid complete comparison runs for game scores and ignores rejected trials', () => {
    let state = newCampaign(board, 'Keeper', 'player-a', 72);
    let permanent = newPermanent();
    let ledger = startLeaderboard(index, [], today);
    const run = (command: Command) => {
      const out = engine.dispatch(command, state, permanent, today.toISOString());
      ledger = recordLeaderboardAction(ledger, index, state, out.state, command, out.events, today);
      state = out.state; permanent = out.permanent;
      return out.events;
    };
    state.mapId = 'aethelgard.emberford';
    const stitch = (moves: number, seconds: number) => {
      const runId = runNumber(state);
      return run({ type: 'CompleteTileStitch', daily: null, run: runId, pairs: [...new Set(dealTiles(runId).map(x => x.slip.id))],
        moves, secs: seconds, times: [1, 2, 3, 4, 5, 6] });
    };
    expect(stitch(8, 18).some(event => event.kind === 'error')).toBe(false);
    expect(stitch(6, 21).some(event => event.kind === 'error')).toBe(false);
    expect(stitch(5, 16).some(event => event.kind === 'error')).toBe(true);
    const fo = board.puzzles.find(puzzle => puzzle.id === 'forecast-board');
    if (fo?.type !== 'forecast') throw new Error('Forecast board missing');
    for (let i = 0; i < fo.days.length; i++) {
      const events = run({ type: 'PuzzleForecast', puzzle: fo.id, chance: 50 });
      expect(events.some(event => event.kind === 'error')).toBe(false);
      if (i < fo.days.length - 1) expect(ledger.days[dayOf(today)]?.['game:forecast-brier']).toBeUndefined();
    }
    const scores = periodHistory({ ...permanent, leaderboard: ledger }, 'weekly', today).values;
    expect(scores).toMatchObject({ 'game:stitch-moves': 6, 'game:stitch-seconds': 18, 'game:forecast-brier': 0.25, 'game:dive-depth': null });
    expect(LEADERBOARD_METRICS).toHaveLength(31);
  });
});
