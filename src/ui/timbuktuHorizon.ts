import type { GameController } from '../app/controller';
import {
  TIMBUKTU_CARD, TIMBUKTU_FLAG, TIMBUKTU_OBJECTIVE, TIMBUKTU_OPEN,
} from '../content/timbuktuManuscript';
import { HORIZON_COLUMNS, HORIZON_VIEWS, firstVisiblePositions } from '../domain/timbuktuHorizon';
import { h } from './dom';
import './timbuktuHorizon.css';

const readers = {
  quay: {
    name: 'The quay readers’ roof line clip', map: 'observatory.harbour',
    send: 'Send the roof line tracing down to the quay',
    action: 'Put the roof line under the readers’ clip',
    result: 'A reader repeats the figure along the roof and finds the delayed start again. The tracing names the skyline. The pocket strip keeps the author and the date of the 1733 copy on the reverse.',
  },
  headland: {
    name: 'The headland’s paired skyline frame', map: 'observatory.station',
    send: 'Keep both traces in the headland frame',
    action: 'Set both skylines into the observer’s frame',
    result: 'The observer can see that the same markers clear the low wall earlier. The frame holds both sightlines and the source slip, although it takes more space than the quay strip.',
  },
} as const;

const markerNames = ['First marker', 'Second marker'];
const pathKeys = [0, 1] as const;

export function timbuktuHorizonPanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'season-horizon' });
  const state = () => controller.state;
  const sendKey = `${TIMBUKTU_FLAG}.sent`;
  const hasCase = () => state().cards.includes(TIMBUKTU_CARD) && state().objectivesDone.includes(TIMBUKTU_OPEN.objective);
  const read = (i: number) => state().flags[`${TIMBUKTU_FLAG}.read.${i}`] === true;
  const complete = () => pathKeys.every(read);
  const write = (flag: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };

  if (station === 'quay' || station === 'headland') {
    const receiver = readers[station];
    if (!hasCase() || !complete() || state().mapId !== receiver.map || state().flags[sendKey] !== station) return panel;
    const status = h('p', { role: 'status', tabindex: -1 });
    const action = h('button', { type: 'button', onclick: () => {
      if (state().mapId !== receiver.map || state().flags[sendKey] !== station || state().flags[TIMBUKTU_OBJECTIVE]) return;
      write(TIMBUKTU_OBJECTIVE, station);
      updateReceiver();
      status.focus();
    } }, receiver.action);
    function updateReceiver() {
      action.disabled = state().flags[TIMBUKTU_OBJECTIVE] === station;
      status.textContent = action.disabled ? receiver.result : 'A copied horizon sits in your case. The original record stays in the archive.';
    }
    panel.append(h('h2', {}, receiver.name), action, status);
    updateReceiver();
    return panel;
  }

  if (station !== 'board' || !hasCase() || state().mapId !== 'observatory.archive') return panel;
  let view = 0;
  let column = 0;
  const markKey = (point: number) => `${TIMBUKTU_FLAG}.mark.${view}.${point}`;
  const marked = (point: number) => state().flags[markKey(point)] === true;
  const guide = h('div', { class: 'season-horizon-plot', 'aria-hidden': 'true' });
  const report = h('p', { role: 'status', class: 'fine' });
  const selected = h('p', { role: 'status', class: 'fine' });
  const slider = h('input', { type: 'range', min: 1, max: HORIZON_COLUMNS, value: 1, 'aria-label': 'Sighting guide column', oninput: () => {
    column = Number(slider.value) - 1;
    draw();
  } });
  const buttons = HORIZON_VIEWS.map(({ place }, i) => h('button', { type: 'button', onclick: () => {
    if (i === view) return;
    view = i;
    column = 0;
    slider.value = '1';
    draw();
  } }, place));
  const seek = h('button', { type: 'button', onclick: () => {
    const target = firstVisiblePositions(HORIZON_VIEWS[view]).find((value) => !marked(value));
    if (target === undefined) return;
    column = target;
    slider.value = String(column + 1);
    draw();
  } }, 'Follow the guide to the next first sighting');
  const record = h('button', { type: 'button', onclick: () => {
    const starts = firstVisiblePositions(HORIZON_VIEWS[view]);
    if (!hasCase() || state().mapId !== 'observatory.archive' || marked(column) || !starts.includes(column)) return;
    controller.dispatch({ type: 'SetFlag', flag: markKey(column), value: true });
    if (starts.every(marked) && !read(view)) {
      controller.dispatch({ type: 'SetFlag', flag: `${TIMBUKTU_FLAG}.read.${view}`, value: true });
    }
    sound('sfx.page');
    refresh();
    draw();
    if (record.disabled) {
      if (read(view) && !complete()) buttons[1 - view].focus();
      else if (complete() && !state().flags[sendKey]) send[0].focus();
      else if (seek.disabled) slider.focus();
      else seek.focus();
    }
  } }, 'Make a tracing mark at the guide');
  const leaveRoutes = ['quay', 'headland'] as const;
  const send = leaveRoutes.map((route) => h('button', { type: 'button', onclick: () => {
    if (!complete() || state().mapId !== 'observatory.archive' || state().flags[sendKey]) return;
    write(sendKey, route);
    draw();
    selected.tabIndex = -1;
    selected.focus();
  } }, readers[route].send));

  function draw() {
    const spot = HORIZON_VIEWS[view];
    const positions = firstVisiblePositions(spot);
    guide.replaceChildren(...Array.from({ length: HORIZON_COLUMNS }, (_, i) => {
      const spans = pathKeys.map((key) => h('span', {
        class: `season-marker marker-${key}${spot.paths[key][i] > spot.height ? ' visible' : ''}`,
        style: { bottom: `${spot.paths[key][i] * 10}%` },
      }));
      return h('div', { class: `season-column${i === column ? ' sighted' : ''}` },
        h('span', { class: 'season-roof', style: { height: `${spot.height * 10}%` } }), spans,
        h('span', { class: 'season-index' }, String(i + 1)));
    }));
    const details = pathKeys.map((key) => {
      const height = spot.paths[key][column];
      if (positions[key] === column) return `${markerNames[key]} starts to show here.`;
      return `${markerNames[key]} ${height > spot.height ? 'clears the skyline' : 'sits behind the skyline'}.`;
    });
    report.textContent = `Column ${column + 1}. ${details.join(' ')} ${read(view) ? 'Both starts are on this tracing.' : `${positions.filter(marked).length} of 2 starts traced here.`}`;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(view === i)));
    seek.disabled = read(view);
    record.disabled = read(view) || !positions.includes(column) || marked(column);
    const sent = state().flags[sendKey];
    send.forEach((button, i) => {
      const route = leaveRoutes[i];
      button.disabled = !complete() || !!sent;
      button.setAttribute('aria-pressed', String(sent === route));
    });
    selected.textContent = sent === 'quay' || sent === 'headland' ? `Bring the tracing to ${readers[sent].name.toLowerCase()}.`
      : complete() ? 'Both skylines are on the work sheet. Decide where the tracing can do its next job.' : '';
  }

  panel.append(h('h2', {}, 'Past the Roof Line'),
    h('p', {}, 'Nasir al-Din’s treatise connects repeated positions and seasons. Copy the first clear position of each marker on two practice skylines. The board uses our own invented paths.'),
    h('div', { class: 'row' }, buttons),
    guide, slider, h('div', { class: 'row' }, seek, record), report,
    h('div', { class: 'row' }, send), selected);
  draw();
  return panel;
}
