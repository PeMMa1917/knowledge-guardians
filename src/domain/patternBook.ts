/**
 * The Pattern Book (chapter 10 field game, C-004, X-006). A trader wants to print a weavers' pattern.
 * The player reads three real cases, each about one people separately (the Navajo Nation, the Maasai,
 * the Mixe community of Santa María Tlahuitoltepec), with sources. Then the player makes an offer on
 * consent, credit and share. The weavers answer each term in their own words: the decision is theirs,
 * which is the point of consent. Pure rules.
 */
import data from '../content/pattern-book.json';

export const INTRO = data.intro;
export const CASES = data.cases;
export const ELDER = data.elder;
export const TERMS = data.terms;
export const TEXT = data;
export const SOURCES = data.sources;
const ANSWERS = data.answers as Record<string, string>;

export type Offer = Record<string, string>;

/** The weavers' objections to an offer, one per term they cannot accept. Empty means they will take it to council. */
export function objections(offer: Offer): string[] {
  return TERMS.map((t) => ANSWERS[`${t.id}.${offer[t.id]}`]).filter((x): x is string => !!x);
}

/** A refusal to be asked at all ends the talk: no other term matters. */
export const refused = (offer: Offer): boolean => offer.consent === 'none';
