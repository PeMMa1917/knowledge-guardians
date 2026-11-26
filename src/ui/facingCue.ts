import type { GameController } from '../app/controller';
import { FACING_CUE_COMPARE, FACING_CUE_RECEIVE, FACING_CUE_TRANSFER, facingCueBeatNode,
  facingCueFlag, facingCueHouseReadNode, facingCuePlanNode } from '../content/facingCue';
import { CUE_BEATS, CUE_PLANS, FACINGS, FACING_SITES, facingCard, facingCueFrame,
  type CuePlan, type Facing } from '../domain/facingCue';
import { h } from './dom';
import { localGuide } from './localGuide';
import './facingCue.css';

const viewLabels: Record<Facing, string> = { bell: 'Face the bell', door: 'Face the door' };
const houseResult: Record<CuePlan, string> = {
  shared: 'Hari stays at the lamp for the cue. Two ushers enter together on the second beat. He has to ask a visitor to carry the programme stack.',
  paired: 'One usher takes the late shift alone and still reaches the lamp. Hari hands out the programmes. The cards occupy both rail pockets.',
};

export function facingCuePanel(controller: GameController, id: string, refresh: () => void, tapSound: () => void): HTMLElement {
  const site = FACING_SITES.find((name) => id === name);
  const shell = h('section', { class: 'facing-rehearsal' });
  if (!site) return shell;

  const flag = (key: string) => controller.state.flags[facingCueFlag(site, key)];
  const counter = (facing: Facing) => Number(flag(facing) ?? 0);
  const plan = () => CUE_PLANS.find((candidate) => flag('plan') === candidate);
  const checked = () => Boolean(flag('checked'));
  const complete = () => FACINGS.every((facing) => flag(`seen.${facing}`));
  let facing = FACINGS.find((facing) => !flag(`seen.${facing}`)) ?? FACINGS[0];
  const announcement = h('p', { role: 'status', class: 'facing-status', tabindex: '-1' });
  const board = h('div', { class: 'facing-board', 'aria-hidden': 'true' });
  const beatTrail = h('ol', { class: 'facing-beats', 'aria-label': 'The four-beat phrase' });
  const places = h('div', { class: 'facing-formats' });

  const faces = FACINGS.map((view) => h('button', { type: 'button', 'data-autofocus': view === facing,
    onclick: () => { facing = view; renderRun(); } }, viewLabels[view]));
  const step = h('button', { type: 'button', onclick: () => {
    choose(facingCueBeatNode(site, facing), counter(facing));
    renderRun();
    showLayout();
  } });
  const guide = localGuide(controller, site === 'nexus' ? 'WORLD-01' : 'WORLD-10', () => site === 'house'
    ? FACING_CUE_TRANSFER : complete() ? FACING_CUE_RECEIVE : FACING_CUE_COMPARE);

  const initialMethod = controller.state.flags['facing.nexus.checked'];
  const houseIntro = initialMethod === 'shared'
    ? 'Hari has one cue for everyone. The House lamp is across the floor from where it stood at the Nexus. Try Sella’s old call from both marks before the ushers come through.'
    : 'Hari has Sella’s two cards. The House lamp is across the floor from where it stood at the Nexus. Try the old call from both marks before you turn the cards.';
  shell.append(
    h('p', {}, site === 'house' ? houseIntro : 'Sella keeps the four beats fixed. Turn the runner, then play the same call to step left on the second beat.'),
    h('div', { class: 'facing-controls', role: 'group', 'aria-label': 'Runner facing' }, ...faces),
    board, announcement, beatTrail, step, places, guide);
  renderRun();
  showLayout();
  return shell;

  function choose(node: string, index: number) {
    controller.dispatch({ type: 'ChooseDialogueOption', node, index });
    tapSound();
    refresh();
  }

  function renderRun() {
    const count = counter(facing);
    const frame = facingCueFrame(site!, facing, count, plan());
    faces.forEach((control, index) => control.setAttribute('aria-pressed', String(FACINGS[index] === facing)));
    const marks = site === 'nexus' ? ['Lamp', 'Centre', 'Rail'] : ['Rail', 'Centre', 'Lamp'];
    board.replaceChildren(
      h('span', { class: 'facing-bell' }, 'Bell'),
      h('div', { class: 'facing-marks' }, ...marks.map((label, index) => h('div', {
        class: 'facing-mark', 'data-mark': label.toLowerCase(),
      }, label, index - 1 === frame.offset ? h('span', { class: 'facing-runner', 'data-view': facing }, h('span', { class: 'facing-arrow' }, '▲')) : null))),
      h('span', { class: 'facing-door' }, 'Door'));
    beatTrail.replaceChildren(...CUE_BEATS.map((beat, index) => h('li', {
      'data-played': count > index ? 'yes' : 'no', 'aria-current': count === index + 1 ? 'step' : undefined,
    }, beat)));
    announcement.textContent = count
      ? `Facing the ${facing}, beat ${count}. ${CUE_BEATS[count - 1]} at the ${frame.mark}.`
      : `Facing the ${facing}, ready at the centre mark.`;
    step.textContent = count === CUE_BEATS.length ? 'Reset this run' : 'Advance one beat';
  }

  function showLayout(moveFocus = false) {
    const current = plan();
    if (!complete()) return;

    if (!current) {
      const node = controller.engine.node(facingCuePlanNode(site!));
      places.replaceChildren(
        h('h3', {}, 'Set the next entrance'),
        h('p', {}, 'A single lamp cue leaves the spare hook free. It needs someone there to lead both runners in.'),
        h('p', {}, 'Two facing cards let runners start separately. They need both display hooks.'),
        ...CUE_PLANS.map((_, index) => h('button', { type: 'button', onclick: () => {
          choose(node.id, index);
          renderRun();
          showLayout(true);
        } }, node.options?.[index]?.text ?? '')));
      return;
    }

    const place = h('h3', { tabindex: '-1' }, current === 'shared' ? 'The lamp-side cue is up' : 'Both entrance cards are in');
    const arrows = current === 'shared' ? h('p', {}, 'Both runners use “one step to the lamp” on the second beat.')
      : h('ul', {}, ...FACINGS.map((view) => h('li', {}, `Facing the ${view}, step ${facingCard(site!, view)} on beat two.`)));
    const farther = current === 'shared' ? 'the lead-in beside the lamp' : 'the second card pocket on the right-hand walk';
    const next = site === 'nexus' ? h('p', {}, checked() ? 'Sella’s cue slip is ready for the House of Performance.'
      : `Leave the board and join Sella at ${farther}.`)
      : checked() ? h('p', { role: 'status' }, houseResult[current])
        : h('button', { type: 'button', onclick: () => {
          choose(facingCueHouseReadNode, CUE_PLANS.indexOf(current));
          showLayout(true);
        } }, current === 'shared' ? 'Take the shifted entrance with Hari’s lead-in' : 'Send the ushers in on their own cards');
    places.replaceChildren(place, arrows, next);
    if (moveFocus) place.focus();
  }
}
