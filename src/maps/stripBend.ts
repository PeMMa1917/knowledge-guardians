import { BEND_CARD, BEND_TOOL, bendLayout, type BendPlan, type BendSite } from '../domain/stripBend';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

function bench(site: BendSite, id: string, x: number, y: number, label: string, visibleIf: Condition): Interactable {
  return { kind: 'fieldgame', game: BEND_TOOL + site, id, x, y, w: 1, h: 1, label, visibleIf,
    walkThrough: true, art: 'board-stand' };
}

function receipt(site: BendSite, plan: BendPlan, id: string, x: number, y: number, label: string, art: string, text: string): Interactable {
  return { kind: 'sign', id, x, y, w: 1, h: 1, label, art, text, walkThrough: true, flag: `bend.${site}.received`,
    visibleIf: { flag: bendLayout(site), eq: plan } };
}

export const NILE_BEND_BOARD: Interactable[] = [
  bench('nile', 'nile-bend-board', 8, 5, 'Marek’s practice strip and weight', { card: 'card.nile.mine' }),
  receipt('nile', 'reading', 'nile-bend-reading', 6, 8, 'the short reading rail with Marek’s card', 'preserved.display-records',
    '“One mark down with the weight on. Back to the line when it comes off.” Marek moves the model within reach of the seated reader. The runner has to carry the far bundle over. The City’s Landing crew keeps a matching card.'),
  receipt('nile', 'return', 'nile-bend-return', 9, 7, 'the long work tray with Marek’s card', 'preserved.display-paired',
    '“Six marks down while the weight is on. Back to the line when it comes off.” Marek leaves the runner room for the wide bundle. The seated reader checks after the lift. The City’s Landing crew keeps a matching card.'),
];

export const LANDING_BEND_BOARD: Interactable[] = [
  bench('landing', 'copies-bend-board', 19, 7, 'Mina’s used strip at the returns practice board', { item: BEND_CARD }),
  receipt('landing', 'short', 'copies-bend-short', 18, 11, 'Mina’s short stand by the bench', 'preserved.display-records',
    'A reader checks the line while Mina holds the bundle over the short rail. The runner brings the wide bundle over in two parts. Mina tags the old strip with its two unloaded marks and takes it out of the practice rack.'),
  receipt('landing', 'long', 'copies-bend-long', 24, 10, 'Mina’s far tray beside the ramp', 'preserved.display-paired',
    'The runner stays beside the wide bundle at the far tray. The waiting reader takes a seat while Mina lifts the weight, then checks the return line. Mina tags the old strip with its two unloaded marks and takes it out of the practice rack.'),
];
