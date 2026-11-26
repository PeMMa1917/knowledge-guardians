/**
 * GameController: the single owner of campaign state, permanent record and
 * saves. Scenes and UI call `dispatch`; nothing else writes state.
 */
import { buildPack } from '../content';
import { Engine, newCampaign, type Command, type GameEvent } from '../domain/engine';
import { checkAwards, restoreQuestionWays } from '../domain/permanent';
import { restoreMicroSkillUses } from '../domain/skills';
import { check } from '../domain/rules';
import {
  PermanentSaveConflict, SaveService, browserStore, restoreRecovery, writeCheckpoint, writeSuspend, type SaveEntry, type SlotPair,
} from '../domain/saves';
import type { CampaignState, ContentPack, PermanentRecord } from '../domain/types';
import { validateContent } from '../domain/validate';
import { addActivity, dayOf } from '../domain/ledger';
import { MAPS } from '../maps';
import { ctx } from './context';

type Listener = (events: GameEvent[]) => void;

export class GameController {
  readonly pack: ContentPack;
  readonly engine: Engine;
  readonly saves: SaveService;
  state!: CampaignState;
  permanent: PermanentRecord;
  pair: SlotPair = { revision: 0, continue: null, recovery: null };
  loadProblem: string | null = null;
  loadWarning: string | null = null;
  contentProblems: string[];
  private listeners: Listener[] = [];
  private playStart = Date.now();
  private diarySessionStart: number | null = null;
  private permanentDirty = false;
  private permanentWriteFailed = false;

  constructor() {
    this.pack = buildPack();
    this.contentProblems = validateContent(this.pack);
    this.engine = new Engine(this.pack);
    this.saves = new SaveService(browserStore());
    this.permanent = this.saves.loadPermanent();
    const r = this.saves.load();
    if (r.ok) {
      this.pair = r.pair;
      this.loadWarning = r.warning ?? null;
    }
    else this.loadProblem = r.reason;   // stored data is left untouched
  }

  onEvents(fn: Listener): void { this.listeners.push(fn); }

  get diarySessionStartedAt(): number | null { return this.diarySessionStart; }

  private beginSession(): void {
    this.diarySessionStart = this.playStart = Date.now();
  }

  // ------------------------------------------------- active time (the Ledger)

  private lastInput = 0;
  private ticks = 0;
  /** Call on any key or pointer input. Time counts only while the player is really playing. */
  noteInput(): void { this.lastInput = Date.now(); }
  /** Call every 15 seconds. Counts the time if the tab is visible and there was input in the last 2 minutes. */
  tickActive(visible: boolean, secs = 15): void {
    if (!this.state || !visible || Date.now() - this.lastInput > 120_000) return;
    this.updatePermanent({ ...this.permanent, activity: addActivity(this.permanent.activity, dayOf(new Date()), { secs }) });
    if (++this.ticks % 4 === 0) this.flushPermanent();
  }

  dispatch(cmd: Command): GameEvent[] {
    const o = this.engine.dispatch(cmd, this.state, this.permanent);
    this.state = o.state;
    const recordChanged = o.permanent !== this.permanent;
    this.updatePermanent(o.permanent);
    const xp = o.events.reduce((n, e) => n + (e.kind === 'xp' ? e.amount : 0), 0);
    if (xp) this.updatePermanent({ ...this.permanent, activity: addActivity(this.permanent.activity, dayOf(new Date()), { xp }) });
    if (recordChanged || xp) this.flushPermanent();
    const events = o.events.filter((event) => event.kind !== 'checkpoint' || this.checkpoint(event.label));
    this.emit(events);
    (events as any).nextNode = o.nextNode;
    return events;
  }

  emit(events: GameEvent[]): void { if (events.length) this.listeners.forEach((l) => l(events)); }

  check = (c: Parameters<typeof check>[0]) => check(c, this.state);

  // ------------------------------------------------------------------ saves

  newGame(name: string, look: string, opts: Parameters<typeof newCampaign>[4] = {}): void {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    this.state = newCampaign(this.pack, name, look, seed, opts);
    const m = MAPS['nexus.archive'];
    this.state.pos = { x: m.spawn.x, y: m.spawn.y };
    this.beginSession();
    this.checkpoint('New recruit');
  }

  private entry(kind: 'checkpoint' | 'suspend', label: string): SaveEntry {
    ctx.world?.snapshotPosition();
    this.tickPlayTime();
    return { kind, label, location: MAPS[this.state.mapId]?.name ?? this.state.mapId, savedAt: new Date().toISOString(), state: structuredClone(this.state) };
  }

  private tickPlayTime(): void {
    const now = Date.now();
    this.state.playSeconds += Math.round((now - this.playStart) / 1000);
    this.playStart = now;
  }

  checkpoint(label: string): boolean {
    return this.commit(writeCheckpoint(this.pair, this.entry('checkpoint', label)));
  }

  suspend(label = 'Save and leave'): boolean {
    return this.commit(writeSuspend(this.pair, this.entry('suspend', label))) && this.flushPermanent(true);
  }

  private updatePermanent(record: PermanentRecord): void {
    if (record === this.permanent) return;
    this.permanent = record;
    this.permanentDirty = true;
  }

  private flushPermanent(announceFailure = false): boolean {
    if (!this.permanentDirty) return true;
    try {
      this.saves.savePermanent(this.permanent);
      this.permanentDirty = this.permanentWriteFailed = false;
      return true;
    } catch (error) {
      const report = announceFailure || !this.permanentWriteFailed;
      this.permanentWriteFailed = true;
      const message = error instanceof PermanentSaveConflict ? error.message
        : 'The browser could not save your learning record. Keep this tab open and try saving again.';
      if (report) this.emit([{ kind: 'error', message }]);
      return false;
    }
  }

  private commit(next: SlotPair): boolean {
    try {
      this.pair = this.saves.commit(this.pair.revision, next);
      this.loadProblem = this.loadWarning = null;
      return true;
    } catch (err) {
      const error = err as Error;
      const message = ['QuotaExceededError', 'SecurityError'].includes(error.name)
        ? 'The browser could not save your adventure. Keep this tab open and try saving again.'
        : error.message;
      this.emit([{ kind: 'error', message }]);
      return false;
    }
  }

  canContinue(): boolean { return !!this.pair.continue; }
  canRecover(): boolean { return !!this.pair.recovery; }

  loadContinue(): void {
    if (!this.pair.continue) throw new Error('No save to continue');
    this.state = structuredClone(this.pair.continue.state);
    if (!Object.hasOwn(MAPS, this.state.mapId)) {
      const nexus = MAPS['nexus.archive'];
      this.state.mapId = nexus.id;
      this.state.pos = { ...nexus.spawn };
    }
    this.beginSession();
    this.refreshAwards();
    const questions = restoreQuestionWays(this.permanent, this.pack, this.state.objectivesDone);
    this.updatePermanent(restoreMicroSkillUses(questions, this.pack, this.state.objectivesDone));
    this.flushPermanent();
  }

  loadRecovery(): boolean {
    if (!this.commit(restoreRecovery(this.pair))) return false;
    this.loadContinue();
    return true;
  }

  /** Awards can be earned from restored state too; credit stays idempotent. */
  private refreshAwards(): void {
    const r = checkAwards(this.permanent, this.pack, this.state, new Date().toISOString());
    if (r.newly.length) this.updatePermanent(r.record);
  }

  /** Text for the return recap (spec 29.1 "readable return recap"). */
  recap(): { title: string; lines: string[] } {
    const s = this.state;
    const lastJournal = s.journal.slice(-2).map((id) => this.pack.journal.find((j) => j.id === id)?.text ?? '');
    const cur = this.engine.currentObjective(s);
    return {
      title: `Welcome back, ${s.player.name}.`,
      lines: [
        `You are in ${MAPS[s.mapId]?.name ?? s.mapId}.`,
        ...lastJournal.filter(Boolean).map((t) => `Last time: ${t}`),
        cur ? `Next step: ${cur.title}` : 'You have finished this chapter. You can explore, or start a new campaign.',
      ],
    };
  }
}
