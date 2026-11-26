import type { GameController } from '../app/controller';
import {
  SCOUT_ROUTES, scoutDecision, scoutNextTrial, scoutReport, scoutTrials,
  type ScoutDecision, type ScoutProtocol, type ScoutRoute, type ScoutTrial,
} from '../domain/scoutRoutes';
import { clear, h } from './dom';
import './scoutRoutes.css';

const ROUTES: Readonly<Record<ScoutRoute, string>> = { orchard: 'Orchard lane', arch: 'Market arch', steps: 'Steps lane' };
const INSTRUCTIONS = { informed: 'Give the scout the turning notes', independent: 'Send the scout with a gate slip only' } as const;
const PROTOCOLS: ScoutProtocol[] = ['informed', 'independent'];

type Round = {
  protocol: ScoutProtocol;
  index: number;
  trial: ScoutTrial;
  stage: 'setup' | 'opened' | 'sent';
  decision?: ScoutDecision;
};

export function buildScoutBoard(controller: GameController): HTMLElement {
  // The world captures Enter on window. Keep the native press on the board.
  const keepEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.target instanceof HTMLElement && event.target.matches('button, summary')) event.stopPropagation();
  };
  const body = h('div', { onKeyDown: keepEnter, onKeyUp: keepEnter });
  let protocol: ScoutProtocol = 'informed';
  let round: Round | null = null;
  const seen = (key: 'played' | 'checked', rule: ScoutProtocol) => controller.state.flags[`scout.${key}.${rule}`] === true;

  const settle = (active: Round, decision: ScoutDecision) => {
    const events = controller.dispatch({ type: 'RunScoutRoute', protocol: active.protocol, first: active.trial.first, trial: active.index, decision });
    if (events.some(({ kind }) => kind === 'error')) return;
    round = { ...active, stage: 'sent', decision };
    render(true);
  };

  function render(moveFocus = false): void {
    clear(body);
    const heading = { setup: 'Chalk on the gate', opened: 'Report from the scout', sent: 'The turn with the loaded cart' };
    const step = h('h3', { tabindex: -1 }, round ? heading[round.stage] : 'Set up the practice cart');
    body.append(step);
    if (round === null) {
      body.append(h('p', {}, 'The board hides the one turning space from the carrier. Give the scout a job, then chalk your first route.'),
        h('div', { class: 'row', role: 'group', 'aria-label': 'Scout instructions' }, PROTOCOLS.map((rule) =>
          h('button', { type: 'button', 'aria-pressed': String(protocol === rule), onClick: () => {
            protocol = rule;
            render();
            body.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus();
          } }, INSTRUCTIONS[rule]))),
        h('p', { class: 'fine' }, protocol === 'informed'
          ? 'The scout checks the turning notes and opens a different gate that the cart cannot use.'
          : 'The scout opens the gate on the slip. The two slips are for the gates you did not chalk.'),
        h('div', { class: 'row', role: 'group', 'aria-label': 'First route' }, SCOUT_ROUTES.map((first) =>
          h('button', { type: 'button', onClick: () => {
            const index = scoutNextTrial(Number(controller.state.flags[`scout.rounds.${protocol}`] ?? 0));
            round = { protocol, index, trial: scoutTrials(first, protocol)[index], stage: 'setup' };
            render(true);
          } }, ROUTES[first]))));
    } else {
      const active = round;
      const trial = active.trial;
      const outcome = active.decision && scoutDecision(trial, active.decision);
      body.append(h('ul', { class: 'scout-lanes', role: 'list' }, SCOUT_ROUTES.map((route) => {
        const notes: string[] = [];
        const opened = active.stage !== 'setup' && route === trial.opened;
        if (route === trial.first) notes.push('chalk route');
        if (opened) notes.push(trial.other ? 'opened, turn blocked' : 'opened, turning space clear');
        if (outcome && route === outcome.route) notes.push(outcome.fits ? 'cart made the turn' : 'cart had to back out');
        if (outcome && route !== outcome.route && route === trial.clear) notes.push('turning space');
        return h('li', { 'data-chalked': route === trial.first },
          h('span', { class: 'scout-gate', 'aria-hidden': 'true', 'data-scout-gate': opened ? (trial.other ? 'blocked' : 'clear') : 'shut' }),
          h('strong', {}, ROUTES[route]), notes.length ? h('small', {}, notes.join(' · ')) : null);
      })));
      if (active.stage === 'setup') {
        body.append(h('button', { type: 'button', onClick: () => {
          round = { ...active, stage: 'opened' };
          render(true);
        } }, 'Signal the scout to open a gate'));
      } else if (active.stage === 'opened') {
        body.append(h('p', {}, `The scout opened ${ROUTES[trial.opened]}. ${trial.other ? 'The practice cart cannot turn there.' : 'You can see the full turning space.'}`),
          trial.other ? h('div', { class: 'row' },
            h('button', { type: 'button', onClick: () => settle(active, 'hold') }, `Keep ${ROUTES[trial.first]}`),
            h('button', { type: 'button', onClick: () => settle(active, 'change') }, `Change to ${ROUTES[trial.other]}`))
            : h('button', { type: 'button', onClick: () => settle(active, 'revealed') }, `Use ${ROUTES[trial.opened]}`));
      } else {
        body.append(h('p', {}, outcome && (outcome.fits
          ? `The wheels clear the last marker on ${ROUTES[outcome.route]}.`
          : `The rear wheel meets the turning marker. This setup had space at ${ROUTES[trial.clear]}.`)),
        h('p', { class: 'fine' }, `The slip named ${ROUTES[trial.slip]}. ${trial.slip !== trial.opened
          ? 'The scout saw room in the turning notes and opened the other gate.' : 'The scout opened the gate on the slip.'}`),
        h('button', { type: 'button', onClick: () => {
          round = null;
          render(true);
        } }, 'Reset to change the scout or try another round'));
      }
    }

    const reporters = PROTOCOLS.filter((rule) => seen('played', rule));
    if (reporters.length) {
      body.append(h('h3', {}, 'Turning ledger'), h('p', { class: 'fine' },
        'Each set deals the space under every gate once for each of the two slips. Count the blocked reports separately from the reports that show the space.'));
      for (const rule of reporters) {
        const title = rule === 'informed' ? 'Scout with turning notes' : 'Scout with only a gate slip';
        if (!seen('checked', rule)) {
          body.append(h('button', { type: 'button', onClick: () => {
            const events = controller.dispatch({ type: 'ReviewScoutProtocol', protocol: rule });
            if (events.some(({ kind }) => kind === 'error')) return;
            render();
            body.querySelector<HTMLElement>(`[data-scout-report="${rule}"]`)?.focus();
          } }, `Open all six setups · ${title.toLowerCase()}`));
          continue;
        }
        const trials = scoutTrials(round?.trial.first ?? 'orchard', rule);
        const report = scoutReport(trials);
        body.append(h('section', { 'data-scout-report': rule, tabindex: -1 },
          h('h4', {}, title),
          h('p', {}, `${report.blocked} of ${report.rounds} reports showed a blocked turn. ${report.revealed} showed the turning space itself.`),
          h('p', {}, `After a blocked report, the chalk route fit in ${report.hold} of ${report.blocked} setups. The other unopened route fit in ${report.change} of ${report.blocked}.`),
          h('details', {}, h('summary', {}, `Check the six turning slips with ${ROUTES[trials[0].first]} chalked`),
            h('ul', {}, trials.map((trial) => h('li', {},
              `Turn at ${ROUTES[trial.clear]}. Slip for ${ROUTES[trial.slip]}. `,
              trial.other ? `Opened ${ROUTES[trial.opened]}, blocked. ${trial.clear === trial.first ? 'The chalk route fit.' : 'The other unopened route fit.'}`
                : `Opened ${ROUTES[trial.opened]}, clear.`))))));
      }
      if (reporters.every((rule) => seen('checked', rule)) && reporters.length === PROTOCOLS.length) {
        body.append(h('p', {}, 'Both scouts can report a blocked turn. Check their instructions before sending a carrier on. Take the ledger to Idris beside the yard.'));
      }
    }
    if (moveFocus) step.focus();
  }

  render();
  return body;
}
