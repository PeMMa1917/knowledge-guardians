import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../src/domain/types';
import { buildPack } from '../src/content';
import { exampleFor, examplesFor, segmentText } from '../src/domain/glossary';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { Driver } from './driver';

const pack = buildPack();

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

describe('titles (spec 47.1, C1)', () => {
  it('every award has its own title that names a deed', () => {
    const titles = pack.awards.map((a) => a.title);
    expect(titles.every(Boolean)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
