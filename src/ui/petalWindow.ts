import type { GameController } from '../app/controller';
import {
  cardsMatch,
  finaleLine,
  flowerEnding,
  flowerLabel,
  flowers,
  gardenTape,
  leftFlower,
  light,
  measure,
  printKey,
  printLegend,
  replyLines,
  seen,
  usableContact,
  watched,
  type Flower,
  type Gain,
  type PetalMove,
} from '../domain/petalWindow';
import { h } from './dom';
import './petalWindow.css';

function room(
  c: GameController,
  sound: (id: string) => void,
  draw: (speak: string) => void,
) {
  return (move: PetalMove, message: string) => {
    const failure = c
      .dispatch({ type: 'WorkPetalWindow', ...move })
      .find((e) => e.kind === 'error');
    if (!failure) sound(move.action === 'watch' ? 'sfx.page' : 'sfx.click');
    draw(failure?.kind === 'error' ? failure.message : message);
  };
}
const button = (text: string, go: () => void) =>
  h('button', { type: 'button', onclick: go }, text);
export function petalWindow(c: GameController, sound: (id: string) => void) {
  const root = h('section', { class: 'petal-bench' }),
    live = h('p', { role: 'status' }),
    crops = h('div', { class: 'petal-pair' }),
    status = h('p', {}),
    receipt = h('p', {});
  const inputs = h('div', { class: 'row' }),
    papers = h('div', { class: 'row' }),
    lastGain = new Map<number, HTMLButtonElement>();
  const bandButtons = new Map<string, HTMLButtonElement>();
  const act = room(c, sound, draw);
  for (const band of ['day', 'uv'] as const) {
    const b = button(
      band === 'day' ? 'Slide in daylight' : 'Slide in ultraviolet',
      () =>
        act(
          { action: 'set-band', band },
          band === 'day'
            ? 'The yellow wash returns.'
            : 'The shutter opens onto the shorter band.',
        ),
    );
    inputs.append(b);
    bandButtons.set(band, b);
  }
  for (const gain of [1, 2, 4] as Gain[]) {
    const b = button('Gain ×' + gain, () =>
      act({ action: 'set-gain', gain }, 'The handle sits at ×' + gain + '.'),
    );
    lastGain.set(gain, b);
    inputs.append(b);
  }
  if (c.state.inventory['item.nexus.shutter-pin'] > 0)
    inputs.append(
      button('Turn the ink roller with the shutter pin', () =>
        act(
          { action: 'flip-ink' },
          'The two inks trade places. The detector keeps its numbers.',
        ),
      ),
    );
  for (const f of flowers)
    papers.append(
      button('Keep the ' + flowerLabel[f] + ' slip', () => {
        const { band, gain } = light(c.state),
          r = measure(f, band, gain);
        act(
          { action: 'sample', flower: f },
          flowerLabel[f] +
            ' kept at gain ' +
            gain +
            '. ' +
            r.low +
            ' low squares. ' +
            r.clipped +
            ' at the upper stop.',
        );
      }),
    );
  root.append(
    h(
      'p',
      {},
      'Viri has named the two flower crops after the parts of her coat she traced them on. Each window covers sixteen equal squares. The printer can mark returns from zero to one hundred.',
    ),
    inputs,
    crops,
    status,
    papers,
    receipt,
    live,
    h(
      'details',
      {},
      h('summary', {}, 'Open Elian’s pocket key'),
      h(
        'p',
        {},
        'Low is under 20, middle is 20 through 49, high is 50 and up. A square at 100 has hit the stop. A stronger return and a much stronger one then print alike. Compare at gain one to see what the instrument can separate.',
      ),
      h(
        'p',
        {},
        'These are model crops in the glasshouse. In silverweed, photographed petals that look yellow to people can differ in the area that absorbs ultraviolet. Bees detect ultraviolet. This print gives a person an account of the detector. A bee’s own experience and its next landing need other evidence.',
      ),
    ),
  );
  function plate(f: Flower) {
    const { band, gain } = light(c.state),
      r = measure(f, band, gain),
      invert = seen(c.state, 'reverse-ink');
    const grid = h('div', { class: 'petal-crop', 'aria-hidden': 'true' });
    for (const n of r.cells)
      grid.append(
        h(
          'span',
          {
            'data-tone': band === 'day' ? 'day' : printLegend(n),
            'data-invert': String(invert),
          },
          n === 100 ? '▲' : n < 20 ? '•' : n < 50 ? '–' : '+',
        ),
      );
    const rows = h(
      'details',
      {},
      h('summary', {}, 'Read the four rows for ' + flowerLabel[f]),
    );
    for (let i = 0; i < 4; i++)
      rows.append(
        h(
          'p',
          {},
          'Row ' + (i + 1) + ' · ' + r.cells.slice(i * 4, i * 4 + 4).join(', '),
        ),
      );
    return h(
      'article',
      { class: 'petal-specimen' },
      h('h3', {}, flowerLabel[f]),
      grid,
      h('p', {}, r.low + ' low of 16 · ' + r.clipped + ' at the upper stop'),
      rows,
    );
  }
  function draw(message: string) {
    const { band, gain } = light(c.state);
    for (const [id, b] of bandButtons)
      b.setAttribute('aria-pressed', String(id === band));
    for (const [id, b] of lastGain)
      b.setAttribute('aria-pressed', String(id === gain));
    const details = [...crops.querySelectorAll('details')].map((d) => d.open);
    crops.replaceChildren(...flowers.map(plate));
    [...crops.querySelectorAll('details')].forEach(
      (d, i) => (d.open = !!details[i]),
    );
    status.textContent =
      (band === 'day' ? 'Daylight' : 'UV') +
      ' · gain ×' +
      gain +
      '. ' +
      (seen(c.state, 'reverse-ink') ? 'The printer’s ink is reversed. ' : '') +
      'The marks and row numbers also identify the returns.';
    receipt.textContent =
      'At this setting the drying rail holds ' +
      (flowers
        .filter((f) => seen(c.state, printKey(band, gain, f)))
        .map((f) => flowerLabel[f])
        .join(' and ') || 'no slips yet') +
      '.';
    live.textContent = message;
  }
  draw('');
  return root;
}
export function petalLedge(c: GameController, sound: (id: string) => void) {
  const root = h('section', { class: 'petal-bench' }),
    ledge = h('div', { class: 'petal-shelf' }),
    track = h('ol', {}),
    note = h('p', {}),
    live = h('p', { role: 'status' });
  const act = room(c, sound, draw);
  function draw(message: string) {
    const left = leftFlower(c.state),
      t = gardenTape(left),
      opened = seen(c.state, left === 'apron' ? 'watch.left' : 'watch.right');
    ledge.replaceChildren(
      h('span', {}, 'Window side · ' + flowerLabel[left]),
      h(
        'span',
        {},
        'Door side · ' + flowerLabel[left === 'apron' ? 'sleeve' : 'apron'],
      ),
    );
    track.replaceChildren(
      ...(opened
        ? t.stops.map((side, i) =>
            h(
              'li',
              {},
              'Landing ' +
                (i + 1) +
                ' · ' +
                (side === 'left' ? 'window side' : 'door side'),
            ),
          )
        : []),
    );
    note.textContent = opened
      ? t.time +
        ' · same 90-second watch length. Hem received ' +
        t.onHem +
        ' landings and Cuff ' +
        t.onCuff +
        '.'
      : 'A strip of morning is folded under this arrangement.';
    live.textContent = message;
  }
  root.append(
    h(
      'p',
      {},
      'Viri found one morning caught in two separate loops of glass. The slips name the time and the ledge arrangement. Unroll a loop and the bees complete the flights already recorded in it.',
    ),
    ledge,
    h(
      'div',
      { class: 'row' },
      button('Set Hem by the window', () =>
        act(
          { action: 'shelf', place: 'left' },
          'Hem rests on the window side.',
        ),
      ),
      button('Set Hem by the door', () =>
        act({ action: 'shelf', place: 'right' }, 'Hem rests on the door side.'),
      ),
    ),
    button('Unroll this morning watch', () =>
      act({ action: 'watch' }, 'The loop comes to rest.'),
    ),
    note,
    track,
    live,
  );
  draw('');
  return root;
}
export function petalStage(c: GameController, sound: (id: string) => void) {
  const root = h('section', { class: 'petal-bench' }),
    live = h('p', { role: 'status' }),
    lines = h('p', {}),
    controls = h('div', { class: 'row' });
  const act = room(c, sound, draw);
  for (const e of ['silk', 'garden'] as const)
    controls.append(
      button(
        e === 'silk' ? 'Give Viri both silk wings' : 'Open the garden stage',
        () => act({ action: 'show', ending: e }, finaleLine[e]),
      ),
    );
  function draw(message: string) {
    const s = c.state;
    lines.textContent =
      usableContact(s) && watched(s)
        ? 'Viri lays four slips across the stage and unrolls the two hours below them. “Mine can dance right on cue. The garden gets to keep us waiting. I have a bill big enough for either.”'
        : 'Her coat has three empty pockets. ' +
          (cardsMatch(s, 'day', 1)
            ? 'Both daylight slips are tucked in. '
            : 'Keep both daylight slips at gain one. ') +
          (cardsMatch(s, 'uv', 1)
            ? 'Both UV slips are tucked in. '
            : 'Keep both UV slips at gain one. ') +
          (watched(s)
            ? 'Both morning loops are on the rail.'
            : 'Unroll each arrangement at the ledge.');
    for (const b of controls.querySelectorAll('button'))
      b.disabled = !(usableContact(s) && watched(s));
    live.textContent = message;
  }
  root.append(lines, controls, live);
  draw('');
  return root;
}
export function petalAudience(c: GameController, sound: (id: string) => void) {
  const e = flowerEnding(c.state),
    root = h('section', { class: 'petal-bench' });
  if (!e) return root;
  const live = h('p', { role: 'status' }),
    actor = room(c, sound, (msg) => {
      live.textContent = msg;
    });
  const names =
    e === 'silk'
      ? ['Light Viri’s fingers first', 'Give the understudy one wire']
      : ['Save the first bench for a child', 'Take the back row to the wall'];
  root.append(
    h('p', {}, finaleLine[e]),
    h(
      'div',
      { class: 'row' },
      ...(['first', 'second'] as const).map((choice, i) =>
        button(names[i], () =>
          actor({ action: 'reply', choice }, replyLines[e][choice]),
        ),
      ),
    ),
    live,
  );
  const hands = [
    [
      'gauge',
      'Viri hangs the roof catch over the front row.',
      'Elian wheels the open catch to the wall.',
    ],
    [
      'line',
      'The wooden edge is out of the crop for this show.',
      'The understudy carries the border mask.',
    ],
    [
      'pen',
      'The audience can lift the question mark on Viri’s bill.',
      'The watch times stay fastened to the landing line.',
    ],
    [
      'swatch',
      'Nell’s intact colour still helps the dresser match her sleeve.',
      'The programme leaves a gap between the comparison fabric and the printed ink.',
    ],
    [
      'words',
      'The quoted line comes before the opening bell.',
      'The quoted line comes back in the quiet after the show.',
    ],
    [
      'lines',
      'The ushers give the audience a separate line for heard wings.',
      'The ushers meet from opposite sides and compare their two headings.',
    ],
    [
      'whistle',
      'A child lifts Liri’s silent start signal.',
      'The back row decides when the silent watch ends.',
    ],
  ];
  const contributions = hands.flatMap(([id, first, second]) => {
    const result = c.state.flags['petal-window.tool.' + id];
    return result === 'first' ? [first] : result === 'second' ? [second] : [];
  });
  if (contributions.length)
    root.append(
      h(
        'details',
        {},
        h('summary', {}, 'What the earlier crew brought to this show'),
        h('ul', {}, ...contributions.map((line) => h('li', {}, line))),
      ),
    );
  const prior = c.state.flags['petal-window.reply.' + e];
  if (prior === 'first' || prior === 'second')
    live.textContent = replyLines[e][prior];
  return root;
}
