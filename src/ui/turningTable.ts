import type { GameController } from '../app/controller';
import { TURNING_CARD, TURNING_GATE } from '../content/turningTable';
import { turningView, type TurningStop } from '../domain/turningTable';
import { h } from './dom';
import './turningTable.css';

const F = 'turning.kunit';
const replies: Record<TurningStop, { name: string; use: string; after: string }> = {
  rail: { name: 'The starting mark at the low rail', use: 'A visitor sets the block with the raised ledge toward the entry. They use the fixed starting notch to align the offshore peg.', after: 'The low rail keeps its fixed start marker for an unstaffed visit. A reader can find the note on the other face in the Turning Room.' },
  keeper: { name: 'Renna’s speaking table', use: 'Renna holds the model still while a visitor turns it. They keep the offshore peg fixed first and move it only after seeing the change in the two marks.', after: 'The speaking table keeps both positions in use. A later visitor checks the keeper’s hours before coming for a turn.' },
};

export function turningPanel(site: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  const panel = h('div', { class: 'turning-table', tabindex: -1 });
  const feedback = h('p', { role: 'status', class: 'fine' });
  const view = h('div');
  panel.append(view, feedback);
  function set(step: string, value: boolean | string, message: string) {
    if (!controller.check(TURNING_GATE) || !controller.check({ card: TURNING_CARD })) return;
    const events = controller.dispatch({ type: 'SetFlag', flag: `${F}.${step}`, value });
    if (events.some(({ kind }) => kind === 'error')) return;
    if (step !== 'fixed' && step !== 'shifted') refreshWorld();
    sound(step === 'read' ? 'sfx.complete' : 'sfx.step');
    render();
    feedback.textContent = message;
    (view.querySelector<HTMLElement>(`[data-turn="${step}"]:enabled`) ?? view.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
  }
  function render() {
    const flags = controller.state.flags;
    const route = flags[`${F}.route`];
    const read = flags[`${F}.read`];
    view.replaceChildren();
    if (site === 'rail' || site === 'keeper') {
      const result = replies[site];
      view.append(h('h2', {}, result.name));
      if (site !== route) return;
      view.append(h('p', {}, result.use));
      if (read === site) view.append(h('p', {}, result.after));
      else view.append(h('button', { type: 'button', 'data-turn': 'read', onclick: () => set('read', site, result.after) },
        site === 'rail' ? 'Set the marker at the visitor’s side' : 'Set the pieces for the keeper’s demonstration'));
      return;
    }
    view.append(h('h2', {}, 'The two practice blocks'));
    if (!controller.check({ card: TURNING_CARD }) || !flags[`${F}.note`]) {
      view.append(h('p', {}, 'Read the coast-piece record and the trial landing note first.'));
      return;
    }
    const fixed = flags[`${F}.fixed`] === true;
    const shifted = flags[`${F}.shifted`] === true;
    const current = turningView(fixed ? 'other' : 'near', shifted ? 'right' : 'left');
    view.append(h('p', {}, 'Holm reports that Kunit carved the pieces and showed him what their features meant. These three practice slots belong to Lantern House.'),
      h('div', { class: 'turning-tracks' }, ...[0, 1, 2].map((slot) => h('div', { class: 'turning-slot' },
        h('span', { class: 'fine' }, `Slot ${slot + 1}`), h('span', { class: current.coastMark === slot ? 'turning-mark' : '' }, current.coastMark === slot ? 'Shore mark' : '—'),
        h('span', { class: current.islandMark === slot ? 'turning-peg' : '' }, current.islandMark === slot ? 'Offshore peg' : '—')))),
      h('p', {}, current.relief),
      h('div', { class: 'row wrap' },
        h('button', { type: 'button', 'data-turn': 'fixed', disabled: fixed, onclick: () => set('fixed', true, 'The shore mark moved to slot 3. The offshore peg stayed in slot 1.') }, 'Turn the shore block with the peg fixed'),
        h('button', { type: 'button', 'data-turn': 'shifted', disabled: !fixed || shifted, onclick: () => set('shifted', true, 'The offshore peg now lines up with the shore mark at slot 3.') }, 'Slide the offshore peg to the far slot')));
    if (!shifted) return;
    if (route === 'rail' || route === 'keeper') { view.append(h('p', {}, `The next check is at ${replies[route].name.toLowerCase()}.`)); return; }
    view.append(h('p', {}, 'The low rail can be used at any hour. The speaking table gives people both positions when Renna is there.'),
      h('div', { class: 'row wrap' },
        h('button', { type: 'button', 'data-turn': 'route', onclick: () => set('route', 'rail', 'Check the fixed starting mark at the public low rail.') }, 'Take a fixed starting mark to the low rail'),
        h('button', { type: 'button', 'data-turn': 'route', onclick: () => set('route', 'keeper', 'Bring both positions to Renna’s speaking table.') }, 'Take both positions to the speaking table')));
  }
  render();
  return panel;
}
