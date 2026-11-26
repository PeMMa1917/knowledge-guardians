import type { GameController } from '../app/controller';
import {
  CATCHMENT_NOTICES, CATCHMENT_TRIALS, NOTICE_NAME, TRIAL_NAME, catchmentCompared, catchmentFlag, catchmentReading,
  type CatchmentAction, type CatchmentTrial,
} from '../domain/catchment';
import { h } from './dom';

export function catchmentPanel(controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  let trial: CatchmentTrial = 'pocket';
  const trace = h('p', { role: 'status' });
  const ledger = h('ul');
  const referral = h('p', { class: 'fine', 'aria-live': 'polite' });
  const preview = h('div', { class: 'catchment-current', 'aria-hidden': 'true' });
  const render = () => {
    const flags = controller.state.flags;
    const notice = flags[catchmentFlag('notice')];
    const ready = catchmentCompared(flags);
    const checked = flags[catchmentFlag('checked')];
    toggles.forEach((button, index) => button.setAttribute('aria-pressed', String(CATCHMENT_TRIALS[index] === trial)));
    preview.dataset.pocket = trial;
    const measured = flags[catchmentFlag(`trial.${trial}`)] === true;
    const { upper, pocket, lower } = catchmentReading(trial);
    preview.replaceChildren(...(['Upper peg', 'Side pocket', 'Lower peg'] as const).map((station, index) =>
      h('div', {}, h('span', {}, station), h('div', { class: 'catchment-floats' },
        measured ? Array.from({ length: [upper, pocket, lower][index] }, () => h('i')) : h('span', {}, '—')))));
    ledger.replaceChildren(...CATCHMENT_TRIALS.map((choice) => {
      const { upper, lower, pocket } = catchmentReading(choice);
      return h('li', {}, `${TRIAL_NAME[choice]}. ${flags[catchmentFlag(`trial.${choice}`)] === true
        ? `Upper peg ${upper}. Side pocket ${pocket}. Lower peg ${lower}.` : 'Run a pulse to leave a reading.'}`);
    }));
    notices.forEach((button, index) => {
      const option = CATCHMENT_NOTICES[index];
      button.disabled = !ready || notice === option || Boolean(notice && notice !== checked);
      button.setAttribute('aria-pressed', String(notice === option));
    });
    referral.textContent = notice
      ? `Your ${notice === 'rows' ? 'terrace' : 'lower rail'} door is open. ${checked === notice ? 'The crew has left a signed receipt.' : 'Take the passage and check who can use it.'}`
      : ready ? 'Both traces are in the ledger. Omi can lend one watcher.' : 'The crossing notices open after both traces are recorded.';
  };
  const operate = (action: CatchmentAction, message: string) => {
    const error = controller.dispatch(action).find((event) => event.kind === 'error');
    trace.textContent = error?.message ?? message;
    if (error) return;
    sound(action.type === 'TraceCatchment' ? 'sfx.click' : 'sfx.page');
    refreshWorld();
    render();
    if (action.type === 'PostCatchmentNotice') referral.focus();
  };
  referral.tabIndex = -1;
  const toggles = CATCHMENT_TRIALS.map((choice) => h('button', { type: 'button', onclick: () => { trial = choice; render(); } }, TRIAL_NAME[choice]));
  const notices = CATCHMENT_NOTICES.map((notice) => h('button', { type: 'button', onclick: () => operate({ type: 'PostCatchmentNotice', notice }, 'Omi tacks up the crossing notice.') }, NOTICE_NAME[notice]));
  render();
  return h('div', {}, h('h2', {}, 'Below the Gauge'),
    h('p', {}, 'The two crews used the same bell. Omi points to a pocket between their pegs. “Put six floats in each time. I’ll hold the starting gate.”'),
    h('div', { role: 'group', 'aria-label': 'Side pocket setting', class: 'row wrap' }, toggles),
    preview, h('button', { type: 'button', class: 'primary', onclick: () => {
      const { upper, pocket, lower } = catchmentReading(trial);
      operate({ type: 'TraceCatchment', trial }, `${upper} pass the upper peg. ${pocket} stop in the pocket. ${lower} reach the lower peg.`);
    } }, 'Release six floats'), trace,
    h('h3', {}, 'Kept traces'), ledger,
    h('p', {}, 'At the terrace, one watcher can open the nearby footboard for one load now. The crossing crew will still wait. At the low rail, both crews can show who is waiting on each bank, with the first load held until they arrive.'),
    h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Crossing notice' }, notices), referral);
}
