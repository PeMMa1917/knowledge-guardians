import type { GameController } from '../app/controller';
import { ctx } from '../app/context';
import { playCueTrial } from '../app/cueTrialAudio';
import {
  afterWalk,
  answerCopy,
  barrowPrint,
  boots,
  loads,
  bandNames,
  bedName,
  beds,
  comparisonLine,
  currentRequest,
  dateName,
  dates,
  delivery,
  edition,
  editionFace,
  editionNames,
  footprints,
  orchardFlag,
  publishedReading,
  requestWords,
  requests,
  rootCard,
  rootLabels,
  rootSymbols,
  seasonCount,
  seasonName,
  seasons,
  selectedBand,
  shutterLight,
  type Band,
  type Bed,
  type OrchardCommand,
} from '../domain/walkingOrchard';
import { h } from './dom';
import { localGuide } from './localGuide';
import './walkingOrchard.css';

type Move = OrchardCommand extends infer T ? (T extends OrchardCommand ? Omit<T, 'type'> : never) : never;
const list = <T extends object>(record: T) => Object.keys(record) as (keyof T)[];
const row = (...nodes: HTMLElement[]) => h('div', { class: 'grove-buttons' }, ...nodes);
const p = (text: string) => h('p', {}, text);
const paneNames = {
  poster: 'The two festival posters',
  spade: 'Two planting nights',
  frost: 'Two mornings after frost',
} as const;
const requestsLabel = { canvas: 'The folded canvas', wheels: 'The wheel and handle', ring: 'The chalk ring' };
type Work = 'nursery' | 'shutters' | 'promise' | 'square';
export function grovePanel(c: GameController, sound: (key: string) => void, task: Work, start: Bed = 'kiln') {
  let bed = start,
    tones = 0;
  const live = h('p', {
    role: 'status',
    'aria-live': 'polite',
    class: 'grove-feedback',
    'data-work-feedback': '',
  });
  const area = h('div'),
    shell = h('section', { class: 'walking-orchard', 'data-reading-bench': '' }, area, live);
  const guide = localGuide(c, task === 'square' ? 'WORLD-13' : 'WORLD-06', () =>
    task === 'square'
      ? 'grove.turn'
      : task === 'promise'
        ? 'grove.promise'
        : task === 'shutters'
          ? 'grove.shade'
          : orchardFlag(c.state, 'track.' + bed)
            ? 'grove.springs'
            : 'grove.tracks',
  );
  function focus(key: string) {
    shell.querySelector<HTMLElement>('[data-grove="' + key + '"]')?.focus({ preventScroll: true });
  }
  function btn(key: string, label: string, onClick: () => void, pressed?: boolean) {
    return h(
      'button',
      {
        type: 'button',
        'data-grove': key,
        ...(pressed !== undefined ? { 'aria-pressed': String(pressed) } : {}),
        onclick: onClick,
      },
      label,
    );
  }
  function run(move: Move, key: string) {
    const error = c.dispatch({ type: 'TendWalkingOrchard', ...move }).find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    const s = c.state;
    let line = '';
    const token = ++tones;
    switch (move.act) {
      case 'peek': {
        const marks = rootCard(s, move.season, move.bed, move.date)!;
        line =
          bedName[move.bed] +
          ', ' +
          seasonName[move.season] +
          ', ' +
          dateName[move.date] +
          '. ' +
          marks.map((mark) => (mark === 'planted' ? 'planted' : rootLabels[mark])).join(', ') +
          '.';
        playCueTrial(
          marks.map((mark) => (mark === 'unread' ? 'rest' : mark === 'lost' ? 'work' : 'cue')),
          ctx.settings.sfxVolume,
          () => shell.isConnected && token === tones,
        );
        break;
      }
      case 'load':
        line = loads[move.load] + ' waits over clean chalk.';
        break;
      case 'boot':
        line = boots[move.boot] + '. The old prints stay beside the lane.';
        break;
      case 'roll':
        line = barrowPrint(
          orchardFlag(s, 'barrowLoad') === 'leaf' ? 'leaf' : 'bare',
          orchardFlag(s, 'barrowBoot') === 'tied' ? 'tied' : 'hanging',
        ).line;
        break;
      case 'account':
        line =
          move.story === 'cart'
            ? 'Pella wheels the bare tub past the empty boot peg. “That much I can show them.”'
            : 'Gresa folds a question mark into the harness. Whoever pulled last night still has a story of their own.';
        break;
      case 'track':
        line = footprints[move.bed].voice;
        break;
      case 'join':
        line = comparisonLine(s, move.comparison);
        break;
      case 'hang':
        line = paneNames[move.pane] + ' hangs above the lamp. The lower hook is yours to fill.';
        break;
      case 'request':
        line = requestWords(move.who);
        break;
      case 'shutter':
        line =
          'The shutter for ' +
          bandNames[move.band] +
          ' is ' +
          (selectedBand(s, move.band) ? 'open.' : 'closed.');
        break;
      case 'light': {
        const v = shutterLight(s);
        line =
          'Under the cloth, ' +
          v.count +
          (v.count === 1 ? ' slip matches' : ' slips match') +
          ' this outline. ' +
          (v.small
            ? 'This little group stays behind the cloth.'
            : 'Check what the grower agreed to before carrying a count outside.');
        break;
      }
      case 'reserve':
        line = String(orchardFlag(s, 'draftWindow'));
        break;
      case 'pledge':
        line = delivery[move.route].built + ' is taking shape in the Civic square.';
        break;
      case 'visit':
        line = delivery[edition(s)!][move.who];
        break;
      case 'answer':
        line = afterWalk(edition(s)!, move.route);
        break;
    }
    if (move.act !== 'peek')
      sound(move.act === 'pledge' || move.act === 'reserve' ? 'sfx.page' : 'sfx.click');
    draw();
    focus(key);
    live.textContent = line;
  }
  function button(key: string, label: string, move: Move, pressed?: boolean) {
    return btn(key, label, () => run(move, key), pressed);
  }
  function chalkLane() {
    const s = c.state,
      load = orchardFlag(s, 'barrowLoad') === 'leaf' ? 'leaf' : 'bare',
      boot = orchardFlag(s, 'barrowBoot') === 'tied' ? 'tied' : 'hanging';
    const tray = h(
      'section',
      { class: 'grove-ledger' },
      h('h4', {}, 'Gresa’s chalk lane'),
      p(
        'Pella thinks a tree put a foot down last night. Gresa has a spare cart and two perfectly good bootlaces.',
      ),
      row(...list(loads).map((l) => button('load-' + l, loads[l], { act: 'load', load: l }, load === l))),
      row(...list(boots).map((b) => button('boot-' + b, boots[b], { act: 'boot', boot: b }, boot === b))),
      button('roll', 'Push the tub across fresh chalk', { act: 'roll' }),
    );
    for (const l of list(loads))
      for (const b of list(boots))
        if (orchardFlag(s, 'rolled.' + l + '.' + b))
          tray.append(p(loads[l] + ' / ' + boots[b] + '. ' + barrowPrint(l, b).line));
    tray.append(
      row(
        button('account-cart', 'Show Pella how the cart can do it', { act: 'account', story: 'cart' }),
        button('account-open', 'Leave a place for the missing night caller', {
          act: 'account',
          story: 'open',
        }),
      ),
    );
    return tray;
  }
  function bedBook() {
    const s = c.state;
    const head = h('div', { class: 'grove-heading' }, h('h3', {}, bedName[bed]), p(footprints[bed].line));
    const choose = row(
      ...beds.map((b) =>
        btn(
          'bed-' + b,
          bedName[b],
          () => {
            bed = b;
            draw();
            focus('bed-' + b);
            live.textContent = 'At ' + bedName[b] + '. ' + footprints[b].line;
          },
          b === bed,
        ),
      ),
    );
    const books = h('div', { class: 'grove-books' });
    for (const year of seasons) {
      const book = h('section', { class: 'grove-ledger' }, h('h4', {}, seasonName[year]));
      for (const date of dates) {
        const marks = rootCard(s, year, bed, date);
        const slots = h('div', { class: 'grove-slots', 'aria-label': dateName[date] + ' marks' });
        for (let i = 0; i < 4; i++) {
          const mark = marks?.[i];
          slots.append(
            h(
              'span',
              {
                class: 'grove-slot ' + (mark ?? 'closed'),
                title: mark === undefined ? 'Page closed' : mark === 'planted' ? 'planted' : rootLabels[mark],
              },
              h(
                'b',
                { 'aria-hidden': 'true' },
                mark === undefined ? '▧' : mark === 'planted' ? '✦' : rootSymbols[mark],
              ),
              h(
                'small',
                {},
                mark === undefined
                  ? 'closed'
                  : mark === 'planted'
                    ? 'planted'
                    : mark === 'living'
                      ? 'leaf'
                      : mark === 'lost'
                        ? 'loss'
                        : 'no entry',
              ),
            ),
          );
        }
        book.append(
          button('peek-' + year + '-' + date, (marks ? 'Relight ' : 'Light ') + dateName[date], {
            act: 'peek',
            bed,
            season: year,
            date,
          }),
          slots,
        );
      }
      books.append(book);
    }
    const compare = h(
      'section',
      {},
      h('h4', {}, 'Hold two panes together'),
      row(
        ...list(paneNames).map((t) =>
          button(
            'join-' + t,
            paneNames[t],
            { act: 'join', comparison: t },
            orchardFlag(s, 'joined.' + t) === true,
          ),
        ),
      ),
    );
    const totals = h('div', { class: 'grove-totals' });
    for (const y of seasons) {
      const a = seasonCount(s, y, 'frost');
      totals.append(
        p(
          seasonName[y] +
            ': ' +
            a.yes +
            ' leaf marks · ' +
            a.no +
            ' recorded losses · ' +
            a.absent +
            ' missing entries · ' +
            a.unvisited +
            ' tubs on closed pages.',
        ),
      );
    }
    return [
      choose,
      head,
      button('track', 'Follow the marks at ' + bedName[bed], { act: 'track', bed }),
      books,
      totals,
      compare,
      ...(bed === 'kiln' ? [chalkLane()] : []),
      p('Once you have a reading, take it to the double hook beside the nursery lantern.'),
    ];
  }
  function shutterPlay() {
    const s = c.state,
      who = currentRequest(s),
      view = shutterLight(s),
      lit = orchardFlag(s, 'preview') === true;
    const frame = h(
      'figure',
      { class: 'grove-screen' },
      h('figcaption', {}, 'Inside the counting cloth'),
      h(
        'div',
        { class: 'grove-cutouts', 'aria-hidden': 'true' },
        ...Array.from({ length: 12 }, (_, i) => h('i', { class: lit && i < view.count ? 'lit' : '' })),
      ),
      p(lit ? view.count + ' matching slips. The squares represent a count.' : 'The slips are in shadow.'),
    );
    const toggles = row(
      ...list(bandNames).map((b: Band) =>
        button(
          'band-' + b,
          (selectedBand(s, b) ? 'Close ' : 'Open ') + bandNames[b],
          { act: 'shutter', band: b },
          selectedBand(s, b),
        ),
      ),
    );
    const reference =
      typeof orchardFlag(s, 'draftWindow') === 'string'
        ? c.engine.pack.sources.find((source) => source.id === 'HIS-GROVE-ROTA')
        : undefined;
    return [
      h('h3', {}, 'Who holds the shutter cord?'),
      p(
        'Three growers lend different parts of the same rota. A count can travel with permission. Any of them will let you take the roll out closed.',
      ),
      row(
        ...requests.map((r) =>
          button('request-' + r, requestsLabel[r], { act: 'request', who: r }, r === who),
        ),
      ),
      p(requestWords(who)),
      frame,
      toggles,
      button('light', 'Light the screen under cover', { act: 'light' }),
      h('h4', {}, 'What leaves the room?'),
      p(
        'This nursery keeps groups of one or two under its cloth. A larger group can still carry a detail its grower withheld.',
      ),
      row(
        button('reserve-count', 'Fold a permitted group count', { act: 'reserve', how: 'count' }),
        button('reserve-closed', 'Carry a closed roll', { act: 'reserve', how: 'closed' }),
      ),
      p(
        typeof orchardFlag(s, 'draftWindow') === 'string'
          ? 'On the rolled copy: ' + String(orchardFlag(s, 'draftWindow'))
          : 'The rolled copy is waiting for its fold.',
      ),
      ...(reference
        ? [
            h(
              'a',
              { href: reference.url, target: '_blank', rel: 'noopener noreferrer' },
              'Inside the lantern · How NIST studies disclosure in public records',
            ),
          ]
        : []),
    ];
  }
  function promise() {
    const s = c.state;
    return [
      h('h3', {}, 'One lamp, two hooks'),
      p(
        'At the upper hook Pella hangs what someone saw. Two coins go on the lower one. A roof, an evening of music and a second visit all cost the same.',
      ),
      h('h4', {}, 'Upper hook'),
      row(
        ...list(paneNames).map((t) =>
          button('hang-' + t, paneNames[t], { act: 'hang', pane: t }, orchardFlag(s, 'draftPane') === t),
        ),
      ),
      h('h4', {}, 'Lower hook'),
      row(
        ...list(editionNames).map((r) =>
          button('pledge-' + r, editionNames[r], { act: 'pledge', route: r }, edition(s) === r),
        ),
      ),
      p(
        typeof orchardFlag(s, 'draftWindow') === 'string'
          ? 'The copy going to the square reads: ' + String(orchardFlag(s, 'draftWindow'))
          : 'The folded rota comes from the theatre under the cloth.',
      ),
      ...(edition(s)
        ? [
            p(
              'At Library Dispatch, the wheel mark by the pole leads to ' +
                delivery[edition(s)!].built.toLowerCase() +
                '.',
            ),
          ]
        : []),
    ];
  }
  function square() {
    const s = c.state,
      r = edition(s);
    if (!r) return [p('The square is waiting for its first evening.')];
    const note = orchardFlag(s, 'answer');
    return [
      h('h3', {}, delivery[r].built),
      p(publishedReading(s)),
      p(editionFace(s)),
      row(
        button(
          'walk-gresa',
          'Take the turn with Gresa',
          { act: 'visit', who: 'gresa' },
          orchardFlag(s, 'visit.gresa') === r,
        ),
        button(
          'walk-pella',
          'Take the turn with Pella',
          { act: 'visit', who: 'pella' },
          orchardFlag(s, 'visit.pella') === r,
        ),
      ),
      ...(['gresa', 'pella'] as const)
        .filter((w) => orchardFlag(s, 'visit.' + w) === r)
        .map((w) => p(delivery[r][w])),
      h('h4', {}, 'Who takes the next turn?'),
      row(
        ...list(answerCopy).map((k) =>
          button('answer-' + k, answerCopy[k].label, { act: 'answer', route: k }, note === k),
        ),
      ),
      ...(note === 'invite' || note === 'move' || note === 'keep' ? [p(afterWalk(r, note))] : []),
    ];
  }
  function draw() {
    area.replaceChildren(
      ...(task === 'square'
        ? square()
        : task === 'shutters'
          ? shutterPlay()
          : task === 'promise'
            ? promise()
            : bedBook()),
    );
  }
  draw();
  shell.append(guide);
  return shell;
}
