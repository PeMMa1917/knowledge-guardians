import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { OPPONENT, judgeYarn, viewBoard } from '../src/domain/clueboard';
import { Driver } from './driver';

const pack = buildPack();
const sd = pack.showdowns.find((x) => x.id === 'corvan')!;
const B = 'corvan-board';

describe('practice clue board (spec 47)', () => {
  it('red yarn cracks the link a card touches; an unrelated card falls off', () => {
    expect(judgeYarn(sd, OPPONENT, 'card.guild-ledger')).toMatchObject({ tone: 'taut', cracks: ['ancient'] });
    expect(judgeYarn(sd, OPPONENT, 'card.loud-patent').tone).toBe('falls');
  });
  it('gold yarn sags on an overreaching claim and is taut on a fair one', () => {
    expect(judgeYarn(sd, 'fake', 'card.workshop-diagram').tone).toBe('sag');
    expect(judgeYarn(sd, 'honest', 'card.workshop-diagram').tone).toBe('taut');
    expect(judgeYarn(sd, 'honest', 'card.damascus-terms').tone).toBe('falls');
  });
  it('a claim with no taut yarn glows; the board is done when every link is cracked and one fair claim holds', () => {
    const v0 = viewBoard(sd, []);
    expect(v0.claims.honest.glow).toBe(true);
    expect(v0.claims[OPPONENT].glow).toBe(true);
    const pins = [
      { claim: OPPONENT, card: 'card.forge-pattern' }, { claim: OPPONENT, card: 'card.guild-ledger' }, { claim: OPPONENT, card: 'card.damascus-terms' },
      { claim: 'honest', card: 'card.workshop-diagram' }, { claim: 'honest', card: 'card.guild-ledger' },
    ];
    const v = viewBoard(sd, pins);
    expect(v.claims[OPPONENT].glow).toBe(false);
    expect(v.claims.honest.glow).toBe(false);
    expect(v.done).toBe(true);
    expect(viewBoard(sd, pins.slice(0, 4)).done).toBe(false);
  });
  it('the engine keeps taut and sagging yarn, drops fallen yarn, and pays once', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'PinYarn', board: B, claim: OPPONENT, card: 'card.guild-ledger' })).toThrow(/do not have/);
    d.s.cards.push('card.forge-pattern', 'card.guild-ledger', 'card.damascus-terms', 'card.workshop-diagram', 'card.loud-patent');
    d.run({ type: 'PinYarn', board: B, claim: OPPONENT, card: 'card.loud-patent' });
    expect(d.s.flags[`yarn.${B}.${OPPONENT}.card.loud-patent`]).toBeUndefined();
    for (const c of ['card.forge-pattern', 'card.guild-ledger', 'card.damascus-terms']) d.run({ type: 'PinYarn', board: B, claim: OPPONENT, card: c });
    d.run({ type: 'PinYarn', board: B, claim: 'honest', card: 'card.workshop-diagram' });
    const o = d.run({ type: 'PinYarn', board: B, claim: 'honest', card: 'card.guild-ledger' });
    expect(o.events.find((e) => e.kind === 'yarn')).toMatchObject({ done: true, tone: 'taut' });
    expect(d.s.flags['board.corvan-board.done']).toBe(true);
    expect(d.s.journal).toContain('j.board');
  });
});

describe('Zen mode (spec 47.4)', () => {
  it('a relaxed Showdown never ends on the turn limit, only when the player rests', () => {
    const d = new Driver();
    d.run({ type: 'ShowdownStart', showdown: 'corvan', relaxed: true });
    d.run({ type: 'ShowdownMove', move: { move: 'claim', claim: 'honest' } });
    for (let i = 0; i < sd.crowd.patience + 3; i++) d.run({ type: 'ShowdownMove', move: { move: 'source' } });
    expect(d.s.showdown!.outcome).toBeNull();
    d.run({ type: 'ShowdownMove', move: { move: 'rest' } });
    expect(d.s.showdown!.outcome).not.toBeNull();
  });
  it('a normal Showdown still ends at the turn limit', () => {
    const d = new Driver();
    d.run({ type: 'ShowdownStart', showdown: 'corvan' });
    d.run({ type: 'ShowdownMove', move: { move: 'claim', claim: 'honest' } });
    for (let i = 0; i < sd.crowd.patience + 3 && !d.s.showdown!.outcome; i++) d.run({ type: 'ShowdownMove', move: { move: 'source' } });
    expect(d.s.showdown!.outcome).not.toBeNull();
  });
});

describe('Sit a while', () => {
  it('a breathing pause gives the Balanced moment once', () => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'zen.sat', value: true });
    expect(d.p.moments['PM-19']).toBeTruthy();
  });
});
