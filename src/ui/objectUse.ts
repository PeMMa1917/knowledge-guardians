import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import {
  DELIVERY_ROUTES, OBJECT_USE_CASES, OBJECT_USE_DETAILS, OBJECT_USE_ROOMS, objectUseDelivery, objectUseReady, specimenUseAsset,
  type DeliveryRoute, type ObjectUseCase, type ObjectUseRoom,
} from '../content/objectUseCases';
import { TRIAL_SIDES, calculateClearance, calculateTally, canTakeReading, pulseStart, seamOffset, seenPulses, type TrialSide } from '../domain/objectUse';
import { check } from '../domain/rules';
import { h } from './dom';
import './objectUse.css';

const receivingMaps = { market: 'market.sample-shed', stage: 'stage.prop-room' };
const fixtureNames = { clearance: 'Aperture and turned outline', tally: 'Partial and additional tally',
  seam: 'Backing mark and sliding overlay', pulse: 'Timed trace and movable shutter' };

function sourceLink(job: ObjectUseCase) {
  const { object } = job;
  return h('a', { href: object.catalogUrl, target: '_blank', rel: 'noopener' }, `${object.institution} · ${object.accession}`);
}

function workView(job: ObjectUseCase, side: TrialSide, position: number) {
  const bench = job.bench;
  if (bench.kind === 'clearance') {
    const { spans, margins } = calculateClearance(bench, side);
    const maximum = Math.max(...bench.sample, ...bench.opening) + 4;
    const width = (value: number) => `${(value / maximum) * 94}%`;
    const measure = [0, 1].map((axis) => h('div', { class: 'object-use-rails' },
      h('span', { class: 'opening', style: { width: width(bench.opening[axis]) } }),
      h('span', { class: margins[axis] < 0 ? 'template catches' : 'template', style: { width: width(spans[axis]) } })));
    const clear = margins.every((margin) => margin >= 0);
    return { shape: h('div', { class: 'object-use-aperture' }, measure),
      report: `Outline ${spans[0]} × ${spans[1]} cm against ${bench.opening[0]} × ${bench.opening[1]} cm. Margins ${margins[0]} and ${margins[1]} cm. ${clear ? 'This template clears.' : 'The turned template catches.'}` };
  }
  if (bench.kind === 'tally') {
    const { base, added, total } = calculateTally(bench, side);
    const marks = Array.from({ length: total }, (_, i) => h('span', { class: i < base ? 'mark' : 'mark separate' }));
    return { shape: h('div', { class: 'object-use-tally' }, marks),
      report: `${base} ${bench.unit} on the first row. ${added} additional ${bench.unit}. Combined reading ${total}.` };
  }
  if (bench.kind === 'seam') {
    const offset = seamOffset(bench, side, position);
    const line = (amount: number, css: string) => h('span', { class: css, style: { insetInlineStart: `${5 + amount * 7.5}%` } });
    return { shape: h('div', { class: 'object-use-seams' }, line(bench.marks[side], 'backing'), line(position, 'overlay')),
      report: offset === 0 ? 'The two marks meet. There is no gap on this register.'
        : `The overlay sits ${Math.abs(offset)} ${Math.abs(offset) === 1 ? 'mark' : 'marks'} to the ${offset < 0 ? 'left' : 'right'} of the backing mark.` };
  }
  const visible = seenPulses(bench, side, position);
  const strip = Array.from({ length: 12 }, (_, index) => {
    const open = index >= position && index < position + bench.widths[side];
    return h('span', { class: open ? 'open' : 'covered' }, h('i', { class: bench.events.includes(index) ? 'pulse' : 'quiet' }));
  });
  return { shape: h('div', { class: 'object-use-timeline' }, strip),
    report: `The shutter starts at tick ${position} and opens ${bench.widths[side]} slots. ${visible.length ? `Visible pulses at ${visible.join(' and ')}.` : 'No marks visible.'}` };
}

export function objectUsePanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'object-use' });
  const state = () => controller.state;
  const flag = (key: string) => state().flags[key];
  const set = (key: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag: key, value });
    sound('sfx.page');
    refresh();
  };

  if (station.startsWith('receive:')) {
    const [, requestedRoom, requestedRoute] = station.split(':');
    if (!OBJECT_USE_ROOMS.includes(requestedRoom as ObjectUseRoom) || !DELIVERY_ROUTES.includes(requestedRoute as DeliveryRoute)) return panel;
    const room = requestedRoom as ObjectUseRoom;
    const route = requestedRoute as DeliveryRoute;
    const index = DELIVERY_ROUTES.indexOf(route);
    const place = OBJECT_USE_DETAILS[room];
    const map = receivingMaps[place.host];
    if (state().mapId !== map) return panel;
    const desk = h('div', { class: 'object-use-queue' });
    const jobs = OBJECT_USE_CASES.filter((job) => job.room === room && check(objectUseDelivery(job, route), state()));
    panel.append(h('h2', {}, place.stations[index]), desk);
    for (const job of jobs) {
      const status = h('p', { class: 'fine', role: 'status', tabindex: -1 });
      const earlier = `${job.flag}.surface-pair`;
      const canPair = job.key === 'vessel-print' && flag('specimen.work.bowl.used') === true;
      const compare = h('button', { type: 'button', onclick: () => {
        if (!canPair || flag(job.objective) !== route || flag(earlier) || state().mapId !== map) return;
        set(earlier, true);
        display();
        status.focus();
      } }, 'Clip the earlier bowl tracing beside the vessel');
      const mount = h('button', { type: 'button', onclick: () => {
        if (state().mapId !== map || flag(job.objective) || !check(objectUseDelivery(job, route), state())) return;
        set(job.objective, route);
        display();
        status.focus();
      } }, `Put ${job.title.toLowerCase()} in place`);
      function display() {
        const received = flag(job.objective) === route;
        mount.disabled = received;
        mount.textContent = received ? 'Copy in place' : `Put ${job.title.toLowerCase()} in place`;
        status.textContent = received ? job.results[index] : job.bets[index];
        compare.hidden = !received || !canPair;
        compare.disabled = flag(earlier) === true;
        if (compare.disabled) status.textContent += ' The visitor now has two clay surfaces to compare. The bowl resembles carving in wood. This vessel carries a braid impression. Each tracing keeps its own catalogue slip.';
      }
      desk.append(h('article', {}, h('h3', {}, job.title), sourceLink(job), mount, compare, status));
      display();
    }
    return panel;
  }

  const found = OBJECT_USE_CASES.find(({ key }) => key === station);
  if (!found) return panel;
  const job: ObjectUseCase = found;
  const place = OBJECT_USE_DETAILS[job.room];
  const atWork = () => state().mapId === place.room && state().cards.includes(job.card);
  if (!atWork()) return panel;

  let side: TrialSide = 0;
  let position = 0;
  const adjustable = job.bench.kind === 'seam' || job.bench.kind === 'pulse';
  const preview = h('div', { class: 'object-use-tool', 'aria-hidden': 'true' });
  const result = h('p', { class: 'fine', role: 'status' });
  const guidance = h('p', { class: 'fine', role: 'status', tabindex: -1 });
  const recorded = (i: TrialSide) => flag(`${job.flag}.trial.${i}`) === true;
  const slider = h('input', { type: 'range', min: 0, max: job.bench.kind === 'pulse' ? 11 : 12,
    value: 0, 'aria-label': job.bench.kind === 'pulse' ? 'Trace shutter start tick' : 'Overlay position',
    oninput: () => { position = Number(slider.value); paint(); },
  });
  const align = h('button', { type: 'button', onclick: () => {
    if (job.bench.kind === 'seam') position = job.bench.marks[side];
    if (job.bench.kind === 'pulse') position = pulseStart(job.bench, side);
    slider.value = String(position);
    paint();
  } }, job.bench.kind === 'pulse' ? 'Slide to the marked start' : 'Slide to the backing mark');
  const controls = TRIAL_SIDES.map((i) => h('button', { type: 'button', onclick: () => {
    side = i;
    position = 0;
    slider.value = '0';
    paint();
  } }, job.bench.labels[i]));
  const record = h('button', { type: 'button', onclick: () => {
    if (!atWork() || recorded(side) || !canTakeReading(job.bench, side, position)) return;
    set(`${job.flag}.trial.${side}`, true);
    paint();
    const other: TrialSide = side === 0 ? 1 : 0;
    if (!recorded(other)) controls[other].focus();
    else if (!flag(`${job.flag}.route`)) routes[0].focus();
    else guidance.focus();
  } }, 'Keep this reading on the work slip');
  const routes = DELIVERY_ROUTES.map((route, i) => h('button', { type: 'button', onclick: () => {
    if (!atWork() || !check(objectUseReady(job), state()) || flag(`${job.flag}.route`)) return;
    set(`${job.flag}.route`, route);
    paint();
    guidance.focus();
  } }, job.bets[i]));

  function paint() {
    const { shape, report } = workView(job, side, position);
    preview.replaceChildren(shape);
    result.textContent = `${fixtureNames[job.bench.kind]}. ${report} ${recorded(side) ? 'Reading on the slip.' : ''}`;
    record.disabled = recorded(side) || !canTakeReading(job.bench, side, position);
    controls.forEach((control, i) => control.setAttribute('aria-pressed', String(i === side)));
    const sent = flag(`${job.flag}.route`);
    const ready = check(objectUseReady(job), state());
    routes.forEach((button, i) => {
      button.disabled = !ready || !!sent;
      button.setAttribute('aria-pressed', String(sent === DELIVERY_ROUTES[i]));
    });
    const receiver = sent === 'near' || sent === 'wide' ? place.stations[DELIVERY_ROUTES.indexOf(sent)] : undefined;
    guidance.textContent = receiver ? `Find ${receiver} outside this room. ${flag(job.objective) ? 'Your copy is already in place.' : 'Bring the work slip with you.'}`
      : ready ? 'Both readings are ready. Choose where the result will help a person.' : 'Keep a reading from each setting.';
  }

  const image = h('img', { class: 'object-use-photo', alt: job.object.altText });
  const reference = h('div', { class: 'object-use-reference' },
    h('div', {}, sourceLink(job), h('p', { class: 'fine' }, job.object.limit)));
  void specimenArt(specimenUseAsset(job)).then((drawing) => {
    if (!drawing) return;
    image.src = drawing.toDataURL('image/png');
    reference.prepend(image);
  });
  const echo = job.key === 'vessel-print' && flag('specimen.work.bowl.used') === true
    ? h('p', { class: 'fine' }, 'Aven sent word from the Sample Shed. Your earlier bowl copy shows how worked clay can resemble carved wood. This vessel gives Coru a second comparison. A woven-looking mark on it belongs to impressed clay.') : null;
  if (echo) reference.append(echo);
  panel.append(h('h2', {}, job.title), h('p', {}, job.problem), reference, h('p', {}, job.action),
    h('div', { class: 'row' }, controls), preview, result,
    ...(adjustable ? [slider, align] : []), record, guidance, h('div', { class: 'row' }, routes));
  paint();
  return panel;
}
