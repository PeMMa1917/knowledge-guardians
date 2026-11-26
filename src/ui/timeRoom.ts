import type { GameController } from '../app/controller';
import { playPracticeTones } from '../app/practiceSounds';
import { TIME_CASES, type TimeCase } from '../content/timeRoomCases';
import { specimenEquipped } from '../domain/specimenGear';
import { clockReading, shiftedTrial, STANDARDS, timeChoice, timeReturn, TIME_PULSES,
  trialFlag, trialModel, type ModelClock, type TimeReading, type TimeStandard } from '../domain/timeRoom';
import { h } from './dom';
import './timeRoom.css';

const titles: Record<TimeStandard, string> = {
  start: 'Agree at the first cue',
  pace: 'Agree on the pace',
};

function readingView(record: TimeCase, reading: TimeReading, covered: boolean) {
  const line = `Reference ${reading.reference} · rehearsal display ${reading.display}.`;
  if (record.kind === 'shadow') return h('p', {}, covered ? 'The shutter hides the shadow. The reference is still advancing.' : `Shadow end ${reading.display}. Reference mark ${reading.reference}.`);
  if (record.kind === 'water') return h('div', {},
    h('meter', { min: 0, max: 48, value: reading.display, 'aria-label': 'Practice water level' }), h('p', {}, `Level ${reading.display}. Reference ${reading.reference}.`));
  if (record.kind === 'calendar') return h('p', {}, `${line} The practice wheel is at division ${Math.floor(reading.display / 8) + 1}.`);
  if (record.kind === 'sound') return h('p', {}, `Practice sound cue at mark ${reading.display}. Reference mark ${reading.reference}.`);
  return h('div', { class: 'time-dial-group' },
    h('div', { class: 'time-dial', 'aria-hidden': 'true' }, h('span', { style: `transform: rotate(${reading.display * 12}deg)` })),
    h('p', {}, record.kind === 'case' ? `Stand-in movement. ${line}` : line));
}

function trace(record: TimeCase, model: ModelClock, division = 8) {
  const { display: firstDisplay, reference: firstRef } = clockReading(0, model, division);
  const { display: finalDisplay, reference: finalRef } = clockReading(TIME_PULSES, model, division);
  return h('div', {},
    h('p', {}, `First record: ${firstDisplay} against ${firstRef}. Last record: ${finalDisplay} against ${finalRef}.`),
    h('p', {}, `Interval on the ${record.feature} model: ${finalDisplay - firstDisplay}. Reference interval: ${finalRef - firstRef}.`));
}

function newReference(controller: GameController, record: TimeCase, panel: HTMLElement, post: (flag: string, value: string | boolean) => void) {
  const fresh = shiftedTrial(record);
  const flag = timeReturn(record.stem);
  const saved = controller.state.flags[`${flag}.model`];
  const prior = typeof saved === 'string' && /^(?:[0-9]|10),-?[0-3]$/.test(saved) ? saved.split(',').map(Number) : undefined;
  const offset = h('input', { type: 'range', min: 0, max: 10, step: 1, value: prior?.[0] ?? fresh.offset, 'aria-label': 'Starting mark' });
  const drift = h('input', { type: 'range', min: -3, max: 3, step: 1, value: prior?.[1] ?? fresh.drift, 'aria-label': 'Pace adjustment' });
  const results = h('div', { class: 'time-trace', role: 'status' });
  let read: ModelClock | undefined;
  const show = (model: ModelClock, priority: TimeStandard) => {
    const sample = priority === 'start' ? clockReading(0, model, 10) : clockReading(TIME_PULSES, model, 10);
    results.replaceChildren(trace(record, model, 10),
      h('p', {}, priority === 'start'
        ? `The departing runner takes the opening reading of ${sample.display}. The keeper leaves its later pace available for comparison.`
        : `The next keeper logs the last reading of ${sample.display} and keeps the first with it. The runner leaves while the readings are checked.`));
  };
  const postNote = (priority: TimeStandard) => {
    if (!read) return;
    controller.dispatch({ type: 'SetFlag', flag: `${flag}.model`, value: `${read.offset},${read.drift}` });
    post(flag, priority);
    show(read, priority);
  };
  const readButtons = [
    h('button', { type: 'button', disabled: true, onclick: () => postNote('start') }, 'Clip the opening cue for the runner'),
    h('button', { type: 'button', disabled: true, onclick: () => postNote('pace') }, 'Clip both readings for the keeper'),
  ];
  const status = h('p', { class: 'fine', role: 'status' });
  const changed = () => {
    status.textContent = `Start ${offset.value}. Pace change ${drift.value} per reference step.`;
    read = undefined;
    readButtons.forEach((button) => { button.disabled = true; });
  };
  offset.addEventListener('input', changed);
  drift.addEventListener('input', changed);
  panel.append(
    h('p', {}, `The carried copy keeps the earlier ${record.feature} with its record. The Study uses a new set of ten marked spaces between cues. Adjust the start or the pace for this new audience.`),
    h('label', {}, 'Set the beginning', offset), h('label', {}, 'Change the pace', drift), status,
    h('button', { type: 'button', onclick: () => {
      read = { offset: Number(offset.value), drift: Number(drift.value) };
      results.replaceChildren(trace(record, read, 10));
      readButtons.forEach((button) => { button.disabled = false; });
    } }, 'Try the new reference'),
    results, h('div', { class: 'row' }, ...readButtons));
  changed();
  const priority = controller.state.flags[flag];
  if (prior && (priority === 'start' || priority === 'pace')) show({ offset: prior[0], drift: prior[1] }, priority);
}

export function timeRoomPanel(controller: GameController, station: string, volume: () => number, sound: (name: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'time-room-panel', tabindex: -1 });
  const revisit = station.startsWith('return.');
  const slug = revisit ? station.slice('return.'.length) : station;
  const record = TIME_CASES.find((entry) => entry.slug === slug);
  if (!record || !controller.check(revisit ? specimenEquipped(record.key) : { card: record.card })) return panel;
  const flags = () => controller.state.flags;
  const post = (flag: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };
  panel.append(h('h2', {}, record.title),
    h('p', {}, record.fact),
    h('p', { class: 'fine' }, h('a', { href: record.catalogue, rel: 'noopener', target: '_blank' }, `Collection record ${record.accession}`), ' · ', record.limit));
  if (revisit) {
    newReference(controller, record, panel, post);
    return panel;
  }

  let standard: TimeStandard = 'start';
  let pulse = 0;
  let covered = false;
  const view = h('div', { role: 'status', class: 'time-readout' });
  const reports = h('div', { class: 'time-trace' });
  const cue = h('p', { role: 'status', class: 'fine' });
  const methods = STANDARDS.map((next) => h('button', { type: 'button', onclick: () => {
    standard = next;
    pulse = 0;
    update();
  } }, titles[next]));
  const advance = h('button', { type: 'button', onclick: () => {
    if (pulse < TIME_PULSES) pulse++;
    if (pulse === TIME_PULSES && !covered) post(trialFlag(record.stem, standard), true);
    update();
  } }, 'Advance one reference cue');
  const send = (['arrival', 'relay'] as const).map((choice) => h('button', {
    type: 'button', onclick: () => {
      if (STANDARDS.some((method) => flags()[trialFlag(record.stem, method)] !== true)) return;
      post(timeChoice(record.stem), choice);
      update();
    },
  }, choice === 'arrival' ? 'Post the first cue at the runner’s hook' : 'Post the checked interval at the keeper’s table'));
  const shade = record.kind === 'shadow' ? h('button', { type: 'button', onclick: () => {
    covered = !covered;
    if (pulse === TIME_PULSES && !covered) post(trialFlag(record.stem, standard), true);
    update();
  } }, 'Move the shutter') : null;
  const chime = record.kind === 'sound' ? h('button', { type: 'button', onclick: () => {
    const reading = clockReading(pulse, trialModel(record, standard));
    playPracticeTones([220 + reading.display * 5], volume());
  } }, 'Hear the original practice tone for this cue') : null;
  const update = () => {
    const tested = STANDARDS.filter((method) => flags()[trialFlag(record.stem, method)] === true);
    methods.forEach((control, i) => control.setAttribute('aria-pressed', String(standard === STANDARDS[i])));
    advance.disabled = pulse === TIME_PULSES;
    shade?.setAttribute('aria-pressed', String(covered));
    view.replaceChildren(h('p', {}, `Reference cue ${pulse} of ${TIME_PULSES}.`),
      readingView(record, clockReading(pulse, trialModel(record, standard)), covered));
    reports.replaceChildren(...tested.map((method) => h('article', {}, h('h3', {}, titles[method]), trace(record, trialModel(record, method)))));
    send.forEach((control) => { control.disabled = tested.length !== 2; });
    const notice = flags()[timeChoice(record.stem)];
    cue.textContent = notice === 'arrival'
      ? 'The runner takes the aligned first cue. The keeper preserves the possible drift on the test sheet.'
      : notice === 'relay' ? 'The keeper pins down the interval. The next shift still has to set its opening mark.'
        : 'Try both setups before deciding which reading has to reach its reader.';
  };
  panel.append(
    h('p', {}, `This fictional rehearsal uses ${record.feature}. Compare the timekeepers over the same three steps.`),
    record.people.length ? h('p', { class: 'fine' }, `Collection credits: ${record.people.map(({ name, role }) => `${name} (${role})`).join(' · ')}.`) : h('p', { class: 'fine' }, 'The catalogue leaves the individual maker’s name open.'),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Set the practice clock' }, ...methods),
    advance, view);
  if (shade) panel.append(shade);
  if (chime) panel.append(chime);
  panel.append(reports, h('div', { class: 'row' }, ...send), cue);
  update();
  return panel;
}
