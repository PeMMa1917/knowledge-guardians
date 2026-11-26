/**
 * The player character (spec 35.1): pronouns and origin. Pure rules, no DOM.
 * Characters use the chosen pronouns through text tokens:
 * {name}, {they}, {them}, {their} and the capitalised {They}, {Them}, {Their}.
 * Write lines so that the verb does not depend on the pronoun
 * (for example "{they} found the seal", not "{they} is ...").
 */
import type { PlayerRecord, Pronouns } from './types';

export const PRONOUN_SETS: { id: string; label: string; p: Pronouns }[] = [
  { id: 'they', label: 'they / them', p: { subject: 'they', object: 'them', possessive: 'their' } },
  { id: 'she', label: 'she / her', p: { subject: 'she', object: 'her', possessive: 'her' } },
  { id: 'he', label: 'he / him', p: { subject: 'he', object: 'him', possessive: 'his' } },
];

export const DEFAULT_PRONOUNS: Pronouns = PRONOUN_SETS[0].p;

const clean = (w: string) => w.replace(/[^\p{L}\p{M}'-]/gu, '').slice(0, 16);

/** Tidy free-choice pronouns. Empty parts fall back to they/them/their. */
export function cleanPronouns(p: Partial<Pronouns>): Pronouns {
  return {
    subject: clean(p.subject ?? '') || DEFAULT_PRONOUNS.subject,
    object: clean(p.object ?? '') || DEFAULT_PRONOUNS.object,
    possessive: clean(p.possessive ?? '') || DEFAULT_PRONOUNS.possessive,
  };
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Replace the player tokens in a line of text. Unknown tokens stay as they are. */
export function personalise(text: string, player: PlayerRecord): string {
  if (!text.includes('{')) return text;
  const pr = player.pronouns ?? DEFAULT_PRONOUNS;
  const map: Record<string, string> = {
    name: player.name, they: pr.subject, them: pr.object, their: pr.possessive,
    They: cap(pr.subject), Them: cap(pr.object), Their: cap(pr.possessive),
  };
  return text.replace(/\{(name|they|them|their|They|Them|Their)\}/g, (_, k: string) => map[k]);
}
