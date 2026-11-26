import { BASKET_FORMS, type BasketForm } from '../domain/marketBasket';
import type { Interactable } from './types';

const FINISHED = { objective: 'market.finish' } as const;

export const MARKET_BASKET: Interactable[] = [
  { id: 'market-basket-note', kind: 'exhibit', exhibit: 'OBJ-BASKET-ZWL-100T', x: 16, y: 17, w: 1, h: 1,
    label: 'the Smithsonian catalogue mount for a Zimbabwe banknote', art: 'market.note-mount', walkThrough: true, visibleIf: FINISHED },
  { id: 'market-basket-bench', kind: 'fieldgame', game: 'market-basket-bench', x: 16, y: 18, w: 1, h: 1,
    label: 'Dagny’s two-bell basket bench', art: 'market.window', walkThrough: true, visibleIf: FINISHED },
];

const COUNTERS = {
  voucher: { x: 15, y: 10, label: 'Oduya’s reserved-goods shelf' },
  credit: { x: 27, y: 13, label: 'Corvan’s open credit counter' },
};

function counter(form: BasketForm): Interactable {
  const ticket = { item: `item.market.basket.${form}` };
  const receipt = { flagSet: `market.basket.receipt.${form}` };
  return {
    ...COUNTERS[form], id: `market-basket-${form}`, kind: 'fieldgame', game: `market-basket-${form}`, w: 1, h: 1, walkThrough: true,
    visibleIf: { any: [ticket, receipt] },
    art: form === 'voucher' ? 'crate-wares' : 'ledger',
    artOpen: { key: 'preserved.display-paired', if: { all: [receipt, { not: ticket }] } },
  };
}

export const EMBERFORD_BASKET = BASKET_FORMS.map(counter);
