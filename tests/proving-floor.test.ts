import { describe, expect, it } from 'vitest';
import { ROWS, SECTIONS, buildFloor, startTrial, step, tileWords } from '../src/domain/provingFloor';
import { FIELD_GAMES } from '../src/domain/fieldgames';

const correct = (row: { shape: string; colour: string; count: number }[], s: number) =>
  row.findIndex((t) => SECTIONS[s].rule(t as never));

describe('the Proving Floor trial (decision X-007)', () => {
  it('builds rows with exactly one tile that follows the rule', () => {
    for (const section of SECTIONS) for (const seed of [1, 2, 3, 99]) {
      const floor = buildFloor(section, seed);
      expect(floor).toHaveLength(ROWS);
      for (const row of floor) expect(row.filter(section.rule)).toHaveLength(1);
    }
  });
  it('every example tile follows its section rule', () => {
    for (const section of SECTIONS) for (const t of section.examples) expect(section.rule(t), section.id).toBe(true);
  });
  it('the last section has two rules that fit its examples, and its first row tells them apart', () => {
    const last = SECTIONS[SECTIONS.length - 1];
    expect(last.examples.every((t) => t.colour === 'gold' && t.count === 1)).toBe(true);
    const goldOnly = last.firstRow!.filter((t) => t.colour === 'gold');
    expect(goldOnly.some((t) => !last.rule(t))).toBe(true);
  });
  it('a crack restarts only the current section, with a new floor, and counts no penalty', () => {
    let s = startTrial(5);
    for (let r = 0; r < ROWS; r++) s = step(s, correct(s.floor[s.row], 0), 5).state;
    expect(s.section).toBe(1);
    s = step(s, correct(s.floor[0], 1), 5).state;
    expect(s.row).toBe(1);
    const wrong = s.floor[1].findIndex((t) => !SECTIONS[1].rule(t));
    const cracked = step(s, wrong, 5);
    expect(cracked.result).toBe('cracked');
    expect(cracked.state).toMatchObject({ section: 1, row: 0, cracks: 1, attempt: 1 });
  });
  it('finishes after every section is crossed and is registered as a field game', () => {
    let s = startTrial(8);
    let last = 'held';
    while (s.section < SECTIONS.length) {
      const out = step(s, correct(s.floor[s.row], s.section), 8);
      s = out.state; last = out.result;
    }
    expect(last).toBe('finished');
    expect(FIELD_GAMES.some((g) => g.id === 'proving')).toBe(true);
    expect(tileWords({ shape: 'circle', colour: 'gold', count: 2 })).toBe('2 gold circles');
  });
});
