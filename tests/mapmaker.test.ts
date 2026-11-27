import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { migrateCampaign } from '../src/domain/saves';
import { tryMap } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'map-table';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'mapmaker') throw new Error('not a mapmaker');
const rec = found;

describe("The Mapmaker's Table (a model is not the thing)", () => {
  it('a map works when it has what the person needs; extra layers are fine; the sheet has a limit', () => {
    expect(tryMap(rec, 'efua', ['wells', 'slope']).ok).toBe(true);
    expect(tryMap(rec, 'efua', ['wells', 'slope', 'loved']).ok).toBe(true);
    const r = tryMap(rec, 'efua', ['wells', 'roads']);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(['slope']);
    expect(() => tryMap(rec, 'efua', ['wells', 'slope', 'roads', 'names'])).toThrow(/three|3/);
  });
  it('a working map says what it left out', () => {
    expect(tryMap(rec, 'kip', ['loved', 'roads']).text).toMatch(/left out: .*wells/);
  });
  it('the delivery opens after every person has a map, and pays once', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: 2 })).toThrow(/everyone/);
    for (const a of rec.audiences) d.run({ type: 'PuzzleMap', puzzle: P, audience: a.id, layers: a.need });
    d.run({ type: 'PuzzleReport', puzzle: P, index: 0 });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    const xp = conceptXP(d.p, pack).values;
    expect(xp).toBeGreaterThan(0);
    // Before handovers existed a completed save had all four maps and no recipient.
    const oldSave = JSON.parse(JSON.stringify(d.s));
    delete oldSave.flags['puzzle.map-table.handoff'];
    d.s = migrateCampaign(oldSave).state;
    expect(d.s.flags['puzzle.map-table.done']).toBe(true);
    expect(d.s.flags['puzzle.map-table.handoff']).toBeUndefined();
    for (const [index, delivery] of rec.handoffs.entries()) {
      d.run({type: 'PuzzleReport', puzzle: P, index});
      expect(d.s.flags['puzzle.map-table.handoff']).toBe(index);
      expect(d.s.adventureDiary.entries.some((entry) => entry.text.includes(delivery.result))).toBe(true);
      expect(conceptXP(d.p, pack).values).toBe(xp);
    }
    const ref = 'field-reply.map-table.3';
    expect(d.s.adventureDiary.entries.some((entry) => entry.event?.ref === ref)).toBe(false);
    const delivery = rec.handoffs[3];
    d.run({type: 'ReadWorldSign', id: ref, title: delivery.label, text: delivery.reply});
    const reply = adventureJournalView(pack, d.s, []).entries.find((entry) => entry.event?.ref === ref);
    expect(reply?.topics?.concepts).toEqual(expect.arrayContaining(rec.weave.concepts));
    expect(reply?.topics?.framework).toEqual(expect.arrayContaining(rec.weave.framework ?? []));
    expect(reply?.text).toContain(delivery.reply);
  });
});
