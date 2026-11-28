/**
 * Two replies after a key choice (Mika 2026-11-27, decision X-008, docs/audit/DECISIONS.md).
 *
 * After some choices, two characters who disagree each give a strong reply, with their reasons.
 * Neither reply is marked as better: the player hears two good arguments and keeps their own judgement
 * (OPEN-001). Each entry shows once. Content lives in src/content/two-replies.json. Pure rules, no DOM.
 */
import data from '../content/two-replies.json';
import type { Condition } from './types';

export interface TwoReply { speaker: string; text: string }
export interface TwoRepliesEntry { id: string; after: Condition; heading: string; replies: [TwoReply, TwoReply] }

export const TWO_REPLIES = data.twoReplies as unknown as TwoRepliesEntry[];

export const seenFlag = (id: string): string => `two.${id}.seen`;

/** The first entry whose condition has become true and that the player has not seen yet. */
export function pendingTwoReplies(
  flags: Record<string, unknown>, check: (c: Condition) => boolean, entries: readonly TwoRepliesEntry[] = TWO_REPLIES,
): TwoRepliesEntry | null {
  return entries.find((e) => flags[seenFlag(e.id)] !== true && check(e.after)) ?? null;
}
