import type { GameController } from '../app/controller';
import {
  bakeryTrays,
  seeTray,
  trayReport,
  type Tray,
  type TrayAction,
} from '../domain/bakeryTrays';
import { h } from './dom';

export function bakeryPanel(c: GameController) {
  const trayNames = Object.keys(bakeryTrays) as Tray[];
  let tray: Tray = c.state.flags['tally.tray'] === 'large' ? 'large' : 'small';
  const switches = trayNames.map((key) =>
    h(
      'button',
      { type: 'button', onclick: () => act(key, 'choose') },
      bakeryTrays[key].name,
    ),
  );
  const scene = h('div', { class: 'bakery-scene', 'aria-hidden': 'true' });
  const status = h('p', { role: 'status', 'aria-live': 'polite' });
  const give = h(
    'button',
    { type: 'button', onclick: () => act(tray, 'deliver') },
    'Leave one loaf at the next door',
  );
  const putBack = h(
    'button',
    { type: 'button', onclick: () => act(tray, 'return') },
    'Bring one loaf back',
  );
  const weigh = h(
    'button',
    { type: 'button', onclick: () => act(tray, 'weigh') },
    'Weigh the remaining tray',
  );
  function act(key: Tray, action: TrayAction) {
    const events = c.dispatch({ type: 'MoveBakeryTray', tray: key, action });
    const error = events.find((e) => e.kind === 'error');
    if (error) {
      status.textContent = error.message;
      return;
    }
    tray = key;
    render(action === 'weigh');
  }
  function render(showScale: boolean) {
    const v = seeTray(c.state, tray);
    trayNames.forEach((key, i) =>
      switches[i].setAttribute('aria-pressed', String(key === tray)),
    );
    const loaf = () => h('i', { class: 'tally-loaf ' + tray });
    const trayLine = h(
      'div',
      { class: 'tally-pan' },
      ...Array.from({ length: v.remaining }, loaf),
    );
    const doors = h(
      'div',
      { class: 'tally-doors' },
      ...Array.from({ length: 6 }, (_, i) =>
        h('span', { class: 'tally-door' }, i < v.delivered ? loaf() : null),
      ),
    );
    const weights = h(
      'div',
      { class: 'tally-pan units' },
      ...Array.from({ length: v.weight }, () =>
        h('i', { class: 'tally-weight' }),
      ),
    );
    scene.replaceChildren(doors, trayLine, ...(showScale ? [weights] : []));
    give.disabled = v.remaining === 0;
    putBack.disabled = v.delivered === 0;
    status.textContent = showScale
      ? 'The pans settle level. ' + trayReport(c.state, tray)
      : v.delivered +
        ' of 6 doors have a loaf. ' +
        v.remaining +
        ' on the tray.';
  }
  render(
    c.state.flags['tally.weighed.' + tray] === seeTray(c.state, tray).delivered,
  );
  return h(
    'details',
    { class: 'bakery-panel' },
    h('summary', {}, 'Try Della’s trays'),
    h(
      'p',
      {},
      'Six stall doors across the top. Leave a whole loaf at each door, or put the tray on Idris’s scale.',
    ),
    h('div', { class: 'row wrap' }, ...switches),
    scene,
    h('div', { class: 'row wrap' }, give, putBack, weigh),
    status,
  );
}
