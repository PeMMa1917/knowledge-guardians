import type { GameController } from '../app/controller';
import {
  OLD_SHUTTERS, SHUTTER_LAMP, SHUTTER_MIRRORS, SHUTTER_OUTLETS, SHUTTER_SIZE, SHUTTER_STOPS,
  readShutterMirrors, sameShutterSpot, traceShutters, turnShutterMirror, type ShutterTrace,
} from '../domain/shutterBoard';
import { h } from './dom';
import './shutterBoard.css';

const scope = 'nexus.shutter.';
const mirrorNames = ['Joining mirror', 'Upper mirror', 'Lower mirror'];
const answer = {
  stop: 'The light stops at a baffle. Follow the marked line and check the last mirror that turned it.',
  edge: 'The light reaches the frame between shutters. Check which face of a mirror turns it.',
  loop: 'The light stays among the mirrors. Turn one mirror where the path repeats.',
  low: 'The light crosses the low shutter’s mark. Walk to the low shutter and check it.',
  quiet: 'The light crosses the upper shutter’s mark. Walk to the upper shutter and check it.',
} satisfies Record<ShutterTrace['end'], string>;

export function shutterBoardPanel(controller: GameController, refresh: () => void, sound: () => void): HTMLElement {
  const panel = h('div', { class: 'shutter-board' });
  const state = () => controller.state;
  if (state().mapId !== 'nexus.two-shutters') return panel;

  const flag = (name: string) => state().flags[scope + name];
  const grid = h('div', { class: 'shutter-grid', 'aria-label': 'Five by five mirror board' });
  const result = h('p', { class: 'shutter-result', role: 'status', tabindex: -1 });
  const turns = h('p', { class: 'fine' });
  const earlier = h('p', { class: 'fine' }, 'The old proof ends at the upper baffle. It stays beside the two checks.');
  const records = h('p', { class: 'fine', 'aria-live': 'polite' });
  const show = () => {
    if (state().mapId !== 'nexus.two-shutters') return;
    const old = flag('old') !== true;
    if (old) set('old', true);
    const trace = traceShutters(readShutterMirrors(flag('mirrors')));
    set('active', trace.end);
    sound();
    draw();
    result.focus();
  };
  const traceButton = h('button', { type: 'button', onclick: show });
  const reset = h('button', { type: 'button', onclick: () => {
    set('mirrors', OLD_SHUTTERS.join(''));
    set('active', 'idle');
    sound();
    draw();
    result.focus();
  } }, 'Reset the test mirrors');

  function set(name: string, value: string | boolean) {
    if (state().mapId !== 'nexus.two-shutters') return;
    controller.dispatch({ type: 'SetFlag', flag: scope + name, value });
    refresh();
  }

  function draw(focus?: number) {
    const position = readShutterMirrors(flag('mirrors'));
    const active = flag('active');
    const old = flag('old') === true;
    const trace = old && active && active !== 'idle' ? traceShutters(position) : undefined;
    const cells: HTMLElement[] = [];
    for (let y = 0; y < SHUTTER_SIZE; y++) {
      for (let x = 0; x < SHUTTER_SIZE; x++) {
        const cell = [x, y] as const;
        const onPath = trace?.tiles.some((tile) => sameShutterSpot(tile, cell));
        const css = onPath ? 'lit' : '';
        const mirror = SHUTTER_MIRRORS.findIndex((tile) => sameShutterSpot(tile, cell));
        if (mirror >= 0) {
          const face = position[mirror] === '/' ? 'forward slash' : 'backslash';
          const button = h('button', { type: 'button', class: `shutter-cell mirror ${css}`,
            'aria-label': `${mirrorNames[mirror]}, ${face}`, 'data-mirror': mirror, disabled: !old, onclick: () => {
              set('mirrors', turnShutterMirror(position, mirror).join(''));
              set('active', 'idle');
              draw(mirror);
            } }, position[mirror] === '/' ? '╱' : '╲');
          cells.push(button);
          continue;
        }
        let cellText = '';
        if (sameShutterSpot(SHUTTER_LAMP, cell)) cellText = 'Lamp';
        if (SHUTTER_STOPS.some((stop) => sameShutterSpot(stop, cell))) cellText = 'Baffle';
        if (sameShutterSpot(SHUTTER_OUTLETS.quiet, cell)) cellText = 'Upper';
        if (sameShutterSpot(SHUTTER_OUTLETS.low, cell)) cellText = 'Low';
        cells.push(h('span', { class: `shutter-cell ${css} ${cellText ? 'fixed' : 'blank'}`, 'aria-hidden': String(!cellText && !onPath) },
          cellText || (onPath ? '·' : '')));
      }
    }
    grid.replaceChildren(...cells);
    if (focus !== undefined) grid.querySelector<HTMLButtonElement>(`[data-mirror="${focus}"]`)?.focus();
    traceButton.textContent = old ? 'Trace the current path' : 'Trace Ilin’s old setting';
    reset.disabled = !old;
    earlier.hidden = !old;
    result.textContent = trace ? answer[trace.end] : old ? 'The light is ready to test again.' : 'Test the setting Ilin saved and look for the place where its light ends.';
    turns.hidden = !trace;
    if (trace) {
      const bends = trace.tiles.flatMap((tile) =>
        SHUTTER_MIRRORS.flatMap((mirror, index) => sameShutterSpot(tile, mirror) ? [mirrorNames[index].toLowerCase()] : []));
      const end = trace.tiles.at(-1)!;
      turns.textContent = `From the lamp through ${bends.join(', ')} to row ${end[1] + 1}, column ${end[0] + 1}.`;
    }
    records.textContent = `Checked at the shutters. Upper ${flag('quiet') === true ? 'checked' : 'waiting'}. Low ${flag('low') === true ? 'checked' : 'waiting'}.`;
  }

  panel.append(h('h2', {}, 'The three mirrors'), grid, h('div', { class: 'row' }, traceButton, reset), result, turns, earlier, records);
  draw();
  return panel;
}
