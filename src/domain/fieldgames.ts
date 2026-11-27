/**
 * Field games: playable versions of ideas from Mika's TOK lessons (2026-11-26). Each one is a game
 * in a place, with a person, never a quiz or a worksheet. Finishing one the first time gives marks,
 * may introduce a Fray creature, and adds a line to the Lore codex. Rules for each game live in their
 * own module (fairgames.ts and others); this is the registry. Pure data, no DOM.
 */
export interface FieldGame {
  id: string;
  name: string;
  /** Who runs it, and where. */
  host: string;
  /** The TOK idea, said plainly after the game (shown in the Lore codex). */
  idea: string;
  /** Main concept (one of the 12 TOK concepts). */
  concept: string;
  fray?: string;
}

export const FIELD_GAMES: FieldGame[] = [
  // A trial section: a wrong step restarts the section (decision X-007). Rules in provingFloor.ts.
  { id: 'proving', name: 'The Proving Floor', host: 'Guildmaster Orrin, at the old proving floor under the bell tower in Emberford', concept: 'evidence',
    idea: 'Guessing a rule from a few examples is induction. The guess has to survive new cases. More than one rule can fit the same examples, and only a new case can tell them apart.' },
  { id: 'doors', name: "Dov's Three Doors", host: 'Dov, at the lantern stall in Emberford', concept: 'certainty',
    idea: 'A strong gut feeling can be wrong, and the answer can change when one assumption changes (does the host know?). Many careful runs can correct an intuition; an argument can explain why.' },
  { id: 'guests', name: 'The Ferry Guest Book', host: 'Tova, at the old ferry landing', concept: 'certainty',
    idea: 'A paradox is not a contradiction: it is a true result that surprises intuition. With 23 people, a shared birthday is more likely than not, because there are 253 pairs.' },
  { id: 'slate', name: 'The Weigh-House Slate', host: 'Clerk Venn and Ren, at the Weigh-House', concept: 'interpretation',
    idea: 'The order of operations is a convention people agreed on, not a fact found in nature. When a line can be read two ways, ask what the writer meant, then write it so it can only be read one way.' },
  { id: 'word', name: 'The Missing Word', host: 'Odo the sign-painter, at the notice board in Emberford', concept: 'perspective', fray: 'hush-moth',
    idea: 'Two words can point at the same fact (denotation) and still make people feel and notice different things (connotation). A soft word can hide a hard fact. When a word is missing, a shared problem is hard to talk about, so the person who chooses the words has power.' },
  { id: 'bones', name: 'Lanterns and Bones', host: 'Juno the ferry cook, at the dice table on the landing', concept: 'evidence', fray: 'gamblers-imp',
    idea: 'A fair die does not remember: after a long run without a six, a six is no more likely than before. To tell a loaded die from a fair one you need many rolls, because a few rolls can fool anyone. More evidence lets you be more sure, but never certain.' },
  { id: 'ballad', name: 'The Ballad of the Guardian', host: 'Wynn the ballad-singer, by the east well in Emberford', concept: 'truth',
    idea: 'A story grows each time it is retold, because a good story is made to be told again. Fame is not evidence. A true verse is often less exciting than a tall one, and choosing it has a cost.' },
  { id: 'trade', name: 'The Spare Tag', host: 'people around Emberford and the ferry landing', concept: 'values',
    idea: 'The same thing can be worth different things to different people, and for different kinds of reasons: what it does, what it reminds them of, how it looks, or need. A value is a judgement made by someone, for something.' },
  { id: 'dig', name: 'The Careful Dig', host: 'Site lead Marisol, at the old charcoal camp in the Living Forest', concept: 'evidence',
    idea: 'A tool decides what you can find and what you damage. A find without notes about where it lay loses most of its value as evidence. A site can only be dug once, so digging is also a choice about what later people can know.' },
  { id: 'stars', name: 'Star Pictures', host: 'Night-keeper Anwen, on the Observatory Coast', concept: 'interpretation',
    idea: 'The stars and their measured positions are the same for everyone. The pictures people draw between them differ, and each picture carries real knowledge: when to fish, how to walk home. Measurement and interpretation answer different questions.' },
  { id: 'ladder', name: "The Copyists' Ladder", host: 'Nasir, at his copy desk in the Royal Records Room of the Nile archive', concept: 'certainty',
    idea: 'A pattern seen in many examples can still break on the next one. A proof from the rules of the game holds for every case, even cases nobody has made yet. But a proof covers only what it states: the part it does not state is still a guess.' },
  { id: 'trees', name: 'The Three Trees', host: 'Naturalist Elian and Steward Ayla, at the old grove on the Listening Trail', concept: 'interpretation',
    idea: 'The shape is chosen: one grove holds many triangles, and the word "triangle" is ours. The distances are not chosen: two people pacing from opposite ends get the same number, and three trees in a line will not make a triangle however much we want one. Mathematics may be partly made and partly found.' },
  // A trial section: a wrong call restarts the round (decision X-007). Rules in assayTrial.ts.
  { id: 'assay', name: 'The Assay Trial', host: 'Inspector Corra, at the sample bench in the Metalworks Sample Yard', concept: 'evidence',
    idea: 'Looks mislead in both directions: two yellow stones can differ, and a dull stone can match a bright one. Each test tells some samples apart and not others. A test that cannot tell two things apart does not show that they are the same.' },
];

export const fieldDone = (flags: Record<string, unknown>, id: string): boolean => flags[`field.${id}.done`] === true;
