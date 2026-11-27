/**
 * Thinkers and named views (Mika 2026-11-27, decisions X-012 and X-015, docs/audit/DECISIONS.md).
 *
 * Views of truth (correspondence, coherence, pragmatic) and of ethics (virtue, duty, consequences, care,
 * ubuntu) have names, and real thinkers who held them. The student meets a thinker through Lumen's
 * advisor call when stuck; later chapters add thinkers as people in the world with their own quests.
 * Each view the student meets is tracked in the journal. All lines are written in advance (no runtime AI).
 * Content: src/content/thinkers.json. Pure rules, no DOM.
 */
import data from '../content/thinkers.json';

export type ViewFamily = 'truth' | 'ethics';
export interface View { id: string; family: ViewFamily; name: string; plain: string }
export interface Thinker {
  id: string; name: string; life: string; place: string; views: string[];
  summary: string; source: { title: string; url?: string };
  /** Advice for a stuck student, by view id. Written for the game; not a quotation. */
  advice: Record<string, string>;
}

export const VIEWS = data.views as View[];
export const THINKERS = data.thinkers as unknown as Thinker[];

export const viewFlag = (view: string): string => `view.${view}.met`;
export const thinkerFlag = (thinker: string): string => `thinker.${thinker}.met`;

/** Flags to set when the student hears a thinker: the thinker, and each of their views. */
export function meetFlags(t: Thinker): string[] {
  return [thinkerFlag(t.id), ...t.views.map(viewFlag)];
}

export function viewsMet(flags: Record<string, unknown>): View[] {
  return VIEWS.filter((v) => flags[viewFlag(v.id)] === true);
}

export function thinkersFor(view: string): Thinker[] {
  return THINKERS.filter((t) => t.views.includes(view));
}

/** The label shown with every advisor line, so nobody takes it for a real quotation. */
export function adviceLabel(t: Thinker): string {
  return `Imagined advice in the spirit of ${t.name}. Their real ideas: ${t.source.title}.`;
}
