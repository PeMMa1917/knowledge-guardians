import type { GameController } from '../app/controller';
import { BRIDGE_PARTNER, CARRY, carryMoves, currentCarryPhase, type CarrySite, type CarryStop } from '../domain/sharedCarry';
import { h } from './dom';
import { artURL } from './illustrations';

const DESTINATIONS: Record<CarrySite, Partial<Record<CarryStop, string>>> = {
  forest: {
    start: 'Ayla’s first trestles',
    turn: 'the hooks at the central bend',
    shelf: 'the covered shelf by the clearing’s east end',
  },
  copies: {
    start: 'Mina’s delivery hooks on the west side',
    cart: 'the first cart rest near the central steps',
    'cart-turn': 'the far cart rest along the south edge',
    lift: 'the second keeper beside the short lane',
    low: 'the low return counter on the southeast side',
    upper: 'the covered cradle at the east rail',
  },
};

export function sharedCarry(site: CarrySite, stop: CarryStop, controller: GameController, sound: (key: string) => void,
  refreshWorld: () => void): HTMLElement {
  const panel = h('div');
  const status = h('p', { 'aria-live': 'polite' });
  const art = h('img', { alt: '', width: 60, height: 48, style: 'image-rendering: pixelated' });
  const choices = h('div', { class: 'row wrap' });
  const intro = h('p', { class: 'fine' });
  panel.append(h('h2', {}, CARRY[site].title), intro, art, status, choices);

  function draw(focus = false) {
    const here = currentCarryPhase(site, controller.state);
    art.src = artURL(here.art);
    const available = here.stop === stop ? carryMoves(site, controller.state, controller.permanent) : [];
    intro.hidden = stop !== 'start' || here.stop !== 'start';
    intro.textContent = site === 'forest'
      ? controller.state.flags['nexus.handle.done'] === true
        ? 'You remember checking Kip’s case with its practice strips inside. Ayla’s frame calls for its own footing check.'
        : 'The holder needs one person at each end. Ayla will work the far handle.'
      : controller.permanent.awards[BRIDGE_PARTNER]
        ? 'Ayla’s Bridge Partner badge tells Mina you have made a shared turn. Mina still needs the local clearance check.'
        : 'Mina keeps a handcart ready for visitors. Local keepers can lend a hand at each rest.';
    status.textContent = here.stop === stop ? here.text : `The frame is now at ${DESTINATIONS[site][here.stop]}. Follow it on foot.`;
    choices.replaceChildren(...available.map((move) => h('button', { type: 'button', onclick: () => {
      const events = controller.dispatch({ type: 'SharedCarry', site, stop, action: move.id });
      if (events.some((event) => event.kind === 'error')) return;
      refreshWorld();
      sound(move.id === 'shelve' || move.id === 'seat' ? 'sfx.sparkle' : 'sfx.click');
      draw(true);
    } }, move.label)));
    if (focus) {
      const next = choices.querySelector('button');
      if (next) next.focus();
      else {
        status.tabIndex = -1;
        status.focus();
      }
    }
  }

  draw();
  return panel;
}
