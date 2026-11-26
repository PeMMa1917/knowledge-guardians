import type { CampaignState, Effect } from './types';

export const BASKET_GOODS = ['oil', 'wick', 'flour'] as const;
export const BASKET_QUOTES = ['opening', 'next', 'review'] as const;
export const BASKET_FORMS = ['voucher', 'credit'] as const;
export const BASKET_CREDITS = 8;
const REVIEW_TOP_UP = 3;

export type BasketGood = typeof BASKET_GOODS[number];
export type BasketQuote = typeof BASKET_QUOTES[number];
export type BasketForm = typeof BASKET_FORMS[number];
export type Basket = Record<BasketGood, number>;
export type BasketAction = { type: 'SealMarketBasket'; extra: BasketGood }
  | { type: 'QuoteMarketBasket'; quote: 'opening' | 'next' }
  | { type: 'IssueBasketTicket'; form: BasketForm }
  | { type: 'ReviewBasketCredit' }
  | { type: 'RedeemBasketTicket'; form: 'voucher' }
  | { type: 'RedeemBasketTicket'; form: 'credit'; basket: Basket };

export const BASKET_PRICES: Record<BasketQuote, Basket> = {
  opening: { oil: 2, wick: 2, flour: 2 },
  next: { oil: 5, wick: 1, flour: 3 },
  review: { oil: 5, wick: 1, flour: 4 },
};

export const BASKET_NAMES: Record<BasketGood, string> = { oil: 'Oil bottles', wick: 'Wick rolls', flour: 'Flour sacks' };
export const BASKET_BELLS: Record<BasketQuote, string> = {
  opening: 'Lantern Day 1, opening bell',
  next: 'Lantern Day 2, receiving bell',
  review: 'Lantern Day 3, review bell',
};

const PREFIX = 'market.basket';
const KEY = `item.${PREFIX}`;
const set = (key: string, value: string | boolean): Effect => ({ setFlag: `${PREFIX}.${key}`, value });

export interface BasketReceipt {
  basket: Basket;
  quote: BasketQuote | 'reserved';
  spent: number | null;
  remainder: number | null;
}

export function sealedBasket(extra: BasketGood): Basket {
  return { oil: 1 + Number(extra === 'oil'), wick: 1 + Number(extra === 'wick'), flour: 1 + Number(extra === 'flour') };
}

export function basketCost(basket: Basket, quote: BasketQuote): number {
  return BASKET_GOODS.reduce((sum, good) => sum + basket[good] * BASKET_PRICES[quote][good], 0);
}

export function basketCount(basket: Basket): number {
  return BASKET_GOODS.reduce((sum, good) => sum + basket[good], 0);
}

function validBasket(basket: Basket): boolean {
  return !!basket && BASKET_GOODS.every((good) => Number.isInteger(basket[good]) && basket[good] >= 0 && basket[good] <= 4)
    && basketCount(basket) > 0 && basketCount(basket) <= 4;
}

export function basketReceipt(flags: CampaignState['flags'], form: BasketForm): BasketReceipt | null {
  const raw = flags[`${PREFIX}.receipt.${form}`];
  if (typeof raw !== 'string') return null;
  try {
    const receipt = JSON.parse(raw) as BasketReceipt;
    return receipt && validBasket(receipt.basket) ? receipt : null;
  } catch {
    return null;
  }
}

export function creditTerms(flags: CampaignState['flags']): { quote: 'next' | 'review'; credits: number } {
  return flags[`${PREFIX}.reviewed`] === true ? { quote: 'review', credits: BASKET_CREDITS + REVIEW_TOP_UP }
    : { quote: 'next', credits: BASKET_CREDITS };
}

export function marketBasketEffects(action: BasketAction, state: CampaignState): Effect[] {
  const { flags, inventory, mapId, objectivesDone } = state;
  if (!objectivesDone.includes('market.finish')) throw new Error('Visit the basket bench after the main market measure is checked.');
  const phase = flags[`${PREFIX}.phase`];
  const opening = flags[`${PREFIX}.quoted.opening`] === true;
  const next = flags[`${PREFIX}.quoted.next`] === true;
  const extra = flags[`${PREFIX}.extra`] as BasketGood;
  const market = mapId === 'market.square';
  if (action.type === 'SealMarketBasket') {
    if (!market || !BASKET_GOODS.includes(action.extra) || BASKET_FORMS.some((form) => phase === form)) {
      throw new Error('First deliver the current ticket. Then select the extra good at Dagny’s bench.');
    }
    return [set('phase', 'checking'), set('extra', action.extra), set('quoted.opening', false), set('quoted.next', false), set('reviewed', false)];
  }
  if (action.type === 'QuoteMarketBasket') {
    if (!market || phase !== 'checking' || (action.quote !== 'opening' && action.quote !== 'next')) {
      throw new Error('Seal the basket at Dagny’s bench before quoting it.');
    }
    return [set(`quoted.${action.quote}`, true)];
  }
  if (action.type === 'IssueBasketTicket') {
    if (!market || phase !== 'checking' || !opening || !next || !BASKET_FORMS.includes(action.form)) {
      throw new Error('Quote the same sealed basket against both dated prices first.');
    }
    return [set('phase', action.form), set('issued', true), { giveItem: `${KEY}.${action.form}` }];
  }
  const form = action.type === 'ReviewBasketCredit' ? 'credit' : action.form;
  const item = `${KEY}.${form}`;
  if (mapId !== 'aethelgard.emberford' || phase !== form || !(inventory[item] > 0)) {
    throw new Error('Bring the matching signed ticket to its Emberford counter.');
  }
  if (action.type === 'ReviewBasketCredit') {
    if (flags[`${PREFIX}.reviewed`] === true) throw new Error('The credit already has its review slip.');
    return [set('reviewed', true)];
  }
  let receipt: BasketReceipt;
  if (action.form === 'voucher') {
    receipt = { basket: sealedBasket(extra), quote: 'reserved', spent: null, remainder: null };
  } else {
    if (!validBasket(action.basket)) throw new Error('Pack at least one good and at most four.');
    const { quote, credits } = creditTerms(flags);
    const spent = basketCost(action.basket, quote);
    if (spent > credits) throw new Error('This mix costs more than the signed credit.');
    receipt = { basket: action.basket, quote, spent, remainder: credits - spent };
  }
  return [{ takeItem: item }, set('phase', 'received'), set('fulfilled', action.form),
    set(`receipt.${action.form}`, JSON.stringify(receipt))];
}
