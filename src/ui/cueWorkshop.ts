import type { GameController } from '../app/controller';
import { playCueTrial } from '../app/cueTrialAudio';
import type { Settings } from '../app/settings';
import { CUE_CASES, CUE_GATE, type CueCase } from '../content/cueWorkshop';
import { CUE_ORDERS, CUE_RUNS, cueKey, cueMove, cueRun, cueTrialState, type CueBeat, type CueReader } from '../domain/cueWorkshop';
import { h } from './dom';
import './cueWorkshop.css';

const SPACE = { walk: 'Eren’s live indicator at Glass Walk', house: 'Hari’s side-seat timing table' } as const;
const BEATS: Record<CueBeat, { text: string; symbol: string }> = {
  cue: { text: 'Cue heard', symbol: '♪' }, covered: { text: 'Cue covered by work', symbol: '×' },
  work: { text: 'Work sound alone', symbol: '□' }, rest: { text: 'Rest', symbol: '·' },
};
type Action = Parameters<typeof cueMove>[2];

function timingLine(beats: readonly CueBeat[], id: string) {
  return h('ol', { class: 'cue-timing-line', 'data-cue-line': id }, ...beats.map((status, index) =>
    h('li', { 'aria-label': `Beat ${index + 1}. ${BEATS[status].text}.`, title: BEATS[status].text },
      h('span', { class: 'fine', 'aria-hidden': true }, String(index + 1)), h('strong', { 'aria-hidden': true }, BEATS[status].symbol))));
}

export function cueWorkshopPanel(place: string, controller: GameController, settings: Settings, refreshWorld: () => void): HTMLElement {
  const body = h('div');
  const report = h('p', { class: 'cue-report fine', role: 'status' });
  const panel = h('div', { class: 'cue-workshop', tabindex: -1 }, body, report);
  let playback = 0;

  function act(record: CueCase, action: Action, id: string, message: string) {
    if (!controller.check(CUE_GATE) || !controller.check({ card: record.card })) return;
    const effect = cueMove(record.slug, controller.state.flags, action);
    if (!effect) return;
    const events = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
    if (events.some(({ kind }) => kind === 'error')) return;
    if (action.type === 'send' || action.type === 'install') refreshWorld();
    const ticket = ++playback;
    render();
    report.classList.toggle('sr-only', action.type === 'try');
    report.textContent = message;
    (body.querySelector<HTMLElement>(`button[data-cue-step="${id}"]:enabled`) ?? body.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
    const state = cueTrialState(record.slug, controller.state.flags);
    if (action.type !== 'try' || !state.order) return;
    const sequence = cueRun(state.order, action.run, record.noise);
    const current = () => panel.isConnected && playback === ticket;
    playCueTrial(sequence, settings.sfxVolume, current);
    if (settings.reducedMotion) return;
    const beats = [...panel.querySelectorAll<HTMLLIElement>(`[data-cue-line="${action.run}"] li`)];
    beats.forEach((beat, index) => setTimeout(() => {
      if (!current()) return;
      beat.classList.add('cue-playing');
      setTimeout(() => beat.classList.remove('cue-playing'), 210);
    }, index * 230));
  }

  function button(record: CueCase, id: string, text: string, action: Action, message: string, disabled = false) {
    return h('button', { type: 'button', 'data-cue-step': id, disabled, onclick: () => act(record, action, id, message) }, text);
  }

  function stand(record: CueCase) {
    const flags = controller.state.flags;
    const state = cueTrialState(record.slug, flags);
    const key = cueKey(record.slug);
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Open the collection case beside this timing table first.'));
      return;
    }
    body.append(h('p', { class: 'fine' }, record.evidence),
      h('p', {}, 'Set the workshop’s three-note cue. Let the order stay fixed while you try the quiet side and the service side.'),
      h('div', { class: 'row wrap' }, ...CUE_ORDERS.map((order) => button(record, `order-${order}`,
        order === 'close' ? 'Set two close notes and a last mark' : 'Set three spaced notes', { type: 'order', order },
        order === 'close' ? 'The three markers sit at beats 1, 2 and 5.' : 'The three markers sit at beats 1, 4 and 7.', !!state.reader || state.order === order))));
    if (!state.order) return;
    const order = state.order;
    for (const run of CUE_RUNS) {
      const sequence = cueRun(order, run, record.noise);
      const count = sequence.filter((step) => step === 'cue').length;
      const summary = `${count} of 3 cue notes heard. ${3 - count} covered by the service work.`;
      body.append(h('section', { class: 'clue-view' }, h('h3', {}, run === 'clear' ? 'Quiet side' : 'Service side'),
        flags[`${key}.${order}.${run}`] === true ? h('div', {}, timingLine(sequence, run), h('p', { class: 'fine' }, summary)) : null,
        button(record, `try-${run}`, run === 'clear' ? 'Run the quiet side' : 'Run with service work', { type: 'try', run }, summary, !!state.reader)));
    }
    body.append(h('p', { class: 'fine' }, '♪ Cue heard · × Cue covered · □ Work sound · · Rest.'));
    if (state.reader) {
      body.append(h('p', {}, state.delivered ? `A checked copy stays at ${SPACE[state.reader]}.` : `Fit the new cue at ${SPACE[state.reader]}.`));
      return;
    }
    body.append(h('div', { class: 'row wrap' },
      button(record, 'send-walk', 'Take the cue to Glass Walk', { type: 'send', reader: 'walk' }, 'The live cue and its fallback marks are ready for Eren.', !state.ready),
      button(record, 'send-house', 'Take the timing strip to the House', { type: 'send', reader: 'house' }, 'The paper timing strip is ready for Hari.', !state.ready)));
  }

  function reader(route: CueReader) {
    body.append(h('h2', {}, SPACE[route]));
    for (const record of CUE_CASES) {
      const state = cueTrialState(record.slug, controller.state.flags);
      if (state.reader !== route || !state.order) continue;
      const line = route === 'walk' ? cueRun(state.order, 'service', record.noise) : cueRun(state.order, 'clear', record.noise);
      const blocked = line.filter((beat) => beat === 'covered').length;
      const step = route === 'walk' ? 'Fit the cue and its visible marks' : 'Lay out the side-seat timing strip';
      body.append(h('article', { class: 'clue-view' }, h('h3', {}, record.name),
        h('p', { class: 'fine' }, `The Metropolitan Museum of Art · ${record.accession}`),
        timingLine(line, record.slug),
        state.delivered ? h('p', {}, record[route]) : button(record, `install-${record.slug}`, step, { type: 'install', reader: route }, record[route]),
        state.delivered && route === 'walk' ? h('p', { class: 'fine' }, blocked ? `The marks remain visible for ${blocked} covered cue ${blocked === 1 ? 'beat' : 'beats'}.` : 'All three beats reached the service side in this run.') : null));
    }
    if (body.childElementCount === 1) body.append(h('p', {}, 'An open clip waits for a cue from the timing workshop.'));
  }

  function render() {
    body.replaceChildren();
    if (place === 'walk' || place === 'house') { reader(place); return; }
    const record = CUE_CASES.find(({ slug }) => slug === place);
    if (record) stand(record);
  }
  render();
  return panel;
}
