import type { GameController } from '../app/controller';
import { h } from './dom';
import { artURL } from './illustrations';

const WINDOWS = {
  low: { name: 'The knee-height flap', first: 'At the first breath, two toes appear beside the dark reed. The lip keeps the dry top out of sight.' },
  high: { name: 'The raised flap', first: 'At the first breath, the dry corner is in full view. A reed covers the hollow below it.' },
} as const;

export function stiltfrogWatch(window: keyof typeof WINDOWS, controller: GameController, sound: (key: string) => void): HTMLElement {
  const pose = WINDOWS[window];
  const record = controller.pack.lorelings.find(({ id }) => id === 'stiltfrog')?.sightings.find(({ id }) => id === window);
  const read = controller.state.flags[`lor.stiltfrog.seen.${window}`] === true;
  const panel = h('div');
  const image = h('img', { src: artURL(`stiltfrog.window-${window}`), alt: '', width: 64, height: 48, style: 'image-rendering: pixelated' });
  const status = h('p', { 'aria-live': 'polite' },
    read && record ? record.text : 'Elian marked the cloth. Lift it to the mark and take the same two quiet breaths at each flap.');
  const button = h('button', { type: 'button', class: 'primary', onclick: advance }, 'Lift the cloth to its mark');
  let breath = -1;

  function advance() {
    breath++;
    sound('sfx.page');
    if (breath === 0) {
      button.textContent = 'Watch one quiet breath';
      status.textContent = 'The flap rests at the mark. Sight through the opening, with the cloth between you and the bank.';
    } else if (breath === 1) {
      button.textContent = 'Watch one more quiet breath';
      status.textContent = pose.first;
    } else {
      const result = controller.dispatch({ type: 'LorelingWatch', loreling: 'stiltfrog', sighting: window });
      const watch = result.find((event) => event.kind === 'loreling');
      if (!watch) return;
      status.textContent = watch.text;
      button.disabled = true;
      button.textContent = 'Both breaths recorded';
      status.tabIndex = -1;
      status.focus();
    }
  }

  panel.append(h('h2', {}, pose.name), image, status, button);
  return panel;
}
