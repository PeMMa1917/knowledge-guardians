/**
 * The Token Drawer (chapter 3 signature game, C-004). Real tokens left with babies at the Foundling
 * Hospital in London (1740s to 1760s). The player chooses what a billet should keep, matches a returning
 * parent's words to a sealed packet, then labels a case of tokens that lost their billets. What a record
 * keeps and loses is the question; no label is marked right (OPEN-001). Pure rules.
 */
import data from '../content/token-drawer.json';

export type Token = { id: string; name: string; text: string; clue: string; billet: string; source: string };
export const NOTE = data.note;
export const INTRO = data.intro;
export const FIELDS = data.fields;
export const TOKENS: Token[] = data.tokens;
export const RETURN = data.return;
export const MATCHED = data.matched;
export const NOT_MATCHED = data.notMatched;
export const DISPLAY = data.display;
export const LABELS = data.labels;
export const SOURCES = data.sources;

/** Fields the player may keep on a billet. */
export const BILLET_SIZE = 3;

/** The fields among a choice that the real billets did not keep. */
export const notKept = (chosen: string[]): string[] => chosen.filter((id) => FIELDS.find((f) => f.id === id)?.kept === false);

/** The parents who return, in order: three tokens, picked by a seed so a replay can differ. */
export function returning(seed: number): Token[] {
  const order = TOKENS.map((t, i) => ({ t, k: (i * 7 + seed * 3) % TOKENS.length }));
  return order.sort((a, b) => a.k - b.k).slice(0, 3).map((x) => x.t);
}

/** True when the parent's words belong to this packet. */
export const matches = (parent: Token, packetId: string): boolean => parent.id === packetId;
