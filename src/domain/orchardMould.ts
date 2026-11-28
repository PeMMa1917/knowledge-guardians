import { diaryEvent } from './adventureEvents';
import { check } from './rules';
import { PERKINS_VOLUME, specimenEquipped } from './specimenGear';
import { PLUM_LOFT } from './plumChest';
import type { CampaignState, Effect } from './types';

export const mouldBookEquipped = specimenEquipped(PERKINS_VOLUME);
export const mouldSurfaces = ['fresh', 'worn'] as const;
export const mouldPressures = ['light', 'working', 'heavy'] as const;
export type Surface = (typeof mouldSurfaces)[number];
export type Pressure = (typeof mouldPressures)[number];
export type MouldCommand = {
  type: 'DrawOrchardStylus';
  surface: Surface;
  pressure: Pressure;
};

// Fen's two invented practice offcuts use a seven-notch track, with flat ends to locate the beginning and end.
// A light touch skims the lowest ridge. The wide contact patch of a heavy draw bridges a one-notch hollow.
export function traceMould(surface: Surface, pressure: Pressure) {
  if (!mouldSurfaces.includes(surface) || !mouldPressures.includes(pressure))
    throw new Error('Choose one of Fen’s moulds and a hand pressure.');
  const pair =
    surface === 'fresh' ? [0, 2, 2, 0, 2, 2, 0] : [0, 1, 2, 1, 2, 1, 0];
  const ridge =
    surface === 'fresh' ? [0, 2, 2, 2, 2, 2, 0] : [0, 1, 2, 2, 2, 1, 0];
  const trace = (shape: number[]) => {
    const raised = shape.map((h) => h >= (pressure === 'light' ? 2 : 1));
    return pressure === 'heavy'
      ? raised.map(
          (value, i) => value || (raised[i - 1] && raised[i + 1]) === true,
        )
      : raised;
  };
  const first = trace(pair),
    second = trace(ridge);
  const same = first.every((v, i) => v === second[i]);
  const report = same
    ? pressure === 'heavy'
      ? 'The broad foot of the stylus spans the hollow. Both tracks feel continuous through the middle.'
      : 'At this pressure the shallow fill catches the stylus. The pair feels continuous, just like the ridge.'
    : pressure === 'light' && surface === 'worn'
      ? 'A lighter touch skims over the shallow fill. The fourth notch separates the high spots on the first tab. The other stays raised.'
      : 'Your stylus settles in the middle hollow on the paired tab. On the ridge it carries across. The fourth notch is where the readings part.';
  return { first, second, same, report };
}

export function mouldEffects(s: CampaignState, cmd: MouldCommand): Effect[] {
  if (s.mapId !== PLUM_LOFT || !check(mouldBookEquipped, s))
    throw new Error(
      'Bring the Perkins volume to Fen’s low table and equip it.',
    );
  traceMould(cmd.surface, cmd.pressure);
  return [
    { setFlag: 'plum.mould.last', value: cmd.surface + '.' + cmd.pressure },
    { setFlag: 'plum.mould.' + cmd.surface + '.' + cmd.pressure, value: true },
  ];
}

export function mouldDiary(cmd: MouldCommand) {
  const reading = traceMould(cmd.surface, cmd.pressure);
  return diaryEvent(
    'plum:mould:' + cmd.surface + ':' + cmd.pressure,
    'tool',
    'plum.mould',
    'At Fen’s workbench',
    'I drew the stylus across Fen’s two wooden tabs at ' +
      cmd.pressure +
      ' pressure on the ' +
      cmd.surface +
      ' mould. ' +
      reading.report,
    { outcome: 'checked' },
    { fixedToolPrefix: 'plum:mould:' },
  );
}
