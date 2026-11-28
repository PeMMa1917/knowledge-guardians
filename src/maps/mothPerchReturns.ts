import type { Perch } from '../domain/mothPerches';
import { mothReturns, mothPresent } from '../content/mothPerchReturns';
import type { Interactable } from './types';

export function mothVisit(home: Perch, x: number, y: number): Interactable[] {
  const room = mothReturns[home],
    id = 'moth.return.' + home;
  const scene: Interactable = {
    id: 'moth-work-' + home,
    kind: 'scene',
    node: id,
    label: room.label,
    art: room.art,
    x,
    y,
    w: 1,
    h: 1,
    walkThrough: true,
    visibleIf: { all: [mothPresent(home), { not: { flagSet: id } }] },
  };
  return [
    scene,
    ...room.options.map((o, i): Interactable => ({
      id: 'moth-receipt-' + home + '-' + o.id,
      kind: 'scene',
      node: id + '.' + o.id + '.again',
      label: room.label,
      art: i === 0 ? 'preserved.display-paired' : 'preserved.display-records',
      x,
      y,
      w: 1,
      h: 1,
      walkThrough: true,
      visibleIf: { flag: id, eq: o.id },
    })),
  ];
}
