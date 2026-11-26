import type { GameController } from '../app/controller';
import { MODEL_DESTINATIONS, MODEL_RECORDS, type ModelDestination, type ModelRecord } from '../content/modelRecords';
import { flowModel, layThread } from '../domain/modelRecords';
import { h } from './dom';
import './modelRecords.css';

const READER = { near: 'the scale keeper', study: 'the study reader' };

function displayTrial(record: ModelRecord, trial: number) {
  if (record.slug === 'moniac') {
    const moved = trial === 0 ? 3 : 6;
    const model = flowModel(1, moved);
    const levels = Object.entries(model).map(([tank, count]) => h('div', {}, h('span', {}, tank),
      h('meter', { min: 0, max: 12, value: count, 'aria-label': tank }, `${count} units`), h('span', {}, `${count} units now in the tank`)));
    return h('div', { class: 'model-record-tanks' }, ...levels,
      h('p', {}, `Before this run the intake held 12. In one pulse ${moved} units crossed. One in three of those moving units went into reserve.`));
  }
  const path = layThread(trial === 1);
  const canvas = h('canvas', { width: 130, height: 38, 'aria-hidden': 'true' });
  const drawing = canvas.getContext('2d');
  if (drawing) {
    drawing.fillStyle = '#363044'; drawing.fillRect(0, 0, canvas.width, canvas.height);
    drawing.beginPath();
    path.forEach(({ x, y }) => drawing.lineTo(x * 9 + 9, y * 9 + 9));
    drawing.lineWidth = 3; drawing.strokeStyle = '#efd1a5'; drawing.stroke();
    drawing.fillStyle = '#a4dceb';
    for (const { x, y } of [path[0], path[path.length - 1]]) drawing.fillRect(x * 9 + 7, y * 9 + 7, 5, 5);
  }
  return h('div', {}, canvas, h('p', {}, `The thread uses ${path.length - 1} segments. Its end marks are ${path[path.length - 1].x} spaces apart.`));
}

export function modelRecordPanel(controller: GameController, place: string, sound: (key: string) => void, refresh: () => void) {
  const panel = h('div', { class: 'model-record-panel' });
  const flag = (key: string) => controller.state.flags[key];
  const set = (key: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag: key, value });
    sound('sfx.page');
    refresh();
  };
  function receive(route: ModelDestination) {
    panel.append(h('h2', {}, READER[route]));
    const queue = MODEL_RECORDS.filter((record) => flag(`${record.flag}.send`) === route);
    if (!queue.length) panel.append(h('p', {}, 'The clip is ready for a checked trial.'));
    for (const record of queue) {
      const reply = h('p', { role: 'status' });
      const returned = () => { reply.textContent = record[route]; button.disabled = true; button.textContent = 'Guide in use'; };
      const button = h('button', { type: 'button', onclick: () => {
        set(`${record.flag}.received`, route);
        returned();
        reply.tabIndex = -1; reply.focus();
      } }, `Pass the guide for ${record.accession}`);
      if (flag(`${record.flag}.received`) === route) returned();
      panel.append(h('article', {}, h('h3', {}, record.title), button, reply));
    }
  }
  if (place === 'near' || place === 'study') { receive(place); return panel; }
  const found = MODEL_RECORDS.find((record) => place === record.slug || place === `return-${record.slug}`);
  if (!found) return panel;
  const record: ModelRecord = found;
  const revisit = place.startsWith('return-');
  const result = h('div', { class: 'model-record-trial', role: 'status' });
  const report = h('p', { class: 'fine', role: 'status' });
  const key = revisit ? 'return' : 'send';
  const decisions = MODEL_DESTINATIONS.map((route) => h('button', { type: 'button', onclick: () => {
    set(`${record.flag}.${key}`, route); show();
  } }, revisit ? (route === 'near' ? 'Use the shorter note' : 'Keep both trials in reach')
    : (route === 'near' ? 'Send the checked guide to the scale' : 'Leave the fuller guide at the study table')));
  function show() {
    const ready = revisit || [0, 1].every((index) => flag(`${record.flag}.trial.${index}`) === true);
    const route = flag(`${record.flag}.${key}`);
    report.textContent = route === 'near' || route === 'study'
      ? revisit ? record[route] : `The checked guide waits for ${READER[route]}.`
      : ready ? record.limit : 'Try the two settings before sending the guide.';
    decisions.forEach((button, index) => {
      button.disabled = !ready;
      button.setAttribute('aria-pressed', String(route === MODEL_DESTINATIONS[index]));
    });
  }
  const labels = record.slug === 'moniac' ? ['Send three units through', 'Send six units through'] : ['Stretch the practice thread', 'Lay the same segments in a bend'];
  const tools = labels.map((label, trial) => h('button', { type: 'button', onclick: () => {
    result.replaceChildren(displayTrial(record, trial));
    if (!revisit) set(`${record.flag}.trial.${trial}`, true);
    show();
  } }, label));
  panel.append(h('h2', {}, revisit ? record.revisit.method : record.title), h('p', {}, record.job), h('div', { class: 'row' }, tools), result,
    report, h('div', { class: 'row' }, decisions));
  show();
  return panel;
}
