import { describe, expect, it } from 'vitest';
import { CONTENT_NOTES, contentNoteFor, noteSeenFlag } from '../src/domain/contentNotes';
import { MAPS } from '../src/maps';

describe('content notes (C-014)', () => {
  it('each note names real maps, a real place to step back to, and https sources', () => {
    for (const n of CONTENT_NOTES) {
      for (const m of [...n.maps, n.stepBack.map]) expect(MAPS[m], m).toBeTruthy();
      expect(n.maps).not.toContain(n.stepBack.map);
      expect(n.sources.length).toBeGreaterThan(0);
      for (const s of n.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('shows once, on the first entry to any of its maps', () => {
    const n = CONTENT_NOTES[0];
    expect(contentNoteFor(n.maps[0], {})?.id).toBe(n.id);
    expect(contentNoteFor(n.maps[0], { [noteSeenFlag(n.id)]: true })).toBeNull();
    expect(contentNoteFor('nexus.archive', {})).toBeNull();
  });
});

import {EXHIBIT_NOTES,noteForExhibit,recordView,recordViewFlag} from '../src/domain/contentNotes';
import {buildPack} from '../src/content';
import {TAKU_EXHIBIT,TAKU_PRINT,takuDescription} from '../src/domain/takuPrint';
import {nightByExhibit,nightReading} from '../src/domain/nightRegister';
describe('Stand-level invitations',()=>{
  it('keeps local decisions independent across five specific records and their ordinary neighbours',()=>{
    const pack=buildPack(),flags:Record<string,unknown>={};
    const ids=EXHIBIT_NOTES.map(n=>n.exhibit);expect(new Set(ids).size).toBe(5);
    for(const n of EXHIBIT_NOTES){
      expect(n.url).toMatch(/^https:\/\//);expect(noteForExhibit(n.exhibit)).toBe(n);
      const e=pack.exhibits.find(r=>r.id===n.exhibit)!;
      expect(e.specimen).toBeTruthy();
      const room=Object.values(MAPS).find(m=>m.interactables.some(p=>p.exhibit===e.id));
      expect(room).toBeTruthy();expect(contentNoteFor(room!.id,flags)).toBeNull();
      expect(recordView(e.id,flags)).toBe('closed');flags[recordViewFlag(e.id)]='text';
      expect(recordView(e.id,JSON.parse(JSON.stringify(flags)))).toBe('text');
      flags[recordViewFlag(e.id)]='illustrated';
      expect(recordView(e.id,flags)).toBe('illustrated');
      flags[recordViewFlag(e.id)]=true;expect(recordView(e.id,flags)).toBe('closed');
    }
    expect(recordView('OBJ-001-A',flags)).toBe('illustrated');
    expect(recordView(ids[2],{[recordViewFlag(ids[3])]:'illustrated'})).toBe('closed');
  });
  it('lets the text reader inspect the album, crop and title as different evidence',()=>{
    const w=nightByExhibit.get(TAKU_EXHIBIT)!;expect(w.id).toBe(TAKU_PRINT);
    expect(nightReading(w,'left')).toContain('outside this crop');
    expect(nightReading(w,'right')).toContain('other end');
    expect(nightReading(w,'date')).toContain('title');
    expect(nightReading(w,'date')).toContain('2,000');
    expect(nightReading(w,'maker')).toContain('no testimony');
    expect(nightReading(w,'accession')).toContain(w.accession);
    expect(takuDescription('original')).toContain('does not supply a count');
  });
});
