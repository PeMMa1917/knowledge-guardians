import { describe, expect, it } from 'vitest';
import { STEPS, flagFor, warnings } from '../src/domain/surveyBell';

describe('The Survey Bell (chapter 12, C-004)', () => {
  it('asks three questions with three options each, each with a note', () => {
    expect(STEPS).toHaveLength(3);
    for (const s of STEPS) { expect(s.options).toHaveLength(3); for (const o of s.options) expect(o.note.length).toBeGreaterThan(30); }
    expect(flagFor('keep')).toBe('civic.survey.keep');
  });
  it('warns about risky designs and stays quiet about careful ones', () => {
    expect(warnings({ join: 'default', keep: 'names', see: 'board' }).length).toBe(2);
    expect(warnings({ join: 'ask', keep: 'counts', see: 'people' })).toEqual([]);
  });
});
