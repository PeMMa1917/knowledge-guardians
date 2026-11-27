/**
 * Lumen offers help when the player seems stuck (Mika 2026-11-27, decision X-011, docs/audit/DECISIONS.md).
 *
 * The setting is on by default. When the player has made no progress for a while, the lantern button
 * glows and Lumen says that help is ready. Lumen never gives the hint itself until the player clicks
 * or presses the hint key, so a puzzle is never spoiled. Pure rules, no DOM.
 */

/** Time without progress before Lumen offers help: three minutes. */
export const STUCK_MS = 3 * 60 * 1000;

export interface OfferState {
  /** The player's setting (on by default). */
  enabled: boolean;
  /** When the player last finished a step, or arrived. */
  lastProgress: number;
  now: number;
  /** A dialogue, panel or menu is open. Lumen waits. */
  busy: boolean;
  /** Lumen already offered for this stretch. One offer until the next progress. */
  offered: boolean;
  /** There is a current step to help with. */
  hasStep: boolean;
}

export function shouldOfferHelp(s: OfferState): boolean {
  return s.enabled && s.hasStep && !s.busy && !s.offered && s.now - s.lastProgress >= STUCK_MS;
}

/** What Lumen says. It names no answer and no hint. */
export const OFFER_LINE = 'I have an idea for this step, when you want it. Click Hint, or press the hint key.';
