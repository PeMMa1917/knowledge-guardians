import type { GameController } from '../app/controller';
import { COUNTER_CASES, COUNTER_ORDERS, replayCounter, type CounterCase, type CounterOrder } from '../domain/counterReplay';
import { h } from './dom';

export function counterReplayBoard(which: CounterCase, controller: GameController, sound: (key: string) => void,
  refreshWorld: () => void): HTMLElement {
  const water = which === 'water';
  const prefix = `${which}.counter`;
  const casePack = COUNTER_CASES[which];
  const orders = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Packet arrival order' });
  const readings = h('ul', { 'aria-label': 'Current source records' });
  const delivered = h('ol', { 'aria-label': 'Envelopes in this replay' });
  const totals = h('p', { class: 'fine', 'aria-live': 'polite' });
  const status = h('p', { 'aria-live': 'polite' });
  const dispatch = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'How the crew sees the pending check' });
  let order: CounterOrder = 'outbound';
  let received = 0;
  let clipped = controller.state.flags[`${prefix}.source-view`] === true;
  const next = h('button', { type: 'button', class: 'primary', onclick: deliver }, 'Advance one packet');
  const clip = h('button', { type: 'button', onclick: toggleClip });

  function draw() {
    const report = replayCounter(which, order, received);
    const last = report.deliveries.at(-1);
    readings.replaceChildren(...report.marks.map(({ slot, value }) => h('li', {},
      h('strong', {}, slot), value === null ? ' — No report yet' : ` — ${casePack.unit} ${value}`)));
    readings.hidden = !clipped;
    delivered.replaceChildren(...report.deliveries.map(({ courier, origin, duplicate }) => h('li', {},
      clipped ? `${courier} · ${origin}${duplicate ? ' · same source' : ''}` : courier)));
    const deliveredCount = report.deliveries.length;
    totals.textContent = clipped
      ? `${deliveredCount} ${deliveredCount === 1 ? 'delivery' : 'deliveries'}, ${report.unique} source ${report.unique === 1 ? 'record' : 'records'}.`
      : `${deliveredCount} ${deliveredCount === 1 ? 'envelope' : 'envelopes'} delivered.`;
    if (!last) status.textContent = 'The scheduled slots are empty at the start.';
    else if (!clipped) status.textContent = `${last.courier} delivered an envelope.`;
    else status.textContent = `${last.courier} brought ${last.origin}. ${last.duplicate
      ? 'That source is already on the board. Keep one copy in the count.'
      : 'Put that source in its slot.'}`;
    if (received === casePack.packets.length) status.textContent += ' This replay has ended.';
    next.disabled = received >= casePack.packets.length;
    clip.textContent = clipped ? 'Lift the source clip' : 'Fit the source clip';
    clip.setAttribute('aria-pressed', String(clipped));

    for (const button of orders.querySelectorAll('button')) {
      const selected = button.dataset.order;
      button.setAttribute('aria-pressed', String(selected === order));
      const tried = controller.state.flags[`${prefix}.trial.${selected}`] === true;
      button.textContent = `${selected === 'outbound' ? 'Set the outbound bundle' : 'Set the return bundle'}${tried ? ' (replayed)' : ''}`;
    }
    const comparison = controller.check({ objective: `${prefix}.compare` });
    const layout = controller.state.flags[`${prefix}.layout`];
    for (const button of dispatch.querySelectorAll('button')) {
      button.disabled = !comparison;
      button.setAttribute('aria-pressed', String(button.dataset.layout === layout));
    }
    plan.textContent = comparison
      ? (layout ? 'The crew is using the selected display. You can move the record to the other place.'
        : 'Both orders end with the same source records. Where should the crew see the pending check?')
      : 'Read both local slips, fit the source clip and replay both bundles before setting the crew’s display.';
  }

  function toggleClip() {
    clipped = !clipped;
    if (clipped) controller.dispatch({ type: 'SetFlag', flag: `${prefix}.source-view`, value: true });
    sound('sfx.click');
    draw();
  }

  function deliver() {
    if (next.disabled) return;
    received++;
    if (received === casePack.packets.length) {
      controller.dispatch({ type: 'SetFlag', flag: `${prefix}.trial.${order}`, value: true });
    }
    sound('sfx.page');
    draw();
  }

  function choose(layout: 'marker' | 'ledger') {
    if (!controller.check({ objective: `${prefix}.compare` })) return;
    const events = controller.dispatch({ type: 'SetFlag', flag: `${prefix}.layout`, value: layout });
    if (!events.length) refreshWorld();
    sound('sfx.sparkle');
    draw();
    plan.textContent = layout === 'marker'
      ? 'The check-request marker is now at the watch site.'
      : 'The handover ledger is now at the crew desk.';
  }

  for (const bundle of COUNTER_ORDERS) {
    orders.append(h('button', { type: 'button', 'data-order': bundle, onclick: () => {
      order = bundle;
      received = 0;
      sound('sfx.click');
      draw();
    } }));
  }
  const plan = h('p', { class: 'fine', 'aria-live': 'polite' });
  dispatch.append(
    h('button', { type: 'button', 'data-layout': 'marker', onclick: () => choose('marker') }, 'Put the pending marker at the site'),
    h('button', { type: 'button', 'data-layout': 'ledger', onclick: () => choose('ledger') }, 'Keep the named handover at the desk'),
  );
  draw();
  const earlier = controller.state.flags['forest.counter.seen.marker'] === true
    ? 'Your Forest marker let the watchers see a missing check at the trail. A second person here can bring an old source along the same path.'
    : 'Your Forest ledger kept the makers apart from the runners. Here the upper rail and lower bank each have their own check to carry.';
  return h('div', {}, h('h2', {}, water ? 'Three Messengers' : 'The Silent Slot'),
    h('p', {}, water
      ? 'The next crew is waiting on a rehearsal report. Replay the same three deliveries in both arrival orders and keep the source on each slip.'
      : 'Elian’s counter has a slot for each watch. Replay the same three slips in both arrival orders. Keep each source beside the runner who carried it.'),
    water ? h('p', { class: 'fine' }, earlier) : null,
    orders, h('div', { class: 'row wrap' }, clip, next), status, readings, totals,
    h('details', {}, h('summary', {}, 'Envelopes in arrival order'), delivered), dispatch, plan);
}
