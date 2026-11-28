import type { CampaignState, Effect, Weave } from './types';
import { diaryEvent } from './adventureEvents';

export const SUPPER_ROOM = 'copies.supper-room';
export const SUPPER_GAME = 'supper-shadow';
export const lamps = {
  centre: [0],
  left: [-4],
  right: [4],
  sides: [-4, 4],
  dark: [],
} as const;
export const lampNames = {
  centre: 'Middle lamp',
  left: 'Left lamp',
  right: 'Right lamp',
  sides: 'Both side lamps',
  dark: 'Shutters closed',
} as const;
export type Lamps = keyof typeof lamps;
export type Screen = 'chalk' | 'lit';
export type BarStop = 'middle' | 'near';
export type ShadowCommand = {
  type: 'CastSupperShadow';
  lamps: Lamps;
  spoons: 1 | 2;
  screen: Screen;
  depth?: BarStop;
};
export const shadowMark = (cmd: Omit<ShadowCommand, 'type'>) =>
  [
    'supper',
    cmd.spoons,
    cmd.lamps,
    cmd.screen,
    ...(cmd.depth === 'near' ? ['near'] : []),
  ].join('.');
export const supperWeave: Weave = {
  concepts: [
    'evidence',
    'explanation',
    'certainty',
    'truth',
    'objectivity',
    'interpretation',
  ],
  framework: ['methods-and-tools', 'scope', 'perspectives'],
  atl: ['research', 'thinking'],
  aoks: ['NAT', 'ART', 'MAT'],
  subjects: ['physics', 'theatre', 'math-aa', 'design-tech'],
  thinking: {
    dok: 3,
    bloom: 'analyse',
    fink: 'integration',
    solo: 'relational',
  },
  minutes: 4,
};

// Point sources. The spoon bar sits halfway or two thirds of the way from the lamps to the curtain.
// Keep blocked-light counts. Lit shadows from one and two sources can differ in brightness.
export function castShadows(
  setting: Lamps,
  spoons: 1 | 2,
  depth: BarStop = 'middle',
) {
  const sources = lamps[setting];
  const magnification = depth === 'near' ? 1.5 : 2;
  const cutouts = spoons === 1 ? [0] : [-2, 2];
  const shadows = new Map<number, number>();
  for (const light of sources) {
    for (const spoon of cutouts) {
      const at = light + magnification * (spoon - light);
      shadows.set(at, (shadows.get(at) ?? 0) + 1);
    }
  }
  return [...shadows]
    .sort(([left], [right]) => left - right)
    .map(([at, blocked]) => ({ at, full: blocked === sources.length }));
}

export function shadowReading(cmd: Omit<ShadowCommand, 'type'>) {
  const cast = castShadows(cmd.lamps, cmd.spoons, cmd.depth);
  if (!cast.length)
    return 'Every wick is covered. The screen goes dark. There is no lit edge to trace.';
  const positions = cast
    .map(({ at }) =>
      at === 0 ? 'centre' : Math.abs(at) + (at < 0 ? ' left' : ' right'),
    )
    .join(', ');
  const outlines =
    cast.length === 1 ? 'One outline' : cast.length + ' outlines';
  if (cmd.screen === 'chalk')
    return (
      outlines +
      ' on the cloth (' +
      positions +
      '). A chalk line holds an edge. It leaves out the brightness on either side.'
    );
  const tones = cast.every((s) => s.full)
    ? 'Each shadow cuts off all the light reaching that place.'
    : cast.some((s) => s.full)
      ? 'The middle shadow is darker. It loses light from both lamps. The outer shadows still catch light from the other side.'
      : 'Each spoon shadow still catches light from the other lamp. The marks are pale enough to read through.';
  return outlines + ' on the lit screen (' + positions + '). ' + tones;
}

export function shadowEffects(s: CampaignState, cmd: ShadowCommand): Effect[] {
  if (s.mapId !== SUPPER_ROOM)
    throw new Error('The lamps and spoon rack are behind Otla’s supper hatch.');
  if (
    !Object.hasOwn(lamps, cmd.lamps) ||
    (cmd.spoons !== 1 && cmd.spoons !== 2) ||
    (cmd.screen !== 'chalk' && cmd.screen !== 'lit') ||
    (cmd.depth !== undefined && cmd.depth !== 'middle' && cmd.depth !== 'near')
  )
    throw new Error('Choose the lamps, a spoon bar and a screen.');
  return [
    { setFlag: 'supper.lamps', value: cmd.lamps },
    { setFlag: 'supper.spoons', value: cmd.spoons },
    { setFlag: 'supper.depth', value: cmd.depth ?? 'middle' },
    { setFlag: 'supper.screen', value: cmd.screen },
    { setFlag: shadowMark(cmd), value: true },
  ];
}

export function shadowDiary(cmd: ShadowCommand) {
  const setup =
    (cmd.spoons === 1 ? 'one spoon' : 'two spoons') +
    ' · ' +
    lampNames[cmd.lamps];
  return diaryEvent(
    'supper:' + shadowMark(cmd),
    'tool',
    'supper.lamps',
    'At Otla’s supper screen',
    'I tried ' +
      setup.toLowerCase() +
      (cmd.depth === 'near'
        ? ' at the stop near the cloth'
        : ' at the middle stop') +
      ' with ' +
      (cmd.screen === 'chalk' ? 'the chalk tracing' : 'the light showing') +
      '. ' +
      shadowReading(cmd),
    { outcome: 'checked' },
    { fixedToolPrefix: 'supper:' },
  );
}
