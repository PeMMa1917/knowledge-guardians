/**
 * Plays the whole chapter through the domain engine with no rendering.
 * Covers several label routes (M01), Showdown outcomes, both forge routes
 * and every market Showdown outcome (M02), so each consequential branch has
 * at least one tested route (spec 27.2).
 */
import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Engine, newCampaign, type GameEvent } from '../src/domain/engine';
import { newPermanent, totalXP } from '../src/domain/permanent';
import type { ShowdownMove } from '../src/domain/showdown';
import type { CampaignState, PermanentRecord } from '../src/domain/types';

const pack = buildPack();

export class Driver {
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
    const node: string | null = this.e.talkEntry(who, this.s);
    if (!node) throw new Error(`no entry for ${who}`);
    this.walk(node, picks);
  }
  walk(start: string, picks: string[] = []) {
    let node: string | null = start;
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
  moves(...mv: ShowdownMove[]) { for (const m of mv) { if (this.s.showdown?.outcome) break; this.run({ type: 'ShowdownMove', move: m }); } }
  done(id: string) { return this.s.objectivesDone.includes(id); }
}

type LabelRoute = 'patent' | 'practical' | 'model' | 'three';
const LABELS: Record<LabelRoute, { subject: string; criterion: string; limit: string }> = {
  patent: { subject: 'loud', criterion: 'patent', limit: 'none' },
  practical: { subject: 'biros', criterion: 'practical', limit: 'none' },
  model: { subject: 'model', criterion: 'working-model', limit: 'modern' },
  three: { subject: 'all', criterion: 'three-firsts', limit: 'dates' },
};

function practiceWonOver(d: Driver) {
  d.run({ type: 'ShowdownStart', showdown: 'practice' });
  d.moves(
    { move: 'claim', claim: 'practical' },
    { move: 'support', card: 'card.dpma-history' }, // Venn presses
    { move: 'support', card: 'card.biro-object' }, // Venn makes a fair point
    { move: 'concede' },
    { move: 'reframe' },
    { move: 'rest' },
  );
}

function playM01(d: Driver, label: LabelRoute, showdown: (d: Driver) => void = practiceWonOver) {
  d.walk('cold.open');
  d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
  d.talk('warden-ise', 'How can all three');
  expect(d.done('m01.o1.look')).toBe(true);
  for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
  d.run({ type: 'UseLens', exhibit: 'OBJ-001-A' });
  d.run({ type: 'UseLens', exhibit: 'OBJ-001-C' });
  d.talk('curator-dace', 'Why do you favour');
  d.talk('clerk-venn', 'Does a patent prove');
  d.talk('kip-arden', 'Go on');
  d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
  d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
  showdown(d);
  expect(d.done('m01.o5.practice')).toBe(true);
  d.run({ type: 'BuildLabel', kit: 'pen', ...LABELS[label] });
  expect(d.s.flags['label.pen.holds']).toBe(true);
  d.talk('warden-ise');
  d.run({ type: 'Reach', zone: 'portal' });
  for (const o of pack.missions[0].objectives.filter((x) => x.essential)) expect(d.done(o.id), o.id).toBe(true);
  expect(d.s.inventory['tool.provenance-thread']).toBe(1);
  expect(d.events.some((e) => e.kind === 'checkpoint' && e.label === 'Recruitment complete')).toBe(true);
}

type Outcome = 'exposed' | 'narrowed' | 'won-over' | 'split' | 'lost-ground';
const CORVAN: Record<Outcome, ShowdownMove[]> = {
  exposed: [
    { move: 'claim', claim: 'honest' },
    { move: 'support', card: 'card.workshop-diagram' },
    { move: 'source' },
    { move: 'support', card: 'card.guild-ledger' },
    { move: 'challenge', link: 'pattern', card: 'card.forge-pattern' },
    { move: 'challenge', link: 'ancient', card: 'card.guild-ledger' },
    { move: 'challenge', link: 'damascus', card: 'card.damascus-terms' },
  ],
  narrowed: [
    { move: 'claim', claim: 'honest' },
    { move: 'support', card: 'card.workshop-diagram' },
    { move: 'counter', card: 'card.forge-pattern' },
    { move: 'support', card: 'card.guild-ledger' },
    { move: 'rest' },
  ],
  'won-over': [
    { move: 'claim', claim: 'honest' },
    { move: 'support', card: 'card.workshop-diagram' },
    { move: 'support', card: 'card.guild-ledger' },
    { move: 'challenge', link: 'ancient', card: 'card.guild-ledger' },
    { move: 'concede' },
    { move: 'rest' },
  ],
  split: [
    { move: 'claim', claim: 'limit' },
    { move: 'support', card: 'card.met-techniques' },
    { move: 'support', card: 'card.damascus-terms' },
    { move: 'support', card: 'card.met-ingots' },
    { move: 'rest' },
  ],
  'lost-ground': [
    { move: 'claim', claim: 'fake' },
    { move: 'attack' },
    { move: 'shout' },
    { move: 'rest' },
  ],
};

function playM02(d: Driver, outcome: Outcome, route: 'pattern' | 'crucible' = 'pattern') {
  d.run({ type: 'Reach', zone: 'emberford' });
  expect(d.done('m02.o1.arrive')).toBe(true);
  d.talk('merchant-corvan', 'How do you know');
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-003-AE' });
  for (const n of ['stall', 'ledger', 'workshop']) d.run({ type: 'FollowThread', thread: 'blade', node: n });
  expect(d.done('m02.o3.thread')).toBe(true);
  d.talk('smith-hesper', 'Can I try it');
  d.talk('scholar-sefa', 'What is wootz');
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-002' });
  d.talk('guildmaster-orrin', 'Is the blade ancient', 'What does the ledger');
  const steps = route === 'pattern' ? ['stack', 'stack', 'weld', 'fold', 'twist', 'cut'] : ['crucible', 'melt', 'cool', 'cut'];
  for (const a of steps) d.run({ type: 'Forge', action: a as any });
  d.run({ type: 'InspectExhibit', exhibit: 'AE-ASSAY' });
  d.run({ type: 'CompareAssay' });
  if (route === 'crucible') {
    // Make a pattern billet too, so the forge card for the Showdown exists.
    for (const a of ['reset', 'stack', 'stack', 'weld', 'fold', 'cut']) d.run({ type: 'Forge', action: a as any });
    d.run({ type: 'CompareAssay' });
  }
  expect(d.done('m02.o4.forge')).toBe(true);
  d.talk('merchant-corvan', 'In the square');
  d.run({ type: 'ShowdownStart', showdown: 'corvan' });
  d.moves(...CORVAN[outcome]);
  expect(d.s.showdown?.outcome).toBe(outcome);
  expect(d.done('m02.o5.showdown')).toBe(true);
  d.talk('smith-hesper', 'Yes. Come');
  d.talk('kip-arden');
  expect(d.s.inventory['item.gold-seal']).toBe(1);
  d.talk('warden-ise');
  for (const o of pack.missions[1].objectives) expect(d.done(o.id), o.id).toBe(true);
}

describe('full chapter routes', () => {
  const routes: [LabelRoute, Outcome][] = [
    ['patent', 'exposed'], ['practical', 'narrowed'], ['model', 'won-over'], ['three', 'split'], ['patent', 'lost-ground'],
  ];
  for (const [label, outcome] of routes) {
    it(`label "${label}" then market outcome "${outcome}" completes the chapter`, () => {
      const d = new Driver();
      playM01(d, label);
      playM02(d, outcome);
      for (const a of ['award.dates-have-kinds', 'skill.fair-test-1', 'award.two-sides', 'skill.force-support-1', 'skill.thread-1', 'award.forged-not-sorted', 'badge.honest-sign']) {
        expect(d.p.awards[a], a).toBeTruthy();
      }
    });
  }

  it('every market outcome earns the same permanent XP (no hidden correct outcome, OPEN-001)', () => {
    const xp = (Object.keys(CORVAN) as Outcome[]).map((o) => { const d = new Driver(); playM01(d, 'patent'); playM02(d, o); return totalXP(d.p); });
    expect(new Set(xp).size).toBe(1);
  });

  it('every holding label earns the same permanent XP', () => {
    const xp = (Object.keys(LABELS) as LabelRoute[]).map((l) => { const d = new Driver(); playM01(d, l); return totalXP(d.p); });
    expect(new Set(xp).size).toBe(1);
  });

  it('the crucible route also completes the forge step', () => {
    const d = new Driver();
    playM01(d, 'three');
    playM02(d, 'narrowed', 'crucible');
    expect(d.s.cards).toContain('card.forge-crucible');
  });

  it('different outcomes leave different signs in the world', () => {
    const signs = (Object.keys(CORVAN) as Outcome[]).map((o) => { const d = new Driver(); playM01(d, 'patent'); playM02(d, o); return d.s.flags['sign.state']; });
    expect(new Set(signs).size).toBe(4); // narrowed and won-over both give an honest sign
  });
});

describe('label builder and the Fray (29.1 item 2)', () => {
  it('"The first ballpoint pen" never holds and raises MIS-29', () => {
    const d = new Driver();
    for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
    const o = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'none', limit: 'dates' });
    const r = (o.events.find((e) => e.kind === 'label') as any).result;
    expect(r.holds).toBe(false);
    expect(r.signals).toContain('MIS-29');
    expect(d.p.signals['MIS-29']?.length).toBe(1);
  });
  it('crediting Bíró alone does not hold and the visitors drop the team', () => {
    const d = new Driver();
    d.talk('clerk-venn', 'What about');
    const o = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'biro-alone', criterion: 'practical', limit: 'dates' });
    const r = (o.events.find((e) => e.kind === 'label') as any).result;
    expect(r.holds).toBe(false);
    expect(r.heard).toMatch(/dropped out/);
  });
  it('support counts only cards the player holds', () => {
    const d = new Driver();
    const o = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'none' });
    expect((o.events.find((e) => e.kind === 'label') as any).result.holds).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    const o2 = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'none' });
    expect((o2.events.find((e) => e.kind === 'label') as any).result.holds).toBe(true);
  });
  it('onHold effects and the holding count apply once only', () => {
    const d = new Driver();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-101' });
    for (let i = 0; i < 3; i++) d.run({ type: 'BuildLabel', kit: 'first.eratosthenes', subject: 'person', criterion: 'specific', limit: 'none' });
    expect(d.s.flags['count.firsts']).toBe(1);
    expect(d.s.flags['count.labels.holding']).toBe(1);
  });
  it('the Hall of Firsts covers every inhabited continent', () => {
    const regions = new Set(pack.cards.filter((c) => c.person).map((c) => c.person!.region));
    for (const r of ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania']) {
      expect([...regions].some((x) => x.includes(r.split(' ')[0]) || (r === 'Asia' && /Asia/.test(x))), r).toBe(true);
    }
  });
  it('three repaired plaques earn the Hall of Firsts badge and a portfolio entry', () => {
    const d = new Driver();
    d.walk('cold.open'); d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true }); d.talk('warden-ise');
    for (const [ex, kit] of [['OBJ-101', 'eratosthenes'], ['OBJ-103', 'bisheng'], ['OBJ-105', 'santos']]) {
      d.run({ type: 'InspectExhibit', exhibit: ex });
      d.run({ type: 'BuildLabel', kit: `first.${kit}`, subject: 'person', criterion: 'specific', limit: 'none' });
    }
    expect(d.done('m01.side.firsts')).toBe(true);
    expect(d.p.awards['badge.hall-of-firsts']).toBeTruthy();
    expect(d.p.portfolio.some((e) => e.title.startsWith('Hall of Firsts'))).toBe(true);
  });
});

describe('Showdown rules (12.24)', () => {
  it('a value Showdown can never end in "exposed" (SHOW-001)', () => {
    const d = new Driver();
    for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
    d.talk('clerk-venn', 'Does a patent');
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'kinds' },
      { move: 'challenge', link: 'works', card: 'card.loud-patent' },
      { move: 'challenge', link: 'model', card: 'card.loud-model' },
      { move: 'challenge', link: 'invent', card: 'card.dpma-history' },
      { move: 'rest' });
    expect(d.s.showdown!.outcome).not.toBe('exposed');
  });
  it('every move explains itself in one line (SHOW-004)', () => {
    const d = new Driver();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'bold' }, { move: 'shout' }, { move: 'attack' });
    for (const l of d.s.showdown!.log.filter((x) => x.who === 'player')) expect(l.why).toBeTruthy();
  });
  it('the same moves give the same result (no hidden dice, SHOW-002)', () => {
    const run = () => { const d = new Driver(); playM01(d, 'patent'); return JSON.stringify(d.s.showdown); };
    expect(run()).toBe(run());
  });
  it('a lost Showdown can be played again', () => {
    const d = new Driver();
    d.talk('clerk-venn', 'What about');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-C' });
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'bold' }, { move: 'rest' });
    expect(d.s.showdown!.outcome).toBeTruthy();
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    expect(d.s.showdown!.outcome).toBeNull();
  });
});

describe('Provenance Thread and forge', () => {
  it('the thread must be followed in order and needs the tool', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'FollowThread', thread: 'blade', node: 'stall' })).toThrow(/do not have/);
    d.s.inventory['tool.provenance-thread'] = 1;
    expect(() => d.run({ type: 'FollowThread', thread: 'blade', node: 'workshop' })).toThrow(/does not lead here/);
    d.run({ type: 'FollowThread', thread: 'blade', node: 'stall' });
    d.run({ type: 'FollowThread', thread: 'blade', node: 'ledger' });
    const o = d.run({ type: 'FollowThread', thread: 'blade', node: 'workshop' });
    expect((o.events.find((e) => e.kind === 'thread') as any).gap).toMatch(/Nobody recorded/);
  });
  it('the forge refuses impossible steps with a plain reason', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'Forge', action: 'weld' })).toThrow(/Stack at least two/);
    expect(() => d.run({ type: 'CompareAssay' })).toThrow(/Cut a billet first/);
  });
});

describe('learning records (Part L)', () => {
  it('records learner-profile moments once, as moments and not grades', () => {
    const d = new Driver();
    playM01(d, 'patent');
    const ids = Object.keys(d.p.moments);
    expect(ids).toEqual(expect.arrayContaining(['PM-01', 'PM-02', 'PM-03', 'PM-04', 'PM-05']));
    const count = ids.length;
    d.run({ type: 'BuildLabel', kit: 'pen', ...LABELS.patent });
    expect(Object.keys(d.p.moments).length).toBe(count);
  });
  it('records ATL and concept weaves for the class dashboard', () => {
    const d = new Driver();
    playM01(d, 'patent');
    expect(d.p.met.atl.communication).toBeGreaterThan(0);
    expect(d.p.met.concepts.evidence).toBeGreaterThan(0);
    expect(d.p.met.subjects.history).toBeGreaterThan(0);
  });
  it('offers a reflection when a misconception reaches the student threshold', () => {
    const d = new Driver();
    for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
    let offers = 0;
    for (let i = 0; i < 4; i++) {
      const o = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'none', limit: 'none' });
      offers += o.events.filter((e) => e.kind === 'reflection').length;
    }
    expect(offers).toBe(1);
  });
  it('adds portfolio entries that stay private until the student shares them', () => {
    const d = new Driver();
    playM01(d, 'patent');
    expect(d.p.portfolio.length).toBeGreaterThan(0);
    expect(d.p.portfolio.every((e) => !e.shared)).toBe(true);
    const id = d.p.portfolio[0].id;
    d.run({ type: 'PortfolioShare', entry: id, shared: true });
    d.run({ type: 'PortfolioReflect', entry: id, text: 'I learned to narrow a claim.' });
    expect(d.p.portfolio[0].shared).toBe(true);
    expect(d.p.portfolio[0].reflection).toMatch(/narrow/);
  });
});

describe('event deck (spec 93)', () => {
  it('an event comes after 10 to 15 minutes of exploration, never repeats, and is seeded', () => {
    const go = () => {
      const d = new Driver();
      d.walk('cold.open'); d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true }); d.talk('warden-ise');
      const seen: string[] = [];
      for (let t = 0; t < 120; t++) {
        const o = d.run({ type: 'Explore', seconds: 60 });
        const due = o.events.find((e) => e.kind === 'event-due') as any;
        if (due) { seen.push(due.event); d.run({ type: 'ResolveEvent', event: due.event }); }
      }
      return seen;
    };
    const a = go();
    expect(a.length).toBeGreaterThan(2);
    expect(new Set(a).size).toBe(a.length);
    expect(go()).toEqual(a);
  });
  it('the first event waits at least 10 minutes', () => {
    const d = new Driver();
    for (let t = 0; t < 9; t++) expect(d.run({ type: 'Explore', seconds: 60 }).events.some((e) => e.kind === 'event-due')).toBe(false);
  });
  it('delaying an event loses nothing (RAND-001)', () => {
    const d = new Driver();
    for (let t = 0; t < 20 && !d.s.events.pending; t++) d.run({ type: 'Explore', seconds: 60 });
    const xp = totalXP(d.p);
    d.run({ type: 'DelayEvent' });
    expect(d.s.events.pending).toBeNull();
    expect(totalXP(d.p)).toBe(xp);
  });
});

describe('permanent credit and hints', () => {
  it('replaying an objective cannot exceed criterion maxima', () => {
    const d = new Driver();
    playM01(d, 'three');
    const before = totalXP(d.p);
    for (let i = 0; i < 5; i++) {
      d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'leather' });
      d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'paper' });
      d.run({ type: 'BuildLabel', kit: 'pen', ...LABELS.practical });
    }
    expect(totalXP(d.p)).toBe(before);
  });
  it('asking for hints never reduces XP or blocks awards (GUIDE-002)', () => {
    const a = new Driver(); const b = new Driver();
    for (let i = 0; i < 4; i++) for (const o of pack.missions[0].objectives) b.run({ type: 'RequestHint', objective: o.id });
    playM01(a, 'patent'); playM01(b, 'patent');
    expect(totalXP(b.p)).toBe(totalXP(a.p));
  });
  it('hints deepen from 1 to 4 and then stay at 4', () => {
    const d = new Driver();
    const depths = [1, 2, 3, 4, 5].map(() => (d.run({ type: 'RequestHint', objective: 'm01.o3.lens' }).events.find((e) => e.kind === 'hint') as any).hint.depth);
    expect(depths).toEqual([1, 2, 3, 4, 4]);
  });
  it('a restored campaign can re-acquire items even after permanent credit was given', () => {
    const d = new Driver();
    const start = structuredClone(d.s);
    playM01(d, 'patent');
    d.s = start; // restore an early checkpoint; permanent record stays
    d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
    d.talk('warden-ise', 'How can all three');
    expect(d.s.inventory['tool.date-lens']).toBe(1);
    expect(d.p.awards['award.dates-have-kinds']).toBeTruthy();
  });
  it('an invalid transaction changes nothing', () => {
    const d = new Driver();
    const before = structuredClone(d.s);
    const o = d.e.dispatch({ type: 'Purchase', offer: 'offer.tea' }, d.s, d.p); // player has 0 marks
    expect(o.events[0].kind).toBe('error');
    expect(o.state).toEqual(before);
  });
  it('unfair simulation tests do not count as fair', () => {
    const d = new Driver();
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    d.run({ type: 'RunSimulation', pen: 'biro-type', surface: 'leather' }); // changed two things
    expect(d.s.flags['sim.fair']).toBeUndefined();
    expect(d.s.flags['sim.unfair']).toBe(1);
  });
});

describe('misconception signals (phase L2, spec 95)', () => {
  it('the game has 25 misconceptions, each with a place in play', () => {
    expect(pack.misconceptions.length).toBe(25);
  });
  const once = (d: Driver, node: string, pick: string) => {
    d.run({ type: 'EnterNode', node });
    const o = d.e.visibleOptions(node, d.s).find((x) => x.option.text.includes(pick));
    if (!o) throw new Error(`no option "${pick}" at ${node}`);
    d.run({ type: 'ChooseDialogueOption', node, index: o.index });
  };
  const sites: [string, string, string][] = [
    ['dace.start', 'Numbers speak', 'MIS-33'], ['hesper.start', 'biased', 'MIS-03'], ['sefa.start', 'no point of view', 'MIS-04'],
    ['sefa.song', 'only art', 'MIS-12'], ['sefa.song', 'Only writing', 'MIS-27'], ['orrin.ledger', 'exactly what', 'MIS-15'],
    ['orrin.ledger', 'only record', 'MIS-16'], ['ev.coin', 'just a label', 'MIS-22'], ['ev.fog', 'cannot know', 'MIS-40'],
    ['ev.memory', 'did not see', 'MIS-20'], ['ev.well', 'must be the cause', 'MIS-07'], ['ev.bell', 'portal magic', 'MIS-07'],
    ['ev.mind', 'ignore all', 'MIS-19'], ['ev.translate', 'earliest', 'MIS-21'],
  ];
  for (const [node, pick, id] of sites) {
    it(`${node}: "${pick}" signals ${id}`, () => {
      const d = new Driver();
      once(d, node, pick);
      expect(d.p.signals[id]?.length).toBe(1);
    });
  }
  it('the other options at the same places raise no signal (values and good questions never do)', () => {
    const d = new Driver();
    once(d, 'orrin.ledger', 'Who writes'); once(d, 'sefa.song', 'What does the song know'); once(d, 'ev.price', 'Who is right');
    expect(Object.keys(d.p.signals)).toEqual([]);
  });
  it('"Proved the exact size of the Earth" does not hold and signals MIS-01', () => {
    const d = new Driver();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-101' });
    const o = d.run({ type: 'BuildLabel', kit: 'first.eratosthenes', subject: 'person', criterion: 'exact', limit: 'limit' });
    expect((o.events.find((e) => e.kind === 'label') as any).result.holds).toBe(false);
    expect(d.p.signals['MIS-01']?.length).toBe(1);
  });
  it('a shout at an open fair point signals MIS-36; a concession does not', () => {
    const d = new Driver();
    d.talk('clerk-venn', 'What about');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-C' });
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'practical' }, { move: 'support', card: 'card.dpma-history' }, { move: 'support', card: 'card.biro-object' });
    expect(d.s.showdown!.openPoint).toBeTruthy();
    expect(d.p.signals['MIS-36']).toBeUndefined();
    d.run({ type: 'ShowdownMove', move: { move: 'shout' } });
    expect(d.p.signals['MIS-36']?.length).toBe(1);
  });
});

describe('dialogue graph', () => {
  it('every node is reachable from a character, an event or a scene entry', () => {
    const reach = new Set<string>();
    const entries = ['cold.open', 'waystone.nexus', 'waystone.emberford', 'oldsign.read'];
    const stack = [...pack.characters.flatMap((c) => c.talk.map((t) => t.node)), ...pack.events.map((e) => e.node), ...entries];
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
