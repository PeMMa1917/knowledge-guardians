import type { GameController } from '../app/controller';
import {
  hours,
  lateWatches,
  ribbonNames,
  ribbons,
  opened,
  pinned,
  replyToRibbon,
  moves,
  danceNames,
  danceAfter,
  lastDance,
  type Hour,
  type WagerCommand,
} from '../domain/petalWager';
import { h } from './dom';
export function petalRibbons(c: GameController, sound: (id: string) => void) {
  const root = h('section', { class: 'petal-bench' }),
    tabs = h('div', { class: 'row' }),
    heading = h('h3', {}),
    claim = h('div', { class: 'row' }),
    evidence = h('p', {}),
    reply = h('p', {}),
    dance = h('div', { class: 'row' }),
    live = h('p', { role: 'status' });
  let hour: Hour = 'noon';
  const act = (cmd: WagerCommand) => {
    const failure = c.dispatch(cmd).find((e) => e.kind === 'error');
    if (failure?.kind === 'error') {
      live.textContent = failure.message;
      return;
    }
    sound(cmd.action === 'dance' ? 'sfx.sparkle' : 'sfx.page');
    draw();
    live.textContent =
      cmd.action === 'pin'
        ? ribbonNames[cmd.ribbon]
        : cmd.action === 'dance'
          ? danceAfter[cmd.move]
          : lateWatches[hour].line;
  };
  const release = h(
    'button',
    {
      type: 'button',
      onclick: () => act({ type: 'DrawPetalRibbon', hour, action: 'release' }),
    },
    'Unfold the dated watch',
  );
  for (const t of hours)
    tabs.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () => {
            hour = t;
            draw();
            live.textContent = '';
          },
        },
        lateWatches[t].time + ' curtain',
      ),
    );
  for (const r of ribbons)
    claim.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () =>
            act({ type: 'DrawPetalRibbon', hour, action: 'pin', ribbon: r }),
        },
        ribbonNames[r],
      ),
    );
  for (const m of moves)
    dance.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () =>
            act({ type: 'DrawPetalRibbon', hour, action: 'dance', move: m }),
        },
        danceNames[m],
      ),
    );
  root.append(
    h(
      'p',
      {},
      'Two later watches came in sealed. The side of each sleeve names the flowers and the hour. Elian wants a ribbon to check when it opens. Viri wants a new gesture even if the bees surprise her.',
    ),
    tabs,
    heading,
    claim,
    release,
    evidence,
    dance,
    reply,
    live,
  );
  function draw() {
    const w = lateWatches[hour],
      r = pinned(c.state, hour),
      open = opened(c.state, hour),
      m = lastDance(c.state, hour);
    heading.textContent =
      w.time + ' · window side ' + w.left + ' · door side ' + w.right;
    [...tabs.querySelectorAll('button')].forEach((b, i) =>
      b.setAttribute('aria-pressed', String(hours[i] === hour)),
    );
    [...claim.querySelectorAll('button')].forEach((b, i) => {
      b.disabled = open;
      b.setAttribute('aria-pressed', String(ribbons[i] === r));
    });
    release.disabled = !r || open;
    evidence.textContent =
      open && r
        ? w.line + ' ' + replyToRibbon(hour, r)
        : r
          ? 'Pinned before the watch opens: ' + ribbonNames[r]
          : 'The ribbon clip is empty.';
    for (const b of dance.querySelectorAll('button')) b.disabled = !open;
    reply.textContent = m ? danceAfter[m] : '';
  }
  draw();
  return root;
}
