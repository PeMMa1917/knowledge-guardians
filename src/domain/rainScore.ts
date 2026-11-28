import type { CampaignState, Effect } from './types';
import { diaryEvent } from './adventureEvents';

export const rainMoves = {
  c: 'Catch a drop in the cuff',
  p: 'Drip straight into the cup',
  t: 'Tip out the cuff',
  s: 'Hold the pose',
} as const;
export type RainMove = keyof typeof rainMoves;
export type RainSeat = 'wings' | 'stalls';
export type Billing = 'wonder' | 'hands';
export type RainCommand = { type: 'WorkCoatRain' } & (
  | { act: 'move'; move: RainMove }
  | { act: 'undo' | 'clear' | 'keep' | 'try-other' }
  | { act: 'listen'; seat: RainSeat }
  | { act: 'bill'; billing: Billing }
);
const flag = (part: string) => 'returned-coat.rain.' + part;
export const rainSite = (map: string) =>
  map === 'stage.foyer'
    ? 'stage'
    : map === 'nexus.coat-lining'
      ? 'lining'
      : undefined;
const opposite = (site: 'stage' | 'lining') =>
  site === 'stage' ? 'lining' : 'stage';
const isBar = (s: unknown): s is string =>
  typeof s === 'string' && /^[cpts]{0,4}$/.test(s);
export function rainDesk(s: Pick<CampaignState, 'flags' | 'mapId'>) {
  const site = rainSite(s.mapId);
  if (!site) return;
  const read = (part: string) => s.flags[flag(site + '.' + part)];
  const score = read('score'),
    kept = read('kept'),
    bill = read('bill'),
    seat = read('seat');
  const peer = opposite(site),
    invitation = s.flags[flag(peer + '.invitation')],
    incoming = s.flags[flag(peer + '.bill')];
  return {
    site,
    score: isBar(score) ? score : '',
    kept: isBar(kept) && kept.length === 4 ? kept : undefined,
    seat: seat === 'stalls' ? ('stalls' as const) : ('wings' as const),
    bill: bill === 'wonder' || bill === 'hands' ? bill : undefined,
    from:
      isBar(invitation) &&
      invitation.length === 4 &&
      (incoming === 'hands' || incoming === 'wonder')
        ? { score: invitation, billing: incoming, site: peer }
        : undefined,
  };
}
export function playRain(score: string) {
  if (!isBar(score)) throw Error('Use up to four beats of rain.');
  let bulb = 2,
    hem = 0;
  const beats = [...score].map((key) => {
    const move = key as RainMove;
    let hits = 0,
      back = '';
    if (move === 's')
      back = 'Nim holds still. The keeper keeps both hands open.';
    if (move === 'c' || move === 'p') {
      if (bulb === 0)
        back = 'The bulb gives a little sigh. Its two drops have already gone.';
      else {
        bulb--;
        if (move === 'c') {
          hem++;
          back = 'One drop slips into the folded hem. The cup stays quiet.';
        } else {
          hits = 1;
          back = 'The keeper squeezes one drop straight into the cup.';
        }
      }
    }
    if (move === 't') {
      hits = hem;
      hem = 0;
      back = hits
        ? 'Nim turns the wet hem out over the cup.'
        : 'Nim turns the cuff inside out. It is dry.';
    }
    const sound =
      hits === 2 ? 'Two close taps.' : hits === 1 ? 'One tap.' : 'Silence.';
    return { move, hits, back, sound, bulb, hem };
  });
  return { beats, bulb, hem, heard: beats.map((b) => b.hits).join('') };
}
export function rainEffects(s: CampaignState, cmd: RainCommand): Effect[] {
  const d = rainDesk(s);
  if (!d)
    throw Error(
      'Find the rain rig in the theatre foyer or behind the Nexus coat rail.',
    );
  const mark = (part: string, value: string | boolean): Effect => ({
    setFlag: flag(d.site + '.' + part),
    value,
  });
  const ready = d.score.length === 4;
  switch (cmd.act) {
    case 'move':
      if (!Object.hasOwn(rainMoves, cmd.move) || ready)
        throw Error('The bar holds four beats. Lift a beat to change it.');
      return [mark('score', d.score + cmd.move)];
    case 'undo':
      return [mark('score', d.score.slice(0, -1))];
    case 'clear':
      return [mark('score', '')];
    case 'listen':
      if (!ready || !['wings', 'stalls'].includes(cmd.seat))
        throw Error(
          'Set four beats, including any silences, before taking a seat.',
        );
      {
        const results = [
          mark('seat', cmd.seat),
          mark('heard.' + cmd.seat, d.score),
        ];
        if (cmd.seat === 'stalls' && d.kept) {
          const first = playRain(d.kept),
            second = playRain(d.score);
          if (
            first.heard === second.heard &&
            first.beats.some(
              (beat, i) => beat.hits > 0 && beat.move !== second.beats[i].move,
            )
          )
            results.push(mark('twocauses', d.kept + '-' + d.score));
        }
        return results;
      }
    case 'keep':
      if (!ready || s.flags[flag(d.site + '.heard.stalls')] !== d.score)
        throw Error(
          'Hear this bar from the stalls before folding it into the programme.',
        );
      return [mark('kept', d.score)];
    case 'bill':
      if (
        !ready ||
        s.flags[flag(d.site + '.heard.stalls')] !== d.score ||
        s.flags[flag(d.site + '.heard.wings')] !== d.score
      )
        throw Error(
          'Try the current four beats from the stalls and the wings before issuing the programme.',
        );
      if (cmd.billing !== 'hands' && cmd.billing !== 'wonder')
        throw Error('Choose the curtain call or the working demonstration.');
      return [
        mark('invitation', d.score),
        mark('bill', cmd.billing),
        { setFlag: 'returned-coat.hem', value: true },
      ];
    case 'try-other':
      if (!d.from) throw Error('The other room has yet to send a programme.');
      return [
        mark('score', d.from.score),
        mark('received', d.from.score + '-' + d.from.billing),
      ];
  }
}
export function rainDiary(s: CampaignState, c: RainCommand) {
  const d = rainDesk(s);
  if (!d) return;
  const bar = playRain(d.score);
  const heard = bar.beats.map((b) => b.sound).join(' ');
  let text: string;
  switch (c.act) {
    case 'move':
      text = 'I set beat ' + d.score.length + '. ' + bar.beats.at(-1)!.back;
      break;
    case 'undo':
      text = 'I lifted the last beat so the two players could try another cue.';
      break;
    case 'clear':
      text = 'I gave Nim and the rain keeper four empty beats to use again.';
      break;
    case 'listen':
      text =
        c.seat === 'stalls'
          ? 'I listened from the stalls. ' + heard
          : 'I stood in the wings. ' + bar.beats.map((b) => b.back).join(' ');
      break;
    case 'keep':
      text =
        'I folded the sound from my first audience into the programme. ' +
        heard;
      break;
    case 'bill':
      text =
        c.billing === 'hands'
          ? 'I let the rain keeper show both hands and explain the trick.'
          : 'I kept the trick behind the curtain and gave the rain keeper a named bow.';
      break;
    case 'try-other':
      text = 'I set out the other room’s programme on our rig. ' + heard;
      break;
  }
  const what =
    c.act === 'listen' ? c.seat : c.act === 'bill' ? c.billing : c.act;
  return diaryEvent(
    'coat-rain:' + d.site + ':' + what + ':' + d.score,
    'tool',
    'returned-coat.rain.' + d.site,
    'Four beats of indoor rain',
    text,
    {},
    'after-break',
  );
}
