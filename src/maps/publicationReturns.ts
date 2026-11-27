import { BIRO_RETURN, GREEN_RETURN, guideReady, guideStarted, penReady } from '../content/publicationReturns';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, walkThrough: true, label, art, visibleIf };
}

function receipt(stem: string, route: string, x: number, y: number, label: string, art: string): Interactable[] {
  const id = `${stem}.${route}`;
  const planned: Condition = { flag: `${stem}.plan`, eq: route };
  const received: Condition = { flag: `${stem}.receipt`, eq: route };
  return [
    scene(id, id, x, y, label, art, { all: [planned, { not: received }] }),
    scene(`${id}-result`, `${id}-result`, x, y, label, 'preserved.display-records', { all: [planned, received] }),
  ];
}

export function publicationReturnsAt(map: string): Interactable[] {
  if (map === BIRO_RETURN.map) {
    const stem = BIRO_RETURN.flag;
    return [
      { ...scene(BIRO_RETURN.prop, `${stem}.bench`, 9, 16, 'Hesper’s strip bench', 'slate-board', penReady),
        artOpen: { key: 'preserved.display-paired', if: { all: [{ flag: `${stem}.fixed`, eq: 6 }, { flag: `${stem}.strap`, eq: 4 }] } } },
      ...receipt(stem, 'rail', 10, 20, 'Della’s writing rail at the bread stall', 'nile.tablet'),
      ...receipt(stem, 'rounds', 21, 22, 'Idris’s portable rest by the south road', 'fold.paired'),
    ];
  }
  if (map === GREEN_RETURN.map) {
    const stem = GREEN_RETURN.flag;
    return [
      scene(GREEN_RETURN.prop, `${stem}.board`, 11, 6, 'Tova’s dry-room board', 'ferry-slate', guideReady),
      { ...scene('second-bell-listing', `${stem}.old`, 10, 4, 'the dated Dry Room listing', 'preserved.slip', guideStarted),
        artOpen: { key: 'nile.slip', if: { flag: `${stem}.old`, eq: true } } },
      { ...scene('second-bell-permission', `${stem}.permission`, 3, 6, 'Enna’s permission at the kitchen bench', 'nile.slip', guideStarted),
        artOpen: { key: 'fold.paired', if: { flag: `${stem}.confirmed`, eq: true } } },
      ...receipt(stem, 'public', 8, 4, 'the confirmed Dry Room notice by the road', 'preserved.slip'),
      ...receipt(stem, 'staffed', 1, 6, 'Enna’s staffed shelter desk', 'ledger'),
    ];
  }
  return [];
}
