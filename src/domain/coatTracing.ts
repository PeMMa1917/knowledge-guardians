import { lanternCase, lanternDisplay, lanternRef, LANTERN_SITES } from './lamplight';
import { guestInstrument, readPieces, type Piece } from './lanternInstruments';
import type { CampaignState } from './types';

type State = Pick<CampaignState, 'flags' | 'mapId'>;
export type SlipPosition = 'draft' | 'sent' | 'read';

export function decodeCoatSlip(site: string, value: unknown) {
  if (typeof value !== 'string') return;
  const match = /^([\w-]+)\.([01])\.([01])\.([012]{2})\.([012])$/.exec(value);
  if (!match) return;
  const [, person, trace, use, order, pin] = match;
  const pair = lanternCase(lanternRef(site, person));
  const instrument = guestInstrument(person);
  const pieces = readPieces(order);
  const pinned = Number(pin) as Piece;
  if (!pair || !instrument || pieces.length !== 2 || !pieces.includes(pinned)) return;
  const other = pieces.find((p) => p !== pinned)!;
  const loose = ([0, 1, 2] as const).find((p) => !pieces.includes(p))!;
  return {
    value,
    ref: pair.ref,
    person: pair.person,
    site: pair.site,
    instrument,
    fold: pair.person.folds[Number(trace)],
    use: pair.site.uses[Number(use)],
    pinned: instrument.pieces[pinned],
    other: instrument.pieces[other],
    loose: instrument.pieces[loose],
  };
}

/** The player can only thread one of the two pieces they previously laid down at this lamp. */
export function mountedCoatSlips(state: State, id: string) {
  const site = LANTERN_SITES.find((site) => site.id === id);
  const mounted = site && lanternDisplay(state, site);
  if (!site || !mounted || mounted.pieces.length !== 2) return [];
  const wall = state.flags['lamplight.' + id + '.shown'];
  return mounted.pieces.flatMap((piece) => {
    const slip = decodeCoatSlip(id, wall + '.' + piece);
    return slip ? [slip] : [];
  });
}

export const slipFlag = (id: string, slot: string) => 'coat.' + id + '.slip-' + slot;
export const coatSlip = (s: State, id: string, slot: SlipPosition) =>
  decodeCoatSlip(id, s.flags[slipFlag(id, slot)]);

/** The keeper's comparison belongs to the enclosed guest tracing and the coat impression actually opened. */
export function openedCoatSlip(s: State, id: string) {
  const slip = coatSlip(s, id, 'read');
  const edition = s.flags['coat.' + id + '.read'];
  if (!slip || typeof edition !== 'number' || !Number.isInteger(edition) || edition < 1 || edition > 8)
    return;
  const receipt = edition + '/' + slip.value;
  const examined = (leaf: 'other' | 'loose') => s.flags[slipFlag(id, leaf)] === receipt;
  return { slip, receipt, examined, both: examined('other') && examined('loose') };
}

export function coatSlipReply(s: State, id: string) {
  const opened = openedCoatSlip(s, id);
  if (!opened) return;
  const reply = s.flags[slipFlag(id, 'reply')];
  if (reply === opened.receipt + '/alongside') return 'alongside';
  if (reply === opened.receipt + '/limit') return 'limit';
}
