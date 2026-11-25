import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { latestPerStudent, readProgress, subjectCsv, summarise, type ProgressFile } from '../src/teacher/report';

const pack = buildPack();
const file = (player: string, over: Partial<ProgressFile> = {}): ProgressFile => ({
  format: 'knowledge-guardians-progress', version: 1, exportedAt: '2026-11-20T10:00:00Z', player, content: 'chapter-1 v2',
  objectivesDone: [], awards: [], conceptXP: {}, totalXP: 0, moments: {},
  met: { concepts: {}, atl: {}, subjects: {}, aoks: {} }, misconceptions: [], portfolio: [], ...over,
});

describe('teacher view (spec 94, 95)', () => {
  it('rejects files that are not progress files, with a reason', () => {
    expect(readProgress({ hello: 1 }).ok).toBe(false);
    expect(readProgress({ ...file('A'), version: 9 })).toEqual({ ok: false, reason: expect.stringMatching(/another version/) });
    expect(readProgress(file('A')).ok).toBe(true);
  });
  it('keeps only the latest file per student', () => {
    const a1 = file('Ana'), a2 = file('Ana', { exportedAt: '2026-11-24T10:00:00Z', totalXP: 50 });
    expect(latestPerStudent([a2, a1, file('Ben')]).map((f) => [f.player, f.totalXP])).toEqual([['Ana', 50], ['Ben', 0]]);
  });
  it('counts students per concept and lists the least-met concepts as gaps', () => {
    const s = summarise([file('A', { met: { concepts: { evidence: 2 }, atl: {}, subjects: {}, aoks: {} } }), file('B')], pack);
    expect(s.concepts.evidence).toEqual({ total: 2, students: 1 });
    expect(s.gaps).not.toContain('evidence');
  });
  it('gives learner-profile moments as class totals only (PROFILE-001)', () => {
    const s = summarise([file('A', { moments: { 'PM-01': { attribute: 'inquirer', at: 'x' } } }), file('B', { moments: { 'PM-10': { attribute: 'inquirer', at: 'x' } } })], pack);
    expect(s.profile).toEqual({ inquirer: 2 });
  });
  it('raises a class alert at 30% of the class, and a teacher can dismiss it (MISC-001)', () => {
    const hit = { id: 'MIS-29', title: 'x', count: 3, level: 'watch' as const };
    const files = [file('A', { misconceptions: [hit] }), file('B'), file('C')];
    const s = summarise(files, pack);
    expect(s.alerts[0]).toMatchObject({ id: 'MIS-29', students: 1, classLevel: true });
    expect(summarise(files, pack, ['MIS-29']).alerts).toEqual([]);
  });
  it('writes subject links as CSV', () => {
    expect(subjectCsv([file('Ana', { met: { concepts: {}, atl: {}, subjects: { history: 3 }, aoks: {} } })])).toBe('"student","subject","times met"\n"Ana","history","3"');
  });
});
