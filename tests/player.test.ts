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
