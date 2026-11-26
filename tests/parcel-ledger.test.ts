import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Engine, newCampaign } from '../src/domain/engine';
import { newPermanent } from '../src/domain/permanent';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { CLAIM_ROLLS, DRAWERS, matchParcelTags, pullParcelRack } from '../src/domain/parcelLedger';

describe('Two People for One Parcel', () => {
  it.each(DRAWERS.map((_, i) => i))('keeps all six slips when the runner pins drawer %i', (pin) => {
    expect(pullParcelRack(pin, 'keeper')).toEqual({ keep: 2, move: 4, exposed: 0 });
    expect(pullParcelRack(pin, 'spring')).toEqual({ keep: 2, move: 2, exposed: 2 });
  });
  it('distinguishes a named claimant, an unrestricted pair and a second queue', () => {
    expect(matchParcelTags(CLAIM_ROLLS[0], false)).toEqual([]);
    expect(matchParcelTags(CLAIM_ROLLS[0], true)).toEqual([[1, 3]]);
    expect(matchParcelTags(CLAIM_ROLLS[1], false)).toEqual([[0, 3]]);
    expect(matchParcelTags(CLAIM_ROLLS[1], true)).toEqual([[0, 3]]);
  });
  it('can reopen a claim and change its arrangement, with a diary outcome each time', () => {
    const pack = buildPack(), engine = new Engine(pack);
    let state = newCampaign(pack, 'Guardian', 'p', 4);
    let permanent = newPermanent();
    function mark(flag: string, value: string | boolean) {
      ({ state, permanent } = engine.dispatch({ type: 'SetFlag', flag: `parcel.${flag}`, value }, state, permanent));
    }
    mark('open', true); mark('pairs', true); mark('named', true);
    expect(state.objectivesDone).toContain('parcel.roll');
    expect(state.objectivesDone).not.toContain('parcel.reply');
    mark('keeper', 'Reed'); mark('spring', 'Wing'); mark('reply', 'desk');
    const xp = JSON.stringify(permanent.credit);
    mark('reply', 'token');
    expect(JSON.stringify(permanent.credit)).toBe(xp);
    expect(state.objectivesDone.filter((id) => id === 'parcel.reply')).toHaveLength(1);
    const entries = adventureJournalView(pack, state, engine.visibleObjectives(state)).entries;
    expect(entries.find(({ id }) => id === 'parcel:reply:desk')?.text).toContain('chair sideways');
    expect(entries.find(({ id }) => id === 'parcel:reply:token')?.reflections?.[0].id).toBe('token');
  });
});
