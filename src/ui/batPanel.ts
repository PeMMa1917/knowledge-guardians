/**
 * The Bat Keeper panel (chapter 4 night scene). Rules in ../domain/batKeeper.ts.
 * Listen with bare ears, tune a detector to find the bats, hear a catch, then say what we can know of
 * the bat's experience. Every answer gets a reply; none is marked right (OPEN-001).
 */
import type { GameController } from '../app/controller';
import { BUZZ, DIAL, FOUND_TO_LISTEN, VIEWS, batsFound, canHearBuzz } from '../domain/batKeeper';
import { h } from './dom';

export function batPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'bats' });
  let tried: number[] = [];
  let now: number | null = null;
  let heard = false;
  let view: string | null = null;
  let stage: 'ears' | 'dial' | 'ask' | 'done' = 'ears';

  const ears = (): (HTMLElement | string)[] => [
    h('p', {}, "Night on the headland. Signalkeeper Ruan turns the lamp down to a glow. Small shapes flick through its light. 'Bats,' says Ruan. 'They are calling all the time. Listen.'"),
    h('p', {}, 'You listen. You hear the sea and the wind in the rail. Nothing else.'),
    h('p', { class: 'fine' }, "Ruan: 'People hear up to about twenty thousand vibrations a second, less as we get older. Bat calls go from about nine thousand to two hundred thousand. Most of what they say is above us.'"),
    h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'dial'; sfx('sfx.page'); render(); } }, 'Take the detector'),
  ];

  const dial = (): (HTMLElement | string)[] => {
    const found = batsFound(tried);
    const here = DIAL.find((d) => d.khz === now);
    return [
      h('p', {}, `Ruan hands you a small box with a dial. 'It listens at one setting at a time, and turns what it hears into a sound for us. Find who is feeding here tonight. Find ${['no', 'one', 'two', 'three', 'four'][FOUND_TO_LISTEN] ?? FOUND_TO_LISTEN} of them.'`),
      h('div', { class: 'row', role: 'group', 'aria-label': 'Detector setting' }, ...DIAL.map((d) => h('button', {
        type: 'button', 'aria-pressed': String(now === d.khz),
        onclick: () => { now = d.khz; if (!tried.includes(d.khz)) tried = [...tried, d.khz]; sfx('sfx.click'); render(); },
      }, `${d.khz} kHz`))),
      here ? h('p', { class: 'clue-view fresh', role: 'status' }, here.hear) : '',
      found.length ? h('ul', { class: 'bats-found' }, ...DIAL.filter((d) => d.bat && found.includes(d.bat)).map((d) => h('li', {}, `Heard: ${d.name}`))) : '',
      heard ? h('p', {}, BUZZ) : '',
      heard
        ? h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'ask'; render(); } }, 'Sit on the step with Ruan')
        : canHearBuzz(tried, now)
          ? h('button', { type: 'button', class: 'primary', onclick: () => { heard = true; sfx('sfx.sparkle'); c.dispatch({ type: 'SetFlag', flag: 'field.bats.buzz', value: true }); render(); } }, 'Keep listening here')
          : found.length >= FOUND_TO_LISTEN ? h('p', { class: 'fine' }, "Ruan: 'Go back to the pipistrelle at the lamp, and wait.'") : '',
    ];
  };

  const ask = (): (HTMLElement | string)[] => [
    h('p', {}, "Ruan switches the detector off. 'We know the setting it called at, and where it flew, and that it caught a moth. Here is what I always wonder. What was that like, for the bat?'"),
    ...(view
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, VIEWS.find((v) => v.id === view)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Turn the lamp back up')]
      : [h('div', { class: 'row' }, ...VIEWS.map((v) => h('button', { type: 'button', onclick: () => {
        view = v.id; c.dispatch({ type: 'SetFlag', flag: 'field.bats.view', value: v.id }); sfx('sfx.page'); render();
      } }, v.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, "Ruan writes in the night log: 'Bats at the lamp and the pool. One catch at the 45 setting.' Under it, smaller: 'What it was like: not written.'"),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'ears' ? ears() : stage === 'dial' ? dial() : stage === 'ask' ? ask() : done();
    box.replaceChildren(h('h2', {}, 'The Bat Keeper'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
