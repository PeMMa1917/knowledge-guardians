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
