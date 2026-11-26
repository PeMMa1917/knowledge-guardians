import type { GameController } from '../app/controller';
import {
  LOOP_CONDITIONS, LOOP_DISPLAYS, LOOP_GAUGES, LOOP_RETURNS, LOOP_STRIP, canSelectLoop, loopInstalled, loopKey,
  loopStarting, loopTrial, runWaterLoop, setupCode, waterLoopRead, waterLoopServices,
  type LoopAction, type LoopGauge, type LoopSetup, type LoopSite,
} from '../domain/waterLoop';
import type { LoopStation } from '../maps/waterLoop';
import { h } from './dom';

const DISPLAY = { shower: 'Short shower', curtain: 'Long curtain' };
const RETURNS = { near: 'Near return', lift: 'Lifted return' };
const GAUGE: Record<LoopGauge, string> = { basin: 'Basin storage', reuse: 'Return counter', spill: 'Spill tray' };

export function waterLoopPanel(site: LoopSite, station: LoopStation, controller: GameController,
  sound: (key: string) => void, refreshWorld: () => void) {
  const title = station === 'model' ? 'The Water That Comes Back' : GAUGE[station];
  const body = h('div');
  const status = h('p', { 'aria-live': 'polite' });
  const limits = LOOP_CONDITIONS[site];
  let setup: LoopSetup = loopStarting(controller.state.flags, site) ?? { display: 'shower', return: 'near' };
  const button = (text: string, act: () => void, disabled = false) => h('button', { type: 'button', onclick: act, disabled }, text);

  function operate(command: LoopAction, log: string) {
    const failure = controller.dispatch(command).find((event) => event.kind === 'error');
    status.textContent = failure?.message ?? log;
    if (failure) return;
    refreshWorld();
    if (command.type === 'FitWaterLoopCard') setup = loopStarting(controller.state.flags, site) ?? setup;
    sound(command.type === 'SetWaterLoopService' ? 'sfx.complete' : 'sfx.click');
    draw();
    body.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }

  function readGauge(gauge: LoopGauge) {
    const flags = controller.state.flags;
    const trial = loopTrial(flags, site);
    if (!trial) return [h('p', {}, 'Run the circulation model, then come back to this gauge.')];
    const reading = runWaterLoop(site, trial);
    const detail = gauge === 'basin'
      ? `${reading.basin} units remain in the basin after both pulses. The basin held ${reading.start} units at the start.`
      : gauge === 'reuse' ? `${reading.reuse} units from the basin went through the display again. Each pulse draws fresh inlet water first.`
        : `${reading.spill} units left through the spill tray, including any water over the basin’s rim.`;
    const clipped = waterLoopRead(flags, site, gauge);
    return [h('p', { class: 'fine' }, `${DISPLAY[trial.display]} · ${RETURNS[trial.return]}`),
      h('p', {}, detail), button(clipped ? 'Reading clipped' : 'Clip this gauge’s reading',
        () => operate({ type: 'ReadWaterLoop', site, gauge }, 'The reading is clipped to this run.'), clipped)];
  }

  function pick(change: Partial<LoopSetup>, value: string) {
    setup = { ...setup, ...change };
    draw();
    body.querySelector<HTMLButtonElement>(`[data-loop-setting="${value}"]`)?.focus();
  }

  function drawModel() {
    const flags = controller.state.flags;
    const source = flags[loopKey(site, 'source')];
    if (site === 'island' && !source) {
      const carried = controller.state.inventory[LOOP_STRIP] > 0;
      return [h('p', {}, 'Ivo has a smaller inlet and a tide plate that draws more power. Fit a starting card before running the local course.'),
        ...(carried ? [button('Fit the Bell Archive’s punched strip', () => operate({ type: 'FitWaterLoopCard', source: 'carried' }, 'The earlier settings are on the local knobs. The Island has its own inlet and load.'))] : []),
        button('Fit Ivo’s local card', () => operate({ type: 'FitWaterLoopCard', source: 'local' }, 'Ivo starts you with a short shower and a near return.'))];
    }
    const trial = loopTrial(flags, site);
    const installed = loopInstalled(flags, site);
    const use = flags[loopKey(site, 'service')];
    const input = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Circulation settings' },
      LOOP_DISPLAYS.map((display) => h('button', { type: 'button', 'data-loop-setting': display,
        'aria-pressed': String(setup.display === display), onclick: () => pick({ display }, display) }, DISPLAY[display])),
      LOOP_RETURNS.map((route) => h('button', { type: 'button', 'data-loop-setting': route,
        'aria-pressed': String(setup.return === route), onclick: () => pick({ return: route }, route) }, RETURNS[route])),
      button('Run two pulses', () => operate({ type: 'RunWaterLoop', site, setup }, 'The run is ready. Clip a reading at each of the three stations.')),
    );
    const logs = LOOP_DISPLAYS.flatMap((display) => LOOP_RETURNS.flatMap((route) => {
      const current = { display, return: route };
      return flags[loopKey(site, `logged.${setupCode(current)}`)] === true ? [current] : [];
    }));
    const docket = h('details', {}, h('summary', {}, 'Completed gauge records'), h('ul', {},
      logs.map((previous) => {
        const report = runWaterLoop(site, previous);
        return h('li', {}, `${DISPLAY[previous.display]}, ${RETURNS[previous.return]}: ${report.basin} stored, ${report.reuse} reused, ${report.spill} spilled, ${report.spare} spare power at the tighter pulse.`);
      })));
    const elements: HTMLElement[] = [
      h('p', {}, site === 'archive' ? 'Try two setups with the same inlet. Take a reading at the basin, return counter and spill tray for each.'
        : 'Test the Island manifold at its own inlet and power supply. The garden path and tide plate share one attendant.'),
      h('p', { class: 'fine' }, `${limits.inflow} inlet units and ${limits.power} power units per pulse. The garden needs ${limits.garden} stored units. The tide plate needs ${limits.plate} spare power units at each pulse.`),
      input,
    ];
    if (trial) {
      const reading = runWaterLoop(site, trial);
      const ready = canSelectLoop(flags, site);
      const services = waterLoopServices(site, trial);
      elements.push(h('p', {}, `${DISPLAY[trial.display]} · ${RETURNS[trial.return]}. Display flow: ${reading.pulses[0].display} then ${reading.pulses[1].display} units. Spare power: ${reading.spare} at the tighter pulse.`),
        h('ul', {}, LOOP_GAUGES.map((gauge) => h('li', {},
          `${GAUGE[gauge]} · ${waterLoopRead(flags, site, gauge) ? reading[gauge] + ' units' : 'reading to clip'}`))));
      if (ready) elements.push(h('div', { class: 'row wrap' },
        button('Keep the rain garden path open', () => operate({ type: 'SetWaterLoopService', site, service: 'garden' },
          site === 'archive' ? 'Punched the garden setup on a strip for Ivo.' : 'Ivo opened the rain garden side gate.'), !services.garden),
        button('Power the public tide plate', () => operate({ type: 'SetWaterLoopService', site, service: 'plate' },
          site === 'archive' ? 'Punched the tide plate setup on a strip for Ivo.' : 'Ivo powered the tide plate and opened its covered passage.'), !services.plate)));
    }
    if (logs.length) elements.push(docket);
    if (installed) {
      elements.push(h('p', {}, `Current ${site === 'archive' ? 'strip' : 'installation'}: ${DISPLAY[installed.display]}, ${RETURNS[installed.return]}, ${use === 'garden' ? 'rain garden path' : 'public tide plate'}.`));
    }
    return elements;
  }

  function draw() {
    body.replaceChildren(...(station === 'model' ? drawModel() : readGauge(station)));
  }
  draw();
  return h('div', {}, h('h2', {}, title), body, status);
}
