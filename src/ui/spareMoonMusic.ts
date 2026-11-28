import type { GameController } from '../app/controller';
import { playNotes } from '../app/ambience';
import {
  MOON_TUNE,
  moonBeatNames,
  moonPerformance,
  moonScore,
  validMoonTune,
  type MoonBeat,
} from '../domain/spareMoonMusic';
import { h } from './dom';

export function spareMoonMusicPanel(controller: GameController, volume: () => number, refreshWorld: () => void) {
  const site = moonPerformance(controller.state);
  if (!site) return;
  const initial = controller.state.flags[MOON_TUNE];
  let tune = validMoonTune(initial) ? initial : '';
  let stop = () => {};
  const live = h('p', { role: 'status', 'aria-live': 'polite' });
  const beats = h('ol', { class: 'moon-beats', 'aria-label': 'Your four beats' });
  const add = (beat: MoonBeat, name: string) =>
    h(
      'button',
      {
        type: 'button',
        onclick: () => {
          if (tune.length >= 4) return;
          stop();
          tune += beat;
          stop = playNotes(moonScore(beat), 0.25, 'pluck', volume());
          draw();
          live.textContent = tune.length === 4 ? 'Four beats. Play them together, or take one back.' : name + '.';
        },
      },
      name,
    );
  const keys = [add('l', 'Low string'), add('h', 'High string'), add('r', 'Leave a rest')];
  const undo = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        stop();
        tune = tune.slice(0, -1);
        draw();
        live.textContent = 'One beat lifted.';
      },
    },
    'Lift the last beat',
  );
  const play = h(
    'button',
    {
      type: 'button',
      class: 'primary',
      onclick: () => {
        if (!validMoonTune(tune)) return;
        const events = controller.dispatch({ type: 'PlayMoonTune', tune });
        if (events.some((event) => event.kind === 'error')) return;
        stop();
        stop = playNotes([...moonScore(tune), ...moonScore(site.reply, 5)], 0.29, 'pluck', volume());
        live.textContent =
          'You played ' +
          moonBeatNames(tune).join(', ') +
          '. The answer came back ' +
          moonBeatNames(site.reply).join(', ') +
          '.';
        if (controller.state.mapId === 'nexus.bell-loft')
          live.textContent += ' The blue wool jumps. The moon stair unlatches.';
        refreshWorld();
      },
    },
    'Play together',
  );
  function draw() {
    beats.replaceChildren(...Array.from({ length: 4 }, (_, i) => h('li', {}, moonBeatNames(tune)[i] ?? 'Empty')));
    keys.forEach((button) => {
      button.disabled = tune.length >= 4;
    });
    undo.disabled = tune.length === 0;
    play.disabled = !validMoonTune(tune);
  }
  draw();
  const panel = h(
    'div',
    { class: 'moon-music' },
    h('p', {}, site.player),
    beats,
    h('div', { class: 'actions' }, ...keys, undo, play),
    live,
  );
  return { title: site.title, panel, dispose: () => stop() };
}
