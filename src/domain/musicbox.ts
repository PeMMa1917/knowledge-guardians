/**
 * The music box (spec 47.4 "music boxes and soundtracks", 39.4 concept motifs).
 * Each TOK concept has a short original motif. A motif opens when the player first
 * earns XP for that concept; two place tunes open by visiting. The player arranges
 * up to eight motifs into a song. Pure data and rules, no sound here.
 */
import type { Concept } from './types';

/** Notes are steps in a major pentatonic scale (0 = C5); `beats` per note. */
export interface Motif { id: string; name: string; steps: number[]; beats: number[]; concept?: Concept; place?: string }

export const MOTIFS: Motif[] = [
  { id: 'evidence', name: 'Evidence: footsteps that check', concept: 'evidence', steps: [0, 0, 2, 4], beats: [1, 1, 1, 2] },
  { id: 'certainty', name: 'Certainty: a careful climb', concept: 'certainty', steps: [0, 1, 2, 2], beats: [1, 1, 1, 2] },
  { id: 'truth', name: 'Truth: a clear bell', concept: 'truth', steps: [4, 2, 4, 7], beats: [1, 1, 1, 2] },
  { id: 'interpretation', name: 'Interpretation: the same notes, turned', concept: 'interpretation', steps: [2, 4, 1, 3], beats: [1, 1, 1, 2] },
  { id: 'power', name: 'Power: a low, strong step', concept: 'power', steps: [-5, -5, 0, -1], beats: [1, 1, 2, 1] },
  { id: 'justification', name: 'Justification: because, because', concept: 'justification', steps: [0, 2, 0, 3], beats: [1, 1, 1, 2] },
  { id: 'explanation', name: 'Explanation: one thing leads on', concept: 'explanation', steps: [0, 1, 2, 3, 4], beats: [1, 1, 1, 1, 1] },
  { id: 'objectivity', name: 'Objectivity: a level beam', concept: 'objectivity', steps: [2, 2, 2, 2], beats: [1, 1, 1, 2] },
  { id: 'perspective', name: 'Perspective: two views', concept: 'perspective', steps: [0, 4, 1, 5], beats: [1, 1, 1, 2] },
  { id: 'culture', name: 'Culture: a shared song', concept: 'culture', steps: [4, 3, 2, 0], beats: [1, 1, 1, 2] },
  { id: 'values', name: 'Values: what we keep', concept: 'values', steps: [2, 1, 0, 0], beats: [1, 1, 2, 1] },
  { id: 'responsibility', name: 'Responsibility: a promise kept', concept: 'responsibility', steps: [0, 2, 4, 2, 0], beats: [1, 1, 1, 1, 2] },
  { id: 'nexus', name: 'Place tune: the archive chimes', place: 'nexus.archive', steps: [4, 3, 5, 2], beats: [2, 1, 1, 2] },
  { id: 'emberford', name: 'Place tune: the forge at Emberford', place: 'aethelgard.emberford', steps: [0, 0, 4, 0, 3], beats: [1, 1, 1, 1, 2] },
];

export const SONG_MAX = 8;

const PENTA = [0, 2, 4, 7, 9]; // C D E G A, in semitones
/** Frequency of a pentatonic step (0 = C5 at 523.25 Hz). */
export function stepFreq(step: number): number {
  const oct = Math.floor(step / 5), i = ((step % 5) + 5) % 5;
  return 523.25 * Math.pow(2, (oct * 12 + PENTA[i]) / 12);
}

export function openMotifs(conceptXP: Partial<Record<Concept, number>>, visited: string[]): Motif[] {
  return MOTIFS.filter((m) => (m.concept ? (conceptXP[m.concept] ?? 0) > 0 : visited.includes(m.place!)));
}

/** Read a stored song; drops unknown or closed motifs and keeps at most SONG_MAX. */
export function readSong(stored: unknown, open: Motif[]): string[] {
  const ids = new Set(open.map((m) => m.id));
  return String(stored ?? '').split(',').filter((x) => ids.has(x)).slice(0, SONG_MAX);
}

/** The notes of a song in order: frequency, start beat and length in beats. */
export function songNotes(song: string[]): { f: number; at: number; beats: number; slot: number }[] {
  const out: { f: number; at: number; beats: number; slot: number }[] = [];
  let t = 0;
  song.forEach((id, slot) => {
    const m = MOTIFS.find((x) => x.id === id);
    if (!m) return;
    m.steps.forEach((st, i) => { out.push({ f: stepFreq(st), at: t, beats: m.beats[i], slot }); t += m.beats[i]; });
    t += 1; // a short rest between motifs
  });
  return out;
}
