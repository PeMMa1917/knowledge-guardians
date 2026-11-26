import { describe, expect, it } from 'vitest';
import { MODEL_RECORDS } from '../src/content/modelRecords';
import { flowModel, layThread } from '../src/domain/modelRecords';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
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
