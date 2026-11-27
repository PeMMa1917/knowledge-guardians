/**
 * The River Crossing Inquiry (chapter 11 signature game, C-004). An original village story: one flood
 * night, five people, one boat lost. The player ranks who acted worst. The person put first shows a way
 * of judging, voiced by a villager who ranked the same way. Omi and Sena show their own ranks, then a new
 * fact arrives and the player can rank again. No rank is marked right (OPEN-001). Pure rules.
 */
import data from '../content/river-crossing.json';

export type Person = { id: string; name: string; did: string };
export const STORY: string[] = data.story;
export const PEOPLE: Person[] = data.people;
export const KEEPERS = data.keepers;
export const FACT = data.fact;
export const AFTER = data.after;
export const CLOSE = data.close;
export const RULE = data.rule;
const VIEWS = data.views as Record<string, { who: string; line: string }>;

/** The way of judging each first place shows. The journal names them (X-012); the game does not. */
export const VIEW_NAMES: Record<string, string> = {
  tamsin: 'duty', orrin: 'character', pell: 'care', ravel: 'consequences', council: 'justice',
};

/** True when the rank holds every person once. */
export const complete = (rank: string[]): boolean =>
  rank.length === PEOPLE.length && PEOPLE.every((p) => rank.includes(p.id));

/** The villager who would put this person first, and what they say. */
export const voiceFor = (id: string): { who: string; line: string } => VIEWS[id];

/** Places moved by each person between two ranks: positive means judged less harshly now. */
export function moves(before: string[], after: string[]): Record<string, number> {
  return Object.fromEntries(PEOPLE.map((p) => [p.id, after.indexOf(p.id) - before.indexOf(p.id)]));
}

/** After the new fact about Ravel's boat: did the player judge him less harshly? */
export const ravelMoved = (before: string[], after: string[]): boolean => moves(before, after).ravel > 0;

/** How far two ranks agree: the number of people in the same place. */
export const samePlaces = (a: string[], b: string[]): number => a.filter((id, i) => b[i] === id).length;
