import type { GameController } from '../app/controller';
import {
  carriedCase,
  carriedMark,
  courierFlag,
  lastCourierOpening,
  type CourierCommand,
  type Landing,
} from '../domain/courierLift';
import { h } from './dom';
import { artURL } from './illustrations';

export function courierLiftPanel(
  c: GameController,
  landing: Landing | 'lift',
  sound: (id: string) => void,
) {
  const root = h('section', { class: 'courier-panel' });
  const scene = h('p', {}),
    frame = h('div', { class: 'courier-frame' }),
    marks = h('div', { class: 'courier-marks' }),
    buttons = h('div', { class: 'row' }),
    result = h('p', { role: 'status' }),
    memory = h('p', { class: 'fine' });
  root.append(scene, frame, marks, buttons, result, memory);
  function draw() {
    const focused = root.contains(document.activeElement)
      ? document.activeElement?.getAttribute('data-lift-control')
      : null;
    const s = c.state,
      r = carriedCase(s);
    marks.replaceChildren();
    buttons.replaceChildren();
    frame.replaceChildren();
    if (!r) {
      result.textContent = '';
      memory.textContent = '';
      scene.textContent =
        'A string runs from the collection room to two distant bells. A little cradle hangs from the string. The inscription asks for the object that will travel with you.';
      return;
    }
    const first = landing === 'lift';
    const at = s.flags[courierFlag(r, 'tab')];
    const current = first
      ? typeof at === 'number'
        ? r.handles[at]
        : undefined
      : carriedMark(s, r, landing);
    const go = (cmd: CourierCommand) => {
      const fail = c.dispatch(cmd).find((e) => e.kind === 'error');
      if (fail?.kind === 'error') {
        result.textContent = fail.message;
        return;
      }
      sound(cmd.act === 'tip' ? 'sfx.page' : 'sfx.sparkle');
      draw();
      if (cmd.act === 'tip') result.textContent = r.handles[cmd.handle].mark;
      else if (cmd.act === 'send')
        result.textContent =
          cmd.landing === 'market'
            ? 'The market bell rings once. Carry the object to Bew in Lantern Square.'
            : 'A handbell answers. Take the object to Pella in the theatre foyer.';
      else
        result.textContent =
          cmd.opening === 'object'
            ? cmd.landing === 'market'
              ? r.west
              : r.east
            : carriedMark(c.state, r, cmd.landing)!.callback;
    };
    const button = (label: string, cmd: CourierCommand) =>
      h(
        'button',
        { type: 'button', 'data-lift-control': label, onclick: () => go(cmd) },
        label,
      );
    scene.textContent = first
      ? r.scene
      : landing === 'market'
        ? 'Bew opens his receipt book with his thumb over the amount due. “Nemi paid three carriage fees on an empty crate last winter. My own sister. Let me see what came with you.”'
        : 'Pella can project a whisper across the foyer. “I read the part for the maker last week. A child asked if I had ever met them. I dropped my bell.”';
    const exhibit = c.pack.exhibits.find((e) => e.id === r.exhibit);
    frame.append(
      h('img', {
        src: artURL('large.courier.' + r.shape),
        alt: exhibit?.altText ?? '',
      }),
      h('p', {}, r.title),
    );
    const family = s.flags['courier.family'];
    if (!first && (family === 'bell' || family === 'receipt'))
      frame.append(
        h(
          'p',
          {},
          landing === 'market'
            ? family === 'bell'
              ? 'Two cords run above Bew’s book. A silver ring lets him finish weighing the crate before he calls the cart.'
              : 'Nemi has initialled the three fee lines. Bew still looks through the hatch when a bell rings.'
            : family === 'bell'
              ? 'Pella waits for Nemi’s silver bell. Someone under the stage has finally let her sister finish the line.'
              : 'Pella holds a cue card in one hand and Nemi’s empty fee envelope in the other. On her palm the whole company comes in.',
        ),
      );
    if (current) frame.append(h('p', {}, current.name + ' · ' + current.mark));
    if (first) {
      for (const [i, m] of r.handles.entries()) {
        const b = button(m.name, {
          type: 'WorkCourierLift',
          act: 'tip',
          handle: i,
        });
        b.setAttribute('aria-pressed', String(at === i));
        marks.append(b);
      }
      const ready =
        r.handles.filter(
          (_, i) => s.flags[courierFlag(r, 'seen.' + i)] === true,
        ).length >= 2;
      for (const stop of ['market', 'theatre'] as const) {
        const b = button(
          stop === 'market'
            ? 'Address the market counter'
            : 'Address the theatre door',
          { type: 'WorkCourierLift', act: 'send', landing: stop },
        );
        b.disabled = !ready;
        buttons.append(b);
      }
      const found = (['market', 'theatre'] as const).flatMap((stop) => {
        const touched = carriedMark(s, r, stop);
        if (!touched) return [];
        const reply = lastCourierOpening(s, r, stop);
        return [
          (stop === 'market' ? 'Market' : 'Theatre') +
            ' · ' +
            touched.name +
            (reply
              ? ' · a signed receipt is back.'
              : ' · waiting for delivery.'),
        ];
      });
      memory.textContent =
        found.join(' ') ||
        'Tip the cradle two ways. The mark you leave facing up travels on the address.';
    } else if (current) {
      buttons.append(
        button(
          landing === 'market'
            ? 'Open the crate for the clerk'
            : 'Put the object in the light first',
          {
            type: 'WorkCourierLift',
            act: 'receive',
            landing,
            opening: 'object',
          },
        ),
        button(
          landing === 'market'
            ? 'Let the carrier speak first'
            : 'Give the first line to the witness',
          {
            type: 'WorkCourierLift',
            act: 'receive',
            landing,
            opening: 'person',
          },
        ),
      );
      const opening = lastCourierOpening(s, r, landing);
      memory.textContent = opening
        ? (opening === 'object'
            ? landing === 'market'
              ? r.west
              : r.east
            : current.callback) +
          ' ' +
          r.limit
        : 'The rope carried an address. The parcel has only now reached its reader.';
    }
    if (focused)
      [...root.querySelectorAll<HTMLButtonElement>('button')]
        .find((b) => b.dataset.liftControl === focused)
        ?.focus({ preventScroll: true });
  }
  draw();
  return root;
}
