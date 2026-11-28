import { diaryEvent } from './adventureEvents';
import {
  carriesSheet,
  faceNames,
  ferryMap,
  getFerrySheet,
  printedSailing,
  type FerryFace,
  type FerrySheet,
} from './pictureFerry';
import type { CampaignState, Effect, Weave } from './types';

export const billParts = ['call', 'ticket', 'afterword'] as const;
export type BillPart = (typeof billParts)[number];
const faces: Record<BillPart, FerryFace> = {
  call: 'view',
  ticket: 'source',
  afterword: 'margin',
};
export const billNames: Record<BillPart, string> = {
  call: 'Opening picture',
  ticket: 'Spoken collection ticket',
  afterword: 'Afterword from the bunk',
};
export type BillCommand =
  | { type: 'HangFerryPrint'; slug: string; part: BillPart }
  | { type: 'OpenFerryBill'; first: 'rail' | 'bunk' }
  | { type: 'HearFerryBill'; action: 'turn' | 'reopen' };
const prefix = 'picture-bill.';
export const billWeave: Weave = {
  concepts: [
    'interpretation',
    'evidence',
    'perspective',
    'justification',
    'culture',
    'responsibility',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['ART', 'HIS'],
  subjects: ['visual-arts', 'theatre', 'history', 'lang-langlit'],
  atl: ['communication', 'thinking', 'self-management'],
  thinking: { dok: 4, bloom: 'create', fink: 'integration', solo: 'extended' },
  minutes: 8,
};
export function slotSheet(s: CampaignState, part: BillPart, posted = false) {
  const id = s.flags[prefix + (posted ? 'posted.' : 'rack.') + part];
  const sheet = typeof id === 'string' ? getFerrySheet(id) : undefined;
  return sheet?.item && carriesSheet(s, sheet) && printedSailing(s, sheet)
    ? sheet
    : undefined;
}
export const partLine = (part: BillPart, sheet: FerrySheet) =>
  sheet.lines[faces[part]];
export function billEffects(s: CampaignState, c: BillCommand): Effect[] {
  const set = (path: string, value: string | number | boolean): Effect => ({
    setFlag: prefix + path,
    value,
  });
  if (c.type === 'HearFerryBill') {
    if (
      s.mapId !== 'stage.gallery' ||
      !billParts.every((part) => slotSheet(s, part, true))
    )
      throw Error(
        'Hari is waiting for the three signed pages of the bill at the theatre.',
      );
    const version = billIdentity(s, true),
      count = heardPages(s);
    if (c.action === 'reopen')
      return [set('reading.version', version), set('reading.count', 0)];
    if (c.action !== 'turn' || count >= billParts.length)
      throw Error(
        'The last page is showing. Open the programme again to hear another reading.',
      );
    return [
      set('reading.version', version),
      set('reading.count', count + 1),
      ...(count + 1 === billParts.length
        ? [set('heard', true), set('heard.version', version)]
        : []),
    ];
  }
  if (s.mapId !== ferryMap)
    throw Error('Neris hung the programme line inside the ferry.');
  if (c.type === 'HangFerryPrint') {
    const sheet = getFerrySheet(c.slug);
    if (!sheet?.item || !carriesSheet(s, sheet) || !printedSailing(s, sheet))
      throw Error(
        'Sail with this signed object print before hanging it on the line.',
      );
    if (!billParts.includes(c.part))
      throw Error('Choose a place on Neris’s line.');
    const fx: Effect[] = [];
    for (const p of billParts) {
      const prev = slotSheet(s, p);
      if (prev?.slug === c.slug && p !== c.part) fx.push(set('rack.' + p, ''));
      if (prev && p === c.part && prev.slug !== c.slug)
        fx.push(set('replaced', true));
    }
    return [...fx, set('rack.' + c.part, c.slug)];
  }
  const sheets = billParts.map((p) => slotSheet(s, p));
  if (sheets.some((s) => !s) || new Set(sheets.map((p) => p?.slug)).size !== 3)
    throw Error(
      'Hang three different prints so the audience can follow each contribution.',
    );
  if (c.first !== 'bunk' && c.first !== 'rail')
    throw Error('Choose who opens.');
  return [
    ...billParts.map((part, i) => set('posted.' + part, sheets[i]!.slug)),
    set('first', c.first),
    set('posted', true),
  ];
}
export function billIdentity(s: CampaignState, posted: boolean) {
  return billParts
    .map((part) => slotSheet(s, part, posted)?.slug ?? '')
    .concat(String(s.flags[prefix + 'first'] ?? ''))
    .join('.');
}
export function heardPages(s: CampaignState) {
  const count = s.flags[prefix + 'reading.count'];
  return s.flags[prefix + 'reading.version'] === billIdentity(s, true) &&
    typeof count === 'number' &&
    Number.isInteger(count) &&
    count >= 0 &&
    count <= 3
    ? count
    : 0;
}
export function billOrder(s: CampaignState): readonly BillPart[] {
  return s.flags[prefix + 'first'] === 'bunk'
    ? ['afterword', 'call', 'ticket']
    : billParts;
}
export function billDiary(
  s: CampaignState,
  next: CampaignState,
  c: BillCommand,
) {
  if (c.type === 'HangFerryPrint') {
    const sheet = slotSheet(next, c.part);
    if (!sheet) return;
    const old = slotSheet(s, c.part);
    return diaryEvent(
      'picture-bill:rack:' + c.part + ':' + sheet.slug,
      'tool',
      sheet.ref,
      billNames[c.part],
      'I hung ' +
        sheet.title +
        ' where the audience would hear the ' +
        billNames[c.part].toLowerCase() +
        '. ' +
        (old && old.slug !== sheet.slug
          ? 'I took down ' + old.title + '. '
          : '') +
        partLine(c.part, sheet),
      { sourceIds: sheet.source ? [sheet.source] : [] },
      'after-break',
    );
  }
  if (c.type === 'HearFerryBill') {
    const count = heardPages(next),
      title = 'Three prints at the evening house';
    if (!count)
      return diaryEvent(
        'picture-bill:again:' + billIdentity(next, true),
        'choice',
        'ferry.programme',
        title,
        'I asked Hari to open the programme for another reading.',
        {},
        'after-break',
      );
    const part = billOrder(next)[count - 1],
      sheet = slotSheet(next, part, true)!;
    return diaryEvent(
      'picture-bill:heard:' + billIdentity(next, true) + ':' + count,
      'conversation',
      sheet.ref,
      title,
      'I heard ' +
        sheet.title +
        ' in the ' +
        billNames[part].toLowerCase() +
        '. ' +
        partLine(part, sheet),
      { sourceIds: sheet.source ? [sheet.source] : [] },
      'after-break',
    );
  }
  const sheets = billOrder(next)
    .map((part) => slotSheet(next, part, true))
    .filter((x): x is FerrySheet => !!x);
  const sourceIds = sheets.flatMap((x) => (x.source ? [x.source] : []));
  return diaryEvent(
    'picture-bill:' + c.type + ':' + billIdentity(next, true),
    'choice',
    'ferry.programme',
    'Three prints on the ferry line',
    'I sent our programme ahead to Hari. ' +
      sheets.map((x) => x.title).join(' · ') +
      '.',
    { sourceIds, outcome: 'checked' },
    'after-break',
  );
}
export const faceAtPart = (part: BillPart) => faceNames[faces[part]];
