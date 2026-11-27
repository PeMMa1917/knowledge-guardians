// @ts-ignore Node types are not installed; vitest runs in Node.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { IDEA_CREDITS } from '../src/domain/ideaCredits';
import { FIELD_GAMES } from '../src/domain/fieldgames';

describe('credits for the ideas behind the games (decision X-017)', () => {
  it('credits every field game', () => {
    for (const g of FIELD_GAMES) expect(IDEA_CREDITS.some((c) => c.game === g.name), g.name).toBe(true);
  });
  it('lists the same games in CREDITS.md', () => {
    const md = readFileSync('CREDITS.md', 'utf8');
    expect(md).toContain('## Ideas behind the games');
    for (const c of IDEA_CREDITS) expect(md, c.game).toContain(c.game);
  });
});
