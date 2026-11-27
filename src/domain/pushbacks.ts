/**
 * Pushback after a weighed judgement (C-016, docs/audit/CONSENSUS.md). After some choices, a person
 * affected by the choice pushes back, in words that depend on what the player chose. The player answers:
 * keep it and say why, change it, or ask what would change the other person's mind. Every answer gets a
 * reply; none is marked right (OPEN-001). Each pushback shows once. Content: src/content/pushbacks.json.
 */
import data from '../content/pushbacks.json';

export interface PushAnswer { id: string; text: string; reply: string }
export interface Pushback { id: string; flag: string; speaker: string; heading: string; byValue: Record<string, string>; answers: PushAnswer[] }

export const PUSHBACKS = data.pushbacks as unknown as Pushback[];

export const pushSeenFlag = (id: string): string => `push.${id}.seen`;
export const pushAnswerFlag = (id: string): string => `push.${id}.answer`;

/** The first pushback whose choice has been made and that the player has not seen yet, with its text. */
export function pendingPushback(flags: Record<string, unknown>, entries: readonly Pushback[] = PUSHBACKS): { entry: Pushback; text: string } | null {
  for (const e of entries) {
    if (flags[pushSeenFlag(e.id)] === true) continue;
    const v = flags[e.flag];
    if (v === undefined || v === null || v === false) continue;
    const text = e.byValue[String(v)];
    if (text) return { entry: e, text };
  }
  return null;
}
