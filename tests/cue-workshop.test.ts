import { describe, expect, it } from 'vitest';
import { CUE_CASES, CUE_GATE, CUE_GROUP } from '../src/content/cueWorkshop';
import { cueMove, cueRun, cueTrialState } from '../src/domain/cueWorkshop';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { CUE_HOUSE_READER, CUE_WALK_READER, CUE_WORKSHOP, CUE_WORKSHOP_DOOR } from '../src/maps/cueWorkshop';
import { Driver } from './driver';

function move(d: Driver, slug: string, action: Parameters<typeof cueMove>[2]) {
  const effect = cueMove(slug, d.s.flags, action);
  expect(effect).toBeTruthy();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

describe('A Cue Beyond the Door', () => {
  it('places 30 source records at unique seats and puts the readers in different worlds', () => {
    const d = new Driver();
    expect(check(CUE_GATE, d.s)).toBe(false);
    d.s.objectivesDone.push('voices.publish');
    expect(check(CUE_GATE, d.s)).toBe(true);
    expect(MAPS['voices.quay'].interactables).toContain(CUE_WORKSHOP_DOOR);
    expect(MAPS['voices.walk'].interactables).toContain(CUE_WALK_READER);
    expect(MAPS['stage.gallery'].interactables).toContain(CUE_HOUSE_READER);
    expect(MAPS['voices.cue-workshop']).toBe(CUE_WORKSHOP);
    expect(CUE_CASES).toHaveLength(30);
    const mission = d.e.pack.missions.find(({ id }) => id === 'KG-CH13-R23');
    expect(mission?.caseVisits).toHaveLength(30);
    for (const record of CUE_CASES) {
      const e = d.e.pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(e?.specimen).toMatchObject({ accession: record.accession, pixelAsset: record.asset, objective: record.objective });
      expect(e?.dateText).toBe(record.date);
      expect(MAPS['voices.cue-workshop'].interactables.some(({ game }) => game === `${CUE_GROUP}:${record.slug}`)).toBe(true);
      const positions = Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === record.exhibit));
      expect(positions).toHaveLength(1);
      expect(MAPS['voices.cue-workshop'].interactables).toContain(positions[0]);
    }
  });

  it('masks particular beats without shifting timestamps, and keeps work beats distinct', () => {
    expect(cueRun('close', 'clear', [1, 4])).toEqual(['cue', 'cue', 'rest', 'rest', 'cue', 'rest', 'rest', 'rest']);
    expect(cueRun('close', 'service', [1, 4])).toEqual(['cue', 'covered', 'rest', 'rest', 'covered', 'rest', 'rest', 'rest']);
    expect(cueRun('spaced', 'service', [1, 4])).toEqual(['cue', 'work', 'rest', 'cue', 'work', 'rest', 'cue', 'rest']);
  });

  it('requires matched trials and prevents installation by the other reader', () => {
    const d = new Driver();
    d.s.objectivesDone.push('voices.publish');
    const entry = CUE_CASES[0];
    d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    move(d, entry.slug, { type: 'order', order: 'close' });
    move(d, entry.slug, { type: 'try', run: 'clear' });
    move(d, entry.slug, { type: 'order', order: 'spaced' });
    move(d, entry.slug, { type: 'try', run: 'service' });
    expect(cueMove(entry.slug, d.s.flags, { type: 'send', reader: 'walk' })).toBeNull();
    move(d, entry.slug, { type: 'try', run: 'clear' });
    move(d, entry.slug, { type: 'send', reader: 'walk' });
    expect(cueMove(entry.slug, d.s.flags, { type: 'install', reader: 'house' })).toBeNull();
    expect(cueMove(entry.slug, d.s.flags, { type: 'order', order: 'close' })).toBeNull();
    move(d, entry.slug, { type: 'install', reader: 'walk' });
    expect(check(CUE_WALK_READER.artOpen?.if, d.s)).toBe(true);
    expect(check(CUE_HOUSE_READER.artOpen?.if, d.s)).toBe(false);
    expect(d.done(entry.objective)).toBe(true);
  });

  it.each(CUE_CASES)('leaves $accession and its checked time strip at the House', (entry) => {
    const d = new Driver();
    d.s.objectivesDone.push('voices.publish');
    d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    move(d, entry.slug, { type: 'order', order: 'spaced' });
    move(d, entry.slug, { type: 'try', run: 'clear' });
    move(d, entry.slug, { type: 'try', run: 'service' });
    move(d, entry.slug, { type: 'send', reader: 'house' });
    expect(d.done(entry.objective)).toBe(false);
    move(d, entry.slug, { type: 'install', reader: 'house' });
    expect(cueTrialState(entry.slug, d.s.flags).delivered).toBe(true);
    expect(d.done(entry.objective)).toBe(true);
  });
});
