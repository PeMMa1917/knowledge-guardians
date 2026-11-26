import { DISPATCH_GAME, dispatchCount, dispatchReceived, type DispatchDesk } from '../domain/tiles';
import type { Interactable } from './types';

export function sefaDispatchDesk(desk: DispatchDesk, x: number, y: number): Interactable {
  return {
    id: `sefa-dispatch-${desk}`, kind: 'fieldgame', game: DISPATCH_GAME + desk,
    x, y, w: 1, h: 1, walkThrough: true, art: 'ledger',
    label: desk === 'guild' ? 'Sefa’s dispatch clip at the guild desk' : 'Sefa’s dispatch clip at the landing desk',
    visibleIf: { num: dispatchCount(desk), gte: 1 },
    artOpen: { key: 'preserved.display-paired', if: { num: dispatchReceived(desk), gte: 1 } },
  };
}
