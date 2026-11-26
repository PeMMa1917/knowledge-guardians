import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import {
  SCRIPT_CASES, SCRIPT_DESTINATIONS, SCRIPT_DETAILS, SCRIPT_RAIL_RETURN,
  scriptCarry, scriptDelivery, scriptReady, type ScriptCase,
} from '../content/scriptRail';
import { check } from '../domain/rules';
import { SCRIPT_LAYOUTS, scriptRailView, type ScriptLayout, type ScriptView } from '../domain/scriptRail';
import { h } from './dom';
import './scriptRail.css';

function source(record: ScriptCase): HTMLElement {
  return h('a', { href: record.object.catalogue, target: '_blank', rel: 'noopener' },
    `${record.object.institution} · ${record.object.accession}`);
}

function strips(record: ScriptCase, layout: ScriptLayout, view: ScriptView): HTMLElement[] {
  return scriptRailView(layout, view).map((strip) => h('li', { class: `script-strip ${strip}`, 'data-strip': strip },
    h('strong', {}, strip === 'cue' ? 'House reading cue · fictional' : 'Catalogue evidence'),
    h('p', {}, strip === 'cue' ? record.cue : record.object.observation)));
}

export function scriptRailPanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'script-rail' });
  const state = () => controller.state;
  const setFlag = (flag: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };

  if (station.startsWith('receive:')) {
    const layout = SCRIPT_LAYOUTS.find((side) => station === `receive:${side}`);
    if (!layout || state().mapId !== SCRIPT_DESTINATIONS[layout].map) return panel;
    panel.append(h('h2', {}, layout === 'cue' ? 'The call rail' : 'The open rest'));
    for (const record of SCRIPT_CASES.filter((entry) => check(scriptDelivery(entry, layout), state()))) {
      const note = h('p', { role: 'status', tabindex: -1 });
      const install = h('button', { type: 'button', onclick: () => {
        if (!check(scriptDelivery(record, layout), state()) || state().mapId !== SCRIPT_DESTINATIONS[layout].map || state().flags[record.objective]) return;
        setFlag(record.objective, layout);
        update();
        note.focus();
      } });
      function update() {
        const installed = state().flags[record.objective] === layout;
        install.disabled = installed;
        install.textContent = installed ? 'Fold installed' : `Install ${record.title.toLowerCase()}`;
        const result = layout === 'cue' ? 0 : 1;
        note.textContent = installed ? record.readbacks[result] : record.task;
      }
      panel.append(h('article', {}, h('h3', {}, record.title), source(record), install, note));
      update();
    }
    return panel;
  }

  if (station === 'revisit') {
    if (state().mapId !== SCRIPT_RAIL_RETURN.map) return panel;
    panel.append(h('h2', {}, 'The folded index'));
    const equipped = SCRIPT_CASES.find((record) => check(scriptCarry(record), state()));
    for (const entry of SCRIPT_CASES.filter((record) => record !== equipped && state().flags[record.reprise] === 'use')) {
      panel.append(h('article', {}, h('h3', {}, entry.title), source(entry), h('p', {}, entry.revisit[1])));
    }
    if (!equipped) {
      panel.append(h('p', {}, 'Equip a Script Cabinet working copy to add its separate retrieval line.'));
      return panel;
    }
    const active: ScriptCase = equipped;
    const layout = state().flags[active.objective] === 'catalogue' ? 'catalogue' : 'cue';
    const fold = h('ol', { class: 'script-fold', 'aria-label': 'Visible strips on the City’s working copy' });
    const result = h('p', { role: 'status', tabindex: -1 });
    let opened = false;
    const open = h('button', { type: 'button', onclick: () => {
      opened = true;
      sound('sfx.page');
      update();
      index.focus();
    } }, 'Open the return fold');
    const index = h('button', { type: 'button', onclick: () => {
      if (!opened || state().mapId !== SCRIPT_RAIL_RETURN.map || !check(scriptCarry(active), state()) || state().flags[active.reprise] === 'use') return;
      controller.dispatch({ type: 'SetSpecimenReading', exhibit: active.exhibit, reading: 'use' });
      sound('sfx.page');
      refresh();
      update();
      result.focus();
    } }, active.revisit[0]);
    function update() {
      const checked = state().flags[active.reprise] === 'use';
      fold.replaceChildren(...strips(active, layout, opened || checked ? 'open' : 'rail'));
      open.disabled = opened || checked;
      index.disabled = !opened || checked;
      result.textContent = checked ? active.revisit[1] : opened ? active.object.limit : 'The City index keeps the last fold. Pull the second strip into reach for its next reader.';
    }
    panel.append(h('article', {}, h('h3', {}, active.title), source(active), fold, open, index, result));
    update();
    return panel;
  }

  const found = SCRIPT_CASES.find(({ slug }) => slug === station);
  if (!found || state().mapId !== SCRIPT_DETAILS[found.room].map || !state().cards.includes(found.card)) return panel;
  const record: ScriptCase = found;

  let layout: ScriptLayout = 'cue';
  let view: ScriptView = 'rail';
  let looked = false;
  const preview = h('ol', { class: 'script-fold', 'aria-label': 'Visible strips on the practice fold' });
  const explore = h('p', { role: 'status', tabindex: -1 });
  const route = h('p', { class: 'fine', role: 'status' });
  const photo = h('figure', { class: 'script-photo' }, h('figcaption', {}, `${record.object.title} · ${record.object.date}`));
  void specimenArt(record.object.pixelAsset).then((image) => {
    if (image) photo.prepend(h('img', { alt: record.object.altText, src: image.toDataURL('image/png') }));
  });

  const turn = h('button', { type: 'button', onclick: () => {
    layout = layout === 'cue' ? 'catalogue' : 'cue';
    view = 'rail';
    looked = false;
    sound('sfx.page');
    update();
  } });
  const rail = h('button', { type: 'button', onclick: () => {
    view = 'rail';
    looked = true;
    sound('sfx.page');
    update();
    explore.focus();
  } }, 'Read from the rail');
  const rest = h('button', { type: 'button', onclick: () => {
    if (!looked) return;
    view = 'open';
    if (!state().flags[`${record.flag}.preview.${layout}`]) setFlag(`${record.flag}.preview.${layout}`, true);
    update();
    explore.focus();
  } }, 'Open the fold on the rest');

  const send = SCRIPT_LAYOUTS.map((side) => h('button', { type: 'button', onclick: () => {
    if (!check(scriptReady(record), state()) || state().mapId !== SCRIPT_DETAILS[record.room].map || state().flags[`${record.flag}.sent`]) return;
    setFlag(`${record.flag}.sent`, side);
    update();
    route.focus();
  } }, SCRIPT_DESTINATIONS[side].installer));

  function update() {
    const sentTo = SCRIPT_LAYOUTS.find((side) => state().flags[`${record.flag}.sent`] === side);
    const ready = check(scriptReady(record), state());
    const tested = SCRIPT_LAYOUTS.filter((side) => state().flags[`${record.flag}.preview.${side}`]).length;
    rest.disabled = !looked || view === 'open';
    turn.textContent = layout === 'cue' ? 'Turn the catalogue line out' : 'Turn the reading cue out';
    preview.replaceChildren(...strips(record, layout, view));
    explore.textContent = view === 'open' ? record.object.limit : looked
      ? layout === 'cue' ? 'Only the House’s practice line is visible from here.' : 'Only the source strip is visible from here.'
      : 'Try the view from the rail. Then open the second strip on the rest.';
    send.forEach((button, i) => {
      button.disabled = !ready || !!sentTo;
      button.setAttribute('aria-pressed', String(sentTo === SCRIPT_LAYOUTS[i]));
    });
    route.textContent = sentTo ? `Take the fold to ${SCRIPT_DESTINATIONS[sentTo].label}.`
      : ready ? 'Both ways fit. Choose where the next reader needs to begin.'
        : `Folds read from both places ${tested} of 2.`;
  }
  route.tabIndex = -1;
  panel.append(h('h2', {}, record.title), h('p', {}, record.task), photo, source(record),
    h('div', { class: 'script-controls' }, turn, rail, rest), preview, explore,
    h('div', { class: 'script-controls' }, ...send), route);
  update();
  return panel;
}
