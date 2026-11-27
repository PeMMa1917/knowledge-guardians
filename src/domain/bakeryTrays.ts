import type { CampaignState, Effect } from './types';
import { diaryEvent } from './adventureEvents';

export const bakeryTrays = {
  small: { name: 'Six small loaves', count: 6, weight: 1 },
  large: { name: 'Three large loaves', count: 3, weight: 2 },
} as const;
export type Tray = keyof typeof bakeryTrays;
export type TrayAction = 'choose' | 'deliver' | 'return' | 'weigh';
export type BakeryCommand = {
  type: 'MoveBakeryTray';
  tray: Tray;
  action: TrayAction;
};

export function seeTray(s: CampaignState, tray: Tray) {
  const recipe = bakeryTrays[tray];
  const stored = Number(s.flags['tally.delivered.' + tray]);
  const delivered = Number.isInteger(stored)
    ? Math.max(0, Math.min(recipe.count, stored))
    : 0;
  const remaining = recipe.count - delivered;
  return { delivered, remaining, weight: remaining * recipe.weight };
}
export function changeTray(s: CampaignState, cmd: BakeryCommand): Effect[] {
  if (
    s.mapId !== 'aethelgard.emberford' ||
    !Object.hasOwn(bakeryTrays, cmd.tray)
  )
    throw new Error('The trays are at the Emberford bake bench.');
  const view = seeTray(s, cmd.tray);
  const effects: Effect[] = [{ setFlag: 'tally.tray', value: cmd.tray }];
  switch (cmd.action) {
    case 'choose':
      break;
    case 'deliver':
      if (!view.remaining)
        throw new Error(
          'Every loaf from this tray is at a door. Take one back to try another delivery.',
        );
      effects.push({
        setFlag: 'tally.delivered.' + cmd.tray,
        value: view.delivered + 1,
      });
      break;
    case 'return':
      if (!view.delivered)
        throw new Error('Every loaf is already on this tray.');
      effects.push({
        setFlag: 'tally.delivered.' + cmd.tray,
        value: view.delivered - 1,
      });
      break;
    case 'weigh':
      effects.push({
        setFlag: 'tally.weighed.' + cmd.tray,
        value: view.delivered,
      });
      if (view.delivered <= 1)
        effects.push({
          setFlag:
            'tally.checked.' +
            cmd.tray +
            (view.delivered === 0 ? '.full' : '.one-out'),
          value: true,
        });
      break;
    default:
      throw new Error('Choose a tray action.');
  }
  return effects;
}
export function trayReport(s: CampaignState, tray: Tray) {
  const { delivered, remaining, weight } = seeTray(s, tray);
  return (
    delivered +
    ' of the six doors have a loaf. ' +
    remaining +
    ' ' +
    (remaining === 1 ? 'loaf remains' : 'loaves remain') +
    ' on the tray, weighing ' +
    weight +
    ' ' +
    (weight === 1 ? 'unit.' : 'units.')
  );
}
export function bakeryDiary(s: CampaignState, cmd: BakeryCommand) {
  const what = {
    choose: 'I took out',
    deliver: 'I moved one loaf to the next door from',
    return: 'I put a loaf back on',
    weigh: 'I balanced',
  }[cmd.action];
  return diaryEvent(
    'tally-tray:' +
      cmd.tray +
      ':' +
      cmd.action +
      ':' +
      seeTray(s, cmd.tray).delivered,
    'tool',
    'emberford.tally',
    'At Della’s bake bench',
    what + ' the ' + cmd.tray + '-loaf tray. ' + trayReport(s, cmd.tray),
    { outcome: 'checked' },
    'after-break',
  );
}
