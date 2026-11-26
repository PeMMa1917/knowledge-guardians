import type { GameController } from '../app/controller';
import {
  SKIFF_BERTHS, SKIFF_CREW, SKIFF_LANES, SKIFF_LAST_MARK, SKIFF_LOADS, SKIFF_WEATHER,
  hasSkiffComparison, newSkiff, skiffBerth, skiffCurrent, skiffDelivery, skiffPractice, skiffRun, skiffTerrain,
  type SkiffAction, type SkiffBerth, type SkiffRun, type SkiffSetup, type SkiffStroke,
} from '../domain/islandSkiff';
import { h } from './dom';
import './islandSkiff.css';

const WEATHER = { early: 'First bell · light current', fresh: 'Later bell · freshening wind' };
const CREW = { lookout: 'Lookout · calls the next drift', rower: 'Second rower · holds a straight course' };
const LOAD = { bundles: 'Two wrapped bundles · can cross shoals', crates: 'Three tool crates · needs deeper water' };
const BERTH = { stair: 'North stair', ramp: 'South ramp' };
const TEXT = {
  launch: 'The skiff is steady beside the first marker.',
  held: 'You stayed at the marker. The water moved on.',
  blocked: 'The skiff stayed at the marker. Try another heading or wait for the current to turn.',
  cleared: 'The skiff followed your heading.',
  drifted: 'The skiff crossed one lane with the current.',
};
const DIRECTION = ['toward the north bank', 'still', 'toward the south bank'];
const KEYS = { ArrowUp: 'north', ArrowRight: 'ahead', ArrowDown: 'south', ArrowLeft: 'hold' } as const;

function selector<T extends string>(title: string, options: readonly T[], names: Record<T, string>, value: T) {
  const control = h('select', {}, options.map((id) => h('option', { value: id }, names[id])));
  control.value = value;
  return { control, wrapper: h('label', {}, h('span', {}, title), control) };
}

function paint(canvas: HTMLCanvasElement, run: SkiffRun) {
  const g = canvas.getContext('2d');
  if (!g) return;
  const w = 44, waterTop = 22, laneHeight = 29, left = 7;
  const gradient = g.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#36483b');
  gradient.addColorStop(0.15, '#264e61');
  gradient.addColorStop(0.6, '#1e455b');
  gradient.addColorStop(0.85, '#174358');
  gradient.addColorStop(1, '#40533e');
  g.fillStyle = gradient;
  g.fillRect(0, 0, canvas.width, canvas.height);
  const berthY = (lane: number) => waterTop + lane * laneHeight;
  for (let mark = 0; mark <= SKIFF_LAST_MARK; mark++) {
    for (let lane = 0; lane < SKIFF_LANES.length; lane++) {
      const x = left + mark * w;
      const y = berthY(lane);
      const terrain = skiffTerrain(run.mode, mark, lane);
      if (mark === run.mark + 1) {
        g.fillStyle = '#cce4c229';
        g.fillRect(x, y, w - 2, laneHeight - 1);
      }
      if (terrain === 'rock') {
        g.fillStyle = '#2b3b39';
        g.fillRect(x + 7, y + 10, 28, 15);
        g.fillStyle = '#73816b';
        g.fillRect(x + 11, y + 5, 18, 10);
        g.fillRect(x + 14, y + 3, 10, 4);
        g.fillStyle = '#a3a27d';
        g.fillRect(x + 12, y + 7, 13, 3);
      } else {
        g.fillStyle = terrain === 'shoal' ? '#99ab80' : '#78adab60';
        const ripple = (mark * 3 + lane * 9 + run.beat * 3) % 15;
        g.fillRect(x + 4 + ripple, y + 23, 16, 1);
        g.fillRect(x + 9 + ripple, y + 26, 12, 1);
        if (terrain === 'shoal') g.fillRect(x + 13, y + 15, 17, 2);
      }
      if (mark === SKIFF_LAST_MARK && (run.mode === 'practice' || terrain !== 'rock')) {
        g.fillStyle = lane < 2 ? '#c5a577' : '#a0bd83';
        g.fillRect(x + 31, y + 2, 8, laneHeight - 2);
        g.fillStyle = '#4c593f';
        g.fillRect(x + 32, y + 7, 6, 2);
        g.fillRect(x + 32, y + 17, 6, 2);
      }
    }
  }
  const x = left + run.mark * w + 4;
  const y = berthY(run.lane) + 4;
  g.fillStyle = '#d2ecd6';
  if (run.mark) {
    g.fillRect(x - 7, y + 15, 10, 2);
    g.fillRect(x - 4, y + 18, 8, 2);
  }
  g.fillStyle = '#774735';
  g.fillRect(x, y + 11, 30, 7);
  g.fillRect(x + 4, y + 18, 21, 3);
  g.fillStyle = '#d18e56';
  g.fillRect(x + 2, y + 10, 25, 3);
  g.fillStyle = run.load === 'crates' ? '#a4c381' : '#dac181';
  g.fillRect(x + 16, y + 6, 4, 6);
  g.fillRect(x + 21, y + 8, 4, 4);
  if (run.load === 'crates') g.fillRect(x + 21, y + 3, 4, 4);
  g.fillStyle = '#e8cf97';
  g.fillRect(x + 8, y + 4, 3, 3);
  g.fillRect(x + 7, y + 7, 6, 5);
  g.fillStyle = '#c1ddce';
  g.font = '11px monospace';
  g.fillText('LAUNCH', left, 15);
  g.fillText(run.mode === 'practice' ? 'TEST MOORING' : 'STAIR', run.mode === 'practice' ? 326 : 359, 15);
  if (run.mode === 'delivery') g.fillText('RAMP', 362, 178);
}

export function islandSkiffPanel(controller: GameController, sound: (key: string) => void, landAt: (berth: SkiffBerth) => void): HTMLElement {
  const saved = skiffRun(controller.state.flags);
  const weather = selector('Departure bell', SKIFF_WEATHER, WEATHER, saved?.weather ?? 'early');
  const crew = selector('Crew station', SKIFF_CREW, CREW, saved?.crew ?? 'lookout');
  const load = selector('Load', SKIFF_LOADS, LOAD, saved?.load ?? 'bundles');
  const input = h('div', { class: 'skiff-settings' }, weather.wrapper, crew.wrapper, load.wrapper);
  const manifest = h('p', { class: 'fine' });
  const chart = h('canvas', { width: 410, height: 184, class: 'skiff-chart', 'aria-hidden': 'true' });
  const readings = h('p', { class: 'skiff-reading', 'aria-live': 'polite' });
  const docket = h('ul', { class: 'skiff-docket' });
  const choices = h('p', {}, 'The north stair is a hand carry to the shelter and leaves the shared cart free. The south ramp is step-free and uses the cart’s last trip.');
  const compare = h('p', { class: 'fine' });
  const launchPractice = h('button', { type: 'button', class: 'primary', onclick: () => launch('practice') }, 'Take the sheltered practice course');
  const launchDelivery = h('button', { type: 'button', class: 'primary', onclick: () => launch('delivery') }, 'Carry this delivery');
  const launches = h('div', { class: 'row wrap' }, launchPractice, launchDelivery);
  const strokeControl = (stroke: SkiffStroke, label: string) =>
    h('button', { type: 'button', onclick: () => move(stroke) }, label);
  const ahead = strokeControl('ahead', 'Row ahead →');
  const helm = h('div', { class: 'row wrap skiff-helm', role: 'group', 'aria-label': 'Skiff helm' },
    strokeControl('north', 'Angle north ↑'), ahead, strokeControl('south', 'Angle south ↓'), strokeControl('hold', 'Hold at the marker ←'));
  const land = h('button', { type: 'button', class: 'primary', onclick: landThere });
  const moor = h('button', { type: 'button', onclick: returnToDock }, 'Bring the skiff back');
  const berthTools = h('div', { class: 'row wrap' }, land, moor);

  function setup(mode: SkiffSetup['mode']): SkiffSetup {
    return { mode, weather: weather.control.value as SkiffSetup['weather'], crew: crew.control.value as SkiffSetup['crew'],
      load: load.control.value as SkiffSetup['load'] };
  }

  function launch(mode: SkiffSetup['mode']) {
    if (!issue({ type: 'SkiffStart', setup: setup(mode) })) return;
    sound('sfx.open');
    draw();
    ahead.focus();
  }

  function move(stroke: SkiffStroke) {
    const run = skiffRun(controller.state.flags);
    if (!run || skiffBerth(run) || !issue({ type: 'SkiffStroke', stroke })) return;
    sound('sfx.click');
    const next = skiffRun(controller.state.flags);
    draw();
    if (!next) {
      readings.textContent = 'The practice skiff reached the mooring. This run is recorded in the docket.';
      launchPractice.focus();
    } else if (skiffBerth(next)) land.focus();
  }

  function issue(action: SkiffAction) {
    const error = controller.dispatch(action).find((event) => event.kind === 'error');
    if (!error) return true;
    readings.textContent = error.message;
    return false;
  }

  function returnToDock() {
    if (!issue({ type: 'SkiffMoor' })) return;
    draw();
    readings.textContent = 'The skiff is back at the dock. Its previous completed runs are still in the docket.';
    launchPractice.focus();
  }

  function landThere() {
    const run = skiffRun(controller.state.flags);
    const berth = run && skiffBerth(run);
    if (!berth || !issue({ type: 'SkiffLand' })) return;
    sound('sfx.complete');
    landAt(berth);
  }

  function cellsAt(run: SkiffRun, terrain: 'rock' | 'shoal') {
    return SKIFF_LANES.filter((_, lane) => skiffTerrain(run.mode, run.mark + 1, lane) === terrain).join(', ').toLowerCase();
  }

  function summary(run: SkiffRun) {
    const strokes = run.beat - run.holds;
    return `${strokes} ${strokes === 1 ? 'advance' : 'advances'}, ${run.holds} holds, ${run.drifts} lane ${run.drifts === 1 ? 'drift' : 'drifts'}`;
  }

  function draw() {
    const flags = controller.state.flags;
    const current = skiffRun(flags);
    const selected = setup('practice');
    const berth = current && skiffBerth(current);
    const calibrated = flags['island.skiff.calibrated'] === true;
    input.hidden = !!current;
    manifest.hidden = !current;
    manifest.textContent = current
      ? `${WEATHER[current.weather]} · ${LOAD[current.load].split(' · ')[0]} · ${CREW[current.crew].split(' · ')[0]}`
      : '';
    launches.hidden = !!current;
    berthTools.hidden = !current;
    helm.hidden = !current || !!berth;
    choices.hidden = !!current && current.mode === 'practice';
    compare.hidden = !!current;
    land.hidden = !berth;
    const focus = current ? (berth ? land : ahead) : launchPractice;
    for (const button of [land, ahead, launchPractice]) button.toggleAttribute('data-autofocus', button === focus);
    if (berth) land.textContent = `Tie up at the ${BERTH[berth].toLowerCase()}`;
    launchDelivery.disabled = !calibrated;
    compare.textContent = hasSkiffComparison(flags, selected)
      ? 'Both bell conditions are on file for this load and crew. The holds and drifts describe the course you took each time.'
      : calibrated ? 'There is a delivery comparison on file for another setup. You can carry this setup and record its own weather.'
        : 'Keep the same load and crew through both practice conditions so Joss can compare them.';
    const preview = current ?? newSkiff(selected);
    paint(chart, preview);

    if (berth) readings.textContent = `The skiff is alongside the ${BERTH[berth].toLowerCase()}. Tie up to step onto the landing.`;
    else if (current) {
      const rocks = cellsAt(current, 'rock');
      const shoals = cellsAt(current, 'shoal');
      const drift = DIRECTION[skiffCurrent(current) + 1];
      const next = current.crew === 'lookout' && current.mark < SKIFF_LAST_MARK - 1
        ? ` After a clear move, the lookout expects the following current to be ${DIRECTION[skiffCurrent(current, 1) + 1]}.` : '';
      readings.textContent = `${TEXT[current.last]} Marker ${current.mark + 1} of ${SKIFF_LAST_MARK + 1}, ${SKIFF_LANES[current.lane].toLowerCase()}. Current ${drift}.${next}`
        + (rocks ? ` Rocks at the next marker: ${rocks}.` : '') + (shoals ? ` Shallows at the next marker: ${shoals}.` : '')
        + (current.mode === 'delivery' && current.mark === SKIFF_LAST_MARK - 1 ? ' The upper two lanes reach the stair. The lower two reach the ramp.' : '');
    } else readings.textContent = 'The skiff waits at the launch marker. Water only moves when you row or hold.';
    const practices = SKIFF_WEATHER.map((bell) => {
      const log = skiffPractice(flags, { ...selected, weather: bell });
      return h('li', {}, WEATHER[bell], log ? ` · ${summary(log)}` : ' · practice slip empty');
    });
    const deliveries = SKIFF_BERTHS.flatMap((stop) => {
      const log = skiffDelivery(flags, stop);
      return log ? [h('li', {}, `${BERTH[stop]} · ${WEATHER[log.weather]} · ${LOAD[log.load].split(' · ')[0]} · ${CREW[log.crew].split(' · ')[0]} · ${summary(log)}`)] : [];
    });
    docket.replaceChildren(...practices, ...deliveries);
  }

  for (const { control } of [weather, crew, load]) control.addEventListener('change', draw);
  draw();
  return h('div', { class: 'skiff-console', onkeydown: (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && event.target.closest('select')) return;
    const stroke = KEYS[event.key as keyof typeof KEYS];
    if (!stroke || helm.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) move(stroke);
  } }, h('h2', {}, 'Joss’s Skiff'),
  h('p', {}, 'Joss taps the chart. “Watch the water at each marker.” Dark rocks stop any load. Reeds mark shallows the low bundles can clear.'),
  input, manifest, chart, readings, choices, compare, launches, helm, berthTools,
  h('details', {}, h('summary', {}, 'Skiff docket'), docket));
}
