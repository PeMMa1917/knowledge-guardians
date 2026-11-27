import { describe, expect, it } from 'vitest';
import { MODEL_RECORDS } from '../src/content/modelRecords';
import { flowModel, layThread, runMouse } from '../src/domain/modelRecords';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { specimenReferences } from '../src/domain/specimenReferences';
import { MODEL_RECORD_ROOM, MODEL_RECORD_RETURNS } from '../src/maps/modelRecords';
import { Driver } from './driver';

describe('What the Model Keeps', () => {
  it('holds thread length and the share reserved steady across different trials', () => {
    const straight = layThread(false), folded = layThread(true);
    expect(straight).toHaveLength(folded.length);
    expect(straight.at(-1)?.x).toBe(12);
    expect(folded.at(-1)?.x).toBe(8);
    expect(flowModel(1, 3)).toEqual({ intake: 9, exchange: 2, reserve: 1 });
    expect(flowModel(1, 6)).toEqual({ intake: 6, exchange: 4, reserve: 2 });
  });

  it('keeps the inventor, maker and dates of the exact LSE MONIAC distinct', () => {
    const { e: { pack } } = new Driver();
    const record = pack.exhibits.find(({ specimen }) => specimen?.key === 'smg:1995-210')!;
    expect(record.specimen).toMatchObject({ institution: 'Science Museum Group', accession: '1995-210', people: [
      { name: 'Bill Phillips', role: 'Engineer, economist and inventor', source: 'HIS-MODEL-RECORD-moniac' },
      { name: 'White Ellerton Limited', role: 'Maker', source: 'HIS-MODEL-RECORD-moniac' },
    ] });
    expect(record.dateKind).toContain('making date');
    expect(record.dateText).toContain('May 1992');
    expect(record.summary).toContain('White Ellerton Limited made it in London in 1949');
    const reference = specimenReferences(pack).find(({ key }) => key === 'smg:1995-210')!;
    expect(reference.url).toBe('https://collection.sciencemuseumgroup.org.uk/objects/co64127/phillips-economic-computer');
    expect(reference.text).toContain('1949.');
    expect(reference.text).not.toContain('1992');
  });

  it('reuses the saved turns with the same practice maze and mouse', () => {
    const searching = runMouse(false), saved = runMouse(true);
    expect(searching).toHaveLength(11);
    expect(saved).toHaveLength(7);
    expect(searching[0]).toEqual(saved[0]);
    expect(searching.at(-1)).toEqual(saved.at(-1));
    expect(saved.every((point) => searching.some(({ x, y }) => x === point.x && y === point.y))).toBe(true);
  });

  for (const record of MODEL_RECORDS) {
    it(`earns ${record.accession} after a real handover and opens its original-world return`, () => {
      const d = new Driver();
      const tool = MODEL_RECORD_ROOM.interactables.find(({ id }) => id === `model-record-tool-${record.slug}`)!;
      const prompt = MODEL_RECORD_RETURNS.find(({ id }) => id === record.revisit.prop)!;
      d.s.objectivesDone.push('island.arrival');
      expect(check(tool.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
      expect(check(tool.visibleIf, d.s)).toBe(true);
      const set = (flag: string, value: string | boolean) => d.run({ type: 'SetFlag', flag: `${record.flag}.${flag}`, value });
      set('trial.0', true); set('trial.1', true); set('send', 'near');
      expect(d.done(record.objective)).toBe(false);
      set('received', 'near');
      expect(d.done(record.objective)).toBe(true);
      d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
      expect(check(prompt.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
      expect(check(prompt.visibleIf, d.s)).toBe(true);
    });
  }
});
