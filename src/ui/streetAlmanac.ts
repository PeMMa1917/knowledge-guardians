import type { GameController } from '../app/controller';
import {
  barLength,
  barWords,
  calendarCases,
  cueFlag,
  cueNames,
  cuePositions,
  equippedCalendar,
  faceCaption,
  lastEdition,
  workingBar,
  type AlmanacCommand,
  type BellLane,
  type CalendarFace,
} from '../domain/streetAlmanac';
import { artURL } from './illustrations';
import { h } from './dom';

type Move = AlmanacCommand extends infer C ? (C extends AlmanacCommand ? Omit<C, 'type'> : never) : never;
const faces: CalendarFace[] = ['first', 'second', 'silence'];
const lanes: BellLane[] = ['stair', 'window'];
const listener = (lane: BellLane) => (lane === 'stair' ? 'Rix on the stair' : 'Jori at the window');
function reading(bar: string, lane: BellLane) {
  const beats = cuePositions(bar, lane);
  return beats.length
    ? listener(lane) + ' receives a cue on ' + beats.join(', ') + '.'
    : listener(lane) + ' waits through all six beats without a cue.';
}
export function streetAlmanacPanel(c: GameController, sound: (key: string) => void, evening: boolean) {
  const root = h('section', { class: 'street-almanac' });
  const content = h('div', { class: 'street-content' }),
    live = h('p', { role: 'status' }),
    playhead = h('p', { 'aria-hidden': 'true', class: 'street-playhead' });
  const notation = h('ol', { class: 'street-notation', 'aria-label': 'Six-beat score' });
  root.append(content, playhead, live);
  let timer: ReturnType<typeof setTimeout> | undefined;
  function stop() {
    clearTimeout(timer);
    timer = undefined;
    playhead.textContent = '';
    notation.querySelector('[aria-current]')?.removeAttribute('aria-current');
  }
  function preview(bar: string) {
    stop();
    live.textContent = 'Playing the score. ' + barWords(bar) + '.';
    function beat(i: number) {
      if (!root.isConnected || i === barLength || document.hidden) {
        stop();
        return;
      }
      notation.querySelector('[aria-current]')?.removeAttribute('aria-current');
      notation.children[i]?.setAttribute('aria-current', 'step');
      const cue = Number(bar[i]);
      playhead.textContent = 'Beat ' + (i + 1) + ' · ' + cueNames[cue];
      if (cue & 1) sound('sfx.step');
      timer = setTimeout(() => beat(i + 1), 850);
    }
    beat(0);
  }
  function draw() {
    stop();
    const active = root.contains(document.activeElement)
      ? document.activeElement?.getAttribute('data-street-key')
      : null;
    const s = c.state,
      cabinet = equippedCalendar(s);
    content.replaceChildren();
    if (!cabinet) {
      content.append(
        h(
          'p',
          {},
          'Four invitations lie unfinished. Rix left a corner of each envelope unsealed so you can see what belongs inside.',
        ),
        h(
          'ul',
          {},
          calendarCases.map((r) => h('li', {}, r.title)),
        ),
        h(
          'p',
          {},
          'Take one of these objects from your collection, equip it in your satchel, and bring it to the six-beat strip.',
        ),
      );
      return;
    }
    const r = cabinet,
      edition = lastEdition(s, r),
      bar = workingBar(s, r),
      thisBar = evening ? edition?.bar : bar;
    const move = (m: Move) => {
      const failed = c.dispatch({ type: 'ArrangeStreetAlmanac', ...m }).some((e) => e.kind === 'error');
      if (failed) {
        live.textContent = '';
        return;
      }
      if (m.act === 'turn') sound('sfx.page');
      draw();
      switch (m.act) {
        case 'turn':
          live.textContent = faceCaption(r, m.face);
          break;
        case 'place':
          live.textContent = 'Beat ' + (m.beat + 1) + ' now holds ' + cueNames[m.cue] + '.';
          break;
        case 'rehearse':
        case 'listen':
          live.textContent = reading(thisBar!, m.lane);
          break;
        case 'send':
          live.textContent =
            'An invitation slides under the reading hall door. Carry the object to the striped awning in the City of Copies.';
          break;
        case 'perform':
          live.textContent =
            m.entrance === 'window'
              ? 'Jori turns the dancer towards the street. ' + r.reply
              : 'Rix steps off the stair and the listeners move with him. ' + r.reply;
          break;
      }
    };
    const button = (label: string, id: string, action: () => void) =>
      h('button', { type: 'button', 'data-street-key': id, onclick: action }, label);
    content.append(
      h('figure', {}, h('img', { src: artURL('large.street.' + r.id), alt: r.alt }), h('figcaption', {}, r.title)),
    );
    if (!thisBar) {
      content.append(
        h('p', {}, 'The invitation has not reached the window. Send it from the musicians’ room first.'),
      );
      return;
    }
    if (!evening) {
      const selected = cueFlag(s, r, 'face') as CalendarFace | undefined;
      const leaves = h('div', { class: 'row' });
      faces.forEach((f) => {
        const b = button(f === 'silence' ? 'The undated leaf' : r[f].tab, 'leaf-' + f, () =>
          move({ act: 'turn', face: f }),
        );
        b.setAttribute('aria-pressed', String(f === selected));
        leaves.append(b);
      });
      content.append(
        h(
          'p',
          {},
          'Choose the line that goes on the invitation. Each leaf opens a different part of the object’s history.',
        ),
        leaves,
        h('p', {}, selected ? faceCaption(r, selected) : 'Three folded leaves rest on the soundboard.'),
      );
      const strip = h('div', { class: 'street-score' });
      Array.from(bar).forEach((value, i) => {
        const id = 'street-score-beat-' + i;
        const select = h(
          'select',
          {
            id,
            'data-street-key': 'beat-' + i,
            onchange: () => move({ act: 'place', beat: i, cue: Number(select.value) }),
          },
          cueNames.map((name, n) => h('option', { value: n }, name)),
        );
        select.value = value;
        strip.append(h('div', {}, h('label', { for: id }, 'Beat ' + (i + 1)), select));
      });
      content.append(
        h(
          'p',
          {},
          'The stair carries a wooden knock. Across the glass, Jori sees the lantern. Give either, both, or neither a turn.',
        ),
        strip,
      );
    } else {
      content.append(
        h(
          'p',
          {},
          'Rix is wedged into the stairwell. Jori has hung a blue dancer inside the window. Each is waiting for a cue.',
        ),
        h('blockquote', {}, faceCaption(r, edition!.face)),
        h('p', {}, barWords(thisBar)),
      );
    }
    notation.replaceChildren(
      ...Array.from(thisBar, (code, i) => {
        const val = Number(code);
        return h(
          'li',
          { 'aria-label': 'Beat ' + (i + 1) + ', ' + cueNames[val] },
          h('span', { 'aria-hidden': 'true', class: val & 2 ? 'street-lamp lit' : 'street-lamp' }),
          h('span', { 'aria-hidden': 'true', class: val & 1 ? 'street-drum struck' : 'street-drum' }),
          h('small', { 'aria-hidden': 'true' }, String(i + 1)),
        );
      }),
    );
    content.append(notation);
    const transport = h(
      'div',
      { class: 'row' },
      button('Play the six beats', 'play', () => preview(thisBar)),
      button('Stop playback', 'stop', () => {
        stop();
        live.textContent = 'The music has stopped.';
      }),
    );
    const voices = h('div', { class: 'row' });
    for (const lane of lanes) {
      const heard = evening ? !!cueFlag(s, r, 'heard.' + lane) : cueFlag(s, r, lane + 'Tried') === bar;
      const b = button('Stand with ' + listener(lane), 'read-' + lane, () =>
        move({ act: evening ? 'rehearse' : 'listen', lane }),
      );
      voices.append(b);
      if (heard) voices.append(h('span', {}, reading(thisBar, lane)));
    }
    content.append(transport, voices);
    if (!evening) {
      const ready =
        faces.every((f) => cueFlag(s, r, 'seen.' + f)) && lanes.every((l) => cueFlag(s, r, l + 'Tried') === bar);
      const send = button('Send this invitation', 'send', () => move({ act: 'send' }));
      send.disabled = !ready;
      content.append(send);
      if (!ready)
        content.append(
          h('p', { class: 'fine' }, 'Open each leaf and try the current score from both places to send it.'),
        );
      if (edition)
        content.append(
          h(
            'p',
            {},
            'At the reading hall now · ' + faceCaption(r, edition.face) + ' ' + barWords(edition.bar) + '.',
          ),
        );
    } else {
      const row = h('div', { class: 'row' }),
        ready = lanes.every((l) => cueFlag(s, r, 'heard.' + l));
      for (const entrance of ['window', 'procession'] as const) {
        const b = button(
          entrance === 'window' ? 'Open Jori’s blind first' : 'Start with the street procession',
          entrance,
          () => move({ act: 'perform', entrance }),
        );
        b.disabled = !ready;
        row.append(b);
      }
      content.append(row);
      if (!ready) content.append(h('p', { class: 'fine' }, 'Visit both listeners to call the entrance.'));
      const show = cueFlag(s, r, 'show');
      if (show)
        content.append(
          h(
            'p',
            {},
            show === 'window'
              ? 'Last performance · The first movement came from an upstairs window.'
              : 'Last performance · A child at the curb took the drummer’s first step.',
          ),
        );
    }
    if (active)
      Array.from(root.querySelectorAll<HTMLElement>('[data-street-key]'))
        .find((e) => e.dataset.streetKey === active)
        ?.focus();
  }
  draw();
  return root;
}
