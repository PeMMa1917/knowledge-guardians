import holdings from '../content/calendar-holdings.json';
import { diaryEvent } from './adventureEvents';
import { ownsSpecimen, carriesSpecimen, specimenToolId, PERSPECTIVE_FLAG } from './specimenGear';
import type { CampaignState, Effect, Weave } from './types';

export const calendarCases = holdings;
export type CalendarCase = (typeof holdings)[number];
export type BellLane = 'stair' | 'window';
export type CalendarFace = 'first' | 'second' | 'silence';
export const composingRoom = 'nexus.almanac';
export const paradeRoom = 'copies.archive';
export const barLength = 6;
export const cueNames = ['rest', 'wooden drum', 'hooded lantern', 'drum and lantern'] as const;
export const calendarWeave: Weave = {
  concepts: ['evidence', 'interpretation', 'culture', 'perspective', 'responsibility', 'values'],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['HIS', 'ART'],
  subjects: ['history', 'music', 'design-tech'],
  atl: ['thinking', 'communication', 'social'],
  thinking: { dok: 3, bloom: 'create', fink: 'integration', solo: 'relational' },
};
export function calendarTopics(c: CalendarCase): Weave {
  return { ...calendarWeave, aoks: [...c.areas, ...c.themes] as Weave['aoks'], subjects: c.subjects };
}
const key = (id: string, name: string) => 'almanac.' + id + '.' + name;
export const cueFlag = (s: CampaignState, c: CalendarCase, name: string) => s.flags[key(c.id, name)];
const set = (c: CalendarCase, name: string, value: string | boolean | number): Effect => ({
  setFlag: key(c.id, name),
  value,
});
export function equippedCalendar(s: CampaignState) {
  return holdings.find(
    (c) =>
      s.flags[PERSPECTIVE_FLAG] === specimenToolId(c.key) && ownsSpecimen(s, c.key) && carriesSpecimen(s, c.key),
  );
}
export function workingBar(s: CampaignState, c: CalendarCase) {
  const bar = cueFlag(s, c, 'bar');
  return typeof bar === 'string' && /^[0-3]{6}$/.test(bar) ? bar : '000000';
}
export function cuePositions(bar: string, lane: BellLane) {
  return Array.from(bar).flatMap((note, i) => (Number(note) & (lane === 'stair' ? 1 : 2) ? [i + 1] : []));
}
export const faceCaption = (c: CalendarCase, f: CalendarFace) => (f === 'silence' ? c.silence : c[f].line);
export const barWords = (bar: string) =>
  Array.from(bar)
    .map((code) => cueNames[Number(code)])
    .join(' / ');
export type AlmanacCommand = { type: 'ArrangeStreetAlmanac' } & (
  | { act: 'turn'; face: CalendarFace }
  | { act: 'place'; beat: number; cue: number }
  | { act: 'listen'; lane: BellLane }
  | { act: 'send' }
  | { act: 'rehearse'; lane: BellLane }
  | { act: 'perform'; entrance: 'procession' | 'window' }
);
export function lastEdition(s: CampaignState, c: CalendarCase): { bar: string; face: CalendarFace } | undefined {
  const bar = cueFlag(s, c, 'sentBar'),
    face = cueFlag(s, c, 'sentFace');
  if (
    typeof bar !== 'string' ||
    !/^[0-3]{6}$/.test(bar) ||
    (face !== 'first' && face !== 'second' && face !== 'silence')
  )
    return;
  return { bar, face };
}
export function almanacEffects(s: CampaignState, cmd: AlmanacCommand): Effect[] {
  const c = equippedCalendar(s);
  if (!c) throw Error('Carry one of the four objects from the almanac cabinet and equip it in your satchel.');
  const after = cmd.act === 'perform' || cmd.act === 'rehearse';
  if (s.mapId !== (after ? paradeRoom : composingRoom))
    throw Error(
      after
        ? 'Take the issued score to the reading hall in the City of Copies.'
        : 'Bring the object to the street musicians’ room off the Nexus collection.',
    );
  const bar = workingBar(s, c);
  switch (cmd.act) {
    case 'turn':
      if (!['first', 'second', 'silence'].includes(cmd.face))
        throw Error('Open one of the three leaves on the stand.');
      return [set(c, 'face', cmd.face), set(c, 'seen.' + cmd.face, true)];
    case 'place': {
      if (
        !Number.isInteger(cmd.beat) ||
        cmd.beat < 0 ||
        cmd.beat >= barLength ||
        !Number.isInteger(cmd.cue) ||
        !cueNames[cmd.cue]
      )
        throw Error('Put a cue in one of the six places on the strip.');
      const next = bar.slice(0, cmd.beat) + cmd.cue + bar.slice(cmd.beat + 1);
      return next === bar ? [] : [set(c, 'bar', next), set(c, 'stairTried', ''), set(c, 'windowTried', '')];
    }
    case 'listen':
      if (cmd.lane !== 'stair' && cmd.lane !== 'window') throw Error('Stand on the stair or at the dark window.');
      return [set(c, cmd.lane + 'Tried', bar)];
    case 'send': {
      if (!cueFlag(s, c, 'seen.first') || !cueFlag(s, c, 'seen.second') || !cueFlag(s, c, 'seen.silence'))
        throw Error('Open both dated leaves and the space in between before you send the calendar.');
      if (cueFlag(s, c, 'stairTried') !== bar || cueFlag(s, c, 'windowTried') !== bar)
        throw Error('Try this arrangement from the stair and the window. You can send a whole bar of rests.');
      const face = cueFlag(s, c, 'face') as CalendarFace;
      const block = cueFlag(s, c, 'block');
      const sentBlock = block === 0 || block === 1 ? block : false;
      const same = lastEdition(s, c);
      return [
        set(c, 'sentBar', bar),
        set(c, 'sentFace', face),
        set(c, 'sentBlock', sentBlock),
        ...(same?.bar === bar && same.face === face && cueFlag(s, c, 'sentBlock') === sentBlock
          ? []
          : [set(c, 'heard.stair', false), set(c, 'heard.window', false)]),
      ];
    }
    case 'rehearse':
      if (!lastEdition(s, c)) throw Error('Send a score from the musicians’ room first.');
      if (cmd.lane !== 'stair' && cmd.lane !== 'window') throw Error('Visit one of the two listening places.');
      return [set(c, 'heard.' + cmd.lane, true)];
    case 'perform': {
      const edition = lastEdition(s, c);
      if (!edition || !cueFlag(s, c, 'heard.stair') || !cueFlag(s, c, 'heard.window'))
        throw Error('Try the issued score with both people before calling the entrance.');
      if (cmd.entrance !== 'window' && cmd.entrance !== 'procession')
        throw Error('Choose where the evening begins.');
      return [
        set(c, 'show', cmd.entrance),
        set(c, 'playedBar', edition.bar),
        set(c, 'playedFace', edition.face),
        { setFlag: 'almanac.lastShow', value: c.id + '.' + cmd.entrance },
      ];
    }
  }
}
export function almanacDiary(s: CampaignState, cmd: AlmanacCommand) {
  const c = equippedCalendar(s);
  if (!c) return;
  const bar = workingBar(s, c);
  let detail = '',
    line = '',
    title = '';
  switch (cmd.act) {
    case 'turn':
      detail = cmd.face;
      title = cmd.face === 'silence' ? 'The unprinted leaf' : c[cmd.face].tab;
      line = 'I opened the almanac beside ' + c.title + '. ' + faceCaption(c, cmd.face);
      break;
    case 'place':
      detail = bar;
      title = 'Six places on a score';
      line = 'I put ' + cueNames[cmd.cue] + ' on beat ' + (cmd.beat + 1) + '. My score ran ' + barWords(bar) + '.';
      break;
    case 'listen':
    case 'rehearse': {
      const used = cmd.act === 'listen' ? bar : lastEdition(s, c)!.bar;
      const beats = cuePositions(used, cmd.lane);
      detail = cmd.lane + '.' + used;
      title = cmd.lane === 'stair' ? 'On the stair with the drummer' : 'At the window with the lantern';
      line =
        'I tried ' +
        (cmd.act === 'listen' ? 'my arrangement' : 'the issued score') +
        ' ' +
        (cmd.lane === 'stair' ? 'from the stair' : 'at the closed window') +
        '. ' +
        (beats.length
          ? 'The cue reached this listener on ' + beats.join(', ') + '.'
          : 'All six beats passed without a cue reaching this listener.');
      break;
    }
    case 'send': {
      const ed = lastEdition(s, c)!;
      detail = ed.face + '.' + ed.bar;
      title = 'A street score for the reading hall';
      line = 'I sent the six beats with the caption I had chosen. ' + faceCaption(c, ed.face);
      break;
    }
    case 'perform': {
      const ed = lastEdition(s, c)!;
      detail = cmd.entrance + '.' + ed.face + '.' + ed.bar;
      title = cmd.entrance === 'window' ? 'The blind opens first' : 'The procession leaves the stair';
      line =
        (cmd.entrance === 'window'
          ? 'I waited at the window for the first reply. '
          : 'I let the drummer take the street. ') +
        c.reply +
        ' We kept the printed caption with the music. ' +
        faceCaption(c, ed.face);
      break;
    }
  }
  return diaryEvent(
    'street-almanac:' + c.id + ':' + cmd.act + ':' + detail,
    cmd.act === 'perform' ? 'choice' : 'tool',
    c.exhibit,
    title,
    line,
    { sourceIds: [...new Set([c.source, c.context])] },
    cmd.act === 'perform' || cmd.act === 'send'
      ? 'after-break'
      : { fixedToolPrefix: 'street-almanac:' + c.id + ':' + cmd.act + ':' },
  );
}
