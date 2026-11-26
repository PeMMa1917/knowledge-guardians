import type { GameController } from '../app/controller';
import { ALL_DRAWER_FACES, DRAWER_FACES, DRAWER_MASK, drawerReadings } from '../domain/drawerCases';
import { h } from './dom';
import './drawerCases.css';

export function drawerCases(box: HTMLElement, controller: GameController, close: HTMLElement): void {
  let focus = 0;
  const render = () => {
    const checked = Number(controller.state.flags[DRAWER_MASK] ?? 0);
    const drawers = DRAWER_FACES.map((shape, i) => {
      const opened = (checked & (1 << i)) !== 0;
      return h('button', {
        type: 'button', class: `drawer-face ${opened ? shape : ''}`,
        'data-face': i, 'aria-label': `Case ${Math.floor(i / 2) + 1}, ${i % 2 === 0 ? 'left' : 'right'} drawer, ${opened ? shape : 'closed'}`,
        onclick: () => {
          controller.dispatch({ type: 'OpenDrawerCase', face: i });
          focus = i;
          render();
        },
      }, h('span', { 'aria-hidden': 'true', class: 'drawer-knob' }),
      h('span', {}, opened ? (shape === 'round' ? 'Round' : 'Square') : 'Lift'));
    });
    const groups = [0, 1, 2].map((i) => h('div', { class: 'drawer-pair' },
      h('h3', {}, `Case ${i + 1}`), h('div', {}, ...drawers.slice(i * 2, i * 2 + 2))));
    const tally = h('div', { role: 'status', class: 'drawer-counts' }, ...(['round', 'square'] as const).map((shape) => {
      const out = drawerReadings(checked, shape);
      return h('p', {}, h('strong', {}, shape === 'round' ? 'Round tokens' : 'Square tokens'),
        ` in ${out.boxes} cases and ${out.checked} drawers`,
        checked === ALL_DRAWER_FACES ? `. In ${out.sameElsewhere} of those ${out.checked} openings, the other drawer matches.` : '.');
    }));
    box.replaceChildren(close, h('h2', {}, 'Three Cases at the Bell'),
      h('p', {}, 'Dov’s practice cases hold two tokens apiece. A porter brings you one token from a drawer. Lift the flaps to see how the very same token could have reached you.'),
      h('div', { class: 'drawer-board' }, ...groups), tally,
      checked === ALL_DRAWER_FACES ? h('p', { class: 'fine' }, 'Dov has cut a stencil of the six openings. Take it to the two check slips beside the station path when you visit the coast.') : '',
    );
    box.querySelector<HTMLButtonElement>(`button[data-face="${focus}"]`)?.focus();
  };
  render();
}
