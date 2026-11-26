import { STORY_PHRASE } from './storyMotifs';

export type ScoreVoice = 'glass' | 'felt' | 'pluck' | 'reed' | 'strings' | 'wood' | 'bell' | 'bass';
type Mode = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'lydian';
type Texture = 'held' | 'broken' | 'offbeat';

export interface WorldScore {
  id: string;
  caption: string;
  bpm: number;
  meter: 3 | 4;
  tonic: number;
  mode: Mode;
  lead: ScoreVoice;
  backing: ScoreVoice;
  texture: Texture;
  /** Chord roots and a short reply, both in scale steps from the tonic. */
  chords: readonly number[];
  reply: readonly number[];
}

const scores: Record<string, WorldScore> = {
  'WORLD-01': { id: 'nexus', caption: 'Soft glass chimes over a low, held harmony', bpm: 72, meter: 4,
    tonic: 60, mode: 'major', lead: 'glass', backing: 'strings', texture: 'held', chords: [0, 5, 3, 0, 1, 3, 4, 0], reply: [4, 6, 7, 4] },
  'WORLD-02': { id: 'emberford', caption: 'A warm plucked tune with small, offbeat bells', bpm: 96, meter: 4,
    tonic: 62, mode: 'mixolydian', lead: 'pluck', backing: 'bell', texture: 'offbeat', chords: [0, 3, 0, 6, 3, 5, 4, 0], reply: [2, 0, 1, 4] },
  'WORLD-03': { id: 'nile', caption: 'Soft plucked notes answer a long, low chord', bpm: 79, meter: 4,
    tonic: 57, mode: 'dorian', lead: 'pluck', backing: 'strings', texture: 'held', chords: [0, 3, 0, 4, 6, 3, 4, 0], reply: [7, 5, 4, 1] },
  'WORLD-04': { id: 'preserved', caption: 'Wide gaps between small bells and muted keys', bpm: 68, meter: 3,
    tonic: 58, mode: 'minor', lead: 'bell', backing: 'felt', texture: 'held', chords: [0, 5, 2, 0, 3, 1, 4, 0], reply: [5, 4, 2, 0] },
  'WORLD-05': { id: 'observatory', caption: 'A reed melody over three gently rocking beats', bpm: 86, meter: 3,
    tonic: 65, mode: 'lydian', lead: 'reed', backing: 'felt', texture: 'broken', chords: [0, 1, 5, 0, 2, 5, 4, 0], reply: [2, 3, 6, 5] },
  'WORLD-06': { id: 'forest', caption: 'Wooden taps with a light flute answering between them', bpm: 84, meter: 4,
    tonic: 67, mode: 'mixolydian', lead: 'reed', backing: 'wood', texture: 'offbeat', chords: [0, 3, 5, 0, 6, 4, 3, 0], reply: [0, 3, 4, 7] },
  'WORLD-07': { id: 'metalworks', caption: 'A measured metal ring and low, padded notes', bpm: 88, meter: 4,
    tonic: 55, mode: 'dorian', lead: 'wood', backing: 'bell', texture: 'offbeat', chords: [0, 6, 3, 0, 1, 6, 4, 0], reply: [2, 4, 1, 0] },
  'WORLD-08': { id: 'copies', caption: 'Quick strings trade turns with soft piano keys', bpm: 103, meter: 4,
    tonic: 64, mode: 'major', lead: 'felt', backing: 'pluck', texture: 'offbeat', chords: [0, 4, 5, 2, 3, 0, 1, 0], reply: [4, 2, 7, 6] },
  'WORLD-09': { id: 'sea', caption: 'Bright glass notes over a slow rocking bass', bpm: 74, meter: 3,
    tonic: 62, mode: 'dorian', lead: 'glass', backing: 'reed', texture: 'held', chords: [0, 2, 6, 0, 3, 6, 4, 0], reply: [8, 7, 4, 2] },
  'WORLD-10': { id: 'stage', caption: 'A swelling string tune above three plucked beats', bpm: 92, meter: 3,
    tonic: 60, mode: 'major', lead: 'strings', backing: 'pluck', texture: 'broken', chords: [0, 5, 1, 4, 2, 3, 4, 0], reply: [7, 4, 3, 4] },
  'WORLD-11': { id: 'market', caption: 'A springy wooden melody with quick plucked replies', bpm: 108, meter: 4,
    tonic: 65, mode: 'mixolydian', lead: 'wood', backing: 'pluck', texture: 'offbeat', chords: [0, 3, 6, 0, 2, 3, 4, 0], reply: [5, 2, 4, 0] },
  'WORLD-12': { id: 'water', caption: 'A rippling plucked pattern and a low sweeping line', bpm: 76, meter: 4,
    tonic: 63, mode: 'lydian', lead: 'pluck', backing: 'reed', texture: 'broken', chords: [0, 5, 1, 0, 2, 5, 4, 0], reply: [0, 2, 3, 5] },
  'WORLD-13': { id: 'civic', caption: 'An even pulse with glass notes passing across it', bpm: 102, meter: 4,
    tonic: 56, mode: 'minor', lead: 'glass', backing: 'wood', texture: 'broken', chords: [0, 5, 6, 0, 3, 5, 4, 0], reply: [6, 4, 6, 2] },
  'WORLD-14': { id: 'voices', caption: 'A reed melody calls and warm strings answer', bpm: 71, meter: 3,
    tonic: 59, mode: 'minor', lead: 'reed', backing: 'strings', texture: 'held', chords: [0, 2, 3, 6, 0, 5, 4, 0], reply: [7, 6, 2, 4] },
  'WORLD-15': { id: 'island', caption: 'An open plucked melody with airy waves of sound', bpm: 98, meter: 3,
    tonic: 69, mode: 'lydian', lead: 'pluck', backing: 'glass', texture: 'broken', chords: [0, 4, 1, 0, 5, 2, 4, 0], reply: [4, 5, 1, 2] },
  'WORLD-16': { id: 'council', caption: 'The opening theme returns above the low strings', bpm: 78, meter: 4,
    tonic: 60, mode: 'major', lead: 'felt', backing: 'strings', texture: 'held', chords: [0, 5, 3, 0, 1, 5, 4, 0], reply: [2, 4, 6, 7] },
};

const rooms: Record<string, WorldScore> = {
  'aethelgard.study': { id: 'study', caption: 'A little music-box tune in Elsbet’s study', bpm: 74, meter: 3,
    tonic: 60, mode: 'major', lead: 'glass', backing: 'felt', texture: 'broken', chords: [0, 5, 3, 0, 2, 3, 4, 0], reply: [2, 4, 5, 4] },
  'aethelgard.undercroft': { id: 'undercroft', caption: 'The music-box tune returns lower and more slowly', bpm: 62, meter: 4,
    tonic: 53, mode: 'minor', lead: 'bell', backing: 'strings', texture: 'held', chords: [0, 5, 6, 0, 3, 5, 4, 0], reply: [4, 2, 1, 0] },
  'nexus.next-bench': { id: 'bench', caption: 'The same little theme returns with a lighter reply', bpm: 94, meter: 3,
    tonic: 67, mode: 'major', lead: 'felt', backing: 'glass', texture: 'broken', chords: [0, 3, 5, 0, 2, 1, 4, 0], reply: [0, 2, 4, 7] },
};

const scales: Record<Mode, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11],
};
const BAR_COUNT = 16;
const motifSteps: Record<number, number> = { 0: 0, 2: 1, 4: 2, 7: 4, 12: 7 };
export const soundtrackKey = (score: WorldScore): string => `music.campaign.${score.id}`;

export function scoreAt(world: string, map: string): WorldScore | undefined {
  if (Object.hasOwn(rooms, map)) return rooms[map];
  return Object.hasOwn(scores, world) ? scores[world] : undefined;
}

export function soundtrackCaption(key: string): string | undefined {
  const score = [...Object.values(scores), ...Object.values(rooms)].find((value) => soundtrackKey(value) === key);
  return score?.caption;
}

export interface ScoreNote {
  midi: number;
  voice: ScoreVoice;
  at: number;
  duration: number;
  strength: number;
  pan: number;
}

export interface ScoreLoop { duration: number; notes: ScoreNote[] }

/** Arrange the same opening tune as a call, a lower return and a final cadence. */
export function arrangeScore(score: WorldScore): ScoreLoop {
  const beat = 60 / score.bpm;
  const notes: ScoreNote[] = [];
  const add = (degree: number, octave: number, at: number, duration: number, voice: ScoreVoice, strength: number, pan: number) => {
    const midi = score.tonic + scales[score.mode][degree % 7] + 12 * (octave + Math.floor(degree / 7));
    notes.push({ midi, at: at * beat, duration: duration * beat, voice, strength, pan });
  };
  const { meter, texture, lead, backing, chords, reply } = score;
  for (let bar = 0; bar < BAR_COUNT; bar++) {
    const at = bar * meter;
    const chord = chords[bar % chords.length];
    const resolving = bar === BAR_COUNT - 1;
    add(chord, -2, at, meter * 0.79, 'bass', 0.59, 0);
    if (texture === 'held') {
      add(chord + 4, -1, at + 0.25, meter * 0.77, backing, 0.45, -0.46);
      add(chord + 2, -1, at + meter / 2, meter * 0.36, backing, 0.34, 0.46);
    } else {
      const spacing = texture === 'broken' ? 1 : 1.25;
      add(chord, -1, at + 0.5, 0.8, backing, 0.48, -0.48);
      add(chord + 4, -1, at + 0.5 + spacing, 0.9, backing, 0.45, 0.52);
      if (meter === 4 && !resolving) add(chord + 2, -1, at + 3, 0.65, backing, 0.33, -0.16);
    }
    if (bar === 3 || bar === 6 || bar === 11 || bar === 13) {
      reply.forEach((degree, index) => add(degree, bar === 11 ? 1 : 0, at + index * meter / 4,
        meter * 0.21, bar === 6 ? backing : lead, index === 0 ? 0.69 : 0.55, index % 2 ? 0.21 : -0.22));
    }
    if (resolving) add(0, 0, at, meter * 0.77, lead, 0.76, 0);
  }
  for (const [bar, octave, spread] of [[0, 0, 1], [8, -1, 1.12]] as const) {
    STORY_PHRASE.forEach((note, index) => add(motifSteps[note.pitch], octave, bar * meter + note.at * spread,
      note.beats * spread * 0.86, lead, index === 0 ? 0.91 : 0.73, index % 2 ? 0.18 : -0.18));
  }
  return { duration: BAR_COUNT * meter * beat, notes: notes.sort((a, b) => a.at - b.at) };
}
