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
  { game: 'The Festival Dilemma', idea: 'Friends who each advise on one problem from a different ethical view', source: LESSONS },
  { game: 'The Fog Chart', idea: 'A battleship grid of knowledge claims, where each hit reveals a claim and its support', source: LESSONS },
  { game: 'The Token Drawer', idea: 'Who gets remembered: tokens left with children at the Foundling Hospital in London', source: LESSONS },
  { game: 'The Collage Wall', idea: 'Can a picture tell the truth: a collage, an 1819 parliamentary debate about child chimney sweeps, and poems of the time, read together', source: LESSONS },
  { game: 'The River Crossing Inquiry', idea: 'A story where people rank who acted worst and each ranking shows a way of judging (the story is fully rewritten as a flood night, with no sexual content)', source: LESSONS },
  { game: 'The Labyrinth Lens', idea: 'Lens toggles that show hidden paths (the scoring of nuanced or dogmatic answers was left out)', source: LESSONS },
  { game: 'The Survey Bell', idea: 'Ethics limits on research with people, and who decides', source: LESSONS },
  { game: 'The Time Mirror', idea: 'How a past self would see the present (a time mirror)', source: LESSONS },
  { game: 'The Bat Keeper', idea: "Thomas Nagel's question 'What is it like to be a bat?' (1974), about another being's experience", source: `${LESSONS}. Bat facts: London Bat Group, Echolocation and bat detectors; Maryland Department of Natural Resources, Bat Echolocation.` },
  { game: 'The Value Fair', idea: 'An auction of beliefs, played with tokens (never money)', source: LESSONS },
  { game: 'The Lens Table', idea: 'A historical lenses card game: lens, event, question and object cards that change how an event looks', source: LESSONS },
  { game: 'The Sketch Relay', idea: 'Drawing a concept for others to guess, passed along a chain', source: LESSONS },
  { game: 'The Assay Trial', idea: 'Telling minerals apart by streak and density, and what a test cannot tell apart', source: 'Original design for the game. Streak colours and densities are standard mineral data.' },
  { game: 'The Three Trees', idea: 'A "triangle of trees" as a shape the viewer chooses (is mathematics invented or discovered?)', source: LESSONS },
];
