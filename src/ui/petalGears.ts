import type { GameController } from '../app/controller';
import {
  flipped,
  gearHandover,
  gearRead,
  pairedGears,
  pulled,
  roller,
  rollerName,
  rollers,
  type GearCommand,
} from '../domain/petalGears';
import { h } from './dom';
export function petalGears(c: GameController, sound: (id: string) => void) {
  const root = h('section', { class: 'petal-bench' }),
    drawer = h('div', { class: 'row' }),
    selected = h('h3', {}),
    face = h('p', {}),
    motion = h('p', { role: 'status' }),
    plate = h('p', {}),
    sends = h('div', { class: 'row' }),
    last = h('p', {});
  const run = (command: GearCommand) => {
    const failure = c.dispatch(command).find((e) => e.kind === 'error');
    if (failure?.kind === 'error') {
      motion.textContent = failure.message;
      return;
    }
    sound(command.action === 'pull' ? 'sfx.page' : 'sfx.click');
    draw();
    const s = c.state,
      r = roller(s),
      record = gearRead(r, flipped(s, r));
    motion.textContent =
      command.action === 'send'
        ? gearHandover[command.reader]
        : command.action === 'pull'
          ? record.movement
          : record.face;
  };
  for (const r of rollers)
    drawer.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () =>
            run({ type: 'WindPetalGear', action: 'fit', roller: r }),
        },
        rollerName[r],
      ),
    );
  const button = (text: string, command: GearCommand) =>
    h('button', { type: 'button', onclick: () => run(command) }, text);
  sends.append(
    button('Send the hooks to the front of the curtain', {
      type: 'WindPetalGear',
      action: 'send',
      reader: 'front',
    }),
    button('Send the ribbons into the wings', {
      type: 'WindPetalGear',
      action: 'send',
      reader: 'wings',
    }),
  );
  root.append(
    h(
      'p',
      {},
      'Four paper rollers turn on the same handle. One chooses a costume. Another lifts the forelegs through three heights. One releases two catches. The last draws out a pair of ribbons. Turn any roller over and see what kind of movement survives.',
    ),
    drawer,
    selected,
    face,
    h(
      'div',
      { class: 'row' },
      button('Turn the paper roller over', {
        type: 'WindPetalGear',
        action: 'turn',
      }),
      button('Pull the little theatre handle', {
        type: 'WindPetalGear',
        action: 'pull',
      }),
    ),
    motion,
    plate,
    sends,
    last,
  );
  function draw() {
    const s = c.state,
      r = roller(s),
      flip = flipped(s, r);
    selected.textContent = rollerName[r];
    face.textContent = gearRead(r, flip).face;
    [...drawer.querySelectorAll('button')].forEach((b, i) =>
      b.setAttribute('aria-pressed', String(rollers[i] === r)),
    );
    plate.textContent =
      pulled(s, r, false) && pulled(s, r, true)
        ? gearRead(r, flip).rule
        : pulled(s, r, false)
          ? 'The cast has seen the front. Turn the roller to try the reverse.'
          : pulled(s, r, true)
            ? 'The cast has seen the reverse. Turn the roller to try the front.'
            : 'The handle is ready. Pull it to play this face.';
    for (const b of sends.querySelectorAll('button'))
      b.disabled = !pairedGears(s);
    const dest = s.flags['petal-window.gear.sent'];
    last.textContent =
      dest === 'front' || dest === 'wings' ? gearHandover[dest] : '';
  }
  draw();
  return root;
}
