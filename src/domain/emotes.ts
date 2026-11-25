/**
 * Emotes (spec 47.4, C1 "a few"): short, friendly signals with no game effect.
 * Nearby people answer with a small mark. Nothing is scored.
 */
export interface Emote { id: string; label: string; caption: string; reply: string }

export const EMOTES: Emote[] = [
  { id: 'wave', label: 'Wave', caption: 'You wave', reply: 'wave' },
  { id: 'cheer', label: 'Cheer', caption: 'You cheer', reply: 'cheer' },
  { id: 'think', label: 'Think', caption: 'You think', reply: 'think' },
  { id: 'idea', label: 'Idea!', caption: 'You have an idea', reply: 'cheer' },
  { id: 'question', label: 'Question', caption: 'You look puzzled', reply: 'think' },
  { id: 'heart', label: 'Thanks', caption: 'You say thank you', reply: 'heart' },
];

/** 9 x 9 pixel icons for the emote bubbles (original art). '#' dark, 'o' colour, '+' light. */
export const EMOTE_ICONS: Record<string, { colour: string; rows: string[] }> = {
  wave: { colour: '#f2d27a', rows: ['..o.o.o..', '..o.o.o.o', '..o.o.o.o', 'o.ooooooo', 'ooooooooo', '.oooooooo', '..ooooooo', '...ooooo.', '....ooo..'] },
  cheer: { colour: '#ff9d5a', rows: ['....o....', '.o..o..o.', '..o.+.o..', '...+++...', 'oo+++++oo', '...+++...', '..o.+.o..', '.o..o..o.', '....o....'] },
  think: { colour: '#c8c0e8', rows: ['.........', '.........', '.........', '.........', 'oo..oo..oo', 'oo..oo..oo', '.........', '.........', '.........'] },
  idea: { colour: '#fff2a0', rows: ['..ooooo..', '.ooo+ooo.', '.oo+++oo.', '.ooo+ooo.', '..ooooo..', '...ooo...', '...###...', '...###...', '....#....'] },
  question: { colour: '#9fe8ff', rows: ['..ooooo..', '.oo...oo.', '......oo.', '.....oo..', '....oo...', '....oo...', '.........', '....oo...', '....oo...'] },
  heart: { colour: '#ff7aa0', rows: ['.........', '.oo...oo.', 'oooo.oooo', 'ooooooooo', 'ooooooooo', '.ooooooo.', '..ooooo..', '...ooo...', '....o....'] },
};
