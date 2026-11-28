import type { GameController } from '../app/controller';
import { landings, riverFlag, type Water } from '../domain/riverNames';
import {
  letterMask,
  listenerNames,
  markDiary,
  markFlag,
  onSlip,
  pieceNames,
  pieces,
  receivers,
  stampedText,
  unpacked,
  type MarkCommand,
  type Listener,
} from '../domain/riverPostmark';
import { h } from './dom';
import { localGuide } from './localGuide';
import { artURL } from './illustrations';
import './riverNames.css';
type Move = MarkCommand extends infer T ? (T extends MarkCommand ? Omit<T, 'type'> : never) : never;
export function postmarkPanel(c: GameController, sound: (key: string) => void, receiving: boolean) {
  const body = h('div'),
    live = h('p', {
      role: 'status',
      'aria-live': 'polite',
      class: 'river-post-feedback',
      'data-work-feedback': '',
    });
  const root = h(
    'section',
    {
      class: 'river-post',
      'data-river-postmark': receiving ? 'quay' : 'oven',
      'data-reading-bench': '',
    },
    body,
    live,
  );
  const guide = localGuide(c, receiving ? 'WORLD-12' : 'WORLD-09', () =>
    receiving ? 'rivernames.postmark' : 'rivernames.placename',
  );
  function action(id: string, text: string, move: Move, pressed?: boolean) {
    return h(
      'button',
      {
        type: 'button',
        'data-mark': id,
        ...(pressed === undefined ? {} : { 'aria-pressed': String(pressed) }),
        onclick: () => {
          const cmd: MarkCommand = { type: 'FoldRiverPostmark', ...move };
          const failure = c.dispatch(cmd).find((e) => e.kind === 'error');
          if (failure) {
            live.textContent = failure.message;
            return;
          }
          sound(move.work === 'send' ? 'sfx.pickup' : 'sfx.page');
          draw();
          root.querySelector<HTMLElement>('[data-mark="' + id + '"]')?.focus({ preventScroll: true });
          live.textContent = markDiary(c.state, cmd).text;
        },
      },
      text,
    );
  }
  const title = (water: Water) => (water === 'ebb' ? 'Low-water slip' : 'High-water slip');
  function draw() {
    body.replaceChildren(
      h('img', { src: artURL('rivernames.skate'), alt: '', class: 'river-post-art' }),
    );
    if (!receiving) {
      const mask = letterMask(c.state);
      body.append(
        h(
          'p',
          {},
          'Pendlow has two little squares of foil. Her apprentice will deliver them at different waters. Which parts of the address can this fold carry?',
        ),
        h(
          'div',
          { class: 'river-post-row' },
          ...pieces.map((piece) =>
            action('press-' + piece, pieceNames[piece], { work: 'press', piece }, onSlip(mask, piece)),
          ),
        ),
      );
      for (const water of landings)
        body.append(h('p', {}, h('strong', {}, title(water) + ' · '), stampedText(mask, water)));
      body.append(action('send', 'Send both foil slips to the other quay', { work: 'send' }));
      for (const water of landings)
        if (riverFlag(c.state, 'heard.' + (water === 'ebb' ? 'emlet' : 'rialla')))
          body.append(
            action(
              'learn-' + water,
              'Walk beside ' + (water === 'ebb' ? 'Emlet' : 'Rialla') + ' and learn the sign',
              { work: 'learn', water },
              markFlag(c.state, 'learned.' + water) === true,
            ),
          );
    } else {
      body.append(
        h(
          'p',
          {},
          'Someone can have the right slip in their hand and still need the person who put the mark there. Pass each slip to a reader.',
        ),
      );
      for (const water of landings)
        body.append(
          h(
            'section',
            {},
            h('h3', {}, title(water)),
            h('p', {}, stampedText(Number(markFlag(c.state, 'sealed') || 0), water)),
            h(
              'div',
              { class: 'river-post-row' },
              ...receivers.map((person) =>
                action('read-' + water + '-' + person, listenerNames[person], {
                  work: 'listen',
                  person,
                  water,
                }),
              ),
            ),
          ),
        );
      const last = markFlag(c.state, 'last.reader') as Listener,
        water = markFlag(c.state, 'last.water') as Water;
      if (
        receivers.includes(last) &&
        landings.includes(water) &&
        Number(markFlag(c.state, 'heard.' + water + '.' + last)) === markFlag(c.state, 'sealed')
      )
        body.append(h('p', {}, unpacked(c.state, water, last).text));
    }
    body.append(guide);
  }
  draw();
  return root;
}
