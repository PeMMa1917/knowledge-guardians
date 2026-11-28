import type { CampaignState, Effect } from './types';
import { diaryEvent } from './adventureEvents';

export const perches = {
  lamp: 'the rail beside the patent drawing',
  desk: 'the reading desk',
  case: 'the new glass cabinet',
} as const;
export const linings = {
  glass: 'new glass',
  cuff: 'Kip’s faded wool cuff',
  brass: 'the polished old door pull',
} as const;
export type Perch = keyof typeof perches;
export type Lining = keyof typeof linings;
export type Shutter = 'open' | 'hooded';
export type MothVisit = { perch: Perch; lining: Lining; shutter: Shutter };
export type PerchCommand = { type: 'TryMothPerch' } & MothVisit;
export type WelcomeCommand = { type: 'WelcomeMoth'; perch: Perch };
const flag = 'moth.perch.';
export function visitKey(v: MothVisit) {
  return [v.perch, v.lining, v.shutter].join('.');
}
function parseVisit(raw: unknown): MothVisit | undefined {
  const parts = typeof raw === 'string' ? raw.split('.') : [];
  if (
    parts.length === 3 &&
    Object.hasOwn(perches, parts[0]) &&
    Object.hasOwn(linings, parts[1]) &&
    ['open', 'hooded'].includes(parts[2])
  )
    return {
      perch: parts[0] as Perch,
      lining: parts[1] as Lining,
      shutter: parts[2] as Shutter,
    };
}
export function lastMothVisit(s: CampaignState) {
  return parseVisit(s.flags[flag + 'last']);
}
export function traceMoth(v: MothVisit) {
  if (!parseVisit(visitKey(v)))
    throw new Error('Choose a perch, lining and shutter.');
  const warm = v.lining !== 'glass',
    bright = v.shutter === 'open';
  const landing = warm
    ? v.lining === 'cuff'
      ? 'Its toes hook a loose thread. It settles long enough for the cuff to sag.'
      : 'It folds its wings in the thumb hollow on the old brass.'
    : bright
      ? 'It flies through the lamplight. Its feet never meet the glass.'
      : 'Its wing brushes your sleeve on the way past. The glass stays empty.';
  const light = warm
    ? bright
      ? 'Light catches the outer edge. A smaller gold pulse continues under the wing.'
      : 'With the shutter down you can still see a gold pulse inside the folded wing.'
    : bright
      ? 'The bright streak moves with your lamp.'
      : 'You hear paper rustle somewhere beyond the perch.';
  return { lands: warm, text: landing + ' ' + light };
}
export function tryMothPerch(s: CampaignState, cmd: PerchCommand): Effect[] {
  traceMoth(cmd);
  if (s.mapId !== 'nexus.archive')
    throw new Error('Kip left the folding perch in the Archive.');
  if (s.flags['lor.glimmermoth.seen.' + cmd.perch] !== true)
    throw new Error('Visit that perch before moving its lining.');
  const seen = Object.keys(perches).filter(
    (k) => s.flags['lor.glimmermoth.seen.' + k] === true,
  );
  if (seen.length < 2)
    throw new Error(
      'Find the moth at a second place so Kip can lend you the other panel.',
    );
  const effects: Effect[] = [
    { setFlag: flag + 'last', value: visitKey(cmd) },
    { setFlag: flag + visitKey(cmd), value: true },
  ];
  if (cmd.shutter === 'open') {
    const alternatives: Lining[] =
      cmd.lining === 'glass' ? ['cuff', 'brass'] : ['glass'];
    if (
      alternatives.some(
        (lining) => s.flags[flag + visitKey({ ...cmd, lining })] === true,
      )
    )
      effects.push({ setFlag: 'meet.fray.shadow-twins', value: true });
  }
  return effects;
}
/** Isolate one change at the same stand. Moving site and changing the material together leaves both explanations open. */
export function comparableVisit(s: CampaignState, v: MothVisit) {
  for (const lining of Object.keys(linings) as Lining[])
    for (const shutter of ['open', 'hooded'] as Shutter[]) {
      const changed =
        Number(lining !== v.lining) + Number(shutter !== v.shutter);
      if (changed !== 1) continue;
      if (
        s.flags[flag + visitKey({ perch: v.perch, lining, shutter })] === true
      )
        return true;
    }
  return false;
}
const welcomes: Record<Perch, string> = {
  lamp: 'Kip slips his little shutter behind the rail. The rest of the Archive shines while a small patch stays dark for folded wings. The moth steps onto your sleeve and leaves the bright half of the drawing to the next reader.',
  desk: 'You leave a place at the quiet end of the desk. Kip has been sent away twice for tapping there. This time he puts his finger down quite still. The moth rests on it before climbing onto your sleeve.',
  case: 'You lay the perch beside the cabinet and leave the visitor’s view through the glass clear. The cabinet keeper starts to wipe away a fingerprint, sees the moth at your cuff, and hands the cloth back to you.',
};
export function inviteMoth(s: CampaignState, perch: Perch) {
  const v = lastMothVisit(s);
  if (s.mapId !== 'nexus.archive' || !v || v.perch !== perch)
    throw new Error('Return to the perch where you last watched the moth.');
  if (!traceMoth(v).lands)
    return {
      ok: false,
      text: 'There is room on the perch. The moth has still to find something it will hold onto.',
    };
  if (!comparableVisit(s, v))
    return {
      ok: false,
      text: 'It rests for a moment. Keep this stand in place and change just the lining or the shutter. Kip wants to leave the next keeper a trial they can repeat.',
    };
  return { ok: true, text: welcomes[perch] };
}
export function mothPerchDiary(cmd: PerchCommand) {
  return diaryEvent(
    'moth-perch:' + visitKey(cmd),
    'tool',
    'glimmermoth',
    'At ' + perches[cmd.perch],
    'I set ' +
      linings[cmd.lining] +
      ' at ' +
      perches[cmd.perch] +
      ' with the shutter ' +
      cmd.shutter +
      '. ' +
      traceMoth(cmd).text,
    { outcome: 'checked' },
    { fixedToolPrefix: 'moth-perch:' },
  );
}
