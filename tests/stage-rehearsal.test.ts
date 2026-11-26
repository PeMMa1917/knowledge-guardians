import { describe, expect, it } from 'vitest';
import { stageRehearsal } from '../src/domain/stageRehearsal';
import { Driver } from './driver';

describe('House of Performance cue table', () => {
  it('reorders only the silence and the move', () => {
    const pause = stageRehearsal('pause');
    const move = stageRehearsal('move');
    expect(pause.map((beat) => beat.kind)).toEqual(['line', 'pause', 'move', 'line']);
    expect(move.map((beat) => beat.kind)).toEqual(['line', 'move', 'pause', 'line']);
    expect(pause.filter((beat) => beat.kind === 'line')).toEqual(move.filter((beat) => beat.kind === 'line'));
    expect(pause[2]).toEqual(move[1]);
  });

  it('requires arrival and the rehearsal room and retains both completed stagings', () => {
    const d = new Driver();
    d.s.mapId = 'stage.rehearsal';
    expect(() => d.run({ type: 'RunStageRehearsal', cue: 'pause' })).toThrow(/cue table/);
    d.run({ type: 'SetFlag', flag: 'stage.arrived', value: true });
    d.s.mapId = 'stage.gallery';
    expect(() => d.run({ type: 'RunStageRehearsal', cue: 'pause' })).toThrow(/cue table/);
    d.s.mapId = 'stage.rehearsal';
    d.run({ type: 'RunStageRehearsal', cue: 'pause' });
    expect(d.s.flags['stage.rehearsal.pause']).toBe(true);
    expect(d.s.flags['stage.rehearsal.move']).toBeUndefined();
    d.run({ type: 'RunStageRehearsal', cue: 'move' });
    const completed = d.s;
    d.run({ type: 'RunStageRehearsal', cue: 'move' });
    expect(d.s).toEqual(completed);
  });
});
