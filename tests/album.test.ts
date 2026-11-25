import { describe, expect, it } from 'vitest';
import { captionLines, checkLine } from '../src/domain/album';
import { Driver } from './driver';

describe('photo album caption check (spec 47.4)', () => {
  const subjects = [
    { kind: 'person' as const, id: 'warden-ise', name: 'Warden Ise' },
    { kind: 'object' as const, id: 'timeline-door', name: 'the Timeline Door' },
  ];
  it('gives one "shows" and one "thinks" line for each subject in the frame', () => {
    const lines = captionLines(subjects, 3);
    expect(lines).toHaveLength(4);
    expect(lines.filter((l) => l.kind === 'shows').map((l) => l.text)).toContain('Warden Ise is in the picture.');
    expect(lines.filter((l) => l.kind === 'thinks')).toHaveLength(2);
    expect(captionLines(subjects, 3)).toEqual(lines);
  });
  it('an empty frame still has a fair pair of lines', () => {
    expect(captionLines([], 1).map((l) => l.kind).sort()).toEqual(['shows', 'thinks']);
  });
  it('explains why a feeling is not in the picture', () => {
    const t = captionLines(subjects, 0).find((l) => l.id === 'warden-ise.thinks')!;
    expect(checkLine(t, 'shows')).toMatchObject({ ok: false });
    expect(checkLine(t, 'shows').text).toMatch(/does not show thoughts/);
  });
  it('pays once, only for a caption sorted fully right', () => {
    const d = new Driver();
    d.run({ type: 'PhotoCaptioned', right: 3, total: 4 });
    expect(d.s.flags['album.checked']).toBeUndefined();
    d.run({ type: 'PhotoCaptioned', right: 4, total: 4 });
    expect(d.s.flags['album.checked']).toBe(true);
    expect(d.s.journal).toContain('j.caption');
  });
});

describe('competency rings', () => {
  it('each concept ring counts credited XP out of the chapter maximum', async () => {
    const { conceptRings } = await import('../src/domain/permanent');
    const d = new Driver();
    const before = conceptRings(d.p, d.e.pack).find((r) => r.concept === 'evidence')!;
    expect(before.got).toBe(0);
    expect(before.max).toBeGreaterThan(0);
    d.run({ type: 'PhotoCaptioned', right: 2, total: 2 });
    expect(conceptRings(d.p, d.e.pack).find((r) => r.concept === 'evidence')!.got).toBe(3);
  });
});
