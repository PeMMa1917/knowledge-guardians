import type { GameController } from '../app/controller';
import { playPracticeTones } from '../app/practiceSounds';
import { practiceFrequency } from '../domain/makerRoom';
import { MAKER_RETURNS } from '../domain/makerReturns';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';

export function makerReturn(controller: GameController, slug: string, volume: () => number, sound: (name: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'maker-room-tool' });
  const entry = MAKER_RETURNS.find((record) => record.slug === slug);
  if (!entry || !controller.check(specimenEquipped(entry.key))) return panel;
  const flag = `makers.return.${entry.slug}`;
  const record = (value: string) => {
    controller.dispatch({ type: 'SetFlag', flag, value });
    sound('sfx.page');
    refresh();
  };
  panel.append(h('h2', {}, entry.method));
  if (entry.slug === 'jiahu') {
    const held = controller.state.flags['makers.exact.jiahu.sent.a'];
    const stop = typeof held === 'number' && Number.isInteger(held) && held >= 0 && held <= 7 ? held : 0;
    const reference = practiceFrequency(stop);
    const tune = h('input', { type: 'range', min: 0, max: 7, value: Math.min(stop + 1, 7), step: 1,
      'aria-label': 'Second practice tube stop' });
    const result = h('p', { role: 'status', class: 'fine' });
    const compare = h('button', { type: 'button', onclick: () => {
      const pitch = practiceFrequency(Number(tune.value));
      const difference = Math.abs(reference - pitch);
      playPracticeTones([reference, pitch], volume());
      record(difference === 0 ? 'paired' : 'split');
      result.textContent = difference === 0
        ? 'Both practice tubes now have the same frequency. The keeper can repeat the opening cue.'
        : `The two practice frequencies differ by ${difference} Hz. The keeper clips the two figures on separate hooks.`;
    } }, 'Sound the reference and the second tube together');
    panel.append(h('p', {}, `Your carried practice sample is ${reference} Hz. Compare it with the adjustable second tube at the listening rack.`),
      h('label', {}, 'Slide the second stop', tune), compare, result);
  } else if (entry.slug === 'disk') {
    const display = h('div', { class: 'maker-disc', role: 'img' }, 'Relief face');
    const message = h('p', { role: 'status', class: 'fine' }, 'From this path the reader can see the relief face of the model disk.');
    const choose = (next: 'side' | 'swivel') => {
      display.textContent = next === 'side' ? 'Relief face · name strip' : 'Name face · relief guide';
      record(next);
      message.textContent = next === 'side'
        ? 'The reader sees the relief and can open the identified inscription line beside it.'
        : 'The reader sees the identified inscription first. The relief drawing is available at the other side of the swivel.';
    };
    panel.append(h('p', {}, 'Use the copy of B16665 to keep Enheduanna’s name attached to the face that supports it. A single view reaches each visitor as they approach.'),
      display, message, h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => choose('side') }, 'Clip the named guide beside the relief'),
        h('button', { type: 'button', onclick: () => choose('swivel') }, 'Turn the swivel so the named side comes first')));
  } else {
    const scene = h('p', { role: 'status', class: 'fine' }, 'Both entries wait for the keeper. Ono has two separate loans in the practice ledger.');
    const put = (next: 'dated' | 'witness') => {
      record(next);
      scene.textContent = next === 'dated'
        ? 'The keeper clears the first dated loan. The second stays open on its own line.'
        : 'The keeper keeps both loans visible until a witness can match the date at the counter.';
    };
    panel.append(h('p', {}, 'Use the carried clearance method from the Laguna record. The practice clerk has two open loans under the same name. A paper clearly authorises release for the earlier dated loan.'),
      h('ul', {}, h('li', {}, 'Ono · early-bell loan'), h('li', {}, 'Ono · late-bell loan')), scene,
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => put('dated') }, 'Clip the clearance to the early-bell loan'),
        h('button', { type: 'button', onclick: () => put('witness') }, 'Leave a witness request on the account tray')));
  }
  return panel;
}
