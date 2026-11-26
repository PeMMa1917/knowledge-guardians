import { describe, expect, it } from 'vitest';
import { guideObjectives } from '../src/domain/guidance';
import { totalXP } from '../src/domain/permanent';
import { Driver } from './driver';

describe('Lumen’s workbench guidance', () => {
  it('prefers the opened case among a player’s visible goals and leaves later worlds out', () => {
    const d = new Driver();
    const live = d.e.visibleObjectives(d.s);
    const clues = guideObjectives(live, 'WORLD-01', 'm01.o1.look');
    expect(clues[0]?.id).toBe('m01.o1.look');
    expect(clues.length).toBeLessThanOrEqual(6);
    expect(clues.every(({ mission }) => mission.world === 'WORLD-01')).toBe(true);
    expect(guideObjectives(live, 'WORLD-03', 'nile.dispatch')).toEqual([]);
    d.s.objectivesDone.push('m01.o1.look');
    expect(guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-01', 'm01.o1.look').map(({ id }) => id)).not.toContain('m01.o1.look');
  });

  it('offers the four clues in order, allows a repeat and keeps award credit steady', () => {
    const d = new Driver();
    const startingXP = totalXP(d.p);
    const initialAwards = { ...d.p.awards };
    const depths = Array.from({ length: 5 }, () => {
      const event = d.run({ type: 'RequestHint', objective: 'm01.o1.look' }).events.find(({ kind }) => kind === 'hint');
      return event?.kind === 'hint' ? event.hint.depth : undefined;
    });
    expect(depths).toEqual([1, 2, 3, 4, 4]);
    expect(totalXP(d.p)).toBe(startingXP);
    expect(d.p.awards).toEqual(initialAwards);
    const previous = d.s;
    expect(() => d.run({ type: 'RequestHint', objective: 'missing.example' })).toThrow('Choose a quest step with a clue');
    expect(d.s).toBe(previous);
  });
});
