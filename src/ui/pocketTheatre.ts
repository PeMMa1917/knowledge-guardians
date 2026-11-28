import type { GameController } from '../app/controller';
import {
  edition,
  fittedPane,
  hasBegun,
  incomingSheet,
  panes,
  paneSeen,
  returnReceipt,
  theatreKey,
  theatreMap,
  theatreStories,
  theatreWorld,
  type TheatreCommand,
  type TheatreStory,
} from '../domain/pocketTheatre';
import { h } from './dom';
import { artURL } from './illustrations';
import { localGuide } from './localGuide';
import { theatreProps } from './pocketTheatreArt';
import './pocketTheatre.css';

type Move = TheatreCommand extends infer C
  ? C extends TheatreCommand
    ? Omit<C, 'type' | 'story'>
    : never
  : never;
export function pocketTheatrePanel(
  c: GameController,
  sound: (key: string) => void,
) {
  let story: TheatreStory | undefined;
  const body = h('div', { class: 'pocket-interior' }),
    shell = h('div', { class: 'pocket-theatre', 'data-reading-bench': '' });
  const feedback = h('p', {
    class: 'pocket-feedback',
    role: 'status',
    'data-work-feedback': '',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });
  const local = theatreStories.filter((s) => theatreMap(s) === c.state.mapId);
  const sides = [0, 1] as const;
  const image = (art: string) =>
    h('img', { src: artURL(art), alt: '', draggable: 'false' });
  const row = (...items: HTMLElement[]) =>
    h('div', { class: 'pocket-row' }, ...items);
  function button(
    id: string,
    text: string,
    act: () => void,
    pressed?: boolean,
  ) {
    return h(
      'button',
      {
        type: 'button',
        'data-pocket': id,
        'aria-pressed': pressed === undefined ? undefined : String(pressed),
        onclick: act,
      },
      text,
    );
  }
  function focus(id: string) {
    const target =
      body.querySelector<HTMLElement>('[data-pocket="' + id + '"]') ??
      body.querySelector<HTMLElement>('h3,button');
    target?.focus({ preventScroll: true });
  }
  function act(move: Move, id: string, words: string) {
    if (!story) return;
    const error = c
      .dispatch({ ...move, type: 'WorkPocketTheatre', story: story.id })
      .find((e) => e.kind === 'error');
    if (error?.kind === 'error') {
      feedback.textContent = error.message;
      return;
    }
    sound(move.act === 'fit' ? 'sfx.click' : 'sfx.page');
    draw();
    focus(id);
    feedback.textContent =
      move.act === 'fit'
        ? story.readings[fittedPane(c.state, story.id)]
        : words;
  }
  function draw() {
    if (!story) {
      body.replaceChildren(
        h(
          'p',
          { class: 'pocket-lid' },
          image('pocket.case'),
          'The suitcase opens into a tiny stage. Two folded streets sit in its lid. A letter pocket runs between this room and another town.',
        ),
        row(
          ...local.map((s) =>
            button(s.id, s.title, () => {
              story = s;
              act({ act: 'open' }, 'story-title', '');
            }),
          ),
        ),
      );
      return;
    }
    const item = story,
      s = c.state,
      pane = fittedPane(s, item.id),
      sent = edition(s, item.id),
      begun = hasBegun(s, item.id);
    const list: HTMLElement[] = [
      button('back', 'Fold up this street', () => {
        story = undefined;
        feedback.textContent = '';
        draw();
        focus(item.id);
      }),
      h('h3', { tabindex: '-1', 'data-pocket': 'story-title' }, item.title),
      h('p', {}, item.opening),
    ];
    if (!begun) {
      list.push(
        h(
          'fieldset',
          {},
          h('legend', {}, 'Try a first direction'),
          row(
            ...sides.map((i) =>
              button('first-' + i, item.editions[i].label, () => {
                act(
                  { act: 'rehearse', side: i },
                  'stage',
                  item.editions[i].immediate,
                );
              }),
            ),
            button('first-wait', 'Watch before taking a side', () =>
              act(
                { act: 'rehearse', side: 'wait' },
                'stage',
                'I’ll see who can use each ending.',
              ),
            ),
          ),
        ),
      );
    } else {
      const levers = h('div', { class: 'pocket-rigging' });
      for (const lever of sides) {
        const pos = lever === 0 ? pane & 1 : pane >> 1;
        const controls = item.controls[lever];
        levers.append(
          h(
            'fieldset',
            {},
            h(
              'legend',
              {},
              lever === 0 ? 'The first slide' : 'The cross-slide',
            ),
            row(
              ...sides.map((side) => {
                const id = 'lever-' + lever + '-' + side;
                return button(
                  id,
                  controls[side],
                  () => act({ act: 'fit', lever, side }, id, ''),
                  pos === side,
                );
              }),
            ),
          ),
        );
      }
      const read = panes.filter((p) => paneSeen(s, item.id, p));
      list.push(
        h(
          'div',
          { class: 'pocket-stage', 'data-pane': String(pane) },
          image(theatreProps[item.id]),
          h(
            'p',
            { tabindex: '-1', 'data-pocket': 'stage' },
            item.readings[pane],
          ),
        ),
        levers,
      );
      if (read.length >= 2) {
        const prior = h(
          'details',
          {},
          h('summary', {}, 'Earlier views from this street'),
        );
        for (const p of read)
          prior.append(
            h(
              'p',
              {},
              h(
                'strong',
                {},
                item.controls[0][p & 1] + ' · ' + item.controls[1][p >> 1],
              ),
              ' ',
              item.readings[p],
            ),
          );
        list.push(prior);
      }
      list.push(
        h(
          'fieldset',
          {},
          h(
            'legend',
            {},
            sent === undefined ? 'Send a public ending' : 'Restage the ending',
          ),
          row(
            ...sides.map((i) => {
              const id = 'send-' + i;
              return button(
                id,
                item.editions[i].label,
                () =>
                  act({ act: 'send', side: i }, id, item.editions[i].immediate),
                sent === i,
              );
            }),
          ),
        ),
      );
    }
    if (sent !== undefined)
      list.push(
        h(
          'p',
          { class: 'pocket-letter' },
          image('pocket.letter'),
          item.editions[sent].immediate +
            ' A working sheet is waiting in “' +
            theatreStories.find((p) => p.id === item.peer)!.title +
            '”.',
        ),
      );
    const incoming = incomingSheet(s, item);
    if (incoming) {
      list.push(
        h(
          'section',
          {},
          h('h4', {}, 'A working sheet from “' + incoming.from.title + '”'),
          button('receive', incoming.label, () =>
            act({ act: 'receive' }, 'receive', incoming.reading),
          ),
        ),
      );
      if (s.flags[theatreKey(item.id, 'tried.' + incoming.side)] === true)
        list.push(h('p', { class: 'pocket-receipt' }, incoming.reading));
    }
    const returned = returnReceipt(s, item);
    if (returned) {
      list.push(
        button(
          'return',
          'Open the answer from “' + returned.peering + '”',
          () =>
            act(
              { act: 'return' },
              'return',
              item.editions[returned.side].return,
            ),
        ),
      );
      if (s.flags[theatreKey(item.id, 'answered.' + returned.side)] === true)
        list.push(
          h(
            'p',
            { class: 'pocket-receipt' },
            returned.reading + ' ' + item.editions[returned.side].return,
          ),
        );
    }
    if (sent !== undefined && panes.every((p) => paneSeen(s, item.id, p))) {
      const used = s.flags[theatreKey(item.id, 'margin')] === true;
      list.push(
        button('margin', 'Read Lumen’s margin', () =>
          act({ act: 'margin' }, 'margin', item.margin),
        ),
      );
      if (used) {
        const source = c.pack.sources.find(
          (src) => src.id === 'POCKET-READING-' + item.source.toUpperCase(),
        );
        list.push(
          h(
            'p',
            {},
            item.margin,
            source
              ? h(
                  'a',
                  {
                    href: source.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  },
                  ' ' + source.title,
                )
              : null,
          ),
        );
      }
    }
    list.push(
      localGuide(c, theatreWorld(item), () =>
        theatreKey(
          item.id,
          sent === undefined ? 'compare' : returned ? 'return' : 'receive',
        ),
      ),
    );
    body.replaceChildren(...list);
  }
  shell.append(feedback, body);
  draw();
  return shell;
}
