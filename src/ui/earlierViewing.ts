import type { GameController } from '../app/controller';
import { earlierViews, type EarlierView } from '../content/earlierViewing';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './earlierViewing.css';

const layouts = ['single', 'paired'] as const;

function workingSketch(record: EarlierView, view: number) {
  const lines = record.id === 'north-turn' ? [8, 6, 4] : record.id === 'deep-window' ? [2, 5, 9] : [8, 5, 7];
  const marks = h('div', { class: 'earlier-view-marks', 'aria-hidden': 'true' },
    ...lines.map((amount) => h('div', { class: `line line-${amount}` })));
  return h('div', { class: `earlier-view-practice ${record.id} view-${view}` }, marks);
}

export function earlierViewingPanel(controller: GameController, id: string, sound: (key: string) => void, refresh: () => void) {
  const panel = h('div', { class: 'earlier-view' });
  const selected = earlierViews.find((entry) => entry.id === id);
  if (!selected || !controller.check(specimenEquipped(selected.key))) return panel;
  const record = selected;
  const { flag } = record;
  const stateFlag = (name: string) => controller.state.flags[`${flag}.${name}`];
  const set = (name: string, value: boolean | string) => {
    controller.dispatch({ type: 'SetFlag', flag: `${flag}.${name}`, value });
    refresh();
  };
  set('begun', true);
  const result = h('div', { class: 'earlier-view-result', role: 'status' });
  const consequence = h('p', { role: 'status' });
  const placements = record.placements.map((placement, index) => h('button', { type: 'button', onclick: () => {
    set('layout', layouts[index]); sound('sfx.page'); paint();
  } }, placement.label));
  function paint() {
    const ready = record.views.every((_, view) => stateFlag(`view.${view}`) === true);
    const layout = layouts.findIndex((key) => stateFlag('layout') === key);
    placements.forEach((button, i) => { button.disabled = !ready; button.setAttribute('aria-pressed', String(i === layout)); });
    const chosen = record.placements[layout];
    consequence.textContent = chosen?.after ?? (ready ? 'The keeper has room for either installation.' : 'Open both views.');
  }
  const views = record.views.map((view, index) => h('button', { type: 'button', onclick: () => {
    set(`view.${index}`, true);
    sound('sfx.page');
    result.replaceChildren(workingSketch(record, index), h('p', {}, view.read));
    views.forEach((control, i) => control.setAttribute('aria-pressed', String(i === index)));
    paint();
  } }, view.label));
  panel.append(h('h2', {}, record.title), h('p', {}, record.request), h('div', { class: 'row' }, ...views), result,
    h('div', { class: 'row' }, ...placements), consequence);
  paint();
  return panel;
}
