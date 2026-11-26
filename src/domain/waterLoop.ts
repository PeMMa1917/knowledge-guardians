import type { CampaignState, Effect } from './types';

export const LOOP_SITES = ['archive', 'island'] as const;
export const LOOP_DISPLAYS = ['shower', 'curtain'] as const;
export const LOOP_RETURNS = ['near', 'lift'] as const;
export const LOOP_GAUGES = ['basin', 'reuse', 'spill'] as const;
export const LOOP_SERVICES = ['garden', 'plate'] as const;

export type LoopSite = typeof LOOP_SITES[number];
export type LoopDisplay = typeof LOOP_DISPLAYS[number];
export type LoopReturn = typeof LOOP_RETURNS[number];
export type LoopGauge = typeof LOOP_GAUGES[number];
export type LoopService = typeof LOOP_SERVICES[number];
export type LoopSetup = { display: LoopDisplay; return: LoopReturn };
type LoopCode = `${LoopDisplay}.${LoopReturn}`;

export const LOOP_STRIP = 'item.water-loop.strip';
export const LOOP_MAP = { archive: 'observatory.archive', island: 'island.workshop' };

export const LOOP_CONDITIONS = {
  archive: { inflow: 5, power: 8, garden: 6, plate: 3 },
  island: { inflow: 3, power: 7, garden: 5, plate: 4 },
} as const;

const STARTING_STORE = 2;
const CAPACITY = 7;
const PULSES = 2;

export type LoopAction = { type: 'RunWaterLoop'; site: LoopSite; setup: LoopSetup }
  | { type: 'ReadWaterLoop'; site: LoopSite; gauge: LoopGauge }
  | { type: 'FitWaterLoopCard'; source: 'carried' | 'local' }
  | { type: 'SetWaterLoopService'; site: LoopSite; service: LoopService };

export function loopKey(site: LoopSite, field: string): string {
  return `waterLoop.${site}.${field}`;
}

const setups = LOOP_DISPLAYS.flatMap((display) => LOOP_RETURNS.map((route) => `${display}.${route}` as const));
export const setupCode = (setup: LoopSetup): LoopCode => `${setup.display}.${setup.return}`;

function decode(code: unknown): LoopSetup | null {
  if (typeof code !== 'string' || !setups.includes(code as LoopCode)) return null;
  const [display, route] = (code as LoopCode).split('.') as [LoopDisplay, LoopReturn];
  return { display, return: route };
}

export function loopTrial(flags: CampaignState['flags'], site: LoopSite) {
  return decode(flags[loopKey(site, 'trial')]);
}

export function loopInstalled(flags: CampaignState['flags'], site: LoopSite) {
  return decode(flags[loopKey(site, 'installed')]);
}

export function loopStarting(flags: CampaignState['flags'], site: LoopSite) {
  return decode(flags[loopKey(site, 'setup')]);
}

export function runWaterLoop(site: LoopSite, setup: LoopSetup) {
  const { inflow, power } = LOOP_CONDITIONS[site];
  const target = setup.display === 'curtain' ? 6 : 3;
  const liftingReturn = setup.return === 'lift';
  let store = STARTING_STORE;
  const pulses = [];
  for (let i = 0; i < PULSES; i++) {
    const fresh = Math.min(target, inflow);
    const reused = Math.min(target - fresh, store);
    const display = fresh + reused;
    const returned = liftingReturn ? Math.ceil(display * 2 / 3) : Math.floor(display / 3);
    const available = store - reused + inflow - fresh + returned;
    const spilled = display - returned + Math.max(0, available - CAPACITY);
    const spent = Math.ceil(display / 2) + (liftingReturn ? 2 : 0);
    store = Math.min(CAPACITY, available);
    pulses.push({ display, reused, returned, store, spilled, spare: power - spent });
  }
  return { pulses, start: STARTING_STORE, inflow: inflow * PULSES, basin: store,
    reuse: pulses.reduce((n, pulse) => n + pulse.reused, 0),
    spill: pulses.reduce((n, pulse) => n + pulse.spilled, 0), spare: Math.min(...pulses.map((pulse) => pulse.spare)) };
}

export function waterLoopServices(site: LoopSite, setup: LoopSetup) {
  const result = runWaterLoop(site, setup);
  const conditions = LOOP_CONDITIONS[site];
  return { garden: result.basin >= conditions.garden, plate: result.spare >= conditions.plate };
}

export function waterLoopRead(flags: CampaignState['flags'], site: LoopSite, gauge: LoopGauge) {
  return flags[loopKey(site, `read.${gauge}`)] === flags[loopKey(site, 'trial')] && !!loopTrial(flags, site);
}

export function canSelectLoop(flags: CampaignState['flags'], site: LoopSite) {
  return LOOP_GAUGES.every((gauge) => waterLoopRead(flags, site, gauge))
    && (site === 'island' || setups.filter((code) => flags[loopKey(site, `logged.${code}`)] === true).length >= 2);
}

const changed = (site: LoopSite, field: string, value: string | boolean): Effect => ({ setFlag: loopKey(site, field), value });

export function waterLoopEffects(action: LoopAction, state: CampaignState): Effect[] {
  const site = action.type === 'FitWaterLoopCard' ? 'island' : action.site;
  const prerequisite = site === 'archive' ? 'coast.revise' : 'island.finish';
  if (state.mapId !== LOOP_MAP[site] || !state.objectivesDone.includes(prerequisite)) throw new Error('Use the local circulation station after the main plan is checked.');
  const flags = state.flags;
  if (action.type === 'FitWaterLoopCard') {
    if (flags[loopKey(site, 'source')]) throw new Error('Ivo already fitted the starting card.');
    const carried = action.source === 'carried' && state.inventory[LOOP_STRIP] > 0 && loopInstalled(flags, 'archive');
    if (action.source !== 'local' && !carried) throw new Error('Bring the Bell Archive’s punched strip or use Ivo’s own card.');
    const setup = carried || { display: 'shower', return: 'near' } as const;
    return [changed(site, 'source', action.source), changed(site, 'setup', setupCode(setup))];
  }
  if (site === 'island' && !flags[loopKey(site, 'source')]) throw new Error('Fit a starting card at the Island manifold.');
  if (action.type === 'RunWaterLoop') {
    if (!setups.includes(setupCode(action.setup))) throw new Error('Set the display sleeve and return channel.');
    return [changed(site, 'trial', setupCode(action.setup)), changed(site, 'setup', setupCode(action.setup)),
      ...LOOP_GAUGES.map((gauge) => changed(site, `read.${gauge}`, false))];
  }
  const trial = loopTrial(flags, site);
  if (!trial) throw new Error('Run the local circuit first.');
  const code = setupCode(trial);
  if (action.type === 'ReadWaterLoop') {
    if (!LOOP_GAUGES.includes(action.gauge)) throw new Error('Find the basin, return counter or spill tray.');
    const effects = [changed(site, `read.${action.gauge}`, code)];
    if (LOOP_GAUGES.every((gauge) => gauge === action.gauge || waterLoopRead(flags, site, gauge))) {
      effects.push(changed(site, `logged.${code}`, true));
      if (site === 'island' || setups.some((prior) => prior !== code && flags[loopKey(site, `logged.${prior}`)] === true)) {
        effects.push(changed(site, 'compared', true));
      }
    }
    return effects;
  }
  if (!canSelectLoop(flags, site) || !LOOP_SERVICES.includes(action.service) || !waterLoopServices(site, trial)[action.service]) {
    throw new Error('Read the three gauges and choose a service that this run can support.');
  }
  const effects = [changed(site, 'service', action.service), changed(site, 'installed', code)];
  if (site === 'archive' && !state.inventory[LOOP_STRIP]) effects.push({ giveItem: LOOP_STRIP });
  return effects;
}
