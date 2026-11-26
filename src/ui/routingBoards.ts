import type { GameController } from '../app/controller';
import {
  civicLaneReading, civicLaneRouting, RELIEF_BASIN_CAPACITY, RELIEF_PULSES, RELIEF_TARGETS,
  reliefReading, reliefRouting, ROUTE_SOCKETS, TRIAL_REQUESTS, type ReliefPulse, type RouteLayout,
} from '../domain/routeTiles';
import { h } from './dom';

export type RoutingGame = 'relief-routing' | 'civic-lane-routing';

export function routingBoard(game: RoutingGame, controller: GameController, sound: (key: string) => void): HTMLElement {
  const water = game === 'relief-routing';
  const prefix = water ? 'water.routing' : 'civic.routing';
  const piece = water ? 'wide channel tile' : 'step-free ramp tile';
  const places = water ? ['Seed rows', 'Lower channel'] : ['North Steps', 'Canal Walk'];
  const sourceLocations = water ? 'the seed terrace and the lower bank' : 'North Steps and Canal Walk';
  const planKey = `${prefix}.layout`;
  const installed = controller.state.flags[planKey];
  let layout: RouteLayout = installed === 'first' || installed === 'second' ? installed : 'plain';
  const tiles = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Two route sockets' });
  const diagram = h('canvas', { class: 'mark', width: 224, height: 82, 'aria-hidden': 'true' });
  const feedback = h('div', { 'aria-live': 'polite' });
  const status = h('p', { class: 'fine', 'aria-live': 'polite' });
  const publish = h('button', { type: 'button', class: 'primary', onclick: install }, water ? 'Fit this relief layout' : 'Post this practice queue');
  const sourceTitle = water ? 'The weir’s relief bench' : 'The library’s lane board';
  const highTrialKey = (choice: RouteLayout) => water ? `${prefix}.trial.8.${choice}` : `${prefix}.trial.${choice}`;
  const sourceReady = () => controller.check({ objective: `${prefix}.sources` });
  const comparisonReady = () => controller.check({ objective: `${prefix}.compare` });

  function draw(tallies?: readonly [number, number]) {
    const g = diagram.getContext('2d');
    if (!g) return;
    g.fillStyle = water ? '#294854' : '#444556';
    g.fillRect(0, 0, diagram.width, diagram.height);
    g.fillStyle = '#b6a589';
    g.fillRect(9, 35, 27, 10);
    g.fillRect(33, 21, 3, 40);
    for (const [index, socket] of ROUTE_SOCKETS.entries()) {
      const y = index === 0 ? 22 : 58;
      const active = socket === layout;
      g.fillStyle = '#c7b99b';
      g.fillRect(36, y - 2, 146, 4);
      g.fillStyle = active ? '#f5d494' : '#706f78';
      g.fillRect(76, y - 8, 36, 16);
      g.fillStyle = active ? '#7b9c8c' : '#aaa18d';
      g.fillRect(79, y - 5, 30, 10);
      g.fillRect(182, y - 10, 31, 20);
      g.fillStyle = water ? '#a6ded8' : '#f4dca4';
      if (tallies) for (let i = 0; i < tallies[index]; i++) g.fillRect(185 + i * 5, y - 2, 3, 4);
    }
  }

  const update = () => {
    for (const button of tiles.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.socket === layout));
    }
    publish.disabled = layout === 'plain' || !sourceReady() || !comparisonReady() || typeof controller.state.flags[planKey] === 'string';
    if (typeof controller.state.flags[planKey] === 'string') status.textContent = 'The first installation stays on the route. You can still try the bench.';
    else if (!sourceReady()) status.textContent = `Take the two local slips at ${sourceLocations} before fitting a plan.`;
    else if (!comparisonReady()) status.textContent = water ? 'Try both wide tile placements with eight buckets.' : 'Try the ramp at both stops.';
    else if (layout === 'plain') status.textContent = `Place the ${piece} in a socket before fitting the plan.`;
    else status.textContent = 'This layout can go out as the first plan.';
  };

  function choose(next: RouteLayout) {
    layout = next;
    sound('sfx.click');
    feedback.textContent = next === 'plain' ? 'Both sockets hold their ordinary pieces.' : `The ${piece} is in the ${places[ROUTE_SOCKETS.indexOf(next)]} socket.`;
    draw();
    update();
  }

  function install() {
    if (publish.disabled || !controller.state.flags[highTrialKey(layout)]) return;
    controller.dispatch({ type: 'SetFlag', flag: planKey, value: layout });
    sound('sfx.sparkle');
    update();
    feedback.textContent = water ? 'The crew will fit the chosen relief layout on the bank.' : 'A practice notice will go beside the stop with the ramp.';
  }

  for (const [index, socket] of ROUTE_SOCKETS.entries()) {
    tiles.append(h('button', { type: 'button', 'data-socket': socket, onclick: () => choose(socket) },
      `Place ${piece} at ${places[index]}`));
  }
  tiles.append(h('button', { type: 'button', 'data-socket': 'plain', onclick: () => choose('plain') }, `Lift the ${piece} out`));

  function release(pulse: ReliefPulse) {
    const result = reliefRouting(pulse, layout);
    controller.dispatch({ type: 'SetFlag', flag: `${prefix}.trial.${pulse}.${layout}`, value: true });
    feedback.replaceChildren(h('p', {}, reliefReading(result)), h('p', { class: 'fine' }, result.spill
      ? 'The basin filled before the pulse ended. The extra crossed the practice bank.'
      : 'The basin had room for everything the two routes left over.'));
    draw([result.rows, result.channel]);
    sound('sfx.page');
    update();
  }

  function routeQueue() {
    const result = civicLaneRouting(layout);
    controller.dispatch({ type: 'SetFlag', flag: highTrialKey(layout), value: true });
    feedback.replaceChildren(h('ul', {}, h('li', {}, `North Steps ${civicLaneReading(result.steps)}.`),
      h('li', {}, `Canal Walk ${civicLaneReading(result.canal)}.`)));
    draw([result.steps.served, result.canal.served]);
    sound('sfx.page');
    update();
  }

  const waterLayout = controller.state.flags['water.routing.layout'];
  const callback = !water && controller.check({ objective: 'water.routing.finish' })
    ? h('p', { class: 'fine' }, waterLayout === 'first'
      ? 'At the weir you widened the seed route. This board also moves one spare piece. Here the people waiting must be able to use the route and agree to the time.'
      : 'At the weir you widened the lower route. This board also moves one spare piece. Here the people waiting must be able to use the route and agree to the time.') : null;
  draw();
  update();
  return h('div', {}, h('h2', {}, sourceTitle), h('p', {}, water
    ? `Omi expects a heavier pulse after hill rain. Lay one wide tile and rehearse. Water reaches the rows first, then the lower channel. The basin holds ${RELIEF_BASIN_CAPACITY} buckets. The slips ask for ${RELIEF_TARGETS.rows} at the rows and ${RELIEF_TARGETS.channel} below.`
    : `Lay one ramp tile. Each stop has three places. Its trial group has ${TRIAL_REQUESTS.stepFree} step-free requests and ${TRIAL_REQUESTS.flexible} flexible requests. At the ramp, the clerk offers step-free places first.`),
  callback, diagram, tiles,
  h('div', { class: 'row wrap' }, water
    ? RELIEF_PULSES.map((pulse) => h('button', { type: 'button', 'data-pulse': pulse, onclick: () => release(pulse) }, `Release ${pulse} buckets`))
    : h('button', { type: 'button', onclick: routeQueue }, 'Open both trial queues')),
  feedback, status, publish);
}
