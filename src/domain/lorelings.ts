/**
 * Lorelings (spec 36.1): befriend by observation, not by catching or fighting.
 *  1. Watch the Loreling in different places (each place is a sighting).
 *  2. Write a pattern note: one answer for each question.
 *  3. Wait in the place the note predicts.
 * If any part of the note is wrong, the Loreling does not come, and the result
 * names a sighting to look at again (a counterexample). Nothing is lost by a
 * wrong try. Lorelings grow when their concept is used in new ways (spec 31.3).
 * Pure rules, no DOM.
 */
import type { ContentPack, LorelingRecord } from './types';

export type OfferResult = { ok: boolean; text: string; recheck: string | null };

export function checkOffer(rec: LorelingRecord, note: Record<string, string | undefined>, place: string, seen: string[]): OfferResult {
  if (seen.length < rec.minSightings) throw new Error('Watch it in more places first');
  for (const q of rec.questions) {
    const pick = note[q.id];
    if (!pick) throw new Error('Finish your note first');
    if (pick === q.answer) continue;
    const o = q.options.find((x) => x.id === pick);
    if (!o) throw new Error('No such option');
    const at = o.contradicts && rec.sightings.find((x) => x.id === o.contradicts);
    const recheck = at ? at.id : null;
    const look = at
      ? seen.includes(at.id) ? `Look again at what you saw at ${at.place}. ${o.why ?? ''}` : `You have not watched it at ${at.place} yet. Try there.`
      : (o.why ?? 'Watch it again.');
    return { ok: false, recheck, text: `You wait, but the ${rec.name} does not come. Your note says "${o.text}". ${look}`.trim() };
  }
  const o = rec.offer.options.find((x) => x.id === place);
  if (!o) throw new Error('No such place');
  if (place !== rec.offer.answer) return { ok: false, recheck: null, text: o.result ?? `You wait there, but the ${rec.name} does not come. Does this place fit your own note?` };
  return { ok: true, recheck: null, text: rec.befriended };
}

/** A pet name the player chose: letters, numbers, spaces, hyphens and apostrophes, 1 to 16 characters. */
export function cleanPetName(name: string): string | null {
  const n = name.replace(/\s+/g, ' ').trim();
  if (!n || n.length > 16 || !/^[\p{L}\p{N} '’-]+$/u.test(n)) return null;
  return n;
}

/**
 * Growth (spec 36.1, 31.3): count the different ways the player used the Loreling's
 * concept in completed steps (world and kind of action).
 * Form 2: the concept used in 2 worlds. Form 3: 3 worlds and 4 kinds of action.
 */
export function lorelingForm(rec: LorelingRecord, pack: ContentPack, objectivesDone: string[]): { form: number; worlds: number; actions: number } {
  const done = new Set(objectivesDone);
  const worlds = new Set<string>(), actions = new Set<string>();
  for (const m of pack.missions) for (const o of m.objectives) {
    if (!done.has(o.id) || !o.weave?.concepts.includes(rec.concept)) continue;
    worlds.add(m.world); actions.add(o.kq?.action ?? 'step');
  }
  const form = worlds.size >= 3 && actions.size >= 4 ? 3 : worlds.size >= 2 ? 2 : 1;
  return { form: Math.min(form, rec.forms.length), worlds: worlds.size, actions: actions.size };
}
