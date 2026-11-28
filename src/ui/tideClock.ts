import type { GameController } from '../app/controller';
import { ctx } from '../app/context';
import { playCueTrial } from '../app/cueTrialAudio';
import {
  allStamped,
  cards,
  cardNames,
  clockPosition,
  furniture,
  fittingNames,
  impression,
  mothOrder,
  planFor,
  plansRead,
  proposals,
  promises,
  tracing,
  compareLeaves,
  quayNames,
  quayReading,
  quays,
  signedFloorPlan,
  tideFlag,
  turns,
  type Fitting,
  type TideCommand,
} from '../domain/tideClock';
import { h } from './dom';
import { localGuide } from './localGuide';
import './tideClock.css';
type Move = TideCommand extends infer T ? (T extends TideCommand ? Omit<T, 'type'> : never) : never;
const keys = <T extends object>(value: T) => Object.keys(value) as (keyof T)[];
const creatures = ['◢', '▰', '▴'] as const;
const icons: Record<Fitting, string> = { horn: '◀', bench: '▰', board: '▤' };
const row = (...e: HTMLElement[]) => h('div', { class: 'quarter-controls' }, ...e);
const para = (text: string) => h('p', {}, text);
const section = (title: string, ...e: HTMLElement[]) => h('section', {}, h('h3', {}, title), ...e);
export function quarterPanel(c: GameController, sound: (id: string) => void, dock: boolean) {
  const content = h('div'),
    live = h('p', {
      role: 'status',
      'aria-live': 'polite',
      class: 'quarter-feedback',
      'data-work-feedback': '',
    });
  const root = h('section', { class: 'quarter-clock', 'data-reading-bench': '' }, content, live);
  let panel = 'pier',
    generation = 0;
  const guide = localGuide(c, 'WORLD-15', () =>
    dock
      ? 'quarter.after'
      : !tideFlag(c.state, 'remembered')
        ? 'quarter.watch'
        : !tideFlag(c.state, 'automatic')
          ? 'quarter.moth'
          : 'quarter.plan',
  );
  function run(move: Move, key: string) {
    const before = clockPosition(c.state);
    const error = c.dispatch({ type: 'WorkTideClock', ...move }).find((e) => e.kind === 'error');
    if (error) {
      if (live.textContent !== error.message) live.textContent = error.message;
      return;
    }
    const s = c.state,
      pos = clockPosition(s);
    let note = '';
    const token = ++generation;
    if (move.act === 'listen' || move.act === 'stamp' || move.act === 'wait') {
      const quiet = quayReading(pos.phase, pos.quay).people.length === 0;
      playCueTrial(
        quiet ? ['work', 'rest', 'rest', 'rest'] : ['cue', 'rest', 'work', 'cue'],
        ctx.settings.sfxVolume,
        () => root.isConnected && token === generation,
      );
    } else sound(move.act === 'issue' ? 'sfx.page' : 'sfx.click');
    switch (move.act) {
      case 'go':
        note = 'You reached ' + quayNames[pos.quay] + '. ' + turns[pos.phase].sound;
        break;
      case 'wait':
        note =
          pos.phase === 0
            ? 'First lantern again. The clock took back the hour. Your stamped card is still here.'
            : turns[pos.phase].name + '. ' + turns[pos.phase].sound;
        break;
      case 'listen':
        note = quayReading(pos.phase, pos.quay).line;
        break;
      case 'stamp': {
        const view = impression(s)!;
        note = 'Stamped ' + quayNames[view.quay] + ' at ' + turns[view.phase].name + '.';
        break;
      }
      case 'step':
        note =
          'The moth did “' +
          cardNames[mothOrder(s)[before.cursor]] +
          '.” ' +
          (tideFlag(s, 'mothNote') === 'blank' && mothOrder(s)[before.cursor] === 'stamp'
            ? 'Its stamp fell on an empty pad.'
            : turns[pos.phase].name + ' now holds.');
        break;
      case 'round':
        note =
          'Six turns later, the card holds ' + allStamped(s).length + ' different place-and-time prints.';
        break;
      case 'reverse':
        note = tideFlag(s, 'reverse')
          ? 'The moth walks against the ferry round.'
          : 'The moth walks with the ferry round.';
        break;
      case 'reorder':
        note =
          'The strip now reads ' +
          mothOrder(s)
            .map((k) => cardNames[k])
            .join(', then ') +
          '.';
        break;
      case 'place':
        note =
          'You moved the ' +
          fittingNames[move.fixture] +
          ' to ' +
          quayNames[move.quay] +
          '. Their two fittings traded places.';
        break;
      case 'proposal':
        note =
          move.team === 'crew'
            ? 'Siv has chalked a plan for the break.'
            : 'Joss has chalked a plan for the last tying-up.';
        break;
      case 'try':
      case 'read':
        note = plansRead(planFor(s, move.act === 'read'))[move.team];
        break;
      case 'trace':
        note = 'Matel holds the corners while you rub the ' + move.leaf + ' sheet.';
        break;
      case 'compare':
        note = compareLeaves(s, move.promise);
        break;
      case 'issue':
        note = 'The deckhand and the pilot have walked this version. Their fittings are waiting on the dock.';
        break;
    }
    draw();
    const restored =
      root.querySelector<HTMLElement>('[data-quarter="' + key + '"]') ??
      (move.act === 'reorder' ? root.querySelector<HTMLElement>('[data-foot="' + move.card + '"]') : null);
    restored?.focus({ preventScroll: true });
    live.textContent = note;
  }
  function button(key: string, label: string, move: Move, pressed?: boolean) {
    return h(
      'button',
      {
        type: 'button',
        'data-quarter': key,
        ...(pressed !== undefined ? { 'aria-pressed': String(pressed) } : {}),
        onclick: () => run(move, key),
      },
      label,
    );
  }
  function diagram(issued = false) {
    const s = c.state,
      pos = clockPosition(s),
      order = planFor(s, issued);
    const figure = h(
      'figure',
      { class: 'quarter-map' },
      h(
        'figcaption',
        {},
        issued ? 'The signed plan on the dock' : turns[pos.phase].name + ' · watch ' + (pos.lap + 1),
      ),
    );
    figure.style.setProperty('--tide-light', turns[pos.phase].colour);
    const piers = h('div', { class: 'quarter-piers' });
    quays.forEach((q, i) => {
      const people = quayReading(pos.phase, q).people;
      const cell = h(
        'div',
        { class: 'quarter-quay' + (pos.quay === q && !issued ? ' here' : '') },
        h('b', {}, quayNames[q]),
        h('span', { class: 'quarter-art', 'aria-hidden': true }, creatures[i] + ' ' + icons[order[i]]),
        h('span', {}, fittingNames[order[i]]),
      );
      if (!issued)
        cell.append(
          h(
            'small',
            {},
            q === pos.quay
              ? 'You are here. ' + (people.length ? 'Movement on the boards.' : 'The boards are quiet.')
              : '',
          ),
        );
      piers.append(cell);
    });
    figure.append(piers);
    return figure;
  }
  function pier() {
    const s = c.state,
      pos = clockPosition(s),
      view = impression(s);
    return section(
      'The clock that gives a quarter back',
      para(
        'On the sixth turn the hand slips. The loose hearing pad washes clean. The marks you stamp on brass stay with you.',
      ),
      diagram(),
      row(
        ...quays.map((q) =>
          button('go-' + q, 'Walk to ' + quayNames[q], { act: 'go', quay: q }, pos.quay === q),
        ),
      ),
      para(turns[pos.phase].sound),
      row(
        button('listen', 'Open the listening tube', { act: 'listen' }),
        button('stamp', 'Stamp what the tube heard', { act: 'stamp' }),
        button('wait', 'Wait for the next tide mark', { act: 'wait' }),
      ),
      para(
        view
          ? 'On the pad: ' +
              quayNames[view.quay] +
              ', ' +
              turns[view.phase].name +
              '. ' +
              quayReading(view.phase, view.quay).line
          : 'The ear is open. The pad has no hearing on it yet.',
      ),
    );
  }
  function workshop() {
    const s = c.state,
      now = clockPosition(s),
      order = mothOrder(s);
    const strip = h('ol', {
      class: 'quarter-program',
      'aria-label': 'Moth instruction order',
    });
    order.forEach((card, i) => {
      const li = h(
        'li',
        { 'data-foot': card, tabindex: -1 },
        h('strong', {}, cardNames[card]),
        i === now.cursor ? h('span', { class: 'quarter-next' }, ' · next') : '',
      );
      const controls = row();
      if (i > 0)
        controls.append(
          button('early-' + card, 'Move ' + cardNames[card] + ' earlier', {
            act: 'reorder',
            card,
            direction: 'earlier',
          }),
        );
      if (i < cards.length - 1)
        controls.append(
          button('late-' + card, 'Move ' + cardNames[card] + ' later', {
            act: 'reorder',
            card,
            direction: 'later',
          }),
        );
      li.append(controls);
      strip.append(li);
    });
    return section(
      'The moth’s three feet',
      para(
        'Tavi drew one instruction on each copper foot. It reads them in order. The tide turns when it has used all three. A stamp keeps the place and time of its last hearing, even if the moth walks away first.',
      ),
      diagram(),
      strip,
      row(
        button(
          'reverse',
          tideFlag(s, 'reverse') ? 'Turn to walk with the ferry' : 'Turn to walk against the ferry',
          { act: 'reverse' },
        ),
        button('step', 'Try the next foot', { act: 'step' }),
        button('round', 'Wind the moth for six turns', { act: 'round' }),
      ),
      para('You can watch a single foot, change the strip, or collect the record of an entire watch.'),
    );
  }
  function record() {
    const list = h('ul'),
      notes = allStamped(c.state);
    for (const v of notes)
      list.append(
        h(
          'li',
          {},
          h('b', {}, quayNames[v.quay] + ' · ' + turns[v.phase].name + '. '),
          quayReading(v.phase, v.quay).line,
        ),
      );
    return section(
      'Stamped brass',
      para(
        notes.length
          ? notes.length + ' different place-and-time prints.'
          : 'The card is bare. A silent pier can give you a print, too.',
      ),
      list,
    );
  }
  function planning() {
    const s = c.state,
      order = planFor(s);
    const layout = section(
      'The chalked pier',
      para(
        'Siv has one break. Joss has one mooring to hold. Each has given you a different plan. You can use either, or swap fittings and walk the result with them.',
      ),
      diagram(),
      row(
        ...keys(proposals).map((team) =>
          button('proposal-' + team, team === 'crew' ? 'Lay out Siv’s plan' : 'Lay out Joss’s plan', {
            act: 'proposal',
            team,
          }),
        ),
      ),
    );
    for (const fixture of furniture)
      layout.append(
        h(
          'fieldset',
          {},
          h('legend', {}, 'Move the ' + fittingNames[fixture]),
          row(
            ...quays.map((q, i) =>
              button(
                'set-' + fixture + '-' + q,
                quayNames[q],
                { act: 'place', fixture, quay: q },
                order[i] === fixture,
              ),
            ),
          ),
        ),
      );
    layout.append(
      row(
        button('try-crew', 'Walk it at break with Siv', {
          act: 'try',
          team: 'crew',
        }),
        button('try-pilots', 'Walk it at tying-up with Joss', {
          act: 'try',
          team: 'pilots',
        }),
      ),
      para(
        'Break walk: ' +
          (tideFlag(s, 'trial.crew') === order.join('|') ? 'kept for this layout' : 'waiting') +
          '. Late walk: ' +
          (tideFlag(s, 'trial.pilots') === order.join('|') ? 'kept for this layout' : 'waiting') +
          '.',
      ),
      button('issue', 'Send this floor plan upstairs', { act: 'issue' }),
    );
    const leaves = section(
      'Matel’s tracing book',
      para(
        'Slip the tracing paper under a floor you have walked. Keep a second arrangement on the facing page. The three posts sit in a line, from awning to rail to slipway. Each pair of neighbours shares one plank.',
      ),
      row(
        ...(['blue', 'rust'] as const).map((leaf) =>
          button('trace-' + leaf, 'Rub the ' + leaf + ' leaf', {
            act: 'trace',
            leaf,
          }),
        ),
      ),
    );
    for (const leaf of ['blue', 'rust'] as const) {
      const order = tracing(c.state, leaf);
      leaves.append(
        para(leaf === 'blue' ? 'Blue leaf. ' + leafFace(order) : 'Rust leaf. ' + leafFace(order)),
      );
    }
    leaves.append(
      row(
        ...keys(promises).map((key) =>
          button('promise-' + key, promises[key].who + ' · ' + promises[key].words, {
            act: 'compare',
            promise: key,
          }),
        ),
      ),
    );
    layout.append(leaves);
    return layout;
  }
  function leafFace(order: Fitting[] | null) {
    return order
      ? order.map((f, i) => fittingNames[f] + ' at ' + quayNames[quays[i]]).join(', ') + '.'
      : 'Blank paper.';
  }
  function switcher() {
    return row(
      ...Object.entries({
        pier: 'Visit a pier',
        moth: 'Wind the moth',
        card: 'Read your brass card',
        plan: 'Move the fittings',
      }).map(([id, label]) =>
        h(
          'button',
          {
            type: 'button',
            'data-quarter-tab': id,
            'aria-pressed': String(panel === id),
            onclick: () => {
              panel = id;
              draw();
              root
                .querySelector<HTMLElement>('[data-quarter-tab="' + id + '"]')
                ?.focus({ preventScroll: true });
            },
          },
          label,
        ),
      ),
    );
  }
  function draw() {
    if (dock) {
      content.replaceChildren(
        section(
          'A place at the end of the pier',
          signedFloorPlan(c.state)
            ? diagram(true)
            : para(
                'The clock room below has the loose fittings. Both shifts can walk a plan there before it comes up here.',
              ),
          ...(signedFloorPlan(c.state)
            ? [
                row(
                  button('read-crew', 'Go down to the break with Siv', {
                    act: 'read',
                    team: 'crew',
                  }),
                  button('read-pilots', 'Stay out with the late pilots', {
                    act: 'read',
                    team: 'pilots',
                  }),
                ),
              ]
            : []),
        ),
        guide,
      );
      return;
    }
    content.replaceChildren(
      switcher(),
      panel === 'pier' ? pier() : panel === 'moth' ? workshop() : panel === 'card' ? record() : planning(),
      guide,
    );
  }
  draw();
  return root;
}
