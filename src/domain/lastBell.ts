import {
  bellCuts,
  bellGrooves,
  bellLeaves,
  hearingChoices,
  lastBellObjective,
  lastBellScenes,
  relayRuns,
  sleeveEntry,
  secondHearing,
  type LastBellSite,
} from '../content/lastBell';
import type { CampaignState, Effect } from './types';
import { watchReading } from './watchBell';
import { diaryEvent } from './adventureEvents';

type State = Pick<CampaignState, 'flags' | 'mapId'>;
type Trial =
  | { site: 'voices'; action: 'spin'; first: number; last: number }
  | { site: 'island'; action: 'send'; runner: number; fog: boolean }
  | { site: 'voices'; action: 'sleeve' }
  | { site: 'island'; action: 'walk' }
  | { site: 'council'; action: 'reopen'; petition: number }
  | { site: 'council'; action: 'lay'; leaf: number };
export type LastBellCommand = { type: 'WorkLastBell' } & (
  | Trial
  | { site: LastBellSite; action: 'leave'; choice: number }
);
const binary = (v: unknown): v is 0 | 1 => v === 0 || v === 1;
const third = (v: unknown): v is 0 | 1 | 2 => binary(v) || v === 2;
const set = (setFlag: string, value: string | number | boolean): Effect => ({ setFlag, value });

export function cylinder(first: number, last: number) {
  if (!third(first) || !third(last) || first > last)
    throw new Error('Keep the end stop at or beyond the start.');
  return bellGrooves.slice(first, last + 1).join(' ');
}

export const fieldWalk =
  'Joss walks you across the hinged plank in her muddy boots. From the kiln it drops underfoot in one beat. Coming back from the loft, you have to lift it by its iron ring. Four beats. Ivo wipes the two matching chalk marks off his hill.';

export function relayRun(runner: number, fog: boolean, measured = false) {
  if (!binary(runner) || typeof fog !== 'boolean') throw new Error('Choose a route and a shutter setting.');
  // The optical path takes two beats. The runner reaches the first house in three
  // and then crosses the footbridge. Both paths start at the quay.
  const light = fog ? Infinity : 2;
  const bridge = measured ? [1, 4][runner] : 2;
  const beats = relayRuns.map((_, i) => Math.min(light, i === runner ? 3 : 3 + bridge));
  const text =
    relayRuns
      .map(
        (house, i) =>
          house +
          ' at beat ' +
          beats[i] +
          (beats[i] > 4
            ? ', after the crossing shut'
            : beats[i] === 4
              ? ', as the crossing shut'
              : ', before the crossing shut'),
      )
      .join('. ') + '.';
  return { beats, text };
}

export function benchOrder(state: State) {
  const raw = state.flags['last-bell.council.work'];
  return typeof raw === 'string' && /^(?:[012]|01|02|10|12|20|21)$/.test(raw) ? [...raw].map(Number) : [];
}

export function hearingRecord(state: State, leaf: number) {
  if (leaf === 0) {
    const cut = state.flags[lastBellObjective('voices')];
    return binary(cut)
      ? 'From Wren’s table. ' + bellCuts[cut].account
      : 'On loan from Wren. A household heard a bell by the stove. The witness could not hear the tower from there.';
  }
  if (leaf === 1) {
    const route = state.flags[lastBellObjective('island')];
    return binary(route)
      ? 'From my trial. In fog Joss runs to the ' +
          relayRuns[route].toLowerCase() +
          ' first. ' +
          relayRun(route, true, state.flags['last-bell.island.published-walk'] === true).text
      : 'Ivo’s loan chart. Light needs two beats via a clear tower. The chart records a model run. Nobody timed a runner on the hill that night.';
  }
  const roll = state.flags['night-watch.dispatch.left'];
  const receipt =
    roll === 0
      ? 'Ro kept the relay staffed until last call.'
      : roll === 1
        ? 'Ro sent the runner out before the last call.'
        : 'Loan from the dispatch desk.';
  return receipt + ' Four of six households replied. The two empty lines leave what they heard unknown.';
}

const limits = [
  'One room’s hearing cannot tell the council who rang the tower bell.',
  'A journey on a wooden hill cannot identify the person on the real steps that night.',
  'Two blank lines cannot tell anyone why two families stayed silent.',
];
const speakers = [
  'A girl sets the kitchen bell on the sill so everyone can see how small it is.',
  'Joss puts her boots on the desk. There is still clay in one heel.',
  'Ro unfolds the rota. The two blank lines have thumb marks where she kept checking them.',
];

const exchanges: Record<string, string> = {
  '01': '“Nobody in our kitchen heard it,” says the girl. Joss takes the tower lamp off the chart. “Then let me find a way to you with that light gone.”',
  '10': 'Joss points to the first house on her chart. The girl turns the little bell over. “A line getting to our door doesn’t mean we heard anything through it.”',
  '02': 'The girl asks Ro to look for her address. Ro holds up an empty line. “I wish I had left room for what you just told us.”',
  '20': 'Ro counts four replies. The girl places her kitchen bell on one of the two empty lines. For the first time Ro can point to a person outside her count.',
  '12': 'Joss moves a boot along the relay. Ro lays the replies underneath. “Your little boot goes through both these houses. Neither sent me a light.”',
  '21': 'Ro asks who can reach the two blank addresses. Joss sets one boot down, then the other. “I can go to both. Tell me which one can afford to wait.”',
};
export const hearingExchange = (order: number[]) => exchanges[order.join('')];

export function hearingMinute(state: State, order: number[], choice: number) {
  if (order.length !== 2 || !third(order[0]) || !third(order[1]) || order[0] === order[1] || !binary(choice))
    throw new Error('Lay two different records on the desk.');
  return [
    speakers[order[0]],
    hearingRecord(state, order[0]),
    hearingRecord(state, order[1]),
    hearingExchange(order),
    limits[order[1]],
    hearingChoices[choice].outcome,
  ].join(' ');
}

export function lastBellReady(state: State, site: LastBellSite) {
  if (site === 'voices')
    return ['00', '02'].every((cut) => state.flags['last-bell.voices.seen.' + cut] === true);
  if (site === 'island')
    return (
      ['01', '11'].every((run) => state.flags['last-bell.island.seen.' + run] === true) &&
      ['00', '10'].some((run) => state.flags['last-bell.island.seen.' + run] === true)
    );
  return benchOrder(state).length === 2;
}

export function hearingReturns(state: State) {
  const gate = state.flags['night-watch.gate.left'],
    dispatch = state.flags['night-watch.dispatch.left'];
  return [
    {
      place: 'Maro’s gate at the Old Weir',
      ready: third(gate),
      detail: third(gate)
        ? 'Maro left the clip at ' + [2, 4, 5][gate] + ' marks. ' + watchReading('gate', gate)
        : '',
    },
    { place: 'Ro’s rota in Library Dispatch', ready: binary(dispatch), detail: hearingRecord(state, 2) },
    {
      place: 'Wren’s kitchen witness in the Listening Room',
      ready: binary(state.flags[lastBellObjective('voices')]),
      detail: hearingRecord(state, 0),
    },
    {
      place: 'Joss’s walked route in the Plan Workshop',
      ready: state.flags['last-bell.island.field-check'] === true,
      detail: hearingRecord(state, 1),
    },
  ];
}

export function lastBellEffects(cmd: LastBellCommand, state: State): Effect[] {
  if (!Object.hasOwn(lastBellScenes, cmd.site) || state.mapId !== lastBellScenes[cmd.site].map)
    throw new Error('Find the receiving lamp in this chapter.');
  const prefix = 'last-bell.' + cmd.site,
    work = prefix + '.work';
  if (cmd.action === 'reopen') {
    const records = hearingReturns(state);
    if (
      !binary(cmd.petition) ||
      !binary(state.flags[lastBellObjective('council')]) ||
      !records.every((r) => r.ready)
    )
      throw new Error('Sign a first hearing and bring all four keepers’ records.');
    const addendum = records.map((r) => r.detail).join(' ') + ' ' + secondHearing[cmd.petition].answer;
    return [set(prefix + '.reopened', cmd.petition), set(prefix + '.addendum', addendum)];
  }
  if (cmd.action === 'sleeve') return [set('last-bell.voices.sleeve', true)];
  if (cmd.action === 'walk') {
    if (!binary(state.flags[lastBellObjective('island')]))
      throw new Error('Post a route before taking the bridge out for a walk.');
    if (state.flags['last-bell.bridge.back'] !== true)
      throw new Error(
        'Take the footpath beside the plinth. Time the plank from the kiln and back before changing the model.',
      );
    return [set(prefix + '.walked', true)];
  }
  if (cmd.action === 'spin' || cmd.action === 'send') {
    let trial: string;
    if (cmd.action === 'spin') {
      cylinder(cmd.first, cmd.last);
      trial = String(cmd.first) + cmd.last;
    } else {
      relayRun(cmd.runner, cmd.fog);
      trial = String(cmd.runner) + Number(cmd.fog);
    }
    const effects = [set(work, trial), set(prefix + '.seen.' + trial, true)];
    if (cmd.action === 'send') {
      const measured = state.flags[prefix + '.walked'] === true;
      effects.push(set(prefix + '.run-measured', measured));
      if (measured && cmd.fog) effects.push(set(prefix + '.verified.' + cmd.runner, true));
    }
    return effects;
  }
  if (cmd.action === 'lay') {
    if (!third(cmd.leaf)) throw new Error('Choose a record from the hearing desk.');
    return [set(work, [...benchOrder(state).filter((n) => n !== cmd.leaf), cmd.leaf].slice(-2).join(''))];
  }
  if (!binary(cmd.choice) || !lastBellReady(state, cmd.site))
    throw new Error(lastBellScenes[cmd.site].hints[3]);
  const effects = [set(lastBellObjective(cmd.site), cmd.choice)];
  if (cmd.site === 'island') {
    const walked = state.flags[prefix + '.walked'] === true;
    if (walked && state.flags[prefix + '.verified.' + cmd.choice] !== true)
      throw new Error('Run this lane in fog again with the measured bridge time.');
    effects.push(set(prefix + '.published-walk', walked));
    if (walked) effects.push(set(prefix + '.field-check', true));
  }
  // Reopening the workbench never rewrites the previously signed public minute.
  if (cmd.site === 'council')
    effects.push(set(prefix + '.minute', hearingMinute(state, benchOrder(state), cmd.choice)));
  return effects;
}

export function lastBellDiary(cmd: LastBellCommand, previous: State, next: State) {
  const base = 'last-bell.' + cmd.site,
    objective = lastBellObjective(cmd.site);
  const work = next.flags[base + '.work'],
    choice = cmd.action === 'leave';
  if (cmd.action === 'reopen') {
    if (previous.flags[base + '.addendum'] === next.flags[base + '.addendum']) return;
    return diaryEvent(
      base + ':reopen:' + cmd.petition,
      'choice',
      base + '.reopened',
      'Two empty lines at dawn',
      'I asked for the hearing to sit again. ' + next.flags[base + '.addendum'],
      {},
      'after-break',
    );
  }
  if (cmd.action === 'sleeve') {
    if (previous.flags['last-bell.voices.sleeve'] === true) return;
    return diaryEvent(
      base + ':sleeve',
      'inspection',
      base + '.sleeve',
      lastBellScenes.voices.title,
      'I followed the shelf mark on the chalk clipping. ' + sleeveEntry,
    );
  }
  if (cmd.action === 'walk') {
    if (previous.flags[base + '.walked'] === true) return;
    return diaryEvent(
      base + ':walk',
      'tool',
      base + '.field-check',
      lastBellScenes.island.title,
      'I held the other end of Joss’s measuring cord. ' + fieldWalk,
    );
  }
  const unchangedRun = previous.flags[base + '.run-measured'] === next.flags[base + '.run-measured'];
  const unchangedPublication =
    previous.flags[base + '.published-walk'] === next.flags[base + '.published-walk'];
  if (
    choice
      ? unchangedPublication &&
        previous.flags[objective] === next.flags[objective] &&
        previous.flags[base + '.minute'] === next.flags[base + '.minute']
      : unchangedRun && previous.flags[base + '.work'] === work
  )
    return;
  let text: string;
  if (cmd.action === 'spin')
    text =
      'I set the stops at grooves ' +
      (cmd.first + 1) +
      ' and ' +
      (cmd.last + 1) +
      '. I heard “' +
      cylinder(cmd.first, cmd.last) +
      '”';
  else if (cmd.action === 'send')
    text =
      'I sent the runner to the ' +
      relayRuns[cmd.runner].toLowerCase() +
      ' first ' +
      (cmd.fog ? 'with the tower in fog. ' : 'in clear air. ') +
      relayRun(cmd.runner, cmd.fog, next.flags[base + '.run-measured'] === true).text;
  else if (cmd.action === 'lay')
    text =
      'I laid out ' +
      benchOrder(next)
        .map((n) => bellLeaves[n])
        .join(' then ') +
      '. ' +
      hearingRecord(next, cmd.leaf);
  else if (cmd.site === 'voices')
    text =
      'I carried the witness’s choice out of the listening room. ' +
      bellCuts[cmd.choice].account +
      ' ' +
      bellCuts[cmd.choice].outcome;
  else if (cmd.site === 'island')
    text =
      'I put Joss’s boots at the ' +
      relayRuns[cmd.choice].toLowerCase() +
      ' end of the bridge. ' +
      routeEnding(cmd.choice) +
      (next.flags[base + '.published-walk'] === true ? ' I left the measured bridge time on the chart.' : '');
  else text = 'I stayed to see who took the chair. ' + next.flags[base + '.minute'];
  const suffix = choice ? cmd.choice + (cmd.site === 'council' ? ':' + work : '') : work;
  const revision = cmd.site === 'island' && next.flags[base + '.walked'] === true ? ':walked' : '';
  return diaryEvent(
    base + ':' + cmd.action + ':' + suffix + revision,
    choice ? 'choice' : 'tool',
    objective,
    lastBellScenes[cmd.site].title,
    text,
    {},
    'after-break',
  );
}

export function routeEnding(runner: number) {
  return runner === 0
    ? 'Joss gives the kiln crew the first knock. For the boy in the loft she ties a note to her other boot so she cannot go home without him. Hale has left a place for her chart under the hearing lamp in Time Hall.'
    : 'Joss promises the first knock to the sail loft. The kiln crew moves its wet clay upstairs early, carrying it twice if the night stays clear. They fold their copy of the chart to fit Hale’s hearing desk in Time Hall.';
}
