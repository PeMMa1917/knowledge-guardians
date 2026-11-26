import type { GameController } from '../app/controller';
import { advanceSillClock, SILL_CHECKED, SILL_FERRY_CHECK, SILL_HANDOVER, SILL_PHASES, SILL_TICKET,
  sillAccepts, sillClockFlag, sillPhase, sillTrace, type SillClockSite } from '../domain/sillBridge';
import { h } from './dom';
import './sillBridge.css';

const notches = ['Before either ring', 'First ring', 'Second ring', 'Past the second ring'];

export function sillBridgePanel(site: SillClockSite, c: GameController, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const bridge = site === 'bridge';
  const phaseKey = sillClockFlag(site, 'phase');
  const acceptedKey = sillClockFlag(site, 'accepted');
  const closedKey = sillClockFlag(site, 'closed');
  const hasSlip = () => bridge ? c.check({ flag: SILL_TICKET, eq: true }) : c.check({ objective: SILL_HANDOVER });
  const phase = () => sillPhase(c.state.flags[phaseKey]);
  const track = h('ol', { class: 'sill-clock-track', 'aria-label': 'The wheel’s four notches' });
  const gate = h('p', { class: 'sill-clock-gate', role: 'status' });
  const traces = h('ul', { class: 'sill-clock-traces', 'aria-label': 'Saved observations' });
  const response = h('p', { role: 'status' });

  function turn(reset: boolean) {
    const next = reset ? 0 : advanceSillClock(phase());
    c.dispatch({ type: 'SetFlag', flag: phaseKey, value: next });
    response.textContent = '';
    sound(!reset && (next === 1 || next === 2) ? 'sfx.metal' : 'sfx.click');
    render();
  }

  function offer() {
    if (!hasSlip()) return;
    const now = phase();
    const trace = sillTrace(site, now);
    if (trace) {
      const key = sillClockFlag(site, trace);
      if (c.state.flags[key] === undefined) c.dispatch({ type: 'SetFlag', flag: key, value: now });
    }
    response.textContent = sillAccepts(site, now)
      ? 'The clip holds the slip. A matching mark stays on the wheel.'
      : now === 2 ? 'At the second ring the latch covers the clip. That mark stays on the wheel, too.'
        : 'The latch covers the clip at this notch. The slip stays in your hand.';
    sound(trace === 'accepted' ? 'sfx.page' : 'sfx.lock');
    render();
    refresh();
  }

  const advance = h('button', { type: 'button', onclick: () => turn(false) }, 'Turn one notch');
  const reset = h('button', { type: 'button', onclick: () => turn(true) }, 'Reset the practice cycle');
  const test = h('button', { type: 'button', onclick: offer }, bridge ? 'Offer the practice ticket' : 'Offer the ferry sample slip');

  function render() {
    const now = phase();
    track.replaceChildren(...SILL_PHASES.map((step) => h('li', { 'aria-current': step === now ? 'step' : undefined },
      h('span', { 'aria-hidden': 'true' }, ['○', '◔', '◑', '●'][step]), notches[step])));
    gate.textContent = `${notches[now]}. The clip is ${sillAccepts(site, now) ? 'open' : 'covered'}.`;
    advance.disabled = now === 3;
    reset.disabled = now === 0;
    test.disabled = !hasSlip();
    const accepted = c.state.flags[acceptedKey];
    const closed = c.state.flags[closedKey];
    traces.replaceChildren(
      h('li', {}, typeof accepted === 'number' ? `Slip held · ${notches[sillPhase(accepted)]}` : 'Open clip · try a slip where it can catch'),
      h('li', {}, closed === 2 ? 'Clip covered · Second ring' : 'Second ring · try the same slip at the ring itself'),
    );
  }

  const panel = h('section', { class: 'sill-clock' },
    h('h2', {}, bridge ? 'The loft’s till-bell wheel' : 'Tova’s afternoon wheel'),
    h('p', {}, bridge ? 'Estelle’s loft uses a clip to hold the claims already in before the second bell. Turn this copy of the wheel by hand.'
      : 'The landing keeps this clip shut until the loading bell has finished. Use Tova’s sample slip on the same four notches.'),
    h('blockquote', { lang: 'fr' }, bridge ? 'Accrochez le billet avant la deuxième sonnerie.' : 'Accrochez le billet après la deuxième sonnerie.'),
    h('details', {}, h('summary', {}, 'Lift the translation strip'),
      h('p', {}, bridge ? 'Clip the ticket on before the second ring.' : 'Clip the ticket on after the second ring.')),
    bridge && !hasSlip() ? h('p', {}, 'Get a dry practice ticket from Estelle’s hook on the town bank.') : '',
    track, gate, h('div', { class: 'row' }, advance, reset, test), response, traces,
    h('p', { class: 'fine' }, bridge ? 'The wheel changes only when you turn it. Resetting the wheel leaves both practice marks on the board.'
      : 'Tova copied both times onto the ferry ticket. This practice wheel leaves the real loading schedule alone.'));
  render();
  return panel;
}

export function sillGuideObjective(site: SillClockSite, c: GameController): string {
  if (site === 'ferry') return c.check({ objective: SILL_FERRY_CHECK }) ? 'sill.ferry.served' : SILL_FERRY_CHECK;
  return c.check({ objective: SILL_CHECKED }) ? SILL_HANDOVER : SILL_CHECKED;
}
