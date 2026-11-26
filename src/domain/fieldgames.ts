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
  { id: 'doors', name: "Pell's Three Doors", host: 'Pell, at the lantern stall in Emberford', concept: 'certainty',
    idea: 'A strong gut feeling can be wrong, and the answer can change when one assumption changes (does the host know?). Many careful runs can correct an intuition; an argument can explain why.' },
  { id: 'guests', name: 'The Ferry Guest Book', host: 'Tova, at the old ferry landing', concept: 'certainty',
    idea: 'A paradox is not a contradiction: it is a true result that surprises intuition. With 23 people, a shared birthday is more likely than not, because there are 253 pairs.' },
  { id: 'slate', name: 'The Weigh-House Slate', host: 'Clerk Venn and Ren, at the Weigh-House', concept: 'interpretation',
    idea: 'The order of operations is a convention people agreed on, not a fact found in nature. When a line can be read two ways, ask what the writer meant, then write it so it can only be read one way.' },
  { id: 'word', name: 'The Missing Word', host: 'Odo the sign-painter, at the notice board in Emberford', concept: 'perspective', fray: 'hush-moth',
    idea: 'Two words can point at the same fact (denotation) and still make people feel and notice different things (connotation). A soft word can hide a hard fact. When a word is missing, a shared problem is hard to talk about, so the person who chooses the words has power.' },
];

export const fieldDone = (flags: Record<string, unknown>, id: string): boolean => flags[`field.${id}.done`] === true;
