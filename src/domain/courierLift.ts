import records from '../content/courier-case-records.json';
import { diaryEvent } from './adventureEvents';
import {
  carriesSpecimen,
  PERSPECTIVE_FLAG,
  specimenToolId,
} from './specimenGear';
import type { AOK, CampaignState, Effect, Weave } from './types';

export const courierCases = records;
export type CourierCase = (typeof records)[number];
export const dispatchLift = 'nexus.specimen-vault';
export const liftLandings = {
  market: 'market.square',
  theatre: 'stage.foyer',
} as const;
export type Landing = keyof typeof liftLandings;
export const liftGates: Record<Landing, string> = {
  market: 'west',
  theatre: 'east',
};
export const courierWeave: Weave = {
  concepts: [
    'evidence',
    'interpretation',
    'perspective',
    'responsibility',
    'culture',
    'justification',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['HIS', 'ART', 'LAN'],
  subjects: ['history', 'lit-perf', 'theatre', 'lang-langlit'],
  atl: ['research', 'communication', 'social'],
  thinking: {
    dok: 3,
    bloom: 'evaluate',
    fink: 'integration',
    solo: 'relational',
  },
};
export function courierTopics(c: CourierCase, landing?: Landing): Weave {
  const areas = landing === 'theatre' ? [...c.areas,'ART'] : c.areas;
  const subject = landing === 'theatre' ? 'theatre' : landing === 'market' ? 'business' : 'history';
  return {...courierWeave, aoks:[...new Set(areas)] as AOK[], subjects:[...new Set([...c.subjects,subject])]};
}

export const courierFlag = (c: CourierCase, part: string) =>
  'courier.' + c.shape + '.' + part;
export function carriedCase(s: CampaignState) {
  return courierCases.find(
    (r) =>
      s.flags[PERSPECTIVE_FLAG] === specimenToolId(r.key) &&
      carriesSpecimen(s, r.key),
  );
}
export function carriedMark(s: CampaignState, c: CourierCase, stop: Landing) {
  const picked = s.flags[courierFlag(c, liftGates[stop])];
  return typeof picked === 'number' ? c.handles[picked] : undefined;
}
export function lastCourierOpening(
  s: CampaignState,
  c: CourierCase,
  stop: Landing,
) {
  const current = carriedMark(s, c, stop);
  const opened = s.flags[courierFlag(c, stop + '.opening')];
  if (
    !current ||
    s.flags[courierFlag(c, stop + '.read')] !== c.handles.indexOf(current)
  )
    return;
  return opened === 'object' || opened === 'person' ? opened : undefined;
}

export type CourierCommand =
  | { type: 'WorkCourierLift'; act: 'tip'; handle: number }
  | { type: 'WorkCourierLift'; act: 'send'; landing: Landing }
  | {
      type: 'WorkCourierLift';
      act: 'receive';
      landing: Landing;
      opening: 'object' | 'person';
    };

export function courierEffects(
  s: CampaignState,
  cmd: CourierCommand,
): Effect[] {
  const r = carriedCase(s);
  if (!r)
    throw Error(
      'Carry the earned object and fit it to the satchel before winding the lift.',
    );
  const mark = (part: string, value: string | number | boolean): Effect => ({
    setFlag: courierFlag(r, part),
    value,
  });
  if (cmd.act === 'receive') {
    if (
      !Object.hasOwn(liftLandings, cmd.landing) ||
      s.mapId !== liftLandings[cmd.landing] ||
      !carriedMark(s, r, cmd.landing)
    )
      throw Error('Follow the issued address with the same object.');
    if (cmd.opening !== 'object' && cmd.opening !== 'person')
      throw Error('Choose who opens the parcel.');
    return [
      {
        setFlag:
          cmd.landing === 'market'
            ? 'courier.bew-signed'
            : 'courier.pella-signed',
        value: true,
      },
      mark(cmd.landing + '.opening', cmd.opening),
      mark(
        cmd.landing + '.read',
        s.flags[courierFlag(r, liftGates[cmd.landing])],
      ),
    ];
  }
  if (s.mapId !== dispatchLift)
    throw Error('Wind the paired lift at the collection room.');
  if (cmd.act === 'tip') {
    if (!Number.isInteger(cmd.handle) || !r.handles[cmd.handle])
      throw Error('That cradle has no tab.');
    return [mark('tab', cmd.handle), mark('seen.' + cmd.handle, true)];
  }
  if (!Object.hasOwn(liftLandings, cmd.landing))
    throw Error('Choose an existing landing.');
  const tab = s.flags[courierFlag(r, 'tab')];
  if (
    typeof tab !== 'number' ||
    !r.handles[tab] ||
    r.handles.filter((_, i) => s.flags[courierFlag(r, 'seen.' + i)] === true)
      .length < 2
  )
    throw Error('Tip the cradle two ways before addressing a delivery.');
  return [mark(liftGates[cmd.landing], tab)];
}

export function courierDiary(s: CampaignState, cmd: CourierCommand) {
  const r = carriedCase(s)!;
  if (cmd.act === 'tip') {
    const h = r.handles[cmd.handle];
    return diaryEvent(
      'courier:' + r.shape + '.tab.' + cmd.handle,
      'tool',
      r.exhibit,
      h.name,
      'I tipped the cradle to read the next side. ' + h.mark,
      { sourceIds: [r.source] },
      { fixedToolPrefix: 'courier:' + r.shape + '.tab.' },
    );
  }
  const route =
    cmd.landing === 'market' ? 'the market counter' : 'the theatre door';
  const h = carriedMark(s, r, cmd.landing)!;
  const id =
    'courier:' +
    r.shape +
    '.' +
    cmd.act +
    '.' +
    cmd.landing +
    '.' +
    r.handles.indexOf(h);
  if (cmd.act === 'send')
    return diaryEvent(
      id,
      'choice',
      r.exhibit,
      'An address for ' + route,
      'I sent the words “' +
        h.name +
        '” up the rope to ' +
        route +
        '. The object travelled in my satchel.',
      { sourceIds: [r.source] },
      'after-break',
    );
  const text =
    cmd.opening === 'person'
      ? h.callback
      : cmd.landing === 'market'
        ? r.west
        : r.east;
  return diaryEvent(
    id + '.' + cmd.opening,
    'choice',
    r.exhibit,
    'At ' + route,
    'I was there when the receipt was opened. ' + text,
    { sourceIds: [r.source] },
    'after-break',
  );
}
