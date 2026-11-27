import { describe, expect, it } from 'vitest';
import { OFFER_LINE, STUCK_MS, shouldOfferHelp } from '../src/domain/lumenOffer';
import { DEFAULTS } from '../src/app/settings';

const base = { enabled: true, lastProgress: 0, now: STUCK_MS, busy: false, offered: false, hasStep: true };

describe('Lumen offers help when the player is stuck (decision X-011)', () => {
  it('is on by default', () => { expect(DEFAULTS.lumenOffers).toBe(true); });
  it('offers once after three minutes with no progress', () => {
    expect(shouldOfferHelp(base)).toBe(true);
    expect(shouldOfferHelp({ ...base, now: STUCK_MS - 1 })).toBe(false);
    expect(shouldOfferHelp({ ...base, offered: true })).toBe(false);
  });
  it('waits while a panel is open, when the setting is off, or when there is no step', () => {
    expect(shouldOfferHelp({ ...base, busy: true })).toBe(false);
    expect(shouldOfferHelp({ ...base, enabled: false })).toBe(false);
    expect(shouldOfferHelp({ ...base, hasStep: false })).toBe(false);
  });
  it('only offers: the line holds no hint until the player clicks', () => {
    expect(OFFER_LINE).toMatch(/Click Hint/);
  });
});
