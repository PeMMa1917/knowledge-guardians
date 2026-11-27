import { CALLBOARD_CASES } from '../content/callboardCases';
import { ferryCommissions } from '../content/ferryCommissions';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const ferryMap = 'sea.picture-ferry';
export const shoreMap = 'sea.harbour';
export const moon = 'little-moon';
export const ferryFaces = ['view', 'source', 'margin'] as const;
export type FerryFace = (typeof ferryFaces)[number];
export type FerrySeat = 'rail' | 'bunk';
export type FerryTrip = 'sail' | 'moor';
export type WheelAction = 'fit' | 'turn' | 'reverse' | FerrySeat | FerryTrip;
export type FerryCommand = {
  type: 'TurnPictureFerry';
  slug: string;
  action: WheelAction | 'hear' | 'unfold';
};
export const faceNames: Record<FerryFace, string> = {
  view: 'Picture',
  source: 'Collection ticket',
  margin: 'Open question',
};
export type FerrySheet = {
  slug: string;
  title: string;
  ref: string;
  source?: string;
  item?: string;
  lines: Record<FerryFace, string>;
};
export const sampleSheet: FerrySheet = {
  slug: moon,
  title: 'A patch for the little moon',
  ref: 'ferry.paper-moon',
  lines: {
    view: 'A black paper boat has a silver crescent pasted across one side.',
    source:
      'Bo drew the boat on the back of Tova’s Thursday supper ticket. His silver thumbprint is still beside the patch.',
    margin:
      'Nobody on the early boat saw Bo paste it. Tova remembers a different crescent on the boat she sailed that night.',
  },
};
export const ferrySheets: readonly FerrySheet[] = [
  sampleSheet,
  ...CALLBOARD_CASES.map((c) => ({
    slug: c.slug,
    title: c.title,
    item: c.item,
    ref: c.artifact,
    source: c.source,
    lines: { view: c.view, source: c.record, margin: c.limit },
  })),
];
const bySlug = new Map(ferrySheets.map((sheet) => [sheet.slug, sheet]));
export function getFerrySheet(slug: string) {
  return bySlug.get(slug);
}
export function carriesSheet(s: CampaignState, sheet: FerrySheet) {
  return !sheet.item || s.inventory[sheet.item] > 0;
}
const prefix = 'picture-ferry.';
const key = (slug: string, part: string) => prefix + slug + '.' + part;
const set = (setFlag: string, value: string | number | boolean): Effect => ({
  setFlag,
  value,
});
export const activePrint = (s: CampaignState) => {
  const slug = s.flags[prefix + 'active'];
  const sheet = typeof slug === 'string' ? getFerrySheet(slug) : undefined;
  return sheet && carriesSheet(s, sheet) ? sheet : sampleSheet;
};
export function wheelPose(s: CampaignState, slug: string) {
  const n = s.flags[key(slug, 'pose')];
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 6
    ? n
    : 0;
}
/** The triangular sleeve can be fitted from either end. The bottom leaf stays inside the box. */
export function windows(pose: number): {
  rail: FerryFace;
  bunk: FerryFace;
  inside: FerryFace;
} {
  if (!Number.isInteger(pose) || pose < 0 || pose > 5)
    throw Error('The sleeve must sit in one of its six detents.');
  const front = pose % 3,
    offset = pose >= 3 ? 2 : 1;
  return {
    rail: ferryFaces[front],
    bunk: ferryFaces[(front + offset) % 3],
    inside: ferryFaces[(front + 2 * offset) % 3],
  };
}
export function turnWheel(pose: number, action: 'turn' | 'reverse') {
  windows(pose);
  return action === 'turn'
    ? (((pose % 3) + 1) % 3) + (pose >= 3 ? 3 : 0)
    : (pose + 3) % 6;
}
export const seenSeat = (s: CampaignState, slug: string, seat: FerrySeat) =>
  s.flags[key(slug, 'seen.' + seat)] === wheelPose(s, slug);
export function fittedSheet(s: CampaignState, slug: string) {
  return s.flags[prefix + 'active'] === slug;
}
export function lastSailing(s: CampaignState) {
  const slug = s.flags[prefix + 'latest'];
  const sheet = typeof slug === 'string' ? getFerrySheet(slug) : undefined;
  if (!sheet || !carriesSheet(s, sheet)) return;
  return printedSailing(s, sheet);
}
export function printedSailing(s: CampaignState, sheet: FerrySheet) {
  const route = s.flags[key(sheet.slug, 'trip')],
    pose = s.flags[key(sheet.slug, 'sailed')];
  if (
    (route !== 'moor' && route !== 'sail') ||
    typeof pose !== 'number' ||
    !Number.isInteger(pose) ||
    pose < 0 ||
    pose > 5
  )
    return;
  return { sheet, route, pose, faces: windows(pose) };
}
export const ferryWeave: Weave = {
  concepts: [
    'perspective',
    'interpretation',
    'evidence',
    'power',
    'responsibility',
    'justification',
  ],
  framework: ['methods-and-tools', 'perspectives', 'ethics'],
  aoks: ['ART', 'HIS', 'HUM'],
  subjects: ['visual-arts', 'theatre', 'history', 'lang-langlit'],
  atl: ['communication', 'thinking', 'social'],
  thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
  minutes: 5,
};
export function ferryEffects(s: CampaignState, c: FerryCommand): Effect[] {
  const sheet = getFerrySheet(c.slug);
  if (!sheet || !carriesSheet(s, sheet))
    throw Error('Bring the signed Callboard print for that object.');
  if (c.action === 'hear' || c.action === 'unfold') {
    const trip = printedSailing(s, sheet);
    if (s.mapId !== shoreMap || !trip)
      throw Error('Meet the ferry at Seagrass Steps after a performance.');
    return [
      set(key(c.slug, 'readback'), trip.route + '.' + trip.pose),
      set(prefix + 'received', c.slug),
      set(prefix + 'hand', c.action),
      set(key(c.slug, 'hand'), c.action),
      ...(sheet.item ? [set(prefix + 'real-receipt', true)] : []),
    ];
  }
  if (s.mapId !== ferryMap)
    throw Error('The folding picture lamp is aboard the ferry.');
  if (c.action === 'fit') return [set(prefix + 'active', c.slug)];
  if (!fittedSheet(s, c.slug))
    throw Error('Fit this print into the lamp first.');
  const pose = wheelPose(s, c.slug);
  switch (c.action) {
    case 'turn':
    case 'reverse':
      return [set(key(c.slug, 'pose'), turnWheel(pose, c.action))];
    case 'rail':
    case 'bunk':
      return [set(key(c.slug, 'seen.' + c.action), pose)];
    case 'moor':
    case 'sail':
      if (!seenSeat(s, c.slug, 'rail') || !seenSeat(s, c.slug, 'bunk'))
        throw Error(
          'Stand at both windows with the sleeve set this way before ringing.',
        );
      return [
        set(key(c.slug, 'sailed'), pose),
        set(key(c.slug, 'trip'), c.action),
        set(prefix + 'latest', c.slug),
        set(prefix + 'landing', c.action),
      ];
    default:
      throw Error('Choose a job at the lamp.');
  }
}
export function ferryDiary(
  s: CampaignState,
  next: CampaignState,
  c: FerryCommand,
) {
  const sheet = getFerrySheet(c.slug);
  if (!sheet) return;
  const face = windows(wheelPose(next, c.slug)),
    src = sheet.source ? [sheet.source] : [];
  const main = 'picture-ferry:' + c.slug + ':',
    title = sheet.title;
  if (c.action === 'hear' || c.action === 'unfold') {
    const sailed = printedSailing(s, sheet);
    if (!sailed) return;
    return diaryEvent(
      main + 'receipt:' + sailed.route + ':' + sailed.pose + ':' + c.action,
      'conversation',
      sheet.ref,
      'Back at Seagrass Steps',
      (c.action === 'hear'
        ? 'I heard the passenger’s first account of '
        : 'I showed the passenger the folded leaf of ') +
        title +
        '. ' +
        ferryCommissions[c.slug].answer,
      { sourceIds: src },
      'after-break',
    );
  }
  if (c.action === 'rail' || c.action === 'bunk')
    return diaryEvent(
      main + c.action + ':' + face[c.action],
      'tool',
      sheet.ref,
      title,
      'I stood ' +
        (c.action === 'rail' ? 'at the rail' : 'by the low bunk') +
        '. ' +
        sheet.lines[face[c.action]],
      { sourceIds: src },
      { fixedToolPrefix: main + c.action + ':' },
    );
  if (c.action === 'moor' || c.action === 'sail')
    return diaryEvent(
      main + c.action + ':' + wheelPose(next, c.slug),
      'choice',
      sheet.ref,
      title,
      'I left the ' +
        faceNames[face.rail].toLowerCase() +
        ' at the rail and the ' +
        faceNames[face.bunk].toLowerCase() +
        ' at the bunk. ' +
        (c.action === 'moor'
          ? 'We tied up. People could come aboard for the folded leaf.'
          : 'We sailed on the bell. The folded leaf stayed with the cabin crew.'),
      { sourceIds: src, outcome: 'checked' },
      'after-break',
    );
  return diaryEvent(
    main + c.action + ':' + wheelPose(next, c.slug),
    'tool',
    sheet.ref,
    title,
    c.action === 'fit'
      ? 'I slipped ' + title + ' into the three-sided lamp.'
      : 'I ' +
          (c.action === 'turn'
            ? 'turned the handle one notch'
            : 'reversed the sleeve') +
          '. The rail now faces the ' +
          faceNames[face.rail].toLowerCase() +
          '.',
    { sourceIds: src },
    { fixedToolPrefix: main + c.action + ':' },
  );
}
