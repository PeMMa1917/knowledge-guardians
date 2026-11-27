/**
 * The Primer Page (chapter 9 field game, C-004). A children's primer has room for one picture and one
 * caption about an event (the opening of a bridge, in the game world). The player chooses; Edda says
 * what the picture shows and Hari what it hides; a caption that agrees with the picture makes what both
 * leave out quieter. Then a child asks a question. No page is marked right (OPEN-001). Pure rules.
 */
import data from '../content/primer-page.json';

export const INTRO = data.intro;
export const PICTURES = data.pictures;
export const CAPTIONS = data.captions;
export const ANSWERS = data.answers;
export const TEXT = data;
const QUESTIONS = data.questions as Record<string, string>;

/** True when the picture and caption tell the same story. */
export const agree = (picture: string, caption: string): boolean =>
  PICTURES.find((p) => p.id === picture)?.subject === CAPTIONS.find((c) => c.id === caption)?.subject;

/** What Hari says about a picture and caption read together. */
export const together = (picture: string, caption: string): string => (agree(picture, caption) ? TEXT.match : TEXT.mismatch);

/** The child's question for a picture. */
export const childAsks = (picture: string): string => TEXT.child.replace('{q}', QUESTIONS[picture]);
