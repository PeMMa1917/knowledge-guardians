import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Driver } from './driver';

const pack = buildPack();
const last = (d: Driver) => [...d.events].reverse().find((e) => e.kind === 'puzzle') as any;

describe('word puzzles', () => {
  it('Sign-Smith: a wrong notice shows its result, the right ones open the gate', () => {
    const d = new Driver();
    d.s = { ...d.s, objectivesDone: ['m02.o1.arrive'] };
    const rec = pack.puzzles.find((p) => p.id === 'guild-notice')!;
    if (rec.type !== 'rounds') throw new Error();
    d.run({ type: 'PuzzleRound', puzzle: rec.id, round: 0, index: rec.rounds[0].options.findIndex((o) => !o.ok) });
    expect(last(d).ok).toBe(false);
    expect(() => d.run({ type: 'PuzzleRound', puzzle: rec.id, round: 1, index: 0 })).toThrow();
    rec.rounds.forEach((r, i) => d.run({ type: 'PuzzleRound', puzzle: rec.id, round: i, index: r.options.findIndex((o) => o.ok) }));
    expect(d.s.flags['puzzle.guild-notice.done']).toBe(true);
    expect(d.s.objectivesDone).toContain('words.o1.signs');
    expect(d.p.credit['crit.interpretation.signs']).toBe(5);
  });
  it('Citation Thread: missing, extra and misplaced pieces leave a gap', () => {
    const d = new Driver();
    d.s = { ...d.s, objectivesDone: ['m02.o1.arrive'] };
    const rec = pack.puzzles.find((p) => p.id === 'song-bridge')!;
    if (rec.type !== 'order') throw new Error();
    d.run({ type: 'PuzzleOrder', puzzle: rec.id, order: rec.answer.slice(0, 4) });
    expect(last(d)).toMatchObject({ ok: false, gapAt: 4 });
    d.run({ type: 'PuzzleOrder', puzzle: rec.id, order: ['title', 'author'] });
    expect(last(d)).toMatchObject({ ok: false, gapAt: 0 });
    d.run({ type: 'PuzzleOrder', puzzle: rec.id, order: ['author', 'x.where'] });
    expect(last(d).text).toContain('not part of the citation');
    d.run({ type: 'PuzzleOrder', puzzle: rec.id, order: [...rec.answer, 'x.good'] });
    expect(last(d).ok).toBe(false);
    d.run({ type: 'PuzzleOrder', puzzle: rec.id, order: rec.answer });
    expect(last(d).ok).toBe(true);
    expect(d.s.objectivesDone).toContain('words.o2.cite');
  });
});
