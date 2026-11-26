import { describe, expect, it } from 'vitest';
import { MOTIFS, SONG_MAX, openMotifs, readSong, songNotes, stepFreq } from '../src/domain/musicbox';

describe('music box (spec 47.4)', () => {
  it('has one motif for every concept, all different', () => {
    const concepts = MOTIFS.filter((m) => m.concept);
    expect(concepts).toHaveLength(12);
    expect(new Set(MOTIFS.map((m) => m.steps.join() + '|' + m.beats.join())).size).toBe(MOTIFS.length);
    MOTIFS.forEach((m) => expect(m.steps.length).toBe(m.beats.length));
  });
  it('opens a motif with the first XP for its concept, and place tunes by visiting', () => {
    const open = openMotifs({ evidence: 3 }, ['nexus.archive']).map((m) => m.id);
    expect(open).toEqual(['evidence', 'nexus']);
  });
  it('reads a stored song safely and plays it in order', () => {
    const open = openMotifs({ evidence: 3, truth: 1 }, []);
    expect(readSong('evidence,power,truth,nope', open)).toEqual(['evidence', 'truth']);
    expect(readSong(Array(12).fill('truth').join(','), open)).toHaveLength(SONG_MAX);
    const n = songNotes(['evidence', 'truth']);
    expect(n[0].f).toBeCloseTo(523.25);
    expect(n.filter((x) => x.slot === 1)[0].at).toBe(6); // 5 beats of evidence + 1 rest
    expect(stepFreq(5)).toBeCloseTo(1046.5);
  });
});
