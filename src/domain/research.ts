/**
 * Research data (Mika 2026-11-27, decision X-018, docs/audit/DECISIONS.md): real data shows what works.
 *
 * Rules that keep students safe:
 *  - Events go only to the project's own server (the hosted build, docs/ACCOUNTS_AND_HOSTING.md), never to
 *    a third-party analytics service. Without a configured server URL, nothing is recorded or sent.
 *  - The school turns research data on for its classes. Until the hosted build passes that consent to the
 *    game, the switch is off.
 *  - Least data: play events only. Never names, usernames, free text, journal writing or answers.
 *  - The offline build works the same with no network.
 * Pure rules, no DOM: the shell supplies storage and sending.
 */

export const RESEARCH_EVENTS = ['objective-done', 'hint', 'field-game', 'timed-replay', 'trial-crack'] as const;
export type ResearchKind = typeof RESEARCH_EVENTS[number];

export interface ResearchEvent {
  kind: ResearchKind;
  /** A content id (objective or field game). Never free text. */
  id: string;
  /** A small number where it helps (hint depth, seconds, cracks). */
  n?: number;
  /** Day only (YYYY-MM-DD), not the time, so a session cannot be traced to a lesson. */
  day: string;
}

/** Content ids are short, lower-case and dotted. Anything else is dropped. */
const SAFE_ID = /^[a-z0-9][a-z0-9.:_-]{0,79}$/;

export function sanitise(raw: Partial<ResearchEvent>): ResearchEvent | null {
  if (!raw.kind || !RESEARCH_EVENTS.includes(raw.kind)) return null;
  if (typeof raw.id !== 'string' || !SAFE_ID.test(raw.id)) return null;
  if (typeof raw.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.day)) return null;
  const e: ResearchEvent = { kind: raw.kind, id: raw.id, day: raw.day };
  if (typeof raw.n === 'number' && Number.isFinite(raw.n) && raw.n >= 0 && raw.n <= 100_000) e.n = Math.round(raw.n);
  return e;
}

export interface ResearchConfig {
  /** The project's own server endpoint, from the hosted build. Empty means research data is off. */
  url: string;
  /** The school's consent for this class, passed by the hosted build. */
  schoolConsent: boolean;
}

export const researchOn = (c: ResearchConfig): boolean => c.schoolConsent && /^https:\/\//.test(c.url);

/** The queue never grows past this, so a long offline stretch cannot fill the device. */
export const QUEUE_LIMIT = 500;

export function enqueue(queue: readonly ResearchEvent[], raw: Partial<ResearchEvent>, c: ResearchConfig): ResearchEvent[] {
  if (!researchOn(c)) return [];
  const e = sanitise(raw);
  if (!e) return queue.slice();
  return [...queue, e].slice(-QUEUE_LIMIT);
}
