/**
 * The Reassembly Line (chapter 2 field game, C-004). Three torn river notices: each had a claim, its
 * evidence, and its limit. The player rebuilds them; a strip from another notice, or a rumour used as
 * evidence, is handed back with a reason. Then the player decides which line goes at the top, and Marek
 * and Nasir disagree about it. No order is marked right (OPEN-001). Pure rules.
 */
import data from '../content/reassembly-line.json';

export type Kind = 'claim' | 'evidence' | 'limit';
export type Piece = { id: string; kind: Kind; notice: string | null; text: string };
export const INTRO = data.intro;
export const NOTICES = data.notices;
export const PIECES = data.pieces as Piece[];
export const ORDERS = data.orders;
export const ORDER_REPLIES = data.orderReplies as Record<string, { marek: string; nasir: string }>;
export const TEXT = data;
export const KINDS: Kind[] = ['claim', 'evidence', 'limit'];

const about = (notice: string | null): string => NOTICES.find((n) => n.id === notice)?.about ?? 'something else';

/** Try a piece in a notice under construction (the claim chosen first). Returns null if it fits, else a reason. */
export function tryPiece(claim: Piece, piece: Piece): string | null {
  if (piece.notice === null) return TEXT.rumour;
  if (piece.notice !== claim.notice) return TEXT.wrong.replace('{a}', about(claim.notice)).replace('{b}', about(piece.notice));
  return null;
}

/** The pieces of one kind that are still on the table. */
export const left = (kind: Kind, used: Set<string>): Piece[] => PIECES.filter((p) => p.kind === kind && !used.has(p.id));

/** The line a rebuilt notice shows. */
export const fixedLine = (notice: string): string => TEXT.fixed.replace('{about}', about(notice));
