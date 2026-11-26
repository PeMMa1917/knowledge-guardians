import type { GameController } from '../app/controller';
import { movePorterTrial, paceSummary, PORTER_CARGO, PORTER_CREWS, PORTER_EARLY, PORTER_EARLY_CHECKED,
  PORTER_LATER, PORTER_LATER_CHECKED, PORTER_PACES, PORTER_RECOVERY, PORTER_SLIP,
  porterCrewTrace, porterPaceTrace, porterStep, runPorterTrial, startPorterTrial, type PorterCrew, type PorterPace,
  type PorterSite } from '../domain/porterPace';
import { h } from './dom';
import './porterPace.css';

const paceNames: Record<PorterPace, string> = { front: 'Quick start, even finish', even: 'Even throughout' };
const crewNames: Record<PorterCrew, string> = { solo: 'One carrier', relay: 'Halfway relay' };

export function porterPacePanel(controller: GameController, site: PorterSite, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'porter-panel' });
  const early = site === 'emberford';
  const earlierPace = controller.state.flags[PORTER_EARLY];
  const hasSlip = controller.check({ all: [{ objective: 'water.arrival' }, { item: PORTER_SLIP }] });
  if (early ? !controller.check({ flag: 'reached.emberford', eq: true }) : !hasSlip || (earlierPace !== 'front' && earlierPace !== 'even')) return panel;
  const inherited: PorterPace = earlierPace === 'front' ? 'front' : 'even';
  const options = early
    ? PORTER_PACES.map((pace) => ({ value: pace, pace, crew: 'solo' as const, trace: porterPaceTrace(pace), name: paceNames[pace] }))
    : PORTER_CREWS.map((crew) => ({ value: crew, pace: inherited, crew, trace: porterCrewTrace(crew), name: crewNames[crew] }));
  const completed = early ? PORTER_EARLY_CHECKED : PORTER_LATER_CHECKED;
  const decision = early ? PORTER_EARLY : PORTER_LATER;
  let option = options[0];
  let trial = startPorterTrial();

  const course = h('ol', { class: 'porter-course', 'aria-label': 'Carry progress' },
    ['First leg', 'Second leg', 'Third leg', 'Fourth leg'].map((label) => h('li', {}, label)));
  const activity = h('p', { role: 'status' });
  const measures = h('div', { class: 'porter-measures', 'aria-live': 'polite' });
  const traces = h('div', { class: 'porter-traces' });
  const reply = h('p', { role: 'status', class: 'porter-reply' });
  const selectors = options.map((choice) => h('button', { type: 'button', onclick: () => reset(choice) }, choice.name));
  const begin = h('button', { type: 'button', onclick: () => reset(option) }, 'Start this trial again');
  const advance = h('button', { type: 'button', onclick: work });
  const destinations = early ? ['Post the early porch delivery', 'Post the steady round']
    : ['Keep one carrier on the load', 'Schedule the halfway relay'];
  const dispatch = options.map((choice, index) => h('button', { type: 'button', onclick: () => {
    if (!controller.check({ objective: completed }) || controller.check({ flagSet: decision })) return;
    controller.dispatch({ type: 'SetFlag', flag: decision, value: choice.value });
    refresh();
    sound('sfx.page');
    render();
  } }, destinations[index]));

  function reset(choice: typeof option) {
    option = choice;
    trial = startPorterTrial();
    render();
  }

  function work() {
    if (!porterStep(trial, site, option.pace, option.crew)) return;
    trial = movePorterTrial(trial, site, option.pace, option.crew);
    if (trial.recovery === PORTER_RECOVERY) {
      controller.dispatch({ type: 'SetFlag', flag: option.trace, value: true });
      sound('sfx.page');
    }
    render();
  }

  function render() {
    const next = porterStep(trial, site, option.pace, option.crew);
    advance.disabled = !next;
    advance.textContent = next?.label ?? 'Trial filed';
    activity.textContent = next?.kind === 'carry' ? `${next.pace} pace on the next leg. Count ${next.turns} ${next.turns === 1 ? 'turn' : 'turns'} and add ${next.effort} effort marks to the active carrier.`
      : next?.kind === 'pass' ? 'The same four parcels pass to the second carrier. The handover takes one turn.'
        : trial.recovery === PORTER_RECOVERY ? 'Both recovery beats are recorded.' : 'The load has reached the rail. Let both beats pass to see how far the effort mark falls.';
    selectors.forEach((button, index) => button.setAttribute('aria-pressed', String(option === options[index])));
    Array.from(course.children).forEach((part, index) => {
      if (index === trial.leg) part.setAttribute('aria-current', 'step');
      else part.removeAttribute('aria-current');
      part.classList.toggle('porter-passed', index < trial.leg);
    });
    measures.replaceChildren(
      h('p', {}, `Elapsed ${trial.elapsed} turns. Peak for one carrier ${trial.peak} effort marks.`),
      h('p', {}, `First carrier ${trial.burden[0]} effort marks${option.crew === 'relay' ? ` · second carrier ${trial.burden[1]} marks` : ''}.`),
      h('p', {}, trial.arrival === undefined ? 'Load in transit.' : `Load arrived after ${trial.arrival} turns. Recovery ${trial.recovery} of ${PORTER_RECOVERY} beats.`),
    );
    traces.replaceChildren(...options.map((choice) => h('section', {}, h('h3', {}, choice.name),
      h('p', {}, controller.state.flags[choice.trace] === true
        ? paceSummary(runPorterTrial(site, choice.pace, choice.crew), choice.crew) : 'Waiting for a complete trial.'))));
    const chosen = controller.state.flags[decision];
    const checked = controller.check({ objective: completed });
    dispatch.forEach((button) => { button.disabled = !checked || Boolean(chosen); });
    reply.textContent = chosen === 'front' ? 'Idris left his earlier receipt at the west porch.'
      : chosen === 'even' ? 'Idris left his steady-round receipt at the south bench.'
        : chosen === 'solo' ? 'Sena filed the single-carrier roster by the south handover.'
          : chosen === 'relay' ? 'Sena filed the relay roster at the lower-side bench.'
            : checked && early ? 'The quicker arrival leaves more effort after the same pause. Choose which round needs the load.'
              : checked ? 'The relay shares the work and adds one turn. The single carrier leaves the second worker on rinsing duty.' : '';
  }

  panel.append(
    h('h2', {}, early ? 'The Pace of a Load' : 'The Middle Handover'),
    h('p', {}, early
      ? `Idris sets out with ${PORTER_CARGO} sealed practice parcels. Each run uses all four legs, then measures recovery for two beats.`
      : `Sena reads Idris’s slip. His pace was “${paceNames[inherited]}”. Keep it, the ${PORTER_CARGO} parcels and the local course fixed while changing the staffing.`),
    h('p', { class: 'fine' }, 'Each carry adds effort marks to the active model. An idle carrier loses four marks per turn. The measures belong to the practice board.'),
    h('div', { class: 'row', role: 'group', 'aria-label': early ? 'Pacing choice' : 'Staffing choice' }, ...selectors),
    course, activity, measures, h('div', { class: 'row' }, advance, begin),
    h('h3', {}, 'Finished trials'), traces, h('div', { class: 'row' }, ...dispatch), reply,
  );
  render();
  return panel;
}
