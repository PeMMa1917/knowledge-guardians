/**
 * Credits for the ideas behind the games (Mika 2026-11-27, decision X-017, docs/audit/DECISIONS.md).
 *
 * Many games in Knowledge Guardians grew from TOK lessons in Mika's lesson folder, and some of those
 * lessons use well-known puzzles or thought experiments. This list names where each idea came from.
 * It never quotes a lesson or a handout: every game is paraphrased and rebuilt to fit the world.
 * Add an entry when you build a new game from an idea. Keep CREDITS.md ("Ideas behind the games") in step.
 */
export interface IdeaCredit {
  /** The game or encounter in Knowledge Guardians. */
  game: string;
  /** The idea in plain words. */
  idea: string;
  /** Where the idea came from. */
  source: string;
}

const LESSONS = "Mika's TOK lesson folder";

export const IDEA_CREDITS: readonly IdeaCredit[] = [
  { game: "Dov's Three Doors", idea: 'The Monty Hall problem',
    source: `${LESSONS}. The puzzle was set by Steve Selvin in a 1975 letter to The American Statistician and made famous by Marilyn vos Savant's Parade column in 1990. It is named after Monty Hall, host of the TV show Let's Make a Deal.` },
  { game: 'The Ferry Guest Book', idea: 'The birthday problem',
    source: `${LESSONS}. The problem is often credited to the mathematician Richard von Mises (1939).` },
  { game: 'The Proving Floor', idea: 'Guessing a rule from examples and testing it on new cases (induction)',
    source: 'Original to Knowledge Guardians. The idea is close to the rule-discovery task that Peter Wason described in 1960.' },
  { game: 'The Weigh-House Slate', idea: 'Questioning the order of operations', source: LESSONS },
  { game: 'The Missing Word', idea: 'Euphemism, and how a chosen word shapes what people notice', source: LESSONS },
  { game: 'Lanterns and Bones', idea: 'The gambler\'s fallacy, and how many rolls it takes to tell a loaded die', source: LESSONS },
  { game: 'The Ballad of the Guardian', idea: 'How a story changes each time it is retold', source: LESSONS },
  { game: 'The Spare Tag', idea: 'Different kinds of value for the same object', source: LESSONS },
  { game: 'The Careful Dig', idea: 'Excavation as a choice about what later people can know', source: LESSONS },
  { game: 'Star Pictures', idea: 'Measured star positions and the different pictures people draw between them', source: LESSONS },
  { game: "The Copyists' Ladder", idea: 'A word ladder that shows the difference between a pattern and a proof',
    source: `${LESSONS}. The lesson credits an activity shared by the TOK teacher Ric Sims. Word ladders ("doublets") were invented by Lewis Carroll in 1877.` },
  { game: 'The Value Fair', idea: 'An auction of beliefs, played with tokens (never money)', source: LESSONS },
  { game: 'The Lens Table', idea: 'A historical lenses card game: lens, event, question and object cards that change how an event looks', source: LESSONS },
  { game: 'The Sketch Relay', idea: 'Drawing a concept for others to guess, passed along a chain', source: LESSONS },
  { game: 'The Assay Trial', idea: 'Telling minerals apart by streak and density, and what a test cannot tell apart', source: 'Original design for the game. Streak colours and densities are standard mineral data.' },
  { game: 'The Three Trees', idea: 'A "triangle of trees" as a shape the viewer chooses (is mathematics invented or discovered?)', source: LESSONS },
];
