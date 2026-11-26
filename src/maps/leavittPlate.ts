import {
  LEAVITT_CARD, LEAVITT_EXHIBIT, LEAVITT_KEY, LEAVITT_REVISIT, LeavittReady,
  arrival, calibrated, leavittRoute, leavittUsed, mirror,
} from '../content/leavittPlate';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, node, x, y, w: 1, h: 1, label, art, visibleIf, kind: 'scene', walkThrough: true, sfx: 'sfx.page' };
}

const seen: Condition = { card: LEAVITT_CARD };
const unsent: Condition = { not: { flagSet: 'leavitt.plate.route' } };

export const LEAVITT_ARCHIVE: Interactable[] = [
  { id: 'leavitt-original-plate', kind: 'exhibit', exhibit: LEAVITT_EXHIBIT, x: 8, y: 12, w: 1, h: 1,
    label: 'the record of Harvard glass plate a02969', art: 'reading-works.leavitt', visibleIf: arrival },
  scene('leavitt-glass-turn', 'leavitt.plate.turn', 9, 12, 'the practice plate on two stops', 'reading-works.leavitt',
    { all: [seen, { not: mirror }] }),
  scene('leavitt-glass-reply', 'leavitt.plate.mirror-reply', 9, 12, 'the turned trace and sky chart', 'reading-works.leavitt.first', mirror),
  scene('leavitt-paper-compare', 'leavitt.plate.compare', 8, 13, 'the two paper exposures and control circle', 'board-stand',
    { all: [seen, { not: calibrated }] }),
  scene('leavitt-paper-reply', 'leavitt.plate.calibrated-reply', 8, 13, 'the two aligned control circles', 'reading-works.leavitt.second', calibrated),
  scene('leavitt-send', 'leavitt.plate.dispatch', 9, 13, 'the headland’s two available stands', 'preserved.folder',
    { all: [LeavittReady, unsent] }),
  ...(['chart', 'watch'] as const).flatMap((route): Interactable[] => [
    scene(`leavitt-project-${route}`, `leavitt.plate.${route}-sent`, 9, 13,
      'the copy for the headland', 'preserved.slip', { all: [leavittRoute(route), { not: leavittUsed(route) }] }),
    scene(`leavitt-archive-reply-${route}`, `leavitt.plate.${route}-reply`, 9, 13, 'the headland’s return word',
      route === 'chart' ? 'reading-works.leavitt.first' : 'reading-works.leavitt.second', leavittUsed(route)),
  ]),
];

export const LEAVITT_HEADLAND: Interactable[] = (['chart', 'watch'] as const).flatMap((route) => {
  const east = route === 'chart';
  const [x, y] = east ? [14, 11] : [6, 13];
  return [
    scene(`leavitt-headland-${route}`, `leavitt.plate.${route}`, x, y,
      east ? 'the chart on the east headland stand' : 'the dated watch strip on the west low board',
      'board-stand', { all: [leavittRoute(route), { not: leavittUsed(route) }] }),
    scene(`leavitt-headland-${route}-kept`, `leavitt.plate.${route}-reply`, x, y,
      east ? 'the registered east chart' : 'the west board with room for another date',
      east ? 'reading-works.leavitt.first' : 'reading-works.leavitt.second', leavittUsed(route)),
  ];
});

const turned: Condition = { flag: 'leavitt.revisit.nile.used', eq: true };

export const LEAVITT_NILE_REVISIT: Interactable[] = [
  scene(LEAVITT_REVISIT.prop, 'leavitt.revisit.nile', 18, 9, 'Marek’s two older tracings and the glass corner marks',
    'reading-works.leavitt', { all: [specimenEquipped(LEAVITT_KEY), { not: turned }] }),
  scene('leavitt-nile-checked', 'leavitt.revisit.nile-reply', 18, 9, 'the two source corners in Marek’s turned frame',
    'reading-works.leavitt.first', turned),
];
