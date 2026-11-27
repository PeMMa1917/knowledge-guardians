/**
 * Shell for research data (decision X-018). Rules are in ../domain/research.ts.
 *
 * Off unless BOTH are true: the build sets VITE_RESEARCH_URL to the project's own https server, and the
 * hosted login has stored the school's consent for this class (localStorage `kg.research.consent` = "yes").
 * The default build sets neither, so it records nothing and makes no network call.
 */
import { dayOf } from '../domain/ledger';
import { enqueue, researchOn, type ResearchConfig, type ResearchEvent } from '../domain/research';

const QUEUE_KEY = 'kg.research.queue';

function config(): ResearchConfig {
  let consent = false;
  try { consent = window.localStorage.getItem('kg.research.consent') === 'yes'; } catch { /* storage blocked */ }
  return { url: String(import.meta.env.VITE_RESEARCH_URL ?? ''), schoolConsent: consent };
}

function readQueue(): ResearchEvent[] {
  try { return JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? '[]'); } catch { return []; }
}

export function recordResearch(kind: ResearchEvent['kind'], id: string, n?: number): void {
  const c = config();
  if (!researchOn(c)) return;
  const queue = enqueue(readQueue(), { kind, id, n, day: dayOf(new Date()) }, c);
  try { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* storage blocked */ }
  if (queue.length >= 25) void flushResearch();
}

/** Send queued events to the project's own server, 50 at a time. Kept on the device if sending fails. */
export async function flushResearch(): Promise<void> {
  const c = config();
  if (!researchOn(c) || !navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;
  const batch = queue.slice(0, 50);
  try {
    const res = await fetch(c.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ events: batch }), credentials: 'include' });
    if (!res.ok) return;
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(batch.length)));
  } catch { /* offline or blocked: try later */ }
}
