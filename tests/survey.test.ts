import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { answerSurvey, runSurvey } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'toll-survey';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'survey') throw new Error('not a survey');
const rec = found;

describe('The Bridge Toll Survey (human sciences)', () => {
  it('a leading question flips only people whose view is not firm', () => {
    expect(answerSurvey({ id: 'a', group: 'x', yes: false, firm: true }, 'yes')).toBe(false);
    expect(answerSurvey({ id: 'a', group: 'x', yes: false, firm: false }, 'yes')).toBe(true);
    expect(answerSurvey({ id: 'a', group: 'x', yes: true, firm: false }, 'none')).toBe(true);
  });
  it('the group and the wording change the result; the fair survey matches the town', () => {
    expect(runSurvey(rec, 'plain', 'meeting').yes).toBe(6);
    expect(runSurvey(rec, 'plain', 'market').yes).toBe(1);
    expect(runSurvey(rec, 'plain', 'houses')).toMatchObject({ yes: 4, total: 8 });
    expect(runSurvey(rec, 'pushyes', 'houses').yes).toBe(5);
    expect(runSurvey(rec, 'pushno', 'houses').yes).toBe(3);
  });
  it('the report needs the fair survey first', () => {
    const d = new Driver();
    const honest = rec.reflect.findIndex((r) => r.honest);
    d.run({ type: 'PuzzleSurvey', puzzle: P, wording: 'plain', sample: 'meeting' });
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: honest })).toThrow(/fair group/);
    d.run({ type: 'PuzzleSurvey', puzzle: P, wording: 'plain', sample: 'houses' });
    d.run({ type: 'PuzzleReport', puzzle: P, index: honest });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).objectivity).toBeGreaterThan(0);
  });
});
