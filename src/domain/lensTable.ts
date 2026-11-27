/**
 * The Lens Table (chapter 9 signature game, C-004). One event, three people who saw it, three objects
 * it left behind. The player chooses two lenses and two objects; each pair gives one line. Then the
 * keepers say who or what the account leaves out, and the player gives the account a title. Pure rules.
 */
import data from '../content/lens-table.json';

export const EVENT = data.event;
export const LENSES = data.lenses;
export const OBJECTS = data.objects;
export const TITLES = data.titles;
const LINES = data.lines as Record<string, string>;
const MISSING = data.missing as Record<string, string>;

/** The account: one line for each lens and object pair, in the order chosen. */
export function account(lenses: string[], objects: string[]): string[] {
  return lenses.flatMap((l) => objects.map((o) => LINES[`${l}.${o}`]));
}

/** What the account leaves out, most important first: the reason, the evidence, the cost, the company. */
export function leftOut(lenses: string[], objects: string[]): string[] {
  const out: string[] = [];
  if (!lenses.includes('stage')) out.push(MISSING.stage);
  if (!objects.includes('rigging')) out.push(MISSING.rigging);
  if (!objects.includes('ledger')) out.push(MISSING.ledger);
  if (!lenses.includes('actor')) out.push(MISSING.actor);
  return out;
}
