/**
 * Condition checks and effect application. Pure functions on plain data.
 * No `eval`, no content-supplied code (spec 22.2).
 */
import { corridorOpen } from './corridor';
import type { CampaignState, Condition, Effect, FlagValue } from './types';

/** During a campaign turn, completed can index this state’s objective IDs. */
export function check(c: Condition | undefined, s: CampaignState, completed?: ReadonlySet<string>): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => check(x, s, completed));
  if ('any' in c) return c.any.some((x) => check(x, s, completed));
  if ('not' in c) return !check(c.not, s, completed);
  if ('corridor' in c) return corridorOpen(s, c.corridor, completed);
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
  if ('objective' in c) return completed ? completed.has(c.objective) : s.objectivesDone.includes(c.objective);
  if ('origin' in c) return s.player.origin === c.origin;
  if ('trust' in c) {
    const v = s.relations[c.trust] ?? 0;
    if (c.gte !== undefined && v < c.gte) return false;
    if (c.lte !== undefined && v > c.lte) return false;
    return true;
  }
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
  // A field interaction can occur with thousands of diary entries already on the save.
  // Effects only write these five collections and scalar fields. Own each collection on its first write.
  const n: CampaignState = { ...s };
  const pending = emptyOutputs();
  for (const e of effects) {
    if ('setFlag' in e || 'addNum' in e) {
      if (n.flags === s.flags) n.flags = { ...s.flags };
      if ('setFlag' in e) n.flags[e.setFlag] = e.value;
      else n.flags[e.addNum] = Number(n.flags[e.addNum] ?? 0) + e.by;
    } else if ('giveItem' in e || 'takeItem' in e) {
      if ('giveItem' in e && e.ifMissing && (n.inventory[e.giveItem] ?? 0) > 0) continue;
      if (n.inventory === s.inventory) n.inventory = { ...s.inventory };
      const give = 'giveItem' in e, id = give ? e.giveItem : e.takeItem, qty = give ? e.qty ?? 1 : -(e.qty ?? 1);
      const amount = (n.inventory[id] ?? 0) + qty;
      if (!give && amount < 0) throw new Error(`Not enough ${id}`);
      if (!give && amount === 0) delete n.inventory[id];
      else n.inventory[id] = amount;
      pending.items.push({ id, qty });
    } else if ('addMarks' in e) {
      if (n.marks + e.addMarks < 0) throw new Error('Not enough marks');
      n.marks += e.addMarks;
      pending.marks += e.addMarks;
    } else if ('addCard' in e && !n.cards.includes(e.addCard)) {
      if (n.cards === s.cards) n.cards = [...s.cards];
      n.cards.push(e.addCard);
      pending.cards.push(e.addCard);
    } else if ('journal' in e && !n.journal.includes(e.journal)) {
      if (n.journal === s.journal) n.journal = [...s.journal];
      n.journal.push(e.journal);
      pending.journal.push(e.journal);
    } else if ('relation' in e) {
      if (n.relations === s.relations) n.relations = { ...s.relations };
      n.relations[e.relation] = (n.relations[e.relation] ?? 0) + e.by;
    } else if ('companion' in e) n.companion = e.companion;
    else if ('credit' in e) pending.credits.push(e.credit);
    else if ('checkpoint' in e) pending.checkpoints.push(e.checkpoint);
    else if ('signal' in e) pending.signals.push(e.signal);
    else if ('portfolio' in e) pending.portfolio.push(e.portfolio);
  }
  out.marks += pending.marks;
  out.cards.push(...pending.cards);
  out.items.push(...pending.items);
  out.journal.push(...pending.journal);
  out.credits.push(...pending.credits);
  out.checkpoints.push(...pending.checkpoints);
  out.signals.push(...pending.signals);
  out.portfolio.push(...pending.portfolio);
  return n;
}

/** Deterministic RNG (mulberry32). State is saved in the campaign (spec 24.2). */
export function nextRandom(s: CampaignState): [number, CampaignState] {
  let t = (s.rng.state + 0x6d2b79f5) >>> 0;
  const n = { ...s, rng: { ...s.rng, state: t } };
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, n];
}
