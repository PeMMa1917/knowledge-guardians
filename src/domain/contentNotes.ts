/**
 * Content notes (audit fix C-014, decision X-005, docs/audit/DECISIONS.md). Before a room with hard
 * real history (for example human remains), the player sees a short note and chooses to go in or to
 * step back. Stepping back never costs anything. Each note shows once. Content lives in
 * src/content/content-notes.json. Pure rules, no DOM.
 */
import data from '../content/content-notes.json';

export interface ContentNote {
  id: string;
  maps: string[];
  heading: string;
  text: string;
  stepBack: { map: string; label: string };
  sources: { title: string; url: string }[];
}

export const CONTENT_NOTES = data.notes as ContentNote[];

export const noteSeenFlag = (id: string): string => `note.${id}.seen`;

/** The note to show on entering `mapId`, or null when there is none or it was already seen. */
export function contentNoteFor(mapId: string, flags: Record<string, unknown>, notes: readonly ContentNote[] = CONTENT_NOTES): ContentNote | null {
  return notes.find((n) => n.maps.includes(mapId) && flags[noteSeenFlag(n.id)] !== true) ?? null;
}
