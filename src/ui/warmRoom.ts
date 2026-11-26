import type { GameController } from '../app/controller';
import { WARM_CASES, type WarmCase } from '../content/warmRoomCases';
import { specimenEquipped } from '../domain/specimenGear';
import { WARM_FIXTURES, WARM_INTERVALS, WARM_LATEST, warmFerry, warmHandoff, warmNotice,
  warmReading, warmTrace, type WarmFixture } from '../domain/warmRoom';
import { h } from './dom';
import './warmRoom.css';

const supports: Record<WarmFixture, string> = {
  bench: 'Wide service bench',
  carrier: 'Padded carrier',
};

function probes(record: WarmCase, fixture: WarmFixture, elapsed: number, ferry = false): HTMLElement {
  const { body, contact } = warmReading(record, fixture, elapsed, ferry);
  return h('div', { class: 'warm-probes' },
    h('p', {}, `Body probe · ${body} warmth marks.`),
    h('meter', { min: 0, max: 36, value: body, 'aria-hidden': 'true' }),
    h('p', {}, `Short contact strip · ${contact} marks.`),
    h('meter', { min: 0, max: 18, value: contact, 'aria-hidden': 'true' }));
}

function ferryTrial(controller: GameController, record: WarmCase, post: (flag: string, value: string | number) => void) {
  const flag = warmFerry(record.stem);
  const savedTime = controller.state.flags[`${flag}.time`];
  const time = h('input', { type: 'range', min: 1, max: 6, step: 1, value: typeof savedTime === 'number' ? savedTime : 3,
    'aria-label': 'Ferry practice wait' });
  const tested = new Set<WarmFixture>();
  const curves = h('div', { class: 'warm-curves', 'aria-live': 'polite' });
  const wait = h('p', { role: 'status' });
  const result = h('p', { role: 'status', class: 'warm-reply' });
  const track = WARM_FIXTURES.map((fixture) => h('button', { type: 'button', onclick: () => {
    tested.add(fixture);
    render();
  } }, `Try ${supports[fixture].toLowerCase()} here`));
  const actions = WARM_FIXTURES.map((fixture) => h('button', { type: 'button', onclick: () => {
    if (tested.size !== WARM_FIXTURES.length) return;
    controller.dispatch({ type: 'SetFlag', flag: `${flag}.time`, value: Number(time.value) });
    post(flag, fixture);
    readBack();
  } }, fixture === 'bench' ? 'Mark the landing counter' : 'Mark a padded trip'));

  function render() {
    const intervals = Number(time.value);
    wait.textContent = `Wait ${intervals} ${intervals === 1 ? 'interval' : 'intervals'} at this landing. The padded trip adds one interval to the handoff.`;
    curves.replaceChildren(...WARM_FIXTURES.map((fixture) => h('section', {}, h('h3', {}, supports[fixture]),
      tested.has(fixture) ? probes(record, fixture, intervals, true) : h('p', { class: 'fine' }, 'Waiting for a trial.'))));
    actions.forEach((action) => { action.disabled = tested.size !== WARM_FIXTURES.length; });
  }

  function readBack() {
    const support = controller.state.flags[flag];
    const intervals = controller.state.flags[`${flag}.time`];
    if (typeof intervals !== 'number' || (support !== 'bench' && support !== 'carrier')) return;
    const { body, contact } = warmReading(record, support, intervals + Number(support === 'carrier'), true);
    const audience = support === 'bench' ? 'Enna sets the first serving at the landing counter.' : 'Enna leaves a padded carrier for the far bench after one extra interval.';
    result.textContent = `${audience} Body ${body} warmth marks. Probe contact ${contact} marks before service.`;
  }

  time.addEventListener('input', () => { tested.clear(); render(); });
  render();
  readBack();
  return h('div', { class: 'warm-ferry' },
    h('p', {}, 'The landing air is cooler and pulls more warmth from the same model. Compare both supports after the same wait before Enna chooses the next serving place.'),
    h('label', {}, 'Set the wait at the landing', time), wait,
    h('div', { class: 'row' }, ...track), curves, h('div', { class: 'row' }, ...actions), result);
}

export function warmRoomPanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'warm-panel' });
  const returning = station.startsWith('return.');
  const slug = returning ? station.slice('return.'.length) : station;
  const entry = WARM_CASES.find((candidate) => candidate.slug === slug);
  if (!entry || !controller.check(returning ? specimenEquipped(entry.key) : { card: entry.card })) return panel;
  const record = entry;
  function post(flag: string, value: boolean | string | number) {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  }
  panel.append(h('h2', {}, record.title),
    h('p', { class: 'fine' }, `Two probes on a practice model of ${record.feature}. The probes read in whole game units.`),
    h('details', {}, h('summary', {}, 'Object record'), h('p', {}, record.fact), h('p', {}, record.limit),
      h('p', {}, h('a', { href: record.catalogue, rel: 'noopener', target: '_blank' }, `Collection record ${record.accession}`))));
  if (returning) {
    panel.append(ferryTrial(controller, record, post));
    return panel;
  }

  let fixture: WarmFixture = 'bench';
  let interval = 0;
  const status = h('p', { role: 'status' });
  const model = h('div', { class: 'warm-live', 'aria-live': 'polite' });
  const curves = h('div', { class: 'warm-curves' });
  const reply = h('p', { role: 'status', class: 'warm-reply' });
  const selectors = WARM_FIXTURES.map((option) => h('button', { type: 'button', onclick: () => {
    fixture = option;
    interval = 0;
    render();
  } }, supports[option]));
  const step = h('button', { type: 'button', onclick: () => {
    if (interval >= WARM_INTERVALS) return;
    interval += 1;
    if (interval === WARM_INTERVALS) post(warmTrace(record.stem, fixture), true);
    render();
  } });
  const handoffs = WARM_FIXTURES.map((option) => h('button', { type: 'button', onclick: () => {
    if (!bothTrials()) return;
    controller.dispatch({ type: 'SetFlag', flag: warmHandoff(record.stem), value: option });
    post(WARM_LATEST, record.slug);
    render();
  } }, option === 'bench' ? 'Serve at the west counter' : 'Send the padded carrier to the east table'));

  function bothTrials() {
    return WARM_FIXTURES.every((option) => controller.state.flags[warmTrace(record.stem, option)] === true);
  }

  function render() {
    status.textContent = `${supports[fixture]}. Interval ${interval} of ${WARM_INTERVALS}.`;
    selectors.forEach((button, index) => button.setAttribute('aria-pressed', String(WARM_FIXTURES[index] === fixture)));
    step.disabled = interval >= WARM_INTERVALS;
    step.textContent = step.disabled ? 'Trial filed' : 'Advance one practice interval';
    model.replaceChildren(probes(record, fixture, interval));
    curves.replaceChildren(...WARM_FIXTURES.map((option) => {
      const tested = controller.state.flags[warmTrace(record.stem, option)] === true;
      return h('section', {}, h('h3', {}, supports[option]),
        tested ? [h('p', { class: 'fine' }, 'At the fill'), probes(record, option, 0),
          h('p', { class: 'fine' }, 'After three intervals'), probes(record, option, WARM_INTERVALS)]
          : h('p', { class: 'fine' }, 'Waiting for a trial.'));
    }));
    handoffs.forEach((button) => { button.disabled = !bothTrials(); });
    const choice = controller.state.flags[warmHandoff(record.stem)];
    if (choice === 'bench' || choice === 'carrier') {
      const table = choice === 'bench' ? 'west counter' : 'east table';
      reply.textContent = `${warmNotice(record, choice)} Read Bea’s receipt at the ${table}.`;
    }
  }

  panel.append(h('p', {}, 'Each model begins with the same practice fill. The wide support draws warmth from the body. The cover slows that loss. The pad reduces transfer to the contact strip at the same body warmth. A carried handoff adds one interval.'),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Support for the model' }, ...selectors), status, model, step,
    h('h3', {}, 'Readings at matching intervals'), curves, h('div', { class: 'row' }, ...handoffs), reply);
  render();
  return panel;
}
