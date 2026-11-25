/**
 * Title Lock (spec 92.2 step 1): the player narrows a broad topic into a
 * focused, arguable research question for EE practice. Pure rules.
 *
 * The question is the chosen option texts joined in part order. The lock
 * opens when every chosen option is `ok`. Many combinations open it, so
 * there is no single correct question (OPEN-001). The topics are authored:
 * the game never takes or stores the student's own research question (EE-002).
 */
import type { TitleLockRecord } from './types';

export interface LockResult {
  opened: boolean;
  question: string;
  /** One line per part that is not ready, or the open line. */
  lines: string[];
}

export function tryLock(rec: TitleLockRecord, choice: Record<string, string>): LockResult {
  const lines: string[] = [];
  const words: string[] = [];
  for (const part of rec.parts) {
    const opt = part.options.find((o) => o.id === choice[part.id]);
    if (!opt) throw new Error(`Choose a ring: ${part.label}`);
    words.push(opt.text);
    if (!opt.ok) lines.push(opt.why);
  }
  const question = words.join(' ').replace(/\s+([?,.])/g, '$1');
  if (lines.length === 0) lines.push(rec.openLine);
  return { opened: lines[0] === rec.openLine, question, lines };
}

/** Count of option combinations that open the lock (for the validator). */
export function openCombinations(rec: TitleLockRecord): number {
  return rec.parts.reduce((n, p) => n * p.options.filter((o) => o.ok).length, 1);
}
