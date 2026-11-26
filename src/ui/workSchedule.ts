import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import {
  SCHEDULE_CASES, SCHEDULE_DETAILS, SCHEDULE_REVISIT, SCHEDULE_ROUTES,
  scheduleCarry, scheduleDelivery, scheduleReady, type ScheduleCase,
} from '../content/workScheduleCases';
import { check } from '../domain/rules';
import { SCHEDULE_TILES, modelSchedule, moveScheduleTile, type ScheduleTile } from '../domain/workSchedule';
import { h } from './dom';
import './workSchedule.css';

const receptacles = {
  source: { map: 'forest.station', name: 'the first-bell source rack at Fern Station' },
  practice: { map: 'forest.trail', name: 'the first-bell practice tray at Listening Trail' },
};

function sourceLink(record: ScheduleCase) {
  const { object } = record;
  return h('a', { href: object.catalogue, target: '_blank', rel: 'noopener' }, `${object.institution} · ${object.accession}`);
}

export function workSchedulePanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'schedule-work' });
  const state = () => controller.state;
  const set = (flag: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };

  if (station.startsWith('receive:')) {
    const route = SCHEDULE_ROUTES.find((branch) => station === `receive:${branch}`);
    if (!route || state().mapId !== receptacles[route].map) return panel;
    const rows = SCHEDULE_CASES.filter((record) => check(scheduleDelivery(record, route), state()));
    const index = SCHEDULE_ROUTES.indexOf(route);
    panel.append(h('h2', {}, route === 'source' ? 'Fern Station’s catalogue rack' : 'Listening Trail’s working tray'));
    for (const record of rows) {
      const note = h('p', { role: 'status', class: 'fine', tabindex: -1 });
      const place = h('button', { type: 'button', onclick: () => {
        if (state().mapId !== receptacles[route].map || state().flags[record.objective] || !check(scheduleDelivery(record, route), state())) return;
        set(record.objective, route);
        draw();
        note.focus();
      } });
      function draw() {
        const placed = state().flags[record.objective] === route;
        place.disabled = placed;
        place.textContent = placed ? 'Copy installed' : `Install ${record.title.toLowerCase()}`;
        note.textContent = placed ? record.outcomes[index] : record.choices[index];
      }
      panel.append(h('article', {}, h('h3', {}, record.title), sourceLink(record), place, note));
      draw();
    }
    return panel;
  }

  if (station === 'revisit') {
    if (state().mapId !== SCHEDULE_REVISIT.map) return panel;
    const match = SCHEDULE_CASES.find((record) => check(scheduleCarry(record), state()));
    const installed = SCHEDULE_CASES.filter(({ reprise }) => state().flags[reprise] === 'use' && reprise !== match?.reprise);
    panel.append(h('h2', {}, 'The late-proof shelf'));
    for (const record of installed) panel.append(h('article', {}, h('h3', {}, record.title), sourceLink(record), h('p', {}, record.revisit[1])));
    if (!match) {
      panel.append(h('p', {}, 'Equip a Working Cupboards copy from your satchel to post its second proof.'));
      return panel;
    }

    const record: ScheduleCase = match;
    const result = h('p', { role: 'status', tabindex: -1 });
    const late = h('button', { type: 'button', onclick: () => {
      prepared = true;
      update();
      install.focus();
    } }, 'Pull the late proof out of the sleeve');
    const install = h('button', { type: 'button', onclick: () => {
      if (!prepared || state().mapId !== SCHEDULE_REVISIT.map || !check(scheduleCarry(record), state()) || state().flags[record.reprise] === 'use') return;
      controller.dispatch({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' });
      sound('sfx.page');
      refresh();
      update();
      result.focus();
    } }, record.revisit[0]);
    let prepared = false;
    function update() {
      const used = state().flags[record.reprise] === 'use';
      const earlier = state().flags[record.objective] === 'source' ? 0 : 1;
      late.disabled = prepared || used;
      install.disabled = !prepared || used;
      result.textContent = used ? record.revisit[1] : prepared
        ? `The first copy gives readers a start. Add its second proof separately. ${record.notes[1 - earlier]}`
        : `First-bell sheet: ${record.notes[earlier]}`;
    }
    panel.append(h('article', {}, h('h3', {}, record.title), sourceLink(record), late, install, result));
    update();
    return panel;
  }

  const found = SCHEDULE_CASES.find(({ slug }) => slug === station);
  if (!found) return panel;
  const record: ScheduleCase = found;
  const info = SCHEDULE_DETAILS[record.room];
  const available = () => state().mapId === info.map && state().cards.includes(record.card);
  if (!available()) return panel;
  const tasks = { source: record.jobs[0], practice: record.jobs[1], public: record.jobs[2] };
  const read = (key: string) => state().flags[`${record.flag}.tested.${key}`] === true;
  const routeKey = `${record.flag}.sent`;
  let order: ScheduleTile[] = [...SCHEDULE_TILES];
  const rail = h('ol', { class: 'schedule-rail' });
  const trail = h('p', { class: 'fine', role: 'status', tabindex: -1 });
  const output = h('p', { class: 'fine', role: 'status' });
  const pacing = h('p', { class: 'fine' });
  const bell = h('button', { type: 'button', onclick: () => {
    if (!available()) return;
    const trial = modelSchedule(record.fixture, order);
    if (trial.priority) {
      if (!read(trial.priority)) set(`${record.flag}.tested.${trial.priority}`, true);
      output.textContent = `The opening is ready by bell ${record.fixture.bell}. ${record.notes[SCHEDULE_ROUTES.indexOf(trial.priority)]} The whole slip is ready at bell ${trial.elapsed}.`;
    } else {
      output.textContent = trial.visible ? 'The stand opens before either proof is ready. Both slips arrive later.'
        : `Both work slips are available when the stand opens. That comes after the first bell at ${record.fixture.bell}.`;
    }
    updateDelivery();
  } }, 'Ring the practice bell');
  const send = SCHEDULE_ROUTES.map((route, index) => h('button', { type: 'button', onclick: () => {
    if (!available() || !check(scheduleReady(record), state()) || state().flags[routeKey]) return;
    set(routeKey, route);
    updateDelivery();
    trail.focus();
  } }, record.choices[index]));

  function updateDelivery() {
    const ready = check(scheduleReady(record), state());
    const route = SCHEDULE_ROUTES.find((branch) => state().flags[routeKey] === branch);
    send.forEach((control, i) => {
      control.disabled = !ready || !!route;
      control.setAttribute('aria-pressed', String(route === SCHEDULE_ROUTES[i]));
    });
    trail.textContent = route ? `Take the opening slip to ${receptacles[route].name}.`
      : ready ? 'Both opening plans fit. Choose who needs their first slip by the first bell.' : `Tested ${SCHEDULE_ROUTES.filter(read).length} of the two opening plans.`;
  }
  function drawRail(focus?: ScheduleTile) {
    const model = modelSchedule(record.fixture, order);
    rail.replaceChildren(...model.phases.map(({ tile, start, end }, i) => {
      const change = (step: -1 | 1) => {
        order = moveScheduleTile(order, i, step);
        drawRail(tile);
        output.textContent = '';
      };
      return h('li', { class: tile, 'data-tile': tile }, h('strong', {}, tasks[tile]),
        h('small', {}, `Bells ${start} to ${end}`),
        h('div', { class: 'row schedule-moves' },
          h('button', { type: 'button', disabled: i === 0, 'aria-label': `Move ${tasks[tile]} earlier`, onclick: () => change(-1) }, 'Earlier'),
          h('button', { type: 'button', disabled: i === model.phases.length - 1, 'aria-label': `Move ${tasks[tile]} later`, onclick: () => change(1) }, 'Later')));
    }));
    pacing.textContent = `The first readers arrive at bell ${record.fixture.bell}.`;
    if (focus) rail.querySelector<HTMLButtonElement>(`[data-tile="${focus}"] button:not([disabled])`)?.focus();
  }
  const recordView = h('article', { class: 'schedule-source' }, h('strong', {}, record.object.artist), sourceLink(record),
    h('p', { class: 'fine' }, record.object.limit));
  void specimenArt(record.object.pixelAsset).then((image) => {
    if (image) recordView.prepend(h('img', { alt: record.object.altText, src: image.toDataURL('image/png') }));
  });
  panel.append(h('h2', {}, record.title), h('p', {}, record.task), recordView,
    pacing, rail, bell, output, trail, h('div', { class: 'row' }, send));
  drawRail();
  updateDelivery();
  return panel;
}
