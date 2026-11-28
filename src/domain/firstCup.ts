import { diaryEvent } from './adventureEvents';
import { carriesSpecimen, ownsSpecimen, PERSPECTIVE_FLAG, specimenToolId } from './specimenGear';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const cupShop = 'market.first-cup';
export const cupStops = { weir: 'water.gatehouse', steps: 'civic.steps' } as const;
export type CupStop = keyof typeof cupStops;
export type Counter = 'two' | 'eight' | 'blank';
export type Bench = 'mill' | 'steps';
export type Carafe = 'warm' | 'cool';
export type Awning = 'chalk' | 'slips';
export type Wrap = 'bare' | 'felt';
export const cocoaTin = 'spri:y-72-1-2';
export const tickets = { two: '2', eight: '8', blank: 'an empty box' } as const;
export const benches = { mill: 'the mill break room', steps: 'the step repair crew' } as const;
export const stops = { weir: 'the Old Weir', steps: 'the North Steps' } as const;
export const signs = { chalk: 'a posted starting price', slips: 'folded offers in the cup' } as const;
export const cupWeave: Weave = {
  concepts: [
    'evidence',
    'interpretation',
    'objectivity',
    'values',
    'responsibility',
    'perspective',
    'explanation',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['HUM', 'MAT', 'NAT', 'POL'],
  subjects: ['psychology', 'economics', 'physics', 'math-ai', 'business'],
  atl: ['thinking', 'social', 'research'],
  thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' },
};

// In each location nine volunteers drew shuffled tickets. Each person bid once on the same reference serving.
// IDs are seats in a fictional trial. Matching two bids by row would incorrectly pair different people.
export const cupVotes: Record<Bench, Record<Counter, readonly number[]>> = {
  mill: { two: [4, 6, 8], eight: [5, 7, 9], blank: [5, 8, 5] },
  steps: { two: [1, 2, 3], eight: [1, 4, 4], blank: [3, 1, 2] },
};
export function meanBid(values: readonly number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
export const cupFlag = (s: CampaignState, k: string) => s.flags['cup.' + k];
const set = (key: string, value: FlagValue): Effect => ({ setFlag: 'cup.' + key, value });
export function brew(s: CampaignState) {
  const raw = cupFlag(s, 'pour');
  return typeof raw === 'string' && /^[wc]{0,4}$/.test(raw) ? raw : '';
}
export function mixDegrees(pours: string) {
  if (!/^[wc]{1,4}$/.test(pours)) return undefined;
  const warm = Array.from(pours).filter((p) => p === 'w').length;
  return Math.round((10 * (54 * warm + 18 * (pours.length - warm))) / pours.length) / 10;
}
export function dispatchedCup(s: CampaignState) {
  const pour = cupFlag(s, 'sentPour'),
    wrap = cupFlag(s, 'sentWrap'),
    stop = cupFlag(s, 'route');
  if (
    typeof pour !== 'string' ||
    !/^[wc]{4}$/.test(pour) ||
    (wrap !== 'bare' && wrap !== 'felt') ||
    (stop !== 'weir' && stop !== 'steps')
  )
    return;
  return { pour, wrap, stop } as { pour: string; wrap: Wrap; stop: CupStop };
}
export function streetDegrees(mix: number, stop: CupStop, wrap: Wrap) {
  // The two fictional routes lose a different fraction of the heat above ambient. The sleeve halves that loss.
  const fraction = (stop === 'weir' ? 0.25 : 0.5) * (wrap === 'felt' ? 0.5 : 1);
  return Math.round(10 * (18 + (mix - 18) * (1 - fraction))) / 10;
}
export function allTrays(s: CampaignState, b: Bench) {
  return (['two', 'eight', 'blank'] as const).every((t) => cupFlag(s, b + '.' + t) === true);
}
export function wearingCocoa(s: CampaignState) {
  return (
    ownsSpecimen(s, cocoaTin) &&
    carriesSpecimen(s, cocoaTin) &&
    s.flags[PERSPECTIVE_FLAG] === specimenToolId(cocoaTin)
  );
}
export type CupCommand = { type: 'WorkFirstCup' } & (
  | { act: 'pour'; carafe: Carafe }
  | { act: 'takeBack' }
  | { act: 'wrap'; wrap: Wrap }
  | { act: 'tip'; bench: Bench; ticket: Counter }
  | { act: 'rain' }
  | { act: 'roll'; stop: CupStop }
  | { act: 'passers'; bench: Bench; view: 'cups' | 'footsteps' }
  | { act: 'bringBack' }
  | { act: 'compareGauge' }
  | { act: 'hang'; first: 'dial' | 'offers' }
  | { act: 'unfold'; seat: 'loose' | 'heavy' }
  | { act: 'taste'; spot: 'inside' | 'street' }
  | { act: 'serve'; sign: Awning }
  | { act: 'readTin' }
);

export function cupEffects(s: CampaignState, cmd: CupCommand): Effect[] {
  const seen = (k: string) => cupFlag(s, k) === true;
  const batch = dispatchedCup(s);
  const receiving =
    cmd.act === 'serve' ||
    cmd.act === 'taste' ||
    cmd.act === 'compareGauge' ||
    cmd.act === 'unfold' ||
    cmd.act === 'bringBack' ||
    cmd.act === 'hang';
  if (receiving) {
    if (!batch || s.mapId !== cupStops[batch.stop]) throw Error('Meet the cocoa cart where you sent it.');
  } else if (s.mapId !== cupShop) throw Error('Visit the cocoa stairs off Lantern Square.');
  const pour = brew(s);
  switch (cmd.act) {
    case 'pour': {
      if (cmd.carafe !== 'warm' && cmd.carafe !== 'cool') throw Error('Choose one of the two carafes.');
      if (pour.length === 4) throw Error('All four wells are full. Empty the last well to change the blend.');
      return [set('pour', pour + (cmd.carafe === 'warm' ? 'w' : 'c'))];
    }
    case 'takeBack':
      return [set('pour', pour.slice(0, -1))];
    case 'wrap':
      if (cmd.wrap !== 'felt' && cmd.wrap !== 'bare')
        throw Error('Set the jug in the felt sleeve or leave the copper showing.');
      return [set('wrap', cmd.wrap)];
    case 'tip':
      if (!Object.hasOwn(cupVotes, cmd.bench) || !Object.hasOwn(tickets, cmd.ticket))
        throw Error('Choose a tray and a ticket.');
      return [set(cmd.bench + '.' + cmd.ticket, true)];
    case 'passers':
      if (
        !Object.hasOwn(benches, cmd.bench) ||
        (cmd.view !== 'cups' && cmd.view !== 'footsteps') ||
        !allTrays(s, cmd.bench)
      )
        throw Error('Hear three ticket groups at this bench before turning the runner’s tray over.');
      return [set(cmd.bench + '.count.' + cmd.view, true), set(cmd.bench + '.view', cmd.view)];
    case 'rain':
      return [set('rain', true)];
    case 'roll': {
      if (batch) throw Error('The cart is still on the street. Bring the wheels home before sending a new jug.');
      if (!Object.hasOwn(cupStops, cmd.stop)) throw Error('Choose a covered stop on the lane.');
      const wrap = cupFlag(s, 'wrap');
      if (!seen('rain')) throw Error('Lift the inside flap to see which way the rain is driving.');
      if (pour.length !== 4 || (wrap !== 'felt' && wrap !== 'bare'))
        throw Error('Fill the four-scoop jug and choose how it travels.');
      if (!allTrays(s, 'mill') && !allTrays(s, 'steps'))
        throw Error('Hear the two numbers and the empty ticket from one crew before rolling the cart.');
      return [
        set('sentPour', pour),
        set('sentWrap', wrap),
        set('route', cmd.stop),
        set('visited.' + cmd.stop, true),
        set('inside', false),
        set('street', false),
        set('serving', false),
      ];
    }
    case 'bringBack':
      return [set('route', false), set('inside', false), set('street', false), set('serving', false)];
    case 'hang':
      if (cmd.first !== 'dial' && cmd.first !== 'offers')
        throw Error('Choose which of the two readings faces the road.');
      if (
        !seen('gauge') ||
        !seen('inside') ||
        !seen('street') ||
        !seen('seat.loose') ||
        !seen('seat.heavy') ||
        !cupFlag(s, 'serving')
      )
        throw Error('Set the dials side by side and unfold both offers before hanging the facing.');
      return [set('facing.' + batch!.stop, cmd.first)];
    case 'compareGauge':
      return [set('gauge', true)];
    case 'unfold':
      if (cmd.seat !== 'loose' && cmd.seat !== 'heavy') throw Error('Choose a sealed offer at the cart.');
      if (!cupFlag(s, 'serving') || !seen('tversky.return'))
        throw Error('Open the cart and ask Amos about an individual offer.');
      return [set('seat.' + cmd.seat, true)];
    case 'taste':
      if (cmd.spot !== 'inside' && cmd.spot !== 'street')
        throw Error('Try the thermometers at the shop and the stop.');
      return [set(cmd.spot, true)];
    case 'serve':
      if (cmd.sign !== 'chalk' && cmd.sign !== 'slips') throw Error('Choose a way to open the cart.');
      if (!seen('inside') || !seen('street')) throw Error('Compare what Cen poured and what reached the stop.');
      return [set('serving', cmd.sign), set('served.' + batch!.stop + '.' + cmd.sign, true)];
    case 'readTin':
      if (!wearingCocoa(s)) throw Error('Equip the tall Carson’s cocoa tin from Elephant Island.');
      return [set('label', true)];
  }
}
export function cupDiary(s: CampaignState, cmd: CupCommand) {
  const batch = dispatchedCup(s);
  let suffix: string = cmd.act,
    title = '',
    line = '';
  switch (cmd.act) {
    case 'pour':
    case 'takeBack': {
      const p = brew(s);
      suffix += '.' + (p || 'empty');
      title = 'Four scoops of room';
      line = p
        ? 'My ' +
          p.length +
          ' equal scoop' +
          (p.length === 1 ? '' : 's') +
          ' gave a mixing estimate of ' +
          mixDegrees(p) +
          ' °C. There was still a journey between that number and a person’s hands.'
        : 'I emptied the last well. Cen steadied the tray so I could start again.';
      break;
    }
    case 'wrap':
      suffix += '.' + cmd.wrap;
      title = 'The jug’s travelling coat';
      line =
        cmd.wrap === 'felt'
          ? 'I drew the old felt coat round the jug. The dent in the copper disappeared under the cloth.'
          : 'I set the copper jug in its bare hoop. Kit could keep an eye on the fill mark through the gap.';
      break;
    case 'tip': {
      suffix += '.' + cmd.bench + '.' + cmd.ticket;
      title = 'What the three cups brought';
      const offers = cupVotes[cmd.bench][cmd.ticket];
      line =
        'I opened the ' +
        tickets[cmd.ticket] +
        ' ticket from ' +
        benches[cmd.bench] +
        '. The three separate offers for the same reference cup were ' +
        offers.join(', ') +
        '. Nobody paid them.';
      break;
    }
    case 'passers': {
      suffix += '.' + cmd.bench + '.' + cmd.view;
      title = 'Who left a footprint?';
      const n = cmd.bench === 'mill' ? 4 : 6;
      line =
        cmd.view === 'cups'
          ? 'I counted nine separate volunteers in ' + benches[cmd.bench] + '. Each left one offer beside a cup.'
          : 'I turned over the tray at ' +
            benches[cmd.bench] +
            '. The runner had left ' +
            n +
            ' empty places for people who declined. A person who made no offer had never written zero.';
      break;
    }
    case 'rain':
      title = 'The rain came indoors';
      line =
        'I lifted the flap. One fat drop ran down the chalkboard and took the first figure of the price with it. Cen had a joke ready until she saw the wheel moving.';
      break;
    case 'roll':
      suffix += '.' + cmd.stop + '.' + batch!.pour + '.' + batch!.wrap;
      title = 'Wheels under the cocoa';
      line =
        'I tipped four wells into the jug and wheeled the blend to ' +
        stops[cmd.stop] +
        ' in ' +
        (batch!.wrap === 'felt' ? 'the felt sleeve' : 'the bare copper hoop') +
        '. Kit kept the shop thermometer reading for us.';
      break;
    case 'bringBack':
      title = 'The quiet walk back';
      line =
        'I brought the cart’s wheels home. The cup rings stayed on the street long enough for the next person to see where we had stood.';
      break;
    case 'compareGauge':
      title = 'The two needles in the shade';
      line =
        'I set both instruments in the same place. The street dial read 20 °C where Kit’s reference glass read 18 °C. I slid the ring back two degrees. The people’s offers were still their own.';
      break;
    case 'hang':
      suffix += '.' + batch!.stop + '.' + cmd.first;
      title = 'Two meanings of a slant';
      line =
        cmd.first === 'dial'
          ? 'I turned the adjusted dial towards the lane. Kit can subtract a measured offset, but taking two counters off every human offer would invent a motive for its writer.'
          : 'I turned the two mill offers towards the lane. A public starting figure can shift a crew’s pattern without setting any individual bid. On the back Kit kept the street dial’s measured two-degree offset.';
      break;
    case 'unfold':
      suffix += '.' + cmd.seat;
      title = 'The hand behind a folded offer';
      line =
        cmd.seat === 'loose'
          ? 'I opened the mill ticket showing 2. Its owner had offered 8 so the next shift could share a cup.'
          : 'I opened the mill ticket showing 8. Its owner had offered 5, the counters left after replacing a wheel nut.';
      break;
    case 'taste': {
      const adjusted = cupFlag(s, 'gauge') === true;
      const mix = mixDegrees(batch!.pour)!;
      suffix +=
        '.' +
        batch!.stop +
        '.' +
        batch!.pour +
        '.' +
        batch!.wrap +
        '.' +
        cmd.spot +
        (cmd.spot === 'street' ? (adjusted ? '.adjusted' : '.raw') : '');
      title = cmd.spot === 'inside' ? 'The shop thermometer' : 'The thermometer at the cart';
      line =
        cmd.spot === 'inside'
          ? 'I unfolded Kit’s kitchen reading. The mix left at ' + mix + ' °C.'
          : 'I read ' +
            Math.round(10 * (streetDegrees(mix, batch!.stop, batch!.wrap) + (adjusted ? 0 : 2))) / 10 +
            ' °C on the ' +
            (adjusted ? 'adjusted' : 'unadjusted') +
            ' street dial at ' +
            stops[batch!.stop] +
            '. Someone had already set a hand around the cup.';
      break;
    }
    case 'serve':
      suffix += '.' + batch!.stop + '.' + cmd.sign + '.' + batch!.pour + '.' + batch!.wrap;
      title = 'Who gets the first cup?';
      line =
        'I opened the cart at ' +
        stops[batch!.stop] +
        ' with ' +
        signs[cmd.sign] +
        '. ' +
        servingLine(batch!.stop, cmd.sign);
      break;
    case 'readTin':
      title = 'The label that outlived the drink';
      line =
        'I held the unopened Elephant Island tin beside our chalk sign. The label could tell Kit what the tin was sold as. We went back to our own pot to find out how this batch tasted.';
      break;
  }
  return diaryEvent(
    'first-cup:' + suffix,
    cmd.act === 'serve' || cmd.act === 'roll' ? 'choice' : 'tool',
    'first-cup',
    title,
    line,
    cmd.act === 'readTin' ? { sourceIds: ['HIS-SPRI-Y-72-1-2'] } : {},
    'after-break',
  );
}
export function servingLine(stop: CupStop, sign: Awning) {
  if (stop === 'steps')
    return sign === 'chalk'
      ? 'The mason counts out her offer before she reaches the cart. The runner sees the same number, checks his pocket, and sits down on the step.'
      : 'The runner folds a slip and warms his hands. The mason waits for someone to tell her how much to leave, and misses the first sip of her break.';
  return sign === 'chalk'
    ? 'The gate crew sends a runner with a counted purse. The night keeper puts her own loose coin back when she sees the number.'
    : 'The night keeper slips her single coin under the saucer. Across the weir a crew will have to send someone to ask how much to bring.';
}
