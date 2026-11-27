import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { makerTrials } from '../src/content/makerTrials';
import { adventureJournalView } from '../src/domain/adventureJournal';
import {
  fieldObservation,
  fieldReceipt,
  installedMakerFit,
  makerEffects,
  makerMarks,
  makerSample,
  type MakerCommand,
  type FieldCommand,
} from '../src/domain/makerField';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { microSkillId } from '../src/domain/skills';
import { Driver } from './driver';

const sides = [0, 1] as const;
const town = 'aethelgard.emberford';
describe('Hesper’s bench and the morning after', () => {
  it('works at each mounting on both reference orders and sends each of the six handovers with either fitting', () => {
    const initial = new Driver().s;
    for (const t of makerTrials)
      for (const mount of sides)
        for (const method of sides)
          for (const first of sides) {
            let s = { ...initial, mapId: town, inventory: { ...initial.inventory, ['item.' + t.tool]: 1 } };
            const work = (c: MakerCommand | FieldCommand) => {
              s = apply(makerEffects(s, c), s, emptyOutputs());
            };
            const bench = { type: 'WorkMakerInstrument' as const, tool: t.tool, mount };
            const field = { type: 'WorkTownReading' as const, reading: t.reading };
            expect(() => work({ ...field, action: 'observe', surface: 0 })).toThrow(/calibrat/i);
            const again = { ...bench, action: 'test' as const, standard: first };
            work(again);
            work(again);
            expect(makerMarks(s, t, mount)).toBe(1 << first);
            expect(() => work({ ...bench, action: 'fit', method })).toThrow(/both/);
            work({ ...bench, action: 'test', standard: first === 1 ? 0 : 1 });
            expect(() => work({ ...bench, mount: mount === 1 ? 0 : 1, action: 'fit', method })).toThrow(
              /both/,
            );
            work({ ...bench, action: 'fit', method });
            expect(installedMakerFit(s, t)).toEqual({ mount, method });
            expect(makerSample(t, mount, 0).reference).not.toBe(makerSample(t, mount, 1).reference);
            work({ ...field, action: 'observe', surface: first });
            expect(() => work({ ...field, action: 'hand', recipient: 0 })).toThrow(/observations/);
            work({ ...field, action: 'observe', surface: first === 1 ? 0 : 1 });
            for (const recipient of sides) {
              work({ ...field, action: 'hand', recipient });
              expect(fieldReceipt(s, t)).toBe(t.replies[recipient]);
            }
            expect(s.marks).toBe(initial.marks + 4);
            expect(s.flags['count.readings']).toBe(1);
            const remote = { ...s, mapId: 'nexus.archive' };
            expect(() => makerEffects(remote, { ...field, action: 'hand', recipient: 1 })).toThrow(
              /Emberford/,
            );
          }
  });

  it('puts two independent edges on the same field slip before crediting uncertainty and preserves the sent interval', () => {
    const d = new Driver(),
      pack = buildPack();
    d.s.mapId = town;
    for (const t of makerTrials.slice(0, 2)) {
      d.s.inventory['item.' + t.tool] = 1;
      d.s.flags['craft.' + t.tool + '.calibrated'] = true;
      const f = { type: 'WorkTownReading' as const, reading: t.reading };
      const id = 'maker.' + t.tool + '.compared-bounds';
      expect(d.e.activeMissions(d.s).some((m) => m.objectives.some((o) => o.id === id))).toBe(false);
      expect(() => d.run({ ...f, action: 'shade', source: 0, include: true })).toThrow(/both/);
      for (const surface of sides) d.run({ ...f, action: 'observe', surface });
      // Old calibrated tools have valid field marks even before a new fitting is installed.
      expect(d.s.flags['maker.' + t.tool + '.seen0']).toBe(0);
      d.run({ ...f, action: 'shade', source: 1, include: true });
      d.run({ ...f, action: 'shade', source: 0, include: true });
      expect(d.done(id)).toBe(false);
      d.run({ ...f, action: 'hand', recipient: 1 });
      const sent = fieldReceipt(d.s, t)!;
      expect(sent).toContain(t.reading === 'rain' ? '8 to 10 mm' : '-1 to 1 finger-widths');
      d.run({ ...f, action: 'shade', source: 1, include: false });
      expect(d.done(id)).toBe(true);
      expect(fieldReceipt(d.s, t)).toBe(sent);
      d.run({ ...f, action: 'hand', recipient: 0 });
      const latest = fieldReceipt(d.s, t)!;
      expect(latest).toContain(t.reading === 'rain' ? '8.5 to 9.5 mm' : '-0.5 to 0.5 finger-widths');
      d.run({
        type: 'ReadWorldSign',
        id: 'maker-reply.' + t.reading + '.0',
        title: t.gifts[0],
        text: latest,
      });
      d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
      expect(fieldReceipt(d.s, t)).toBe(latest);
      const entries = adventureJournalView(pack, d.s, []).entries.filter(
        (e) => e.event?.ref === 'maker.' + t.tool || e.event?.ref === 'maker-reply.' + t.reading + '.0',
      );
      expect(entries.some((e) => e.text.includes(sent))).toBe(true);
      expect(entries.some((e) => e.text.includes(latest))).toBe(true);
      expect(
        entries.every(
          (e) =>
            e.topics?.concepts?.includes('certainty') &&
            e.topics?.themes?.includes('TEC') &&
            e.reflections?.length,
        ),
      ).toBe(true);
    }
    expect(d.p.skills[microSkillId(621)]).toHaveLength(2);
  });

  it('preserves the field copy through refitting, then lets the player deliberately take a fresh observation', () => {
    const d = new Driver();
    d.s.mapId = town;
    d.s.flags['res.clay'] = 2;
    d.s.flags['res.reed'] = 1;
    const t = makerTrials[0],
      f = { type: 'WorkTownReading' as const, reading: t.reading };
    d.run({ type: 'Craft', recipe: t.tool });
    expect(d.s.flags['craft.rain-gauge.calibrated']).toBe(false);
    expect(d.s.flags['res.clay']).toBe(0);
    expect(() => d.run({ type: 'Craft', recipe: t.tool })).toThrow(/already/);
    for (const mount of sides) {
      for (const standard of sides)
        d.run({ type: 'WorkMakerInstrument', tool: t.tool, action: 'test', mount, standard });
      d.run({ type: 'WorkMakerInstrument', tool: t.tool, action: 'fit', mount, method: mount });
      if (mount === 0) d.run({ ...f, action: 'observe', surface: 0 });
      expect(fieldObservation(d.s, t, 0)).toContain('11 mm');
    }
    d.run({ ...f, action: 'observe', surface: 0 });
    expect(fieldObservation(d.s, t, 0)).toContain('8 mm');
    const pen = makerTrials[2];
    d.s.inventory['item.reed-pen'] = 1;
    d.s.flags['craft.reed-pen.calibrated'] = true;
    for (const surface of sides)
      d.run({ type: 'WorkTownReading', reading: pen.reading, action: 'observe', surface });
    expect(() =>
      d.run({ type: 'WorkTownReading', reading: pen.reading, action: 'shade', source: 0, include: true }),
    ).toThrow();
    expect(fieldObservation(d.s, pen, 0)).toContain('?');
    expect(fieldObservation(d.s, pen, 1)).toContain('does not name this post');
  });
});
