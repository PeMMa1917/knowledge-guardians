/**
 * GameController: the single owner of campaign state, permanent record and
 * saves. Scenes and UI call `dispatch`; nothing else writes state.
 */
import { buildPack } from '../content';
import { Engine, newCampaign, type Command, type GameEvent } from '../domain/engine';
import { checkAwards } from '../domain/permanent';
import { check } from '../domain/rules';
import {
  SaveService, browserStore, restoreRecovery, writeCheckpoint, writeSuspend, type SaveEntry, type SlotPair,
} from '../domain/saves';
import type { CampaignState, ContentPack, PermanentRecord } from '../domain/types';
import { validateContent } from '../domain/validate';
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
  contentProblems: string[];
  private listeners: Listener[] = [];
  private playStart = Date.now();

  constructor() {
    this.pack = buildPack();
    this.contentProblems = validateContent(this.pack);
    this.engine = new Engine(this.pack);
    this.saves = new SaveService(browserStore());
    this.permanent = this.saves.loadPermanent();
    const r = this.saves.load();
    if (r.ok) this.pair = r.pair;
    else this.loadProblem = r.reason;   // stored data is left untouched
  }

  onEvents(fn: Listener): void { this.listeners.push(fn); }

  dispatch(cmd: Command): GameEvent[] {
    const o = this.engine.dispatch(cmd, this.state, this.permanent);
    this.state = o.state;
    if (o.permanent !== this.permanent) {
      this.permanent = o.permanent;
      this.saves.savePermanent(this.permanent);
    }
    for (const e of o.events) if (e.kind === 'checkpoint') this.checkpoint(e.label);
    this.emit(o.events);
    (o.events as any).nextNode = o.nextNode;
    return o.events;
  }

  emit(events: GameEvent[]): void { if (events.length) this.listeners.forEach((l) => l(events)); }

  check = (c: Parameters<typeof check>[0]) => check(c, this.state);

  // ------------------------------------------------------------------ saves

  newGame(name: string, look: string, opts: Parameters<typeof newCampaign>[4] = {}): void {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    this.state = newCampaign(this.pack, name, look, seed, opts);
    const m = MAPS['nexus.archive'];
    this.state.pos = { x: m.spawn.x, y: m.spawn.y };
    this.playStart = Date.now();
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

  checkpoint(label: string): void {
    this.commit(writeCheckpoint(this.pair, this.entry('checkpoint', label)));
  }

  suspend(label = 'Save and leave'): void {
    this.commit(writeSuspend(this.pair, this.entry('suspend', label)));
  }

  private commit(next: SlotPair): void {
    try {
      this.pair = this.saves.commit(this.pair.revision, next);
    } catch (err) {
      this.emit([{ kind: 'error', message: (err as Error).message }]);
    }
  }

  canContinue(): boolean { return !!this.pair.continue; }
  canRecover(): boolean { return !!this.pair.recovery; }

  loadContinue(): void {
    if (!this.pair.continue) throw new Error('No save to continue');
    this.state = structuredClone(this.pair.continue.state);
    this.playStart = Date.now();
    this.refreshAwards();
  }

  loadRecovery(): void {
    this.commit(restoreRecovery(this.pair));
    this.loadContinue();
  }

  /** Awards can be earned from restored state too; credit stays idempotent. */
  private refreshAwards(): void {
    const r = checkAwards(this.permanent, this.pack, this.state, new Date().toISOString());
    if (r.newly.length) { this.permanent = r.record; this.saves.savePermanent(r.record); }
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
