/** One original theme, heard before the mystery, with Vesper, and after the Council. */
export const STORY_MOTIFS = ['first-light', 'gold-thread', 'in-the-open'] as const;
export type StoryMotif = typeof STORY_MOTIFS[number];
export const storyMotifKey = (motif: StoryMotif) => `music.story.${motif}`;

export const STORY_PHRASE = [
  { pitch: 0, at: 0, beats: 1 },
  { pitch: 7, at: 1, beats: 0.75 },
  { pitch: 4, at: 1.75, beats: 0.75 },
  { pitch: 2, at: 2.5, beats: 0.5 },
  { pitch: 0, at: 3, beats: 1 },
  { pitch: 4, at: 4, beats: 0.5 },
  { pitch: 7, at: 4.5, beats: 0.5 },
  { pitch: 12, at: 5, beats: 2 },
] as const;

const ACCOMPANIMENT = [
  { pitch: -12, at: 0, beats: 2.5 },
  { pitch: -5, at: 1.5, beats: 1.5 },
  { pitch: -12, at: 3, beats: 3.5 },
  { pitch: -8, at: 4, beats: 2.5 },
  { pitch: -5, at: 5, beats: 2 },
];

export function storyMotif(motif: StoryMotif) {
  const rival = motif === 'gold-thread';
  const resolved = motif === 'in-the-open';
  const root = rival ? 261.63 : 523.25;
  const score = resolved ? [...STORY_PHRASE, ...ACCOMPANIMENT] : STORY_PHRASE;
  const notes = score.map(({ pitch, at, beats }) => ({
    f: root * Math.pow(2, (rival && pitch === 4 ? 3 : pitch) / 12),
    at,
    beats,
  }));
  const voice = rival ? 'pluck' : resolved ? 'marimba' : 'box';
  const beat = rival ? 0.42 : resolved ? 0.36 : 0.39;
  return { notes, voice, beat } as const;
}
