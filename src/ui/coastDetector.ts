import type { GameController } from '../app/controller';
import { DETECTOR_HANDOFF, DETECTOR_OBSERVED, DETECTOR_RANGES, detectorReading,
  detectorTrace, type DetectorRange } from '../domain/coastDetector';
import { h } from './dom';
import './coastDetector.css';

function readingTable(range: DetectorRange): HTMLElement {
  const { label, floor, ceiling } = DETECTOR_RANGES[range];
  return h('table', { class: 'detector-trace' },
    h('caption', {}, label),
    h('tbody', {}, detectorReading(range).map(({ name, reading, stop }) => {
      const bound = stop === 'floor' ? `${reading} or lower` : stop === 'ceiling' ? `${reading} or higher` : String(reading);
      return h('tr', {},
        h('th', { scope: 'row' }, name),
        h('td', {}, h('meter', { min: floor, max: ceiling, value: reading, 'aria-hidden': 'true' })),
        h('td', { class: stop ? 'detector-stop' : undefined }, bound));
    })));
}

const ranges = ['wide', 'amplified'] as const;

export function coastDetectorPanel(controller: GameController, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'detector-panel' });
  if (!controller.check({ flag: 'coast.arrived', eq: true })) return panel;
  let range: DetectorRange = 'wide';
  const rangeStatus = h('p', { role: 'status' });
  const traces = h('div', { class: 'detector-traces', 'aria-live': 'polite' });
  const dispatch = h('p', { role: 'status' });
  const selectors = ranges.map((value) => h('button', { type: 'button', onclick: () => {
    range = value;
    render();
  } }, DETECTOR_RANGES[value].label));
  const sweep = h('button', { type: 'button', onclick: () => {
    controller.dispatch({ type: 'SetFlag', flag: detectorTrace(range), value: true });
    sound('sfx.page');
    render();
  } }, 'Sweep the four marks');
  const handoffs = [
    h('button', { type: 'button', onclick: () => post('ramp') }, 'Send the wide strip to the ramp'),
    h('button', { type: 'button', onclick: () => post('stairs') }, 'Send both strips to the lower rail'),
  ];
  function post(choice: 'ramp' | 'stairs') {
    if (!controller.check({ objective: DETECTOR_OBSERVED }) || controller.check({ flagSet: DETECTOR_HANDOFF })) return;
    controller.dispatch({ type: 'SetFlag', flag: DETECTOR_HANDOFF, value: choice });
    sound('sfx.page');
    render();
    refresh();
  }
  function render() {
    const selected = DETECTOR_RANGES[range];
    rangeStatus.textContent = `${selected.label} selected. Stops at ${selected.floor} and ${selected.ceiling}.`;
    selectors.forEach((button, index) => button.setAttribute('aria-pressed', String(range === ranges[index])));
    traces.replaceChildren(...ranges.map((candidate) => controller.state.flags[detectorTrace(candidate)] === true
      ? readingTable(candidate)
      : h('p', { class: 'fine' }, `${DETECTOR_RANGES[candidate].label} waiting for a sweep.`)));
    const choice = controller.state.flags[DETECTOR_HANDOFF];
    const ready = controller.check({ objective: DETECTOR_OBSERVED });
    handoffs.forEach((button) => { button.disabled = !ready || Boolean(choice); });
    dispatch.textContent = choice === 'ramp' ? 'Ruan has the wide strip for the first bell. Read his receipt at the eastern unloading ramp.'
      : choice === 'stairs' ? 'Ruan has both strips for the second bell. Read his receipt at the lower rail west of his post.'
      : ready ? 'The repeated numbers at the stops give limits. Ruan can set the ramp ropes now or wait for both practice crews.'
      : '';
  }
  panel.append(
    h('h2', {}, 'Where the Needles Stop'),
    h('p', {}, 'Neri has fixed four lights on a practice rail. Ruan needs the two bright beacons for the ramp crew. The stair crew also needs the cord and step marks.'),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Reader range' }, ...selectors, sweep),
    rangeStatus,
    traces,
    dispatch,
    h('div', { class: 'row' }, ...handoffs),
  );
  render();
  return panel;
}
