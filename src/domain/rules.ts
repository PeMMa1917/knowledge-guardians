/**
 * Condition checks and effect application. Pure functions on plain data.
 * No `eval`, no content-supplied code (spec 22.2).
 */
import type { CampaignState, Condition, Effect, FlagValue } from './types';

export function check(c: Condition | undefined, s: CampaignState): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => check(x, s));
  if ('any' in c) return c.any.some((x) => check(x, s));
  if ('not' in c) return !check(c.not, s);
  if ('eq' in c) return s.flags[c.flag] === c.eq;
  if ('in' in c) return c.in.includes(s.flags[c.flag] as FlagValue);
  if ('flagSet' in c) return c.flagSet in s.flags;
  if ('num' in c) {
    const v = Number(s.flags[c.num] ?? 0);
    if (c.gte !== undefined && v < c.gte) return false;
    if (c.lte !== undefined && v > c.lte) return false;
    return true;
  }
  if ('item' in c) return (s.inventory[c.item] ?? 0) >= (c.min ?? 1);
  if ('marks' in c) return s.marks >= c.marks;
  if ('card' in c) return s.cards.includes(c.card);
  if ('objective' in c) return s.objectivesDone.includes(c.objective);
  if ('origin' in c) return s.player.origin === c.origin;
  return false;
}

/** Side outputs of effects that the shell must handle. */
export interface EffectOutputs {
  credits: string[];
  checkpoints: string[];
  journal: string[];
  cards: string[];
  items: { id: string; qty: number }[];
  marks: number;
  signals: string[];
  portfolio: string[];
}

export function emptyOutputs(): EffectOutputs {
  return { credits: [], checkpoints: [], journal: [], cards: [], items: [], marks: 0, signals: [], portfolio: [] };
}

/**
 * Apply effects to a COPY of state. Returns the new state.
 * Throws on an invalid transaction (for example spending marks you do not have),
 * so a command either applies completely or not at all.
 */
export function apply(effects: Effect[] | undefined, s: CampaignState, out: EffectOutputs): CampaignState {
  if (!effects || effects.length === 0) return s;
  const n: CampaignState = structuredClone(s);
  for (const e of effects) {
    if ('setFlag' in e) n.flags[e.setFlag] = e.value;
    else if ('addNum' in e) n.flags[e.addNum] = Number(n.flags[e.addNum] ?? 0) + e.by;
    else if ('giveItem' in e) {
      const q = e.qty ?? 1;
      n.inventory[e.giveItem] = (n.inventory[e.giveItem] ?? 0) + q;
      out.items.push({ id: e.giveItem, qty: q });
    } else if ('takeItem' in e) {
      const q = e.qty ?? 1;
      const have = n.inventory[e.takeItem] ?? 0;
      if (have < q) throw new Error(`Not enough ${e.takeItem}`);
      n.inventory[e.takeItem] = have - q;
      if (n.inventory[e.takeItem] === 0) delete n.inventory[e.takeItem];
      out.items.push({ id: e.takeItem, qty: -q });
    } else if ('addMarks' in e) {
      if (n.marks + e.addMarks < 0) throw new Error('Not enough marks');
      n.marks += e.addMarks;
      out.marks += e.addMarks;
    } else if ('addCard' in e) {
      if (!n.cards.includes(e.addCard)) { n.cards.push(e.addCard); out.cards.push(e.addCard); }
    } else if ('journal' in e) {
      if (!n.journal.includes(e.journal)) { n.journal.push(e.journal); out.journal.push(e.journal); }
    } else if ('relation' in e) n.relations[e.relation] = (n.relations[e.relation] ?? 0) + e.by;
    else if ('companion' in e) n.companion = e.companion;
    else if ('credit' in e) out.credits.push(e.credit);
    else if ('checkpoint' in e) out.checkpoints.push(e.checkpoint);
    else if ('signal' in e) out.signals.push(e.signal);
    else if ('portfolio' in e) out.portfolio.push(e.portfolio);
  }
  return n;
}

/** Deterministic RNG (mulberry32). State is saved in the campaign (spec 24.2). */
export function nextRandom(s: CampaignState): [number, CampaignState] {
  let t = (s.rng.state + 0x6d2b79f5) >>> 0;
  const n = structuredClone(s);
  n.rng.state = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, n];
}
