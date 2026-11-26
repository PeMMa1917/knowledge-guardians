/** Approved excerpts from a fictional archive. The carrier's name stays off the desk. */
export const VOICE_SOURCES = ['carrier', 'clerk'] as const;
export const VOICE_VIEWS = ['original', 'guide'] as const;
export type VoiceSource = typeof VOICE_SOURCES[number];
export type VoiceView = typeof VOICE_VIEWS[number];

const excerpts = {
  carrier: {
    label: 'A carrier on the test walk',
    date: 'Lantern 4, dusk',
    original: '“Second lamp, then the rail.”',
    guide: 'A carrier recalls a test walk on Lantern 4 at dusk. From the quay, take the rail after the second lamp.',
    purpose: 'This recollection describes one walk from the quay.',
  },
  clerk: {
    label: 'The opening register',
    date: 'Lantern 6',
    original: '“Lantern 6. Glass Walk opened for public passage.”',
    guide: 'The register starts with the public opening on Lantern 6.',
    purpose: 'This entry records when public passage began.',
  },
} as const;

export function voiceReading(source: string, view: string) {
  if (source !== 'carrier' && source !== 'clerk') throw new Error('That excerpt does not belong to the listening desk.');
  if (view !== 'original' && view !== 'guide') throw new Error('That edition does not belong to the listening desk.');
  const { label, date, purpose } = excerpts[source];
  return { label, date, purpose, text: excerpts[source][view] };
}
