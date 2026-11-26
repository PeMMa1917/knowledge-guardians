import type { GameController } from '../app/controller';
import { CURTAIN_STATIONS } from '../content/curtainCall';
import { curtainCall, type CallStation } from '../domain/curtainCall';
import { h } from './dom';
import './curtainCall.css';

const stationName: Record<CallStation, string> = {
  open: 'At the open rail',
  curtain: 'Behind the curtain',
  marks: 'The tick-board at the Workmen’s rail',
  felt: 'The padded latch at the Workmen’s rail',
};

export function curtainCallPanel(controller: GameController, id: string, refresh: () => void, tapSound: () => void): HTMLElement {
  const shell = h('section', { class: 'curtain-call', tabindex: '-1' });
  const station = CURTAIN_STATIONS.find((name) => name === id);
  if (!station) return shell;
  const node = controller.pack.dialogue.find(({ id }) => id === `curtain.run.${station}`);
  if (!node) return shell;

  const pulseCount = () => Number(controller.state.flags[`curtain.${station}`] ?? 0);

  const choose = (index: number) => {
    const before = pulseCount();
    controller.dispatch({ type: 'ChooseDialogueOption', node: node.id, index });
    const after = pulseCount();
    if (after > before && curtainCall(station, after).at(-1)?.heard) tapSound();
    refresh();
    render();
    (shell.querySelector('button[data-pulse]') as HTMLButtonElement | null ?? shell.querySelector('button') ?? shell).focus();
  };

  function tiles() {
    const heard = curtainCall(station!, pulseCount());
    return h('ol', { class: 'curtain-calls', 'aria-live': 'polite' }, ...[0, 1, 2].map((beat) => {
      const row = heard[beat];
      return h('li', { class: 'curtain-beat', 'data-sound': row ? row.heard ? 'clear' : 'covered' : 'waiting' },
        h('strong', {}, ['First tap', 'Second tap', 'Third tap'][beat]), row
          ? h('span', {}, row.heard ? 'Carries here' : 'Covered by the latch', row.marker ? h('small', {}, 'Tick raised') : null)
          : h('span', {}, 'Waiting'));
    }));
  }

  function render() {
    const count = pulseCount();
    const finish = controller.check(node!.options?.[4]?.if) && node!.options?.[4];
    const note = station === 'marks' ? 'The board raises a tick for every tap. The latch still clicks.'
      : station === 'felt' ? 'The same striker runs beside a padded latch.'
        : 'The same striker starts from the same three marks.';
    shell.replaceChildren(h('h2', {}, stationName[station!]), h('p', {}, note), tiles(),
      h('div', { class: 'row' },
        h('button', { type: 'button', 'data-pulse': true, onclick: () => choose(count) },
          count === 3 ? 'Reset the striker' : 'Tap the striker'),
        finish ? h('button', { type: 'button', onclick: () => choose(4) }, finish.text) : null));
  }
  render();
  return shell;
}
