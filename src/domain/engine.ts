/**
 * Domain engine. Scenes send typed commands; the engine checks preconditions,
 * computes ONE valid state transition and returns events for the view to show
 * (spec 22.2). A button never writes XP or state directly.
 */
import type {
  AwardRecord, CampaignState, ContentPack, DialogueNode, DialogueOption, Effect, Hint, MisconceptionRecord, Mission,
  MomentRule, Objective, PermanentRecord, ShowdownState, Weave,
} from './types';
import { CAMPAIGN_SCHEMA, type Pronouns } from './types';
import { cleanPronouns } from './player';
import { isValidLook } from './appearance';
import { implyAlcove, linkAlcove, placeInAlcove } from './exhibition';
import { answerRound, checkOrder } from './puzzles';
import { apply, check, emptyOutputs, type EffectOutputs } from './rules';
import { checkAwards, grantCredit } from './permanent';
import { evaluateLabel, type LabelResult } from './label';
import { playMove, startShowdown, type ShowdownMove } from './showdown';
import { tryLock, type LockResult } from './lock';
import { compareWithBlade, forgeStep, newForge, type ForgeAction } from './forge';
import { addPortfolio, addSignal, checkMoments, recordWeave, tickEvents } from './learning';

export type Command =
  | { type: 'Reach'; zone: string }
  | { type: 'SetPronouns'; pronouns: Pronouns }
  | { type: 'SetLook'; look: string }
  | { type: 'AlcovePlace'; alcove: string; item: string }
  | { type: 'PuzzleRound'; puzzle: string; round: number; index: number }
  | { type: 'PuzzleOrder'; puzzle: string; order: string[] }
  | { type: 'AlcoveLink'; alcove: string; index: number }
  | { type: 'AlcoveImply'; alcove: string; index: number }
  | { type: 'EnterNode'; node: string }
  | { type: 'ChooseDialogueOption'; node: string; index: number }
  | { type: 'InspectExhibit'; exhibit: string }
  | { type: 'UseLens'; exhibit: string }
  | { type: 'RunSimulation'; pen: string; surface: string }
  | { type: 'BuildLabel'; kit: string; subject: string; criterion: string; limit: string }
  | { type: 'TurnLock'; lock: string; choice: Record<string, string> }
  | { type: 'ShowdownStart'; showdown: string }
  | { type: 'ShowdownMove'; move: ShowdownMove }
  | { type: 'FollowThread'; thread: string; node: string }
  | { type: 'Forge'; action: ForgeAction }
  | { type: 'CompareAssay' }
  | { type: 'Explore'; seconds: number }
  | { type: 'ResolveEvent'; event: string }
  | { type: 'DelayEvent' }
  | { type: 'Rest'; place: string }
  | { type: 'Purchase'; offer: string }
  | { type: 'RequestHint'; objective: string }
  | { type: 'SetFlag'; flag: string; value: string | number | boolean }
  | { type: 'AddNote'; text: string }
  | { type: 'PortfolioShare'; entry: string; shared: boolean }
  | { type: 'PortfolioReflect'; entry: string; text: string };

export type GameEvent =
  | { kind: 'card'; id: string }
  | { kind: 'journal'; id: string }
  | { kind: 'item'; id: string; qty: number }
  | { kind: 'marks'; delta: number }
  | { kind: 'objective'; id: string; title: string }
  | { kind: 'stone'; question: string; ways: number; newWay: boolean }
  | { kind: 'award'; award: AwardRecord; xp: number }
  | { kind: 'xp'; amount: number }
  | { kind: 'checkpoint'; label: string }
  | { kind: 'hint'; hint: Hint }
  | { kind: 'simulation'; result: SimulationResult }
  | { kind: 'label'; result: LabelResult }
  | { kind: 'lock'; lock: string; result: LockResult }
  | { kind: 'puzzle'; puzzle: string; ok: boolean; text: string; gapAt?: number | null }
  | { kind: 'alcove'; alcove: string; stage: 'place' | 'link' | 'imply'; result: string; text: string }
  | { kind: 'showdown'; state: ShowdownState }
  | { kind: 'forge'; line: string }
  | { kind: 'compare'; match: boolean; line: string }
  | { kind: 'thread'; node: string; text: string; gap?: string }
  | { kind: 'event-due'; event: string }
  | { kind: 'moment'; moment: MomentRule }
  | { kind: 'reflection'; misconception: MisconceptionRecord }
  | { kind: 'portfolio'; title: string }
  | { kind: 'rest'; place: string }
  | { kind: 'error'; message: string };

export interface SimulationResult {
  pen: string; surface: string; markQuality: number; note: string; fairTest: boolean; testCount: number;
}

export interface Outcome {
  state: CampaignState;
  permanent: PermanentRecord;
  events: GameEvent[];
  nextNode?: string | null;
}

export function newCampaign(pack: ContentPack, name: string, look: string, seed: number, opts: { pronouns?: Pronouns; origin?: string | null } = {}): CampaignState {
  const origin = pack.origins.find((o) => o.id === opts.origin) ?? null;
  return {
    schema: CAMPAIGN_SCHEMA,
    contentVersion: pack.contentVersion,
    player: { name, look, pronouns: cleanPronouns(opts.pronouns ?? {}), origin: origin?.id ?? null },
    mapId: 'nexus.archive',
    pos: { x: -1, y: -1 },
    facing: 'up',
    flags: {},
    inventory: {},
    marks: 0,
    relations: {},
    journal: origin ? [origin.journal] : [],
    notes: [],
    cards: [],
    objectivesDone: [],
    companion: null,
    rng: { seed, state: seed >>> 0 },
    playSeconds: 0,
    showdown: null,
    forge: newForge(),
    events: { clock: 0, next: 600, seen: [], pending: null },
  };
}

/** World code for portfolio entries, from the map id (e.g. "nexus.archive" -> "nexus"). */
export function worldOf(s: CampaignState): string {
  return s.mapId.split('.')[0];
}

// ---------------------------------------------------------------------------
// Simulation model for the marking test minigame (OBJ-001 playable case).
// Values are MODEL ASSUMPTIONS for play, labelled as such in the interface.
// They are not measurements of historical pens.
// ---------------------------------------------------------------------------
export const SIM_MODEL: Record<string, Record<string, { q: number; note: string }>> = {
  'loud-model': {
    paper: { q: 1, note: 'Model assumption: the coarse ball tears the paper fibres and the thick ink skips. The line is faint and broken.' },
    leather: { q: 3, note: 'Model assumption: the ball rolls well on the rough grain and leaves a clear, broad mark.' },
    wood: { q: 3, note: 'Model assumption: a broad, readable mark on the rough board.' },
  },
  'biro-type': {
    paper: { q: 3, note: 'Model assumption: a fine ball with thin, quick-drying ink makes a smooth, even line.' },
    leather: { q: 1, note: 'Model assumption: the fine ball skates on the grain and the thin ink beads. The mark is patchy.' },
    wood: { q: 2, note: 'Model assumption: a thin line that catches on the grain in places.' },
  },
};

export class Engine {
  constructor(public pack: ContentPack) {}

  node(id: string): DialogueNode {
    const n = this.pack.dialogue.find((x) => x.id === id);
    if (!n) throw new Error(`Unknown dialogue node ${id}`);
    return n;
  }

  /** Options the player can choose now. If none pass, the node's fallback "next" applies. */
  visibleOptions(nodeId: string, s: CampaignState): { option: DialogueOption; index: number }[] {
    return (this.node(nodeId).options ?? []).map((option, index) => ({ option, index })).filter((o) => check(o.option.if, s));
  }

  talkEntry(characterId: string, s: CampaignState): string | null {
    const c = this.pack.characters.find((x) => x.id === characterId);
    if (!c) return null;
    const t = c.talk.find((x) => check(x.if, s));
    return t ? t.node : null;
  }

  activeMissions(s: CampaignState): Mission[] {
    return this.pack.missions.filter((m) => check(m.available, s));
  }

  visibleObjectives(s: CampaignState): (Objective & { mission: Mission; complete: boolean })[] {
    return this.activeMissions(s).flatMap((m) =>
      m.objectives.filter((o) => check(o.visible, s)).map((o) => ({ ...o, mission: m, complete: s.objectivesDone.includes(o.id) })),
    );
  }

  /** The first open, visible objective. Used by the guide and the recap. */
  currentObjective(s: CampaignState): (Objective & { mission: Mission }) | null {
    return this.visibleObjectives(s).find((o) => !o.complete) ?? null;
  }

  dispatch(cmd: Command, s0: CampaignState, p0: PermanentRecord, now = new Date().toISOString()): Outcome {
    const out = emptyOutputs();
    const events: GameEvent[] = [];
    const weaves: Weave[] = [];
    const stones: { id: string; way: string }[] = [];
    const portfolio: { kind: Parameters<typeof addPortfolio>[1]['kind']; title: string; text: string; weave: Weave }[] = [];
    let s = s0;
    let p = p0;
    let nextNode: string | null | undefined;
    try {
      switch (cmd.type) {
        case 'Reach':
          s = apply([{ setFlag: `reached.${cmd.zone}`, value: true }], s, out);
          break;
        case 'SetFlag':
          s = apply([{ setFlag: cmd.flag, value: cmd.value }], s, out);
          break;
        case 'EnterNode': {
          const n = this.node(cmd.node);
          // Remember seen lines, so the world can mark people with something new to say.
          if (!s.flags[`node.${n.id}`]) s = apply([{ setFlag: `node.${n.id}`, value: true }], s, out);
          s = apply(n.effects, s, out);
          break;
        }
        case 'ChooseDialogueOption': {
          const n = this.node(cmd.node);
          const opt = n.options?.[cmd.index];
          if (!opt) throw new Error('That option does not exist');
          if (!check(opt.if, s)) throw new Error('That option is not available now');
          s = apply(opt.effects, s, out);
          nextNode = opt.next ?? null;
          break;
        }
        case 'InspectExhibit': {
          const e = this.pack.exhibits.find((x) => x.id === cmd.exhibit);
          if (!e) throw new Error('Unknown exhibit');
          s = apply([{ setFlag: `inspected.${e.id}`, value: true }, { addCard: e.grantsCard }, { addNum: 'count.inspected', by: s.flags[`inspected.${e.id}`] ? 0 : 1 }], s, out);
          break;
        }
        case 'UseLens': {
          if (!s.inventory['tool.date-lens']) throw new Error('You do not have the Date-Kind Lens yet');
          s = apply([{ setFlag: `lens.${cmd.exhibit}`, value: true }, { addNum: 'count.lens', by: s.flags[`lens.${cmd.exhibit}`] ? 0 : 1 }], s, out);
          break;
        }
        case 'RunSimulation': {
          const m = SIM_MODEL[cmd.pen]?.[cmd.surface];
          if (!m) throw new Error('Unknown test setup');
          const prevPen = s.flags['sim.lastPen'];
          const prevSurface = s.flags['sim.lastSurface'];
          // A fair comparison changes exactly one variable from the last test.
          const changed = (prevPen !== undefined ? Number(prevPen !== cmd.pen) : 0) + (prevSurface !== undefined ? Number(prevSurface !== cmd.surface) : 0);
          const fair = prevPen !== undefined && changed === 1;
          const count = Number(s.flags['sim.tests'] ?? 0) + 1;
          const fx: Effect[] = [
            { setFlag: 'sim.lastPen', value: cmd.pen }, { setFlag: 'sim.lastSurface', value: cmd.surface },
            { setFlag: 'sim.tests', value: count },
            { setFlag: `sim.ran.${cmd.pen}.${cmd.surface}`, value: true },
          ];
          if (fair) fx.push({ addNum: 'sim.fair', by: 1 });
          if (prevPen !== undefined && changed === 2) fx.push({ addNum: 'sim.unfair', by: 1 });
          s = apply(fx, s, out);
          events.push({ kind: 'simulation', result: { pen: cmd.pen, surface: cmd.surface, markQuality: m.q, note: m.note, fairTest: fair, testCount: count } });
          break;
        }
        case 'BuildLabel': {
          const kit = this.pack.labelKits.find((k) => k.id === cmd.kit);
          if (!kit) throw new Error('Unknown label');
          const r = evaluateLabel(kit, cmd, s);
          const tries = Number(s.flags[`label.${kit.id}.tries`] ?? 0) + 1;
          const everHeld = s.flags[`label.${kit.id}.everHeld`] === true;
          s = apply([
            { setFlag: `label.${kit.id}.text`, value: r.text },
            { setFlag: `label.${kit.id}.criterion`, value: cmd.criterion },
            { setFlag: `label.${kit.id}.subject`, value: cmd.subject },
            { setFlag: `label.${kit.id}.limit`, value: cmd.limit },
            { setFlag: `label.${kit.id}.gap`, value: r.gap },
            { setFlag: `label.${kit.id}.holds`, value: r.holds },
            { setFlag: `label.${kit.id}.tries`, value: tries },
            ...(r.holds && !everHeld ? [{ addNum: 'count.labels.holding', by: 1 } as Effect, { setFlag: `label.${kit.id}.everHeld`, value: true } as Effect] : []),
            ...(!r.holds && tries === 1 ? [{ setFlag: `label.${kit.id}.failedOnce`, value: true } as Effect] : []),
            ...(r.holds && !everHeld ? kit.onHold ?? [] : []),
          ], s, out);
          r.signals.forEach((x) => out.signals.push(x));
          events.push({ kind: 'label', result: r });
          portfolio.push({ kind: 'label', title: `Label: ${kit.title}`, text: `${r.text} (${r.holds ? 'the label held' : 'visitors repeated a distorted version'}; force ${r.force - r.lower}, support ${r.support})`, weave: kit.weave });
          weaves.push(kit.weave);
          break;
        }
        case 'TurnLock': {
          const rec = this.pack.locks.find((x) => x.id === cmd.lock);
          if (!rec) throw new Error('Unknown lock');
          const r = tryLock(rec, cmd.choice);
          const wasOpen = s.flags[`lock.${rec.id}.open`] === true;
          s = apply([
            { addNum: `lock.${rec.id}.turns`, by: 1 },
            ...(r.opened ? [{ setFlag: `lock.${rec.id}.open`, value: true } as Effect, { setFlag: `lock.${rec.id}.question`, value: r.question } as Effect] : []),
            ...(r.opened && !wasOpen ? rec.onOpen ?? [] : []),
          ], s, out);
          events.push({ kind: 'lock', lock: rec.id, result: r });
          if (r.opened && !wasOpen) { portfolio.push({ kind: 'reflection', title: `EE practice: ${rec.title}`, text: `My practice question: ${r.question}`, weave: rec.weave }); weaves.push(rec.weave); }
          break;
        }
        case 'ShowdownStart': {
          const rec = this.pack.showdowns.find((x) => x.id === cmd.showdown);
          if (!rec) throw new Error('Unknown Showdown');
          if (s.showdown && s.showdown.id === rec.id && !s.showdown.outcome) break; // resume
          s = structuredClone(s);
          s.showdown = startShowdown(rec);
          events.push({ kind: 'showdown', state: s.showdown });
          break;
        }
        case 'ShowdownMove': {
          if (!s.showdown) throw new Error('No Showdown is running');
          const rec = this.pack.showdowns.find((x) => x.id === s.showdown!.id)!;
          const r = playMove(rec, s.showdown, cmd.move, s);
          s = structuredClone(s);
          s.showdown = r.state;
          r.signals.forEach((x) => out.signals.push(x));
          if (r.state.outcome) {
            const o = rec.outcomes[r.state.outcome];
            s = apply([
              { setFlag: `sd.${rec.id}.outcome`, value: r.state.outcome },
              { setFlag: `sd.${rec.id}.conceded`, value: r.state.conceded.length > 0 },
              { setFlag: `sd.${rec.id}.reframed`, value: r.state.reframed },
              { setFlag: `sd.${rec.id}.claim`, value: r.state.claim ?? '' },
              ...o.effects,
            ], s, out);
            const claim = rec.playerClaims.find((c) => c.id === r.state.claim);
            portfolio.push({ kind: 'showdown', title: `Showdown: ${rec.title}`, text: `My claim: "${claim?.text ?? '—'}" (force ${r.state.force}, support ${r.state.support}). Outcome: ${r.state.outcome}. ${o.text}`, weave: rec.weave });
            weaves.push(rec.weave);
          }
          events.push({ kind: 'showdown', state: s.showdown! });
          break;
        }
        case 'FollowThread': {
          const t = this.pack.threads.find((x) => x.id === cmd.thread);
          if (!t) throw new Error('Unknown thread');
          if (!s.inventory['tool.provenance-thread']) throw new Error('You do not have the Provenance Thread yet');
          const idx = t.nodes.findIndex((n) => n.id === cmd.node);
          if (idx < 0) throw new Error('Unknown place on the thread');
          if (idx > 0 && !s.flags[`thread.${t.id}.${t.nodes[idx - 1].id}`]) throw new Error('The thread does not lead here yet. Follow it from its start.');
          const n = t.nodes[idx];
          const first = !s.flags[`thread.${t.id}.${n.id}`];
          const fx: Effect[] = [{ setFlag: `thread.${t.id}.${n.id}`, value: true }, { setFlag: `thread.${t.id}.at`, value: idx + 1 }];
          if (n.card) fx.push({ addCard: n.card });
          const gap = t.gap.after === n.id;
          if (gap) fx.push({ setFlag: `thread.${t.id}.gap`, value: true });
          s = apply(fx, s, out);
          events.push({ kind: 'thread', node: n.id, text: n.text, gap: gap ? t.gap.text : undefined });
          if (first && idx === t.nodes.length - 1) weaves.push(t.weave);
          break;
        }
        case 'Forge': {
          const r = forgeStep(s.forge, cmd.action);
          s = structuredClone(s);
          s.forge = r.forge;
          const fx: Effect[] = [{ addNum: 'forge.steps', by: 1 }];
          if (cmd.action === 'cut') fx.push({ setFlag: `forge.cut.${r.forge.route}`, value: true });
          if (cmd.action === 'crucible') fx.push({ setFlag: 'forge.triedCrucible', value: true });
          s = apply(fx, s, out);
          events.push({ kind: 'forge', line: r.line });
          break;
        }
        case 'CompareAssay': {
          const r = compareWithBlade(s.forge);
          s = apply([{ addCard: r.card }, { setFlag: 'forge.compared', value: true }, { setFlag: `forge.compared.${s.forge.route}`, value: true }], s, out);
          events.push({ kind: 'compare', match: r.match, line: r.line });
          portfolio.push({ kind: 'test', title: 'Forge test: billet and blade compared', text: r.line, weave: { concepts: ['evidence', 'explanation'], atl: ['thinking', 'research'], subjects: ['chemistry', 'design-tech', 'history'], aoks: ['NAT', 'HIS'] } });
          weaves.push({ concepts: ['evidence', 'explanation'], atl: ['thinking', 'research'], subjects: ['chemistry', 'design-tech', 'history'], aoks: ['NAT', 'HIS'] });
          break;
        }
        case 'Explore': {
          const before = s.events.pending;
          s = tickEvents(this.pack, s, Math.max(0, Math.min(60, cmd.seconds)));
          if (!before && s.events.pending) events.push({ kind: 'event-due', event: s.events.pending });
          break;
        }
        case 'DelayEvent': {
          if (!s.events.pending) break;
          s = structuredClone(s);
          s.events.pending = null; s.events.clock = 0; s.events.next = 240; // ask again in about four minutes
          break;
        }
        case 'ResolveEvent': {
          const ev = this.pack.events.find((e) => e.id === cmd.event);
          if (!ev) throw new Error('Unknown event');
          s = structuredClone(s);
          if (!s.events.seen.includes(ev.id)) s.events.seen.push(ev.id);
          if (s.events.pending === ev.id) s.events.pending = null;
          s = apply([{ addNum: 'count.events', by: 1 }], s, out);
          weaves.push(ev.weave);
          break;
        }
        case 'Rest': {
          // Waystone (spec 38.7): save, rest, and an optional reflection.
          s = apply([{ addNum: 'count.rests', by: 1 }, { setFlag: 'rested', value: true }, { checkpoint: `Waystone: ${cmd.place}` }], s, out);
          events.push({ kind: 'rest', place: cmd.place });
          break;
        }
        case 'Purchase': {
          const o = this.pack.offers.find((x) => x.id === cmd.offer);
          if (!o) throw new Error('Unknown offer');
          if (!check(o.if, s)) throw new Error('That offer is not available');
          if (s.marks < o.price) throw new Error('You do not have enough marks');
          s = apply([{ addMarks: -o.price }, { giveItem: o.item }, ...(o.effects ?? [])], s, out);
          break;
        }
        case 'PuzzleRound': case 'PuzzleOrder': {
          const rec = this.pack.puzzles.find((x) => x.id === cmd.puzzle);
          if (!rec) throw new Error('Unknown puzzle');
          const F = `puzzle.${rec.id}`;
          const wasDone = s.flags[`${F}.done`] === true;
          let ok: boolean, text: string, solved: boolean, gapAt: number | null = null;
          if (cmd.type === 'PuzzleRound') {
            const r = answerRound(rec, Number(s.flags[`${F}.rounds`] ?? 0), cmd.round, cmd.index);
            ok = r.ok; text = r.text; solved = r.solved;
            s = apply(r.ok ? [{ addNum: `${F}.rounds`, by: 1 }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else {
            const r = checkOrder(rec, cmd.order);
            ok = r.ok; text = r.text; solved = r.ok; gapAt = r.gapAt;
            if (!r.ok) s = apply([{ addNum: `${F}.misses`, by: 1 }], s, out);
          }
          if (solved) s = apply([{ setFlag: `${F}.done`, value: true }, ...(!wasDone ? rec.onComplete ?? [] : [])], s, out);
          if (solved && !wasDone) weaves.push(rec.weave);
          events.push({ kind: 'puzzle', puzzle: rec.id, ok, text, gapAt });
          break;
        }
        case 'AlcovePlace': case 'AlcoveLink': case 'AlcoveImply': {
          const rec = this.pack.alcoves.find((x) => x.id === cmd.alcove);
          if (!rec) throw new Error('Unknown alcove');
          const F = `alcove.${rec.id}`;
          if (cmd.type === 'AlcovePlace') {
            const r = placeInAlcove(rec, cmd.item);
            if (r.result !== 'mirage' && r.result !== 'lit' && !this.pack.cards.some((c) => c.id === cmd.item)) throw new Error('Unknown item');
            if (r.result !== 'mirage' && !s.cards.includes(cmd.item)) throw new Error('You do not have that card');
            s = structuredClone(s);
            if (r.result === 'mirage') s = apply([{ addNum: `${F}.mirages`, by: 1 }], s, out);
            if (r.result === 'lit') { delete s.flags[`${F}.link`]; delete s.flags[`${F}.done`]; s = apply([{ setFlag: `${F}.item`, value: cmd.item }], s, out); }
            events.push({ kind: 'alcove', alcove: rec.id, stage: 'place', result: r.result, text: r.text });
          } else {
            const item = s.flags[`${F}.item`];
            if (typeof item !== 'string') throw new Error('Place an object first');
            if (cmd.type === 'AlcoveLink') {
              const r = linkAlcove(rec, item, cmd.index);
              if (r.result === 'ok') s = apply([{ setFlag: `${F}.link`, value: cmd.index }], s, out);
              else s = apply([{ addNum: `${F}.${r.result}`, by: 1 }], s, out);
              events.push({ kind: 'alcove', alcove: rec.id, stage: 'link', result: r.result, text: r.text });
            } else {
              if (typeof s.flags[`${F}.link`] !== 'number') throw new Error('Say what the object shows first');
              const r = implyAlcove(rec, item, cmd.index);
              const first = !s.flags[`${F}.done`];
              if (r.result === 'ok') {
                s = apply([{ setFlag: `${F}.done`, value: true }, { setFlag: `${F}.implication`, value: cmd.index }, ...(first && !s.flags[`${F}.ever`] ? rec.onComplete ?? [] : []), { setFlag: `${F}.ever`, value: true }], s, out);
                if (first) {
                  const obj = rec.objects.find((o) => o.card === item)!;
                  const title = this.pack.cards.find((c) => c.id === item)?.title ?? item;
                  portfolio.push({ kind: 'exhibition', title: `Alcove: ${title}`, text: `${rec.prompt}\nObject: ${title}.\n${obj.links[s.flags[`${F}.link`] as number].text}\n${obj.implications[cmd.index].text}`, weave: rec.weave });
                  weaves.push(rec.weave);
                }
              } else s = apply([{ addNum: `${F}.sphinx`, by: 1 }], s, out);
              events.push({ kind: 'alcove', alcove: rec.id, stage: 'imply', result: r.result, text: r.text });
            }
          }
          break;
        }
        case 'SetLook': {
          if (!isValidLook(cmd.look)) throw new Error('Unknown look');
          s = structuredClone(s);
          s.player.look = cmd.look;
          break;
        }
        case 'SetPronouns': {
          s = structuredClone(s);
          s.player.pronouns = cleanPronouns(cmd.pronouns);
          break;
        }
        case 'AddNote': {
          const t = cmd.text.trim().slice(0, 500);
          if (!t) throw new Error('The note is empty');
          if (s.notes.length >= 200) throw new Error('The journal is full');
          s = structuredClone(s);
          s.notes.push(t);
          s = apply([{ addNum: 'count.notes', by: 1 }], s, out);
          break;
        }
        case 'RequestHint': {
          const used = Number(s.flags[`hint.${cmd.objective}`] ?? 0);
          const depth = Math.min(4, used + 1) as 1 | 2 | 3 | 4;
          const hint = this.pack.hints.find((h) => h.objective === cmd.objective && h.depth === depth && check(h.if, s))
            ?? this.pack.hints.find((h) => h.objective === cmd.objective && h.depth === depth);
          // Asking for help never reduces XP or blocks awards (GUIDE-002).
          s = apply([{ setFlag: `hint.${cmd.objective}`, value: depth }], s, out);
          if (hint) events.push({ kind: 'hint', hint });
          break;
        }
        case 'PortfolioShare': {
          const i = p.portfolio.findIndex((e) => e.id === cmd.entry);
          if (i < 0) throw new Error('Unknown portfolio entry');
          const list = [...p.portfolio]; list[i] = { ...list[i], shared: cmd.shared };
          p = { ...p, portfolio: list };
          break;
        }
        case 'PortfolioReflect': {
          const i = p.portfolio.findIndex((e) => e.id === cmd.entry);
          if (i < 0) throw new Error('Unknown portfolio entry');
          const list = [...p.portfolio]; list[i] = { ...list[i], reflection: cmd.text.trim().slice(0, 800) };
          p = { ...p, portfolio: list };
          break;
        }
      }
    } catch (err) {
      return { state: s0, permanent: p0, events: [{ kind: 'error', message: (err as Error).message }] };
    }

    // Objectives, then awards. Repeat so that completion effects can chain.
    for (let guard = 0; guard < 10; guard++) {
      let changed = false;
      for (const m of this.activeMissions(s)) {
        for (const o of m.objectives) {
          if (s.objectivesDone.includes(o.id)) continue;
          if (!check(o.visible, s) || !check(o.done, s)) continue;
          s = structuredClone(s);
          s.objectivesDone.push(o.id);
          events.push({ kind: 'objective', id: o.id, title: o.title });
          s = apply(o.onComplete, s, out);
          if (o.weave) weaves.push(o.weave);
          if (o.kq) stones.push({ id: o.kq.id, way: `${m.world}|${o.kq.action}` });
          changed = true;
        }
      }
      if (!changed) break;
    }
    for (const cid of out.credits) {
      const r = grantCredit(p, this.pack, cid);
      p = r.record;
      if (r.gained) events.push({ kind: 'xp', amount: r.gained });
    }
    const aw = checkAwards(p, this.pack, s, now);
    p = aw.record;
    for (const a of aw.newly) events.push({ kind: 'award', award: a, xp: 0 });
    if (aw.xp) events.push({ kind: 'xp', amount: aw.xp });

    // Learning records (Part L). They ride on actions; they add no tasks.
    for (const w of weaves) p = recordWeave(p, w);
    const mo = checkMoments(p, this.pack, s, now);
    p = mo.record;
    for (const m of mo.newly) events.push({ kind: 'moment', moment: m });
    for (const id of out.signals) {
      const r = addSignal(p, this.pack, id, now);
      p = r.record;
      if (r.offer) events.push({ kind: 'reflection', misconception: r.offer });
    }
    // Question Stones (KQ-003): Lumen names the question; a new way makes the stone brighter.
    for (const st of stones) {
      const ways = p.stones?.[st.id] ?? [];
      const newWay = !ways.includes(st.way);
      if (newWay) p = { ...p, stones: { ...(p.stones ?? {}), [st.id]: [...ways, st.way] } };
      events.push({ kind: 'stone', question: st.id, ways: newWay ? ways.length + 1 : ways.length, newWay });
    }
    for (const tid of out.portfolio) {
      const t = this.pack.portfolio.find((x) => x.id === tid);
      if (t) portfolio.push({ kind: t.kind, title: t.title, text: t.text, weave: t.weave });
    }
    for (const e of portfolio) {
      p = addPortfolio(p, { ...e, at: now, world: worldOf(s) });
      events.push({ kind: 'portfolio', title: e.title });
    }

    pushOutputs(out, events);
    return { state: s, permanent: p, events, nextNode };
  }
}

function pushOutputs(out: EffectOutputs, events: GameEvent[]): void {
  out.cards.forEach((id) => events.push({ kind: 'card', id }));
  out.journal.forEach((id) => events.push({ kind: 'journal', id }));
  out.items.forEach((i) => events.push({ kind: 'item', id: i.id, qty: i.qty }));
  if (out.marks) events.push({ kind: 'marks', delta: out.marks });
  out.checkpoints.forEach((label) => events.push({ kind: 'checkpoint', label }));
}
