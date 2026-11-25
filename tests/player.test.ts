import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { newCampaign } from '../src/domain/engine';
import { cleanPronouns, personalise, PRONOUN_SETS } from '../src/domain/player';
import { newPermanent } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();

describe('player pronouns and origin (spec 35.1)', () => {
  it('replaces name and pronoun tokens, with capitals', () => {
    const s = newCampaign(pack, 'Ana', 'player-a', 1, { pronouns: PRONOUN_SETS[1].p });
    expect(personalise('{They} said {name} checked {their} dates. Ask {them}.', s.player)).toBe('She said Ana checked her dates. Ask her.');
    expect(personalise('No tokens {here}.', s.player)).toBe('No tokens {here}.');
  });
  it('keeps free-choice pronouns but cleans them', () => {
    expect(cleanPronouns({ subject: 'xe', object: 'xem', possessive: 'xyr' })).toEqual({ subject: 'xe', object: 'xem', possessive: 'xyr' });
    expect(cleanPronouns({ subject: '<>', object: '', possessive: 'their' })).toEqual({ subject: 'they', object: 'them', possessive: 'their' });
  });
  it('defaults to they/them and no origin', () => {
    const s = newCampaign(pack, 'Ana', 'player-a', 1);
    expect(s.player.pronouns.subject).toBe('they');
    expect(s.player.origin).toBeNull();
    expect(s.journal).toEqual([]);
  });
  it('an origin gives its Lens hint in the journal, and nothing else', () => {
    for (const o of pack.origins) {
      const s = newCampaign(pack, 'Ana', 'player-a', 1, { origin: o.id });
      expect(s.player.origin).toBe(o.id);
      expect(s.journal).toEqual([o.journal]);
      expect(s.marks).toBe(0);
      expect(s.cards).toEqual([]);
    }
  });
  it('has the five origins of the spec', () => {
    expect(pack.origins.map((o) => o.id)).toEqual(['archive', 'harbour', 'workshop', 'singer', 'traveller']);
  });
  it('each origin sees only its own option at Ise, once, and it gives no XP', () => {
    for (const o of pack.origins) {
      const d = new Driver();
      d.s = newCampaign(pack, 'Ana', 'player-a', 7, { origin: o.id });
      d.p = newPermanent();
      d.run({ type: 'EnterNode', node: 'ise.again' });
      const opts = d.e.visibleOptions('ise.again', d.s).filter((x) => x.option.tag === 'Your background');
      expect(opts.length).toBe(1);
      const before = JSON.stringify(d.p.credit);
      d.run({ type: 'ChooseDialogueOption', node: 'ise.again', index: opts[0].index });
      expect(JSON.stringify(d.p.credit)).toBe(before);
      expect(d.e.visibleOptions('ise.again', d.s).filter((x) => x.option.tag === 'Your background').length).toBe(0);
    }
  });
  it('the player can change pronouns at any time', () => {
    const d = new Driver();
    d.run({ type: 'SetPronouns', pronouns: { subject: 'he', object: 'him', possessive: 'his' } });
    expect(personalise('{They} did it.', d.s.player)).toBe('He did it.');
  });
});

describe('origin side quests (spec 35.1)', () => {
  const Q: Record<string, [string, string]> = {
    archive: ['cataloguer-bela', 'curator-dace'], traveller: ['translator-lio', 'clerk-venn'],
    harbour: ['runner-tamar', 'fruit-seller'], workshop: ['apprentice-ren', 'smith-hesper'], singer: ['singer-teodora', 'scholar-sefa'],
  };
  for (const [o, [giver, other]] of Object.entries(Q)) {
    it(`${o}: hear, ask, choose; journal and portfolio, no XP`, () => {
      const d = new Driver();
      d.s = newCampaign(pack, 'Ana', 'player-a', 7, { origin: o });
      d.p = newPermanent();
      d.talk(giver);
      expect(d.s.flags[`os.${o}.started`]).toBe(true);
      d.talk(other);
      expect(d.s.flags[`os.${o}.asked`]).toBe(true);
      d.talk(giver);
      expect(d.s.objectivesDone).toContain(`os.${o}.o3`);
      expect(d.s.journal).toContain(`j.os.${o}`);
      expect(d.p.portfolio.length).toBe(1);
      expect(Object.values(d.p.credit).reduce((a, b) => a + b, 0)).toBe(0);
      expect(d.e.talkEntry(giver, d.s)).toBe(`os.${o}.idle`);
    });
  }
  it('other origins never see a giver quest', () => {
    const s = newCampaign(pack, 'Ana', 'player-a', 7, { origin: 'archive' });
    const d = new Driver(); d.s = s;
    expect(d.e.visibleObjectives(s).some((x) => x.id.startsWith('os.singer'))).toBe(false);
  });
});

describe('appearance (spec 35.1)', () => {
  it('encodes and decodes a made look, and rejects unknown parts', async () => {
    const { encodeLook, decodeLook, isValidLook } = await import('../src/domain/appearance');
    const c = { skin: 'olive', hair: 'pink', outfit: 'cream', trousers: 'wine', accessory: 'both' as const, accent: 'cyan' };
    expect(decodeLook(encodeLook(c))).toEqual(c);
    expect(isValidLook(encodeLook(c))).toBe(true);
    expect(isValidLook('player-b')).toBe(true);
    expect(isValidLook('custom:olive.nope.cream.wine.both.cyan')).toBe(false);
    expect(isValidLook('../../etc')).toBe(false);
  });
  it('recolours skin and paints a headband on the hair row above the face', async () => {
    const { recolour, SKIN, ACCENT } = await import('../src/domain/appearance');
    // A tiny 16 x 32 frame: hair at row 9 and 10, skin at row 11.
    const d = new Uint8ClampedArray(16 * 32 * 4);
    const put = (x: number, y: number, hex: string) => { const o = (y * 16 + x) * 4; d.set([parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4), 16), 255], o); };
    for (let x = 4; x < 12; x++) { put(x, 9, '432e27'); put(x, 10, '432e27'); put(x, 11, 'e8d4b2'); }
    recolour(d, 16, 32, { skin: 'dark', hair: 'black', outfit: 'teal', trousers: 'indigo', accessory: 'headband', accent: 'red' });
    const hex = (x: number, y: number) => [...d.slice((y * 16 + x) * 4, (y * 16 + x) * 4 + 3)].map((v) => v.toString(16).padStart(2, '0')).join('');
    expect(hex(5, 11)).toBe(SKIN.dark[0]);
    expect(hex(5, 10)).toBe(ACCENT.red);
    expect(hex(5, 9)).toBe('1f1a24');
  });
  it('the player can change look, but only to a valid one', () => {
    const d = new Driver();
    d.run({ type: 'SetLook', look: 'custom:tan.blue.gold.sand.scarf.white' });
    expect(d.s.player.look).toBe('custom:tan.blue.gold.sand.scarf.white');
    expect(() => d.run({ type: 'SetLook', look: 'custom:x' })).toThrow();
  });
  it('every character sprite is a sheet on disk or a valid made look', async () => {
    const { isValidLook } = await import('../src/domain/appearance');
    // @ts-ignore Node types are not installed; vitest runs in Node.
    const fs = await import('node:fs');
    for (const ch of pack.characters) {
      const ok = ch.sprite.startsWith('custom:') ? isValidLook(ch.sprite) : fs.existsSync(`public/assets/art/generated/characters/${ch.sprite}.png`);
      expect(ok, ch.id).toBe(true);
    }
  });
});
