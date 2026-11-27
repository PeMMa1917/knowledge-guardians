import type { GameController } from '../app/controller';
import { LOAD_CASES, LOAD_GATE, type LoadCase } from '../content/loadingBay';
import { cartLean, changeLoad, fitLoad, LOAD_FIXES, LOAD_NOTCHES, loadKey, loadMove, readLoad, type LoadMove, type LoadNotch, type LoadRoute, type LoadState } from '../domain/loadingBay';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './loadingBay.css';

const HANDOVER = { bench: 'Hale’s low deposit bench in Time Hall', call: 'Essi’s handover rail in the Letter Gallery' } as const;
const notchLabel = (notch: LoadNotch) => notch === -1 ? 'left notch' : 'right notch';
const leanLabel = (lean: number) => lean === 0 ? 'The board is level.' : `The ${lean < 0 ? 'left' : 'right'} end lowers. Lean ${Math.abs(lean)} trial units.`;

function cart(load: LoadState, axle: LoadNotch) {
  const [left, right, leftSlot, rightSlot] = load;
  const lean = cartLean(load, axle);
  const slot = (label: string, index: number) => h('span', { class: 'load-slot', style: `grid-column: ${index + 4}` }, label);
  return h('div', { class: 'load-cart' }, h('div', { class: 'load-cart-board', 'aria-hidden': true, style: `--tilt:${Math.sign(lean) * 3}deg` },
    slot(String(left), leftSlot), slot(String(right), rightSlot)),
    h('div', { class: 'load-cart-axle', 'aria-hidden': true }, slot('▲', axle)),
    h('p', { class: 'fine' }, `Left box ${left} at mark ${leftSlot}. Right box ${right} at mark ${rightSlot}. Axle at the ${notchLabel(axle)}. ${leanLabel(lean)}`));
}

export function loadingBayPanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  const body = h('div');
  const report = h('p', { role: 'status', class: 'fine' });
  const panel = h('div', { class: 'load-panel', tabindex: -1 }, body, report);
  const [station, slug] = place.split(':');

  function step(record: LoadCase, move: LoadMove, id: string, text: string, result: string, disabled = false) {
    return h('button', { type: 'button', 'data-load-step': id, disabled, onclick: () => {
      if (!controller.check(LOAD_GATE) || !controller.check({ card: record.card })) return;
      if (station === 'return' && !controller.check(specimenEquipped(record.key))) return;
      const effect = loadMove(record.slug, controller.state.flags, move);
      if (!effect) return;
      const events = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
      if (events.some(({ kind }) => kind === 'error')) return;
      sound(move.type === 'fit' || move.type === 'receive' ? 'sfx.sparkle' : 'sfx.pickup');
      if (move.type === 'send' || move.type === 'receive' || move.type === 'fit') refreshWorld();
      render();
      report.textContent = result;
      const outcome = move.type === 'fit' ? body.querySelector<HTMLElement>('[data-load-result]') : null;
      (outcome ?? body.querySelector<HTMLElement>(`button[data-load-step="${id}"]:enabled`) ?? body.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
    } }, text);
  }

  function trial(record: LoadCase) {
    const flags = controller.state.flags;
    const key = loadKey(record.slug);
    const state = readLoad(record.slug, flags);
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Read the dated collection record next to the cart before starting the trial.'));
      return;
    }
    body.append(h('p', { class: 'fine' }, record.evidence), h('p', {}, record.limit),
      h('p', {}, `Load the two practice boxes for ${record.job}. Keep them on their rings while you move the axle.`));
    const runs = h('div', { class: 'load-layout' });
    for (const notch of LOAD_NOTCHES) {
      const measured = flags[`${key}.notch.${notch}`] === true;
      runs.append(h('section', { class: 'clue-view' }, h('h3', {}, notch === -1 ? 'Left notch' : 'Right notch'),
        measured ? cart(record.load, notch) : null,
        step(record, { type: 'measure', notch }, `notch-${notch}`, `Try the ${notchLabel(notch)}`, leanLabel(cartLean(record.load, notch)), measured || !!state.route),
        measured && state.baseReady && !state.route ? step(record, { type: 'mark', notch }, `mark-${notch}`, `Mark the ${notchLabel(notch)}`, `The cart will go with the ${notchLabel(notch)} marked.`, state.axle === notch) : null));
    }
    body.append(runs);
    if (state.axle === undefined) return;
    body.append(h('p', {}, `Marked ${notchLabel(state.axle)}. ${leanLabel(cartLean(record.load, state.axle))}`));
    if (state.route) {
      body.append(h('p', {}, state.received ? `The cart stays in use at ${HANDOVER[state.route]}.` : `Take this cart to ${HANDOVER[state.route]}.`));
      return;
    }
    body.append(h('div', { class: 'row wrap' },
      step(record, { type: 'send', route: 'bench' }, 'send-bench', 'Send a cart to the low bench', 'Hale can leave one preset for people who come between shifts.'),
      step(record, { type: 'send', route: 'call' }, 'send-call', 'Take the two readings to the rail', 'Essi can swap the notches for the people at handover.')));
  }

  function receiver(route: LoadRoute) {
    body.append(h('h2', {}, HANDOVER[route]));
    for (const record of LOAD_CASES) {
      const state = readLoad(record.slug, controller.state.flags);
      if (state.route !== route || state.axle === undefined) continue;
      const status = route === 'bench'
        ? `The cart for ${record.job} waits at the low bench. One person can use the marked notch without waiting for Essi.`
        : `Essi keeps space for both notches on the cart for ${record.job}. The next group can compare the two readings together at handover.`;
      body.append(h('section', { class: 'clue-view' }, h('h3', {}, record.name), cart(record.load, state.axle),
        h('p', { class: 'fine' }, `${record.institution} · ${record.accession}`),
        route === 'call' ? h('p', {}, LOAD_NOTCHES.map((notch) => `${notchLabel(notch)}. ${leanLabel(cartLean(record.load, notch))}`).join(' ')) : null,
        state.received ? h('p', {}, status) : step(record, { type: 'receive', route }, `receive-${record.slug}`,
          route === 'bench' ? 'Seat the cart in its marked cradle' : 'Set both notches for the next handover', status)));
    }
    if (body.childElementCount === 1) body.append(h('p', {}, 'The clips here are empty. The Cart Bay has the source cases and their practice carts.'));
  }

  function revisit(record: LoadCase) {
    const state = readLoad(record.slug, controller.state.flags);
    const { axle } = state;
    body.append(h('h2', {}, record.name));
    if (!state.received || axle === undefined || !controller.check(specimenEquipped(record.key))) {
      body.append(h('p', {}, `Equip ${record.name} in the Bag to uncover its load record.`));
      return;
    }
    const changed = changeLoad(record.load, record.changedRight, record.changedSlot);
    body.append(h('p', {}, record.change), h('p', {}, `The marked ${notchLabel(axle)} first held a right box of ${record.load[1]} at ring ${record.load[3]}. The box now reads ${changed[1]} at ring ${changed[3]}.`),
      step(record, { type: 'recheck' }, 'recheck', 'Repeat at the old mark', leanLabel(cartLean(changed, axle)), state.returned));
    if (!state.returned) return;
    body.append(cart(changed, axle));
    const choices = h('div', { class: 'load-layout' });
    const key = loadKey(record.slug);
    for (const fix of LOAD_FIXES) {
      const read = controller.state.flags[`${key}.test.${fix}`] === true;
      const result = fitLoad(changed, axle, fix);
      choices.append(h('section', { class: 'clue-view' }, h('h3', {}, fix === 'axle' ? 'Other axle notch' : 'Inner strap ring'),
        read ? cart(result.load, result.axle) : null,
        step(record, { type: 'test', fix }, `test-${fix}`, fix === 'axle' ? 'Try the other axle notch' : 'Try the inner strap ring', leanLabel(result.lean), read || !!state.fix),
        state.fixReady && !state.fix ? step(record, { type: 'fit', fix }, `fit-${fix}`, fix === 'axle' ? 'Set the rack stop at the other notch' : 'Secure the box at the inner ring',
          fix === 'axle' ? record.axleResult : record.tieResult) : null));
    }
    body.append(choices);
    if (state.fix) {
      const fitted = fitLoad(changed, axle, state.fix);
      body.append(h('section', { class: 'clue-view', 'data-load-result': '', tabindex: -1 }, h('h3', {}, 'The fitted cart'), cart(fitted.load, fitted.axle),
        h('p', {}, state.fix === 'axle' ? record.axleResult : record.tieResult)));
    }
  }

  function render() {
    body.replaceChildren();
    if (station === 'bench' || station === 'call') { receiver(station); return; }
    const record = LOAD_CASES.find((entry) => entry.slug === slug);
    if (!record) return;
    if (station === 'trial') trial(record);
    else if (station === 'return') revisit(record);
  }
  render();
  return panel;
}
