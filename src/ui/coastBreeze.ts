import type { GameController } from '../app/controller';
import { BREEZE_CHECK, BREEZE_CHECKS, BREEZE_MOMENTS, BREEZE_PLAN, BREEZE_START, breezeMoment, breezePhaseFlag,
  breezeReading, breezeReceiptFlag, breezeTraceFlag, nextBreezeMoment, type BreezeMoment, type BreezePlan, type BreezeStation } from '../domain/coastBreeze';
import { h } from './dom';
import './coastBreeze.css';

const moments: Record<BreezeMoment, string> = { still: 'Still air', gust: 'First gust', eased: 'Gust passed', again: 'Another gust' };
const titles: Record<BreezeStation, string> = { headland: 'A Second Look at the Step', archive: 'The hooded stand', harbour: 'The next turn at the exposed peg' };
const briefing: Record<BreezeStation, string> = {
  headland: 'Neri keeps the two faint marks on the reader’s open scale. “We could read a difference once the needle came off the stop. Then I saw the step mark dip in the first gust. Did the lamp dip, or did we see less of it from this peg?”',
  archive: 'Olwen unfolds the strip Neri sent. “Here the practice reader is tucked under the hood. I can run the same first gust from this peg. That will show whether the drop belonged to the step or to one view of it.”',
  harbour: 'Ruan clips the marked pattern onto a copy of the exposed stand. “I used to put one number down and ring for the next crew. Let’s see whether the step comes back once this gust is past, and what another gust does.”',
};
const receipts: Record<BreezePlan, string> = {
  archive: 'At the first gust, the exposed stand read 1 at the step and the hooded one read 3. The rim was 1 from both. Olwen keeps their two positions over the numbers. “The reading depended on where we put the stand. I want to try a third peg on the same notch next.”',
  harbour: 'At the exposed stand, the step returned to 3 after the gust then dipped to 1 again. The rim held at 1. Ruan leaves one wheel notch for the next visitor. “I can see the drop repeat. I still wonder what someone under the hood would see.”',
};

function traceTable(station: BreezeStation, observed: BreezeMoment[]): HTMLElement {
  const row = (moment: BreezeMoment) => {
    const { rim, step } = breezeReading(station, moment);
    return h('tr', {}, h('th', { scope: 'row' }, moments[moment]), h('td', {}, String(rim)), h('td', {}, String(step)));
  };
  return h('table', { class: 'breeze-table' }, h('caption', {}, 'Clipped readings from this stand'),
    h('thead', {}, h('tr', {}, ...['Interval', 'Rim', 'Step'].map((label) => h('th', { scope: 'col' }, label)))),
    h('tbody', {}, observed.map(row)));
}

export function coastBreezePanel(site: BreezeStation, c: GameController, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'breeze-panel' });
  const headland = site === 'headland';
  if (!c.check({ objective: BREEZE_START }) || (!headland && c.state.flags[BREEZE_PLAN] !== site && !c.state.flags[breezeReceiptFlag(site)])) return panel;
  const start = site === 'harbour' ? 'gust' : 'still';
  const phaseKey = breezePhaseFlag(site);
  const phase = () => breezeMoment(c.state.flags[phaseKey], start);
  const checked = (moment: BreezeMoment) => c.state.flags[breezeTraceFlag(site, moment)] === true;
  const track = h('ol', { class: 'breeze-track', 'aria-label': 'Practice wind interval' });
  const announcement = h('p', { role: 'status' });
  const strips = h('div');
  const readback = h('p', { role: 'status' });
  const theory = h('p');
  const set = (flag: string, value: string | boolean) => c.dispatch({ type: 'SetFlag', flag, value });

  function turn(reset: boolean) {
    set(phaseKey, reset ? start : nextBreezeMoment(phase()));
    announcement.textContent = '';
    sound('sfx.click');
    render();
  }

  function sweep() {
    const moment = phase();
    const { rim, step } = breezeReading(site, moment);
    if (!checked(moment)) set(breezeTraceFlag(site, moment), true);
    announcement.textContent = `${moments[moment]} · Rim ${rim}, step ${step}.`;
    sound('sfx.page');
    render();
  }

  function send(plan: BreezePlan) {
    if (!c.check({ objective: BREEZE_CHECK })) return;
    set(BREEZE_PLAN, plan);
    sound('sfx.page');
    render();
    refresh();
  }

  const forward = h('button', { type: 'button', onclick: () => turn(false) }, 'Advance the wind pointer');
  const reset = h('button', { type: 'button', onclick: () => turn(true) }, 'Rewind this practice');
  const record = h('button', { type: 'button', onclick: sweep }, 'Sweep the two marks');
  const plans = [
    h('button', { type: 'button', onclick: () => send('archive') }, 'Ask Olwen to compare the same gust under the hood'),
    h('button', { type: 'button', onclick: () => send('harbour') }, 'Ask Ruan to watch past the gust at the exposed peg'),
  ];
  const receipt = h('button', { type: 'button', onclick: () => {
    if (headland || !BREEZE_CHECKS[site].every(checked) || c.state.flags[breezeReceiptFlag(site)] === true) return;
    set(breezeReceiptFlag(site), true);
    sound('sfx.page');
    render();
    refresh();
  } }, 'Clip these readings to Neri’s strip');

  function render() {
    const moment = phase();
    track.replaceChildren(...BREEZE_MOMENTS.map((mark) => h('li', { 'aria-current': mark === moment ? 'step' : undefined }, moments[mark])));
    forward.disabled = moment === 'again';
    reset.disabled = moment === start;
    const observed = BREEZE_MOMENTS.filter(checked);
    strips.replaceChildren(observed.length ? traceTable(site, observed) : h('p', { class: 'fine' }, 'The strips are blank. Sweep both marks at the same notch.'));
    const complete = BREEZE_CHECKS[site].every(checked);
    if (headland) {
      const plan = c.state.flags[BREEZE_PLAN];
      plans.forEach((button, i) => { button.disabled = !complete || plan === (i === 0 ? 'archive' : 'harbour'); });
      theory.textContent = complete ? 'Neri holds the slips side by side. “It was just the step that dipped. I hadn’t thought to ask where the drop could be seen. Who can show us something this strip can’t?”' : '';
      readback.textContent = plan === 'archive' ? 'Olwen has your strip. Find the hooded stand on the east side of the Bell Archive.'
        : plan === 'harbour' ? 'Ruan has your strip. Find the second-gust stand at the west end of Slate Harbour.' : '';
    } else {
      const filed = c.state.flags[breezeReceiptFlag(site)] === true;
      receipt.disabled = !complete || filed;
      readback.textContent = filed ? receipts[site]
        : site === 'archive' ? 'For a matched comparison, clip a reading at the first gust.'
          : 'Keep the exposed peg and record both the eased interval and the next gust.';
    }
  }

  panel.append(h('h2', {}, titles[site]), h('p', {}, briefing[site]),
    h('p', { class: 'fine' }, 'This workshop model uses practice marks and scripted intervals. It advances only when you turn the pointer.'),
    track, h('div', { class: 'row' }, forward, reset, record), announcement, strips, theory,
    h('div', { class: 'row' }, ...(headland ? plans : [receipt])), readback);
  render();
  return panel;
}
