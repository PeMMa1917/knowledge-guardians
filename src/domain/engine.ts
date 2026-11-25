/**
 * Domain engine. Scenes send typed commands; the engine checks preconditions,
 * computes ONE valid state transition and returns events for the view to show
 * (spec 22.2). A button never writes XP or state directly.
 */
import type {
  AwardRecord, CampaignState, ContentPack, DialogueNode, DialogueOption, Hint, Mission, Objective, PermanentRecord,
} from './types';
import { CAMPAIGN_SCHEMA } from './types';
import { apply, check, emptyOutputs, type EffectOutputs } from './rules';
import { checkAwards, grantCredit } from './permanent';

export type Command =
  | { type: 'Reach'; zone: string }
  | { type: 'EnterNode'; node: string }
  | { type: 'ChooseDialogueOption'; node: string; index: number }
  | { type: 'InspectExhibit'; exhibit: string }
  | { type: 'UseLens'; exhibit: string }
  | { type: 'AttachEvidence'; claim: string; card: string }
  | { type: 'DetachEvidence'; claim: string; card: string }
  | { type: 'RunSimulation'; pen: string; surface: string }
  | { type: 'SubmitSort'; placements: Record<string, string> }
  | { type: 'Purchase'; offer: string }
  | { type: 'RequestHint'; objective: string }
  | { type: 'SetFlag'; flag: string; value: string | number | boolean }
  | { type: 'AddNote'; text: string };

export type GameEvent =
  | { kind: 'card'; id: string }
  | { kind: 'journal'; id: string }
  | { kind: 'item'; id: string; qty: number }
  | { kind: 'marks'; delta: number }
  | { kind: 'objective'; id: string; title: string }
  | { kind: 'award'; award: AwardRecord; xp: number }
  | { kind: 'xp'; amount: number }
  | { kind: 'checkpoint'; label: string }
  | { kind: 'hint'; hint: Hint }
  | { kind: 'simulation'; result: SimulationResult }
  | { kind: 'sort'; result: SortResult }
  | { kind: 'error'; message: string };

export interface SimulationResult {
  pen: string; surface: string; markQuality: number; note: string; fairTest: boolean; testCount: number;
}
export interface SortResult { correct: string[]; mismatched: string[]; complete: boolean }

export interface Outcome {
  state: CampaignState;
  permanent: PermanentRecord;
  events: GameEvent[];
  nextNode?: string | null;
}

export function newCampaign(pack: ContentPack, name: string, look: string, seed: number): CampaignState {
  return {
    schema: CAMPAIGN_SCHEMA,
    contentVersion: pack.contentVersion,
    player: { name, look },
    mapId: 'nexus.archive',
    pos: { x: -1, y: -1 },
    facing: 'up',
    flags: {},
    inventory: {},
    marks: 0,
    relations: {},
    journal: [],
    notes: [],
    cards: [],
    board: {},
    objectivesDone: [],
    companion: null,
    rng: { seed, state: seed >>> 0 },
    playSeconds: 0,
  };
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
    let s = s0;
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
        case 'AttachEvidence': {
          if (!s.cards.includes(cmd.card)) throw new Error('You have not found that evidence yet');
          if (!this.pack.claims.some((c) => c.id === cmd.claim)) throw new Error('Unknown claim');
          const list = s.board[cmd.claim] ?? [];
          if (list.includes(cmd.card)) break;
          if (list.length >= 4) throw new Error('A claim can hold at most four cards');
          s = structuredClone(s);
          s.board[cmd.claim] = [...list, cmd.card];
          break;
        }
        case 'DetachEvidence': {
          s = structuredClone(s);
          s.board[cmd.claim] = (s.board[cmd.claim] ?? []).filter((c) => c !== cmd.card);
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
          s = apply([
            { setFlag: 'sim.lastPen', value: cmd.pen }, { setFlag: 'sim.lastSurface', value: cmd.surface },
            { setFlag: 'sim.tests', value: count },
            ...(fair ? [{ addNum: 'sim.fair', by: 1 } as const] : []),
            { setFlag: `sim.ran.${cmd.pen}.${cmd.surface}`, value: true },
          ], s, out);
          events.push({ kind: 'simulation', result: { pen: cmd.pen, surface: cmd.surface, markQuality: m.q, note: m.note, fairTest: fair, testCount: count } });
          break;
        }
        case 'SubmitSort': {
          // Process-sorting minigame (OBJ-002/003). Classification of schematic
          // process steps is factual, so it has a key; feedback names mismatches
          // and lets the player revise without penalty (spec 2.1 OPEN-003).
          const key = SORT_KEY;
          const correct: string[] = []; const mismatched: string[] = [];
          for (const [step, route] of Object.entries(key)) {
            if (cmd.placements[step] === route) correct.push(step); else mismatched.push(step);
          }
          const complete = mismatched.length === 0;
          s = apply([{ addNum: 'sort.attempts', by: 1 }, ...(complete ? [{ setFlag: 'sort.done', value: true } as const] : [])], s, out);
          events.push({ kind: 'sort', result: { correct, mismatched, complete } });
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
        case 'AddNote': {
          const t = cmd.text.trim().slice(0, 500);
          if (!t) throw new Error('The note is empty');
          if (s.notes.length >= 200) throw new Error('The journal is full');
          s = structuredClone(s);
          s.notes.push(t);
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
      }
    } catch (err) {
      return { state: s0, permanent: p0, events: [{ kind: 'error', message: (err as Error).message }] };
    }

    // Objectives, then awards. Repeat so that completion effects can chain.
    let p = p0;
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

/** Answer key for the schematic process sort (pattern welding vs crucible steel). */
export const SORT_KEY: Record<string, 'pattern' | 'crucible' | 'both'> = {
  'stack-pieces': 'pattern',
  'forge-weld': 'pattern',
  'twist-rods': 'pattern',
  'seal-crucible': 'crucible',
  'melt-in-crucible': 'crucible',
  'cool-to-ingot': 'crucible',
  'shape-blade': 'both',
  'etch-surface': 'both',
};
