/**
 * The Collage Wall (chapter 13 signature game, C-004). Four real records about child chimney sweeps in
 * Britain: a street print (1804), Blake's poem (1789), the House of Lords debate (1819) and an engraving
 * of a sweeping machine. The player joins two cards with thread; each join tells something neither card
 * tells alone. Then the keepers name the voice the wall lacks, and the player says which card tells most.
 * No answer is marked right (OPEN-001). Pure rules.
 */
import data from '../content/collage-wall.json';

export type Card = { id: string; name: string; date: string; text: string; source: string };
export const NOTE = data.note;
export const CARDS: Card[] = data.cards;
export const MISSING = data.missing;
export const ASKS = data.asks;
export const SOURCES = data.sources;
const JOINS = data.joins as Record<string, string>;

/** The key for a pair of cards, the same in either order. */
export const joinKey = (a: string, b: string): string => [a, b].sort().join('.');

/** What joining two different cards shows, or null for a card joined to itself. */
export const join = (a: string, b: string): string | null => (a === b ? null : JOINS[joinKey(a, b)] ?? null);

/** Every possible pair of the cards. */
export const ALL_PAIRS: [string, string][] = CARDS.flatMap((a, i) => CARDS.slice(i + 1).map((b) => [a.id, b.id] as [string, string]));

/** Joins needed before the keepers name what is missing. */
export const JOINS_TO_STEP_BACK = 3;
