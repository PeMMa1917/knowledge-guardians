/**
 * The Time Mirror (chapter 15 signature game, C-004). Elsbet's mirror shows the player's first journal
 * entries beside their latest ones. The player decides how they would rewrite the first, and the past self
 * answers. It uses only the player's own journal; nothing is graded (OPEN-001). Pure rules.
 */
import data from '../content/time-mirror.json';

export const REWRITE = data.rewrite;
export const QUESTION = data.question;

/** The first and the latest entries, without repeats. With few entries, "latest" may be empty. */
export function thenAndNow(journal: string[], n = 2): { then: string[]; now: string[] } {
  const then = journal.slice(0, n);
  const now = journal.slice(Math.max(n, journal.length - n));
  return { then, now };
}
