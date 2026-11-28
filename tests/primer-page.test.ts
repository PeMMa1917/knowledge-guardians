import { describe, expect, it } from 'vitest';
import { ANSWERS, CAPTIONS, PICTURES, agree, childAsks, together } from '../src/domain/primerPage';

describe('The Primer Page (chapter 9, C-004)', () => {
  it('says what every picture shows and hides, and gives each a child question', () => {
    for (const p of PICTURES) {
      expect(p.shows.length).toBeGreaterThan(30);
      expect(p.hides.length).toBeGreaterThan(30);
      expect(childAsks(p.id)).not.toContain('{q}');
    }
  });
  it('has one matching caption per picture, and a reply for every pair', () => {
    for (const p of PICTURES) expect(CAPTIONS.filter((c) => agree(p.id, c.id))).toHaveLength(1);
    for (const p of PICTURES) for (const c of CAPTIONS) expect(together(p.id, c.id).length).toBeGreaterThan(40);
  });
  it('replies to every answer to the child', () => {
    for (const a of ANSWERS) expect(a.reply.length).toBeGreaterThan(40);
  });
});
