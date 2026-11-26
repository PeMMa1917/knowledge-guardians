import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../src/domain/types';
import { buildPack } from '../src/content';
import { exampleFor, examplesFor, segmentText } from '../src/domain/glossary';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { Driver } from './driver';

const pack = buildPack();
const memories = (d: Driver, id: string) => examplesFor(pack.glossary.find((entry) => entry.id === id)!, d.s, (c) => check(c, d.s));

describe('smart glossary (spec 47.10)', () => {
  it('marks each term once, keeps the text the same, and prefers the longest form', () => {
    const text = 'A knowledge question is not a claim. Another claim needs evidence.';
    const seg = segmentText(text, pack.glossary);
    expect(seg.map((x) => x.text).join('')).toBe(text);
    expect(seg.filter((x) => x.term).map((x) => x.term)).toEqual(['knowledge-question', 'claim', 'evidence']);
  });
  it('does not split a larger Unicode word into a glossary control and ordinary text', () => {
    const text = 'éevidence evidence\u0301 evidence2 _evidence (EVIDENCE)!truth and evidence';
    const segments = segmentText(text, pack.glossary);
    expect(segments.map((part) => part.text).join('')).toBe(text);
    expect(segments.filter((part) => part.term)).toEqual([
      { text: 'EVIDENCE', term: 'evidence' }, { text: 'truth', term: 'truth' },
    ]);
  });
  it('keeps two distinct earned memories and a fresh starting example for each registered word', () => {
    const d = new Driver();
    for (const entry of pack.glossary) {
      const earned = entry.examples.filter(({ if: condition }) => condition);
      expect(new Set(earned.map(({ if: condition }) => JSON.stringify(condition))).size, entry.id).toBeGreaterThanOrEqual(2);
      expect(new Set(earned.map(({ text }) => text)).size, entry.id).toBe(earned.length);
      expect(memories(d, entry.id), entry.id).toEqual(entry.examples.filter(({ if: condition }) => !condition).map(({ text }) => text));
    }
  });
  it('remembers the inspected pen and the tried cloth insert independently after a reload', () => {
    const d = new Driver();
    const startingModel = memories(d, 'reconstruction');
    const startingFit = memories(d, 'symmetry');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    expect(memories(d, 'patent')).toEqual([expect.stringContaining('US 392,046')]);
    expect(memories(d, 'reconstruction')).toEqual(startingModel);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-B' });
    d.walk('corner.frame', ['Lift the loose corner']);
    expect(memories(d, 'symmetry')).toEqual(startingFit);
    d.walk('corner.try', ['Turn the square insert']);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(memories(d, 'reconstruction')).toEqual([expect.stringContaining('workshop’s version')]);
    expect(memories(d, 'symmetry')).toEqual([expect.stringContaining('fourth diamond')]);
    expect(memories(d, 'documented')).toEqual([expect.stringContaining('date on Loud’s patent')]);
  });
  it('gives an example from the player\'s own play when there is one', () => {
    const d = new Driver();
    const claim = pack.glossary.find((g) => g.id === 'claim')!;
    expect(exampleFor(claim, d.s, (c) => check(c, d.s))).toMatch(/old label/);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'none' });
    expect(exampleFor(claim, d.s, (c) => check(c, d.s))).toMatch(/Your museum label was a claim: '.*Loud/);
  });
  it('keeps the fitting and the lookout as distinct memories only after their checks, including after a reload', () => {
    const d = new Driver();
    const evidence = pack.glossary.find((entry) => entry.id === 'evidence')!;
    const recollections = () => examplesFor(evidence, d.s, (c) => check(c, d.s));
    expect(recollections()).toEqual([expect.stringContaining('Inspect an exhibit')]);
    d.walk('corner.frame', ['Lift the loose corner']);
    d.walk('corner.try', ['Turn the square insert']);
    d.walk('corner.try', ['Slide the clipped insert']);
    expect(recollections()[0]).toContain('Inspect an exhibit');
    d.walk('corner.order', ['Pin the dated order']);
    expect(recollections()).toEqual([expect.stringContaining('repair slip')]);

    d.s.objectivesDone.push('m01.o6.label');
    d.run({ type: 'Reach', zone: 'portal' });
    d.s.mapId = 'aethelgard.emberford';
    d.run({ type: 'Reach', zone: 'emberford' });
    d.walk('ember.circle.stall', ['Lift the corner']);
    d.walk('ember.circle.tea', ['Keep the tea slip']);
    d.walk('ember.circle.ledger', ['Lay both slips']);
    expect(recollections()).toHaveLength(1);
    d.walk('ember.circle.witness', ['Set the signed sightline']);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(recollections()).toEqual([expect.stringContaining('repair slip'), expect.stringContaining('Havra')]);
  });
  it('remembers only the carrier who received a route and lets another save keep its own examples', () => {
    const d = new Driver();
    const values = pack.glossary.find((entry) => entry.id === 'values')!;
    const recollections = () => examplesFor(values, d.s, (c) => check(c, d.s));
    const fallback = recollections();
    d.run({ type: 'SetFlag', flag: 'sea.threadbend.choice', value: 'tray' });
    expect(recollections()).toEqual(fallback);
    d.run({ type: 'SetFlag', flag: 'sea.threadbend.placed', value: 'tray' });
    expect(recollections()).toEqual([expect.stringContaining('wide turn')]);
    d.run({ type: 'SetFlag', flag: 'clearbay.checked', value: 'west' });
    expect(recollections()).toEqual([expect.stringContaining('wide turn'), expect.stringContaining('hand parcel')]);
    const fresh = new Driver();
    expect(examplesFor(values, fresh.s, (c) => check(c, fresh.s))).toEqual(fallback);
  });
  it('covers all twelve concepts and offers a dictionary source for each registered word history', () => {
    const ids = pack.glossary.map((entry) => entry.id);
    for (const concept of CONCEPTS) expect(ids).toContain(concept);
    for (const entry of pack.glossary) {
      expect(entry.history?.note.length, entry.term).toBeGreaterThan(25);
      expect(entry.history?.url, entry.term).toMatch(/^https:\/\//);
    }
  });
  it('every term appears somewhere in the chapter text', () => {
    const all = JSON.stringify(pack.dialogue.map((n) => n.text)).toLowerCase();
    for (const g of pack.glossary) expect(g.match.some((m) => all.includes(m)), g.id).toBe(true);
  });
});

describe('reasoning words in Lumen’s glossary', () => {
  it.each([
    ['deduction', 'corner.choose'], ['induction', 'forest.moss.compare'], ['abduction', 'nile.lamp.repeat'],
    ['analogy', 'metal.witness.archive'], ['causal', 'water.scribe.revise'], ['pragmatic', 'nexus.rest.pair-read'],
    ['concession', 'dace.how'], ['reframe', 'dace.how'],
  ])('registers the specific source, a starting image and distinct earned %s examples', (id, node) => {
    const entry = pack.glossary.find((item) => item.id === id)!;
    expect(entry.history?.url).toBe(pack.sources.find((source) => source.id === `LEX-REASON-${id.toUpperCase()}`)?.url);
    expect(entry.examples.filter((example) => example.if).length).toBeGreaterThanOrEqual(2);
    const d = new Driver();
    expect(memories(d, id)).toEqual(entry.examples.filter((example) => !example.if).map((example) => example.text));
    expect(memories(d, id)).toHaveLength(1);
    expect(segmentText(d.e.node(node).text, pack.glossary).map((segment) => segment.term)).toContain(id);
  });

  it('starts with a fitting, then adds the later deduction only after grouping the rack', () => {
    const d = new Driver();
    d.walk('corner.frame', ['Lift the loose corner']);
    expect(memories(d, 'deduction')).toEqual([expect.stringContaining('empty hooks')]);
    d.walk('corner.try', ['Turn the square insert']);
    expect(memories(d, 'deduction')).toEqual([expect.stringContaining('Fourth Corner')]);
    d.s.mapId = 'civic.dispatch';
    d.walk('civic-overlap-red', ['Unclip the three slips']);
    d.walk('civic-overlap-blue', ['Unclip the three slips']);
    d.walk('civic-overlap-rack', ['Start filling the rack', 'Leave the rows']);
    expect(memories(d, 'deduction')).toHaveLength(1);
    d.walk('civic-overlap-rack', ['Start filling the rack', 'Group the remaining rows']);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(memories(d, 'deduction')).toEqual([expect.stringContaining('Fourth Corner'), expect.stringContaining('24 of the 64')]);
  });

  it('unlocks the causal and simulation memories from the actual marking bench counter', () => {
    const d = new Driver();
    const before = memories(d, 'causal');
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    expect(memories(d, 'causal')).toEqual(before);
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
    expect(d.s.flags['sim.fair']).toBe(1);
    expect(memories(d, 'causal')).toEqual([expect.stringContaining('Nexus marking bench')]);
    expect(memories(d, 'simulation')).toEqual([expect.stringContaining('Your fair test')]);
  });

  it('only calls a strip a transfer when Leila’s was actually used and both tallies checked', () => {
    const d = new Driver();
    d.s.objectivesDone.push('metal.witness.compare');
    d.run({ type: 'SetFlag', flag: 'metal.witness.use', value: 'loan' });
    expect(memories(d, 'analogy')).toEqual([expect.stringContaining('crate')]);
    d.run({ type: 'SetFlag', flag: 'metal.witness.use', value: 'archive' });
    expect(memories(d, 'analogy')).toEqual([expect.stringContaining('Leila’s earlier guide strip')]);
    d.s.objectivesDone.push('asia.loft.compare');
    expect(memories(d, 'analogy')).toEqual([expect.stringContaining('Leila’s earlier guide strip'), expect.stringContaining('Island Label Loft')]);
  });

  it('keeps the missing groove open until the lamp revisits its first position', () => {
    const d = new Driver();
    d.s.mapId = 'nile.workyard';
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    d.walk('nile.lamp.start', ['Look down with the lamp above', 'Leave the lamp above']);
    d.walk('nile.lamp.start', ['Move the lamp to the side', 'Leave the lamp to the side']);
    expect(memories(d, 'abduction')).toEqual([expect.stringContaining('wet wick')]);
    d.walk('nile.lamp.start', ['Return the lamp above', 'Leave the readings ready']);
    expect(memories(d, 'abduction')).toEqual([expect.stringContaining('changing view explains')]);
    expect(pack.sources.find(({ id }) => id === 'REF-REASON-ABDUCTION')?.url).toBe('https://plato.stanford.edu/entries/abduction/');
  });

  it('adds both debate memories only after the distinct moves are made and the Showdown closes', () => {
    const d = new Driver();
    for (const exhibit of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit });
    d.walk('venn.start', ['Does a patent prove']);
    d.run({ type: 'ShowdownStart', showdown: 'practice', relaxed: true });
    d.moves({ move: 'claim', claim: 'practical' }, { move: 'support', card: 'card.dpma-history' },
      { move: 'support', card: 'card.biro-object' });
    expect(memories(d, 'concession')).toEqual([expect.stringContaining('the fold carries a date')]);
    d.moves({ move: 'concede' }, { move: 'reframe' }, { move: 'rest' });
    expect(memories(d, 'concession')).toEqual([expect.stringContaining('limited point of Venn’s')]);
    expect(memories(d, 'reframe')).toEqual([expect.stringContaining('Venn’s crowd')]);
    expect(memories(new Driver(), 'reframe')).toEqual([expect.stringContaining('whose map is better')]);
  });
});

describe('titles (spec 47.1, C1)', () => {
  it('every award has its own title that names a deed', () => {
    const titles = pack.awards.map((a) => a.title);
    expect(titles.every(Boolean)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
