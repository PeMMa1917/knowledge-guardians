import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import {
  MATERIAL_CASES, MATERIAL_REVISIT, MATERIAL_ROOMS, STORE_ROUTES, storeCarry, storeReady, storeRouted,
  type MaterialCase,
} from '../content/materialStores';
import { check } from '../domain/rules';
import { STORE_SIDES, checkRoute, checkTension, checkTilt, litFeature, targetSetting, type StoreSide } from '../domain/materialStores';
import { h } from './dom';
import './materialStores.css';

const RECEIVER = {
  yard: { where: 'water.council', label: 'The Council Yard’s open tray' },
  channel: { where: 'water.lower-channel', label: 'The Lower Channel’s weather sleeve' },
};

function objectLink(record: MaterialCase) {
  const { object } = record;
  return h('a', { href: object.url, rel: 'noopener', target: '_blank' }, `${object.institution} · ${object.accession}`);
}

function fill(kind: string, units: number, extra = '') {
  return h('div', { class: `material-gauge ${kind}` },
    h('span', { style: { width: `${Math.min(100, Math.max(1, units))}%` } }, extra));
}

function view(record: MaterialCase, side: StoreSide, pos: number) {
  const fixture = record.fixture;
  if (fixture.kind === 'fibres') {
    const length = checkTension(fixture, side, pos);
    return { graphic: fill('ribbon', 100 * length / (fixture.span + fixture.load * Math.max(...fixture.stretch) + 1)),
      report: `Load ${pos} of ${fixture.load}. Practice strip spans ${length} centimetres, from ${fixture.span} loose.` };
  }
  if (fixture.kind === 'forms') {
    const margin = checkTilt(fixture, side, pos);
    return { graphic: fill(margin < 0 ? 'tip over' : 'tip', 30 + margin * 4),
      report: `Incline ${pos} of ${fixture.incline}. Load line ${Math.abs(margin)} model marks ${margin < 0 ? 'past' : 'inside'} the support edge.` };
  }
  if (fixture.kind === 'travel') {
    return { graphic: h('div', { class: 'material-stamps' }, fixture.legs[side].map((distance, i) =>
      h('span', { class: i <= pos ? 'material-stamp active' : 'material-stamp' }, String(distance)))),
      report: `Stop ${pos + 1} of ${fixture.legs[side].length}. Recorded distance ${checkRoute(fixture, side, pos)} model units.` };
  }
  const revealed = litFeature(fixture, side, pos);
  return { graphic: fill('reflection', 100 * revealed / fixture.patch[side]),
    report: `Model lamp angle ${pos} degrees. ${revealed ? `Visible length ${revealed} model marks.` : 'The feature falls outside this lamp view.'}` };
}

export function materialStorePanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'material-store' });
  const state = () => controller.state;
  const set = (flag: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };
  if (station.startsWith('receipt:')) {
    const route = STORE_ROUTES.find((value) => station === `receipt:${value}`);
    if (!route || RECEIVER[route].where !== state().mapId) return panel;
    const cases = MATERIAL_CASES.filter((record) => check(storeRouted(record, route), state()));
    const index = STORE_ROUTES.indexOf(route);
    panel.append(h('h2', {}, RECEIVER[route].label));
    for (const record of cases) {
      const status = h('p', { class: 'fine', role: 'status', tabindex: -1 });
      const take = h('button', { type: 'button', onclick: () => {
        if (state().mapId !== RECEIVER[route].where || !check(storeRouted(record, route), state()) || state().flags[record.objective]) return;
        set(record.objective, route);
        update();
        status.focus();
      } });
      function update() {
        const placed = state().flags[record.objective] === route;
        take.disabled = placed;
        take.textContent = placed ? 'Copy in use' : `Put ${record.title.toLowerCase()} in use`;
        status.textContent = placed ? record.responses[index] : record.choices[index];
      }
      panel.append(h('article', {}, h('h3', {}, record.title), objectLink(record), take, status));
      update();
    }
    return panel;
  }

  if (station === 'revisit') {
    if (state().mapId !== MATERIAL_REVISIT.map) return panel;
    const available = MATERIAL_CASES.find((record) => check(storeCarry(record), state()));
    const replies = MATERIAL_CASES.filter(({ reprise }) => state().flags[reprise] === 'use' && reprise !== available?.reprise);
    panel.append(h('h2', {}, 'Canal Walk’s used-work-copy shelf'));
    for (const record of replies) panel.append(h('article', {}, h('h3', {}, record.title), objectLink(record), h('p', {}, record.returnEffect)));
    if (!available) {
      panel.append(h('p', {}, 'Fit a working copy in your bag to check another part of the shelf.'));
      return panel;
    }
    const record: MaterialCase = available;
    const result = h('p', { role: 'status', class: 'fine', tabindex: -1 });
    const use = h('button', { type: 'button', onclick: () => {
      if (!open || !check(storeCarry(record), state()) || state().mapId !== MATERIAL_REVISIT.map || state().flags[record.reprise]) return;
      controller.dispatch({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' });
      sound('sfx.page');
      refresh();
      update();
      result.focus();
    } }, record.returnAction);
    const compare = h('button', { type: 'button', onclick: () => {
      open = !open;
      compare.setAttribute('aria-pressed', String(open));
      update();
    } }, 'Swing the shelf clamp over this working copy');
    let open = false;
    function update() {
      const used = state().flags[record.reprise] === 'use';
      compare.disabled = used;
      use.disabled = used || !open;
      result.textContent = used ? record.returnEffect : open ? record.object.observation
        : `${record.object.identity}. The active copy carries this catalogue reference.`;
    }
    panel.append(h('article', {}, h('h3', {}, record.title), objectLink(record), compare, use, result));
    update();
    return panel;
  }

  const found = MATERIAL_CASES.find((record) => record.slug === station);
  if (!found) return panel;
  const record: MaterialCase = found;
  const fixture = record.fixture;
  const room = MATERIAL_ROOMS[fixture.kind];
  const inRoom = () => state().mapId === room.id && state().cards.includes(record.card);
  if (!inRoom()) return panel;

  let side: StoreSide = 0;
  let position = 0;
  const recorded = (i: StoreSide) => state().flags[`${record.flag}.reading.${i}`] === true;
  const routeFlag = `${record.flag}.route`;
  const status = h('p', { role: 'status', class: 'fine' });
  const slip = h('p', { role: 'status', class: 'fine', tabindex: -1 });
  const diagram = h('div', { 'aria-hidden': 'true', class: 'material-diagram' });
  const slider = h('input', { type: 'range', min: 0, value: 0, 'aria-label': 'Fixture position',
    oninput: () => { position = Number(slider.value); paint(); } });
  const near = h('button', { type: 'button', onclick: () => {
    position = fixture.kind === 'travel' ? Math.min(position + 1, targetSetting(fixture, side)) : targetSetting(fixture, side);
    slider.value = String(position);
    paint();
    if (near.disabled && !mark.disabled) mark.focus();
  } }, fixture.kind === 'travel' ? 'Push the docket to the next stop' : 'Set the fixture to its marked position');
  const controls = STORE_SIDES.map((i) => h('button', { type: 'button', onclick: () => {
    side = i;
    position = 0;
    slider.value = '0';
    paint();
  } }, record.checks[i]));
  const mark = h('button', { type: 'button', onclick: () => {
    if (!inRoom() || recorded(side) || position !== targetSetting(fixture, side)) return;
    set(`${record.flag}.reading.${side}`, true);
    paint();
    const other = side === 0 ? 1 : 0;
    if (!recorded(other)) controls[other].focus();
    else if (!state().flags[routeFlag]) choices[0].focus();
    else slip.focus();
  } }, 'Save this fixture reading');
  const choices = STORE_ROUTES.map((route, i) => h('button', { type: 'button', onclick: () => {
    if (!inRoom() || state().flags[routeFlag] || !check(storeReady(record), state())) return;
    set(routeFlag, route);
    paint();
    slip.focus();
  } }, record.choices[i]));

  function paint() {
    const test = view(record, side, position);
    const target = targetSetting(fixture, side);
    const atTarget = position === target;
    slider.max = String(fixture.kind === 'surfaces' ? 90 : target);
    diagram.replaceChildren(test.graphic);
    status.textContent = `${test.report} ${atTarget ? record.notes[side] : ''} ${recorded(side) ? 'This reading is on the slip.' : ''}`;
    near.disabled = atTarget;
    mark.disabled = !atTarget || recorded(side);
    controls.forEach((control, i) => control.setAttribute('aria-pressed', String(i === side)));
    const chosen = STORE_ROUTES.find((route) => state().flags[routeFlag] === route);
    const ready = STORE_SIDES.every(recorded);
    choices.forEach((button, i) => {
      button.disabled = !ready || !!chosen;
      button.setAttribute('aria-pressed', String(chosen === STORE_ROUTES[i]));
    });
    slip.textContent = chosen ? `Take the slip to ${RECEIVER[chosen].label}.`
      : ready ? 'Both readings are on the slip. Choose who needs this copy first.' : 'Keep a reading from both settings.';
  }

  const evidence = h('article', { class: 'material-evidence' }, h('strong', {}, record.object.identity), objectLink(record),
    h('p', { class: 'fine' }, record.object.observation), h('p', { class: 'fine' }, record.object.limit));
  void specimenArt(record.object.asset).then((drawing) => {
    if (drawing) evidence.prepend(h('img', { alt: record.object.alt, src: drawing.toDataURL('image/png') }));
  });
  panel.append(h('h2', {}, record.title), h('p', {}, record.task), evidence, h('p', { class: 'fine' }, room.instruction),
    h('div', { class: 'row' }, controls), diagram, status,
    ...(fixture.kind === 'travel' ? [] : [slider]), near, mark, slip, h('div', { class: 'row' }, choices));
  paint();
  return panel;
}
