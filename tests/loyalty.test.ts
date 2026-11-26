import { describe, expect, it } from 'vitest';
import { LOYALTY, loyaltyOf } from '../src/domain/loyalty';
import { vignettesFor } from '../src/domain/epilogue';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { migrateCampaign } from '../src/domain/saves';
import { Driver } from './driver';
import { buildPack } from '../src/content';
import { MAPS } from '../src/maps';

describe('companion loyalty missions (spec 15.9, COMP-002, COMP-003)', () => {
  const pack = buildPack();
  it('each core companion has one, with three sources, a blind-spot slip and three costly choices', () => {
    expect(LOYALTY.map((l) => l.id).sort()).toEqual(['hesper', 'kip', 'rook', 'sefa']);
    for (const l of LOYALTY) {
      expect(pack.characters.some((c) => c.id === l.companion), l.id).toBe(true);
      expect(l.sources).toHaveLength(3);
      expect(l.choices).toHaveLength(3);
      for (const ch of l.choices) { expect(ch.cost.length).toBeGreaterThan(30); expect(ch.reply.length).toBeGreaterThan(10); }
      expect(l.slip.notice && l.slip.fixed && l.slip.miss).toBeTruthy();
    }
  });
  it('each one has a spot on a map that appears when the mission is available, and a remembered line for each choice', () => {
    for (const l of LOYALTY) {
      const spot = Object.values(MAPS).flatMap((m) => m.interactables).find((i) => i.game === `loyalty-${l.id}`);
      expect(spot, l.id).toBeTruthy();
      expect(spot!.visibleIf).toEqual(l.available);
      for (const ch of l.choices) expect((pack.memories ?? []).some((m) => m.id === `loyal.${l.id}.${ch.id}` && m.character === l.companion), `${l.id}.${ch.id}`).toBe(true);
    }
  });
});


describe('The Clean Well in Afterwards and the diary', () => {
  const rookLines = (d: Driver) => vignettesFor(d.s).filter(({ who }) => who === 'Rook').map(({ text }) => text);

  it.each([
    ['public', 'with their own name', 'sign the public result'],
    ['quiet', 'an unsigned warning', 'post an unsigned warning'],
    ['family', 'keeps the written account of that first visit in her drawer', 'showed the family the new test'],
  ] as const)('keeps the %s repair with its own readers after restoring a save', (choice, ending, journal) => {
    const d = new Driver();
    d.s.mapId = 'water.lower-channel';
    d.run({ type: 'SetFlag', flag: 'rook.joined', value: true });
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'both' });
    const credit = { ...d.p.credit };
    const action = { type: 'SetFlag', flag: 'loyalty.rook', value: choice } as const;
    d.run(action);
    d.run(action);

    const id = `loyalty:rook:${choice}`;
    const readDiary = () => adventureJournalView(d.e.pack, d.s, d.e.visibleObjectives(d.s)).entries.filter((row) => row.id.startsWith(id));
    expect(readDiary()).toEqual([expect.objectContaining({ id, text: expect.stringContaining(journal), mapId: 'water.lower-channel' })]);
    expect(d.p.credit).toEqual(credit);
    expect(rookLines(d)).toEqual([expect.stringContaining(ending)]);

    // Preserve a diary body already written by the prior release rather than regenerate it.
    const original = loyaltyOf('rook')!.choices.find((row) => row.id === choice)!;
    const oldText = `I chose “${original.text}” Rook replied, ${original.reply}`;
    d.s.adventureDiary.entries.find((row) => row.id === id)!.text = oldText;
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.s.flags['loyalty.rook']).toBe(choice);
    expect(rookLines(d)).toEqual([expect.stringContaining(ending)]);
    expect(readDiary()).toEqual([expect.objectContaining({ id, text: oldText })]);
    expect(d.p.credit).toEqual(credit);
  });

  it('preserves Rook’s undecided aftermath when the well was skipped', () => {
    const d = new Driver();
    expect(rookLines(d)).toEqual([]);
    d.run({ type: 'SetFlag', flag: 'rook.joined', value: true });
    expect(rookLines(d)).toEqual([expect.stringContaining('still carries the old Seal stamp')]);
  });
});
