import type { GameController } from '../app/controller';
import {
  BASKET_BELLS, BASKET_CREDITS, BASKET_GOODS, BASKET_NAMES, BASKET_PRICES, basketCost, basketCount, basketReceipt, creditTerms, sealedBasket,
  type Basket, type BasketAction, type BasketForm, type BasketGood, type BasketReceipt,
} from '../domain/marketBasket';
import { h } from './dom';
import './marketBasket.css';

const SINGLE: Record<BasketGood, string> = { oil: 'oil bottle', wick: 'wick roll', flour: 'flour sack' };
const HEADINGS = { bench: 'Three Goods, Two Bells', voucher: 'Oduya’s reserved shelf', credit: 'Corvan’s open counter' };
const PREFIX = 'market.basket';

function icon(good: BasketGood) {
  return h('span', { class: `basket-pixel ${good}`, 'aria-hidden': 'true' });
}

function stock(basket: Basket) {
  return h('div', { class: 'basket-stock', role: 'group', 'aria-label': 'Goods in the basket' },
    BASKET_GOODS.map((good) => h('div', { class: 'basket-quantity' }, icon(good),
      h('strong', {}, `${basket[good]} ${basket[good] === 1 ? SINGLE[good] : BASKET_NAMES[good].toLowerCase()}`))));
}

function quoteSlip(basket: Basket, quote: 'opening' | 'next') {
  const cost = basketCost(basket, quote);
  const change = BASKET_CREDITS - cost;
  return h('section', { class: 'basket-quote' }, h('h3', {}, BASKET_BELLS[quote]),
    h('ul', {}, BASKET_GOODS.map((good) => h('li', {}, `${basket[good]} × ${SINGLE[good]} at ${BASKET_PRICES[quote][good]} credits`))),
    h('p', {}, h('strong', {}, `Total ${cost} credits.`), change < 0 ? ` Eight credits leave ${-change} owing.` : ' Eight credits cover this basket.'));
}

function receiptSlip(form: BasketForm, receipt: BasketReceipt) {
  return h('section', { class: 'basket-receipt' }, h('h3', {}, 'Signed receipt'), stock(receipt.basket), h('p', {},
    form === 'voucher' ? 'Oduya released the named goods and freed their space on the reserve shelf.'
      : `${receipt.quote === 'reserved' ? '' : BASKET_BELLS[receipt.quote] + '. '}${receipt.spent} credits spent. ${receipt.remainder} remain with the co-op.`));
}

export function marketBasketPanel(site: 'bench' | BasketForm, controller: GameController, sound: (key: string) => void): HTMLElement {
  const body = h('div');
  const status = h('p', { 'aria-live': 'polite', class: 'basket-status' });
  let load: Basket = { oil: 0, wick: 0, flour: 0 };

  function control(id: string, text: string, run: () => void, disabled = false) {
    return h('button', { type: 'button', 'data-basket-control': id, disabled, onclick: run }, text);
  }

  function perform(action: BasketAction, message: string, focus?: string) {
    const failure = controller.dispatch(action).find((event) => event.kind === 'error');
    if (failure) {
      status.textContent = failure.message;
      return;
    }
    status.textContent = message;
    sound(action.type === 'RedeemBasketTicket' ? 'sfx.pickup' : 'sfx.click');
    draw(focus);
  }

  function bench(basket: Basket | null) {
    const flags = controller.state.flags;
    const phase = flags[`${PREFIX}.phase`];
    if (phase === 'voucher' || phase === 'credit') return [
      h('p', {}, phase === 'voucher'
        ? 'The signed voucher is in your bag. The exact goods are reserved at Oduya’s shelf in Emberford.'
        : 'The signed credit is in your bag. Bring it to Corvan’s open counter in Emberford.'),
      basket ? stock(basket) : '',
    ];
    const sealed = phase === 'checking' ? basket : null;
    const opening = flags[`${PREFIX}.quoted.opening`] === true;
    const next = flags[`${PREFIX}.quoted.next`] === true;
    return [
      h('p', {}, 'Dagny sets out one oil bottle, one wick roll and one flour sack. Add an extra for the co-op and seal the four together. Her practice purse holds eight credits.'),
      h('div', { class: 'row wrap', role: 'group', 'aria-label': sealed ? 'Repack the basket' : 'Tie in an extra good' },
        BASKET_GOODS.map((good) => control(`seal-${good}`, `${sealed ? 'Repack with an extra' : 'Seal with an extra'} ${SINGLE[good]}`,
          () => perform({ type: 'SealMarketBasket', extra: good }, 'The basket is sealed. Both quotes will use these four goods.', 'quote-opening'),
          !!sealed && sealed[good] === 2))),
      sealed ? stock(sealed) : '',
      sealed ? h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Dated quote rails' },
        control('quote-opening', opening ? 'Day 1 quote attached' : 'Carry the basket to the Day 1 rail',
          () => perform({ type: 'QuoteMarketBasket', quote: 'opening' }, 'The Day 1 quote is clipped to the sealed basket.', next ? 'issue-voucher' : 'quote-next'), opening),
        control('quote-next', next ? 'Day 2 quote attached' : 'Carry the basket to the Day 2 rail',
          () => perform({ type: 'QuoteMarketBasket', quote: 'next' }, 'The Day 2 quote is clipped to that same basket.', opening ? 'issue-voucher' : 'quote-opening'), next)) : '',
      sealed ? h('div', { class: 'basket-quotes' }, opening ? quoteSlip(sealed, 'opening') : '', next ? quoteSlip(sealed, 'next') : '') : '',
      sealed && opening && next ? h('div', { class: 'basket-quotes' },
        h('section', {}, h('p', {}, 'Oduya holds these exact quantities. The co-op gets the chosen goods and the shelf stays tied up until collection.'),
          control('issue-voucher', 'Sign the goods voucher', () => perform({ type: 'IssueBasketTicket', form: 'voucher' }, 'The signed voucher is in your bag.'))),
        h('section', {}, h('p', {}, 'Corvan keeps the shelves open. The co-op can change the mix. The current price or a later review determines what it can collect.'),
          control('issue-credit', 'Sign reviewable credit', () => perform({ type: 'IssueBasketTicket', form: 'credit' }, 'The signed credit is in your bag.')))) : '',
    ];
  }

  function credit() {
    const { credits, quote } = creditTerms(controller.state.flags);
    const total = basketCost(load, quote);
    return [
      h('p', {}, 'Corvan slides the dated price rail over. “Pack what the crew can use. I can take a review request if you need a later collection.”'),
      h('p', {}, h('strong', {}, BASKET_BELLS[quote]), ` · ${credits} co-op credits available.`),
      quote === 'next' ? control('review', 'Send the credit for a Day 3 review', () =>
        perform({ type: 'ReviewBasketCredit' }, 'The co-op waits for Day 3. Its review adds three credits. Day 3 prices now apply.', 'oil-add'))
        : h('p', {}, 'The review added three credits and moved collection to this bell.'),
      h('ul', { class: 'basket-counter' }, BASKET_GOODS.map((good) => h('li', {}, icon(good),
        h('span', {}, `${BASKET_NAMES[good]} · ${BASKET_PRICES[quote][good]} each · ${load[good]} packed`),
        control(`${good}-add`, `Add ${SINGLE[good]}`, () => adjust(good, 1), basketCount(load) >= 4 || total + BASKET_PRICES[quote][good] > credits),
        control(`${good}-remove`, `Remove ${SINGLE[good]}`, () => adjust(good, -1), load[good] === 0)))),
      h('p', {}, `${basketCount(load)} of four spaces filled. ${total} credits used. ${credits - total} left.`),
      control('settle', 'Settle the packed basket',
        () => perform({ type: 'RedeemBasketTicket', form: 'credit', basket: load }, 'The co-op collected this mix and kept its dated receipt.'), !basketCount(load) || total > credits),
    ];
  }

  function draw(focusId?: string) {
    const flags = controller.state.flags;
    const phase = flags[`${PREFIX}.phase`];
    const extra = flags[`${PREFIX}.extra`] as BasketGood;
    const basket = extra ? sealedBasket(extra) : null;
    if (site === 'bench') body.replaceChildren(...bench(basket));
    else if (phase !== site) {
      const receipt = basketReceipt(flags, site);
      body.replaceChildren(receipt ? receiptSlip(site, receipt) : h('p', {}, 'This counter has no active co-op ticket.'));
    } else if (site === 'credit') body.replaceChildren(...credit());
    else body.replaceChildren(h('p', {}, 'Oduya lays the exact four goods on the shelf. The order used those spaces until the handover.'),
      basket ? stock(basket) : '', control('collect', 'Collect the reserved basket',
        () => perform({ type: 'RedeemBasketTicket', form: 'voucher' }, 'The co-op received the exact goods.')));
    const focus = focusId && body.querySelector<HTMLButtonElement>(`[data-basket-control="${focusId}"]:not([disabled])`);
    if (focus) focus.focus();
    else if (focusId) body.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }

  function adjust(good: BasketGood, by: 1 | -1) {
    load = { ...load, [good]: load[good] + by };
    status.textContent = `${BASKET_NAMES[good]} in the basket, ${load[good]}. ${basketCount(load)} goods packed.`;
    draw(`${good}-${by > 0 ? 'add' : 'remove'}`);
  }

  draw();
  return h('div', { class: 'basket-panel' }, h('h2', {}, HEADINGS[site]), body, status);
}
