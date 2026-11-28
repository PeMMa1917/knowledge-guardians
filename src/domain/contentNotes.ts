/**
 * Content notes (audit fix C-014, decision X-005, docs/audit/DECISIONS.md). Before a room with hard
 * real history (for example human remains), the player sees a short note and chooses to go in or to
 * step back. Stepping back never costs anything. Choosing to enter remembers the room. Leaving it keeps the invitation for a later visit. Content lives in
 * src/content/content-notes.json. Pure rules, no DOM.
 */
import data from '../content/content-notes.json';
import records from '../content/exhibit-notes.json';

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

export type RecordView='text'|'illustrated';
export interface ExhibitNote { exhibit:string;heading:string;text:string;source:string;url:string; }
export const EXHIBIT_NOTES:readonly ExhibitNote[]=records;
const byExhibit=new Map(EXHIBIT_NOTES.map(note=>[note.exhibit,note]));
export const noteForExhibit=(id:string)=>byExhibit.get(id);
export const recordViewFlag=(id:string)=>'reading-view.'+id;
export function recordView(id:string,flags:Readonly<Record<string,unknown>>):RecordView|'closed'{
  if(!byExhibit.has(id))return 'illustrated';
  const choice=flags[recordViewFlag(id)];
  return choice==='text'||choice==='illustrated'?choice:'closed';
}
