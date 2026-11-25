/**
 * Plays the whole chapter through the domain engine with no rendering.
 * Covers every label choice (M01) and every blade choice (M02), so each
 * consequential branch has at least one tested route (spec 27.2).
 */
import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Engine, newCampaign, type GameEvent } from '../src/domain/engine';
import { newPermanent, totalXP } from '../src/domain/permanent';
import type { CampaignState, PermanentRecord } from '../src/domain/types';

const pack = buildPack();

class Driver {
  e = new Engine(pack);
  s: CampaignState = newCampaign(pack, 'Tester', 'player-a', 7);
  p: PermanentRecord = newPermanent();
  events: GameEvent[] = [];
  run(cmd: Parameters<Engine['dispatch']>[0]) {
    const o = this.e.dispatch(cmd, this.s, this.p);
    const err = o.events.find((x) => x.kind === 'error');
    if (err) throw new Error((err as any).message);
    this.s = o.state; this.p = o.permanent; this.events.push(...o.events);
    return o;
  }
  /** Talk to a character, choosing options whose text includes each pick in turn. */
  talk(who: string, ...picks: string[]) {
    let node: string | null = this.e.talkEntry(who, this.s);
    if (!node) throw new Error(`no entry for ${who}`);
    while (node) {
      this.run({ type: 'EnterNode', node });
      const opts = this.e.visibleOptions(node, this.s);
      if (opts.length === 0) { node = this.e.node(node).next ?? null; continue; }
      const pick = picks.shift();
      const choice = pick ? opts.find((o) => o.option.text.includes(pick)) : opts[0];
      if (!choice) throw new Error(`option "${pick}" not found at ${node}: ${opts.map((o) => o.option.text).join(' | ')}`);
      node = this.run({ type: 'ChooseDialogueOption', node, index: choice.index }).nextNode ?? null;
    }
  }
  done(id: string) { return this.s.objectivesDone.includes(id); }
}

function playM01(d: Driver, label: 'Label A' | 'Label B' | 'Label C' | 'Label D') {
  d.talk('warden-ise', 'How can all three');
  expect(d.done('m01.o1.report')).toBe(true);
  for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
  d.run({ type: 'UseLens', exhibit: 'OBJ-001-A' });
  d.run({ type: 'UseLens', exhibit: 'OBJ-001-C' });
  d.talk('curator-dace', 'Why do you favour');
  d.talk('clerk-venn', 'Does a patent prove');
  if (label === 'Label D') d.talk('kip-arden', 'Go on');
  d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
  d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
  d.run({ type: 'AttachEvidence', claim: 'claim.loud-first', card: 'card.loud-patent' });
  d.run({ type: 'AttachEvidence', claim: 'claim.biro-practical', card: 'card.biro-object' });
  d.run({ type: 'AttachEvidence', claim: 'claim.one-inventor', card: 'card.dpma-history' });
  d.talk('curator-dace', label);
  d.talk('warden-ise');
  d.run({ type: 'Reach', zone: 'portal' });
  for (const o of pack.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
  expect(d.s.inventory['tool.annotation-pen']).toBe(1);
  expect(d.events.some((e) => e.kind === 'checkpoint' && e.label === 'Recruitment complete')).toBe(true);
}

function playM02(d: Driver, choice: string) {
  d.run({ type: 'Reach', zone: 'emberford' });
  d.talk('merchant-corvan', 'How do you know');
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-003-AE' });
  d.talk('smith-hesper', 'sorting');
  d.talk('scholar-sefa', 'What is wootz');
  if (d.s.inventory['item.registry-letter']) d.talk('guildmaster-orrin', 'registry letter');
  else d.talk('guildmaster-orrin', 'Pay 3 marks');
  expect(d.done('m02.o3.evidence')).toBe(true);
  // First sort attempt has a mistake: the game names it and lets the player revise.
  const wrong = d.run({ type: 'SubmitSort', placements: { 'stack-pieces': 'pattern', 'forge-weld': 'pattern', 'twist-rods': 'pattern', 'seal-crucible': 'crucible', 'melt-in-crucible': 'crucible', 'cool-to-ingot': 'crucible', 'shape-blade': 'both', 'etch-surface': 'pattern' } });
  const r = wrong.events.find((e) => e.kind === 'sort') as any;
  expect(r.result.mismatched).toEqual(['etch-surface']);
  d.run({ type: 'SubmitSort', placements: { 'stack-pieces': 'pattern', 'forge-weld': 'pattern', 'twist-rods': 'pattern', 'seal-crucible': 'crucible', 'melt-in-crucible': 'crucible', 'cool-to-ingot': 'crucible', 'shape-blade': 'both', 'etch-surface': 'both' } });
  expect(d.done('m02.o4.sort')).toBe(true);
  d.talk('merchant-corvan', choice);
  expect(d.s.flags['blade.choice']).toBeTruthy();
  d.talk('kip-arden', 'Here is what I found');
  for (const o of pack.missions[1].objectives) expect(d.done(o.id), o.id).toBe(true);
}

describe('full chapter routes', () => {
  const labels = ['Label A', 'Label B', 'Label C', 'Label D'] as const;
  const blades = ['Pay 12 marks', 'Pay the full 24', 'Post a correction', "Don't buy it"];
  for (const label of labels) {
    for (const blade of blades) {
      it(`${label} then "${blade}" completes the chapter`, () => {
        const d = new Driver();
        playM01(d, label);
        playM02(d, blade);
        expect(d.p.awards['award.dates-have-kinds']).toBeTruthy();
        expect(d.p.awards['skill.fair-test-1']).toBeTruthy();
        expect(d.p.awards['award.two-sides-label']).toBeTruthy();
        expect(d.p.awards['badge.honest-label']).toBeTruthy();
      });
    }
  }

  it('different label choices give different consequences', () => {
    const items = labels.map((l) => { const d = new Driver(); playM01(d, l); return Object.keys(d.s.inventory).sort().join(','); });
    expect(new Set(items).size).toBe(4);
  });

  it('every choice earns comparable permanent XP (no hidden correct option, OPEN-001)', () => {
    const xp = labels.map((l) => { const d = new Driver(); playM01(d, l); playM02(d, 'Post a correction'); return totalXP(d.p); });
    expect(new Set(xp).size).toBe(1);
  });
});

describe('permanent credit and hints', () => {
  it('replaying an objective cannot exceed criterion maxima', () => {
    const d = new Driver();
    playM01(d, 'Label C');
    const before = totalXP(d.p);
    for (let i = 0; i < 5; i++) {
      d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'leather' });
      d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'paper' });
    }
    expect(totalXP(d.p)).toBe(before);
  });
  it('asking for hints never reduces XP or blocks awards (GUIDE-002)', () => {
    const a = new Driver(); const b = new Driver();
    for (let i = 0; i < 4; i++) for (const o of pack.missions[0].objectives) b.run({ type: 'RequestHint', objective: o.id });
    playM01(a, 'Label A'); playM01(b, 'Label A');
    expect(totalXP(b.p)).toBe(totalXP(a.p));
  });
  it('hints deepen from 1 to 4 and then stay at 4', () => {
    const d = new Driver();
    const depths = [1, 2, 3, 4, 5].map(() => (d.run({ type: 'RequestHint', objective: 'm01.o4.lens' }).events.find((e) => e.kind === 'hint') as any).hint.depth);
    expect(depths).toEqual([1, 2, 3, 4, 4]);
  });
  it('a restored campaign can re-acquire items even after permanent credit was given', () => {
    const d = new Driver();
    const start = structuredClone(d.s);
    playM01(d, 'Label A');
    d.s = start; // restore an early checkpoint; permanent record stays
    d.talk('warden-ise', 'How can all three');
    expect(d.s.inventory['tool.date-lens']).toBe(1);
    expect(d.p.awards['award.dates-have-kinds']).toBeTruthy();
  });
  it('an invalid transaction changes nothing', () => {
    const d = new Driver();
    const before = structuredClone(d.s);
    const o = d.e.dispatch({ type: 'EnterNode', node: 'corvan.full' }, d.s, d.p); // costs 24 marks; player has 0
    expect(o.events[0].kind).toBe('error');
    expect(o.state).toEqual(before);
  });
  it('unfair simulation tests do not count as fair', () => {
    const d = new Driver();
    d.talk('warden-ise', 'How can all three');
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'leather' }); // changed two things
    expect(d.s.flags['sim.fair']).toBeUndefined();
    expect(d.done('m01.o5.test')).toBe(false);
  });
});

describe('dialogue graph', () => {
  it('every node is reachable from some character entry or another node', () => {
    const reach = new Set<string>();
    const stack = pack.characters.flatMap((c) => c.talk.map((t) => t.node));
    while (stack.length) {
      const id = stack.pop()!;
      if (reach.has(id)) continue;
      reach.add(id);
      const n = pack.dialogue.find((x) => x.id === id)!;
      if (n.next) stack.push(n.next);
      for (const o of n.options ?? []) if (o.next) stack.push(o.next);
    }
    const unreachable = pack.dialogue.map((n) => n.id).filter((id) => !reach.has(id));
    expect(unreachable).toEqual([]);
  });
});
