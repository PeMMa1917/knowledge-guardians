import type { GameController } from '../app/controller';
import {
  castShadows,
  lampNames,
  lamps,
  shadowReading,
  type Lamps,
  type Screen,
  type BarStop,
} from '../domain/supperShadow';
import { h } from './dom';
import './supperShadow.css';

export function supperShadow(
  controller: GameController,
  sound: (id: string) => void,
) {
  const flags = controller.state.flags;
  const remembered = flags['supper.lamps'];
  let setting: Lamps =
    typeof remembered === 'string' && Object.hasOwn(lamps, remembered)
      ? (remembered as Lamps)
      : 'centre';
  let spoons: 1 | 2 = flags['supper.spoons'] === 2 ? 2 : 1;
  let screen: Screen = flags['supper.screen'] === 'chalk' ? 'chalk' : 'lit';
  let depth: BarStop = flags['supper.depth'] === 'near' ? 'near' : 'middle';
  const stage = h('div', { class: 'supper-screen', 'aria-hidden': 'true' });
  const reading = h('p', { role: 'status', 'aria-live': 'polite' });
  const switches: { button: HTMLButtonElement; selected: () => boolean }[] = [];
  function cast() {
    const result = controller.dispatch({
      type: 'CastSupperShadow',
      lamps: setting,
      spoons,
      screen,
      depth,
    });
    const failure = result.find((e) => e.kind === 'error');
    if (failure) {
      reading.textContent = failure.message;
      return;
    }
    sound(setting === 'dark' ? 'sfx.page' : 'sfx.click');
    draw();
  }
  function control(label: string, chosen: () => boolean, select: () => void) {
    const button = h(
      'button',
      {
        type: 'button',
        onclick: () => {
          select();
          cast();
        },
      },
      label,
    );
    switches.push({ button, selected: chosen });
    return button;
  }
  const shades = (Object.keys(lamps) as Lamps[]).map((key) =>
    control(
      lampNames[key],
      () => setting === key,
      () => {
        setting = key;
      },
    ),
  );
  const spoonsRow = [1, 2].map((n) =>
    control(
      n === 1 ? 'Hang one spoon' : 'Hang the pair',
      () => spoons === n,
      () => {
        spoons = n as 1 | 2;
      },
    ),
  );
  const stops = [
    control(
      'Middle stop',
      () => depth === 'middle',
      () => {
        depth = 'middle';
      },
    ),
    control(
      'Near the cloth',
      () => depth === 'near',
      () => {
        depth = 'near';
      },
    ),
  ];
  const screens = [
    control(
      'Show the lamplight',
      () => screen === 'lit',
      () => {
        screen = 'lit';
      },
    ),
    control(
      'Trace the edges in chalk',
      () => screen === 'chalk',
      () => {
        screen = 'chalk';
      },
    ),
  ];
  function draw() {
    for (const s of switches)
      s.button.setAttribute('aria-pressed', String(s.selected()));
    stage.dataset.depth = depth;
    stage.dataset.screen = setting === 'dark' ? 'dark' : screen;
    stage.replaceChildren(
      ...castShadows(setting, spoons, depth).map((shadow) => {
        const figure = h('span', {
          class: 'supper-spoon ' + (shadow.full ? 'full' : 'pale'),
        });
        figure.style.left = 50 + 5 * shadow.at + '%';
        return figure;
      }),
    );
    reading.textContent = shadowReading({
      lamps: setting,
      spoons,
      screen,
      depth,
    });
  }
  draw();
  return h(
    'section',
    { class: 'supper-theatre' },
    h(
      'p',
      {},
      'Two chalk dents on the supper curtain. Kip swears he counted two people. Otla hands you the spoon rack. “Go on. Make a liar of my curtain.”',
    ),
    stage,
    h('fieldset', {}, h('legend', {}, 'Spoon bar'), ...spoonsRow),
    h('fieldset', {}, h('legend', {}, 'Lamp shutters'), ...shades),
    h('fieldset', {}, h('legend', {}, 'Curtain'), ...screens),
    reading,
    h(
      'details',
      {},
      h('summary', {}, 'Look behind the curtain'),
      h(
        'p',
        {},
        'The spoons hang on a sliding bar. At the middle stop each spoon is halfway to the cloth. The next stop takes it two thirds of the way there. Keep the lamps fixed while you slide it.',
      ),
      h('fieldset', {}, h('legend', {}, 'Slide the spoon bar'), ...stops),
    ),
    h(
      'p',
      { class: 'fine' },
      'The lit curtain shows light and shade. The witness brought only a tracing. Each control runs the new arrangement.',
    ),
  );
}
