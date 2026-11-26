/**
 * Word games from the language lessons (Mika's TOK lessons, 2026-11-26). Played, never asked as a quiz.
 *
 * - The Missing Word: Odo the sign-painter must paint one fact on the town notice board. Three words
 *   point at the same fact (denotation) but make people notice different things (connotation). The
 *   player's choice stays on the board, and people talk about it. Then a Hush Moth has eaten a word
 *   from Odo's word chest: three people try to say a feeling that has no name. The player coins one.
 * TOK link: language and power, denotation and connotation, euphemism, perspective. Fictional town only.
 * There is no hidden correct word: each choice is explained by what it makes people notice.
 */

export interface Reader { id: string; who: string; about: string }
export interface Wording { id: string; word: string; line: string; tone: string; says: Record<string, string> }
export interface Coinage { id: string; word: string; whose: string; meaning: string; centre: string }

/** The fact itself, the same in every wording. */
export const FACT = { from: 2, to: 4, what: 'the bridge toll', reason: 'to mend the rotten beams under the bridge' };

/** The three people who read the notice. Each has their own voice. */
export const READERS: Reader[] = [
  { id: 'hobb', who: 'Hobb the carter', about: 'crosses the bridge six times a day with his cart; speaks short and plain' },
  { id: 'maudie', who: 'Maudie the toll-keeper', about: 'asked for the notice; proud, careful, a little formal' },
  { id: 'pim', who: 'Pim', about: 'a child who counts everything and asks about every word' },
];

export const WORDINGS: Wording[] = [
  { id: 'adjusted', word: 'adjusted', line: 'The bridge toll is ADJUSTED to 4 marks.', tone: 'Soft. It sounds small and careful, and it hides which way the toll moved.',
    says: {
      hobb: "'Adjusted. Adjusted which way? Up, I bet. Why not just say so?'",
      maudie: "'Good. Calm words keep a calm bridge.'",
      pim: "'What does adjusted mean? My shoelaces are adjusted. Did the toll get tighter?'",
    } },
  { id: 'raised', word: 'raised', line: 'The bridge toll is RAISED to 4 marks.', tone: 'Plain. It says which way the toll moved, but not how far.',
    says: {
      hobb: "'Raised. Fair enough to say it out loud. Still hurts.'",
      maudie: "'It is true, I suppose. I hoped for a gentler word.'",
      pim: "'Raised from what? I want the numbers!'",
    } },
  { id: 'doubled', word: 'doubled', line: 'The bridge toll is DOUBLED to 4 marks.', tone: 'Strong. It says how far the toll moved, and it sounds like an alarm.',
    says: {
      hobb: "'Doubled! Six times a day! I will take the long ford.'",
      maudie: "'That makes me sound greedy. The beams are rotten, and nobody will read that part.'",
      pim: "'Two to four is twice. That is the right sum!'",
    } },
];

/** What each reader says when the reason is painted too. */
export const WITH_REASON: Record<string, string> = {
  hobb: "'Rotten beams. Well. I would rather pay than swim.'",
  maudie: "'Thank you. Now they can see why, not only how much.'",
  pim: "'Can I see the rotten beams? Are they very rotten?'",
};

/** The feeling the Hush Moth took the word for, as each person tries to say it. */
export const ATTEMPTS: Record<string, string> = {
  hobb: "'It is when a rule is the same for everyone, but it lands hardest on the ones who cross most. There used to be a word. It is gone.'",
  maudie: "'It is when you must say a rule you did not choose, and people blame your face for it. I cannot find the word.'",
  pim: "'It is when a grown-up says it is fair because it is the same for everybody, but it does not feel fair. What is the word?'",
};

export const COINAGES: Coinage[] = [
  { id: 'heavy-even', word: 'heavy-even', whose: 'hobb', meaning: 'a rule that is even on paper and heavy in life',
    centre: "It puts the people who cross most at the centre. Hobb can now say why the toll weighs on him, and others nod." },
  { id: 'toll-face', word: 'toll-face', whose: 'maudie', meaning: 'being blamed for a rule you only carry',
    centre: "It puts the person who carries the rule at the centre. People begin to ask who chose the rule, not only who says it." },
  { id: 'same-not-fair', word: 'same-not-fair', whose: 'pim', meaning: 'when the same is not the same as fair',
    centre: "It puts the question at the centre. Now even a child can ask the grown-ups to explain, and they must answer." },
];

export const wordingOf = (id: unknown): Wording | undefined => WORDINGS.find((w) => w.id === id);
export const coinageOf = (id: unknown): Coinage | undefined => COINAGES.find((c) => c.id === id);

/** The text the notice board shows after the player has painted it. */
export function paintedNotice(flags: Record<string, unknown>): string | null {
  const w = wordingOf(flags['word.painted']);
  if (!w) return null;
  return flags['word.reason'] === true ? `${w.line} Reason: ${FACT.reason}.` : w.line;
}
