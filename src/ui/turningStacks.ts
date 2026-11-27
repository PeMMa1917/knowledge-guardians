import { stackWindow } from '../content/stackWindows';
import type { GameController } from '../app/controller';
import {
  aisles,
  ballotView,
  leafKeys,
  seats,
  shelfSquares,
  stackEdition,
  stackLeaves,
  stackPath,
  stackPlan,
  stackSquare,
  visitors,
  type Aisle,
  type Ballots,
  type Direction,
  type Leaf,
  type Shelf,
  type StackCommand,
  type Visitor,
} from '../domain/turningStacks';
import { h } from './dom';
type Act = StackCommand extends infer C ? (C extends StackCommand ? Omit<C, 'type'> : never) : never;
const ways: Direction[] = ['north', 'east', 'south', 'west'];
const edges = ['street', 'inside'] as const;
const coord = (square: number) => String.fromCharCode(65 + (square % 5)) + (Math.floor(square / 5) + 1);
export function turningStacksPanel(c: GameController, sound: (key: string) => void) {
  const content = h('div', {}),
    status = h('p', { class: 'stack-feedback', role: 'status', 'aria-live': 'polite' }),
    root = h('section', { class: 'turning-stacks' }, content, status);
  function run(cmd: Act, feedback: string) {
    const error = c.dispatch({ type: 'WorkTurningStacks', ...cmd }).find((e) => e.kind === 'error');
    if (error) {
      status.textContent = error.message;
      return;
    }
    if (cmd.act === 'read' || cmd.act === 'bind') sound('sfx.page');
    else if (cmd.act === 'step' || cmd.act === 'follow') sound('sfx.step');
    draw();
    status.textContent = feedback;
  }
  const button = (label: string, id: string, cmd: Act, feedback: string, disabled = false) =>
    h('button', { type: 'button', 'data-stack-control': id, disabled, onclick: () => run(cmd, feedback) }, label);
  const source = (leaf: Leaf) => {
    const l = stackLeaves[leaf];
    return h(
      'section',
      { class: 'stack-leaf' },
      h('h4', {}, l.title),
      h('p', { class: 'fine' }, l.credit + ' · ' + l.subject),
      h('p', {}, l.detail),
      h('p', { class: 'fine' }, l.limit),
    );
  };
  function draw() {
    const focus = (document.activeElement as HTMLElement | null)?.dataset.stackControl;
    const s = c.state,
      p = stackPlan(s),
      issued = stackEdition(s);
    content.replaceChildren();
    if (s.mapId === 'voices.quay' && !issued) {
      content.append(h('p', {}, 'The rings are empty. Opal can bind two leaves at the house on Canal Walk.'));
      return;
    }
    if (s.mapId === 'voices.quay' && issued) {
      const open = s.flags['stacks.opened'] === s.flags['stacks.edition'];
      content.append(
        h(
          'p',
          {},
          'The book hangs by a brass hinge. One lamp turns towards the boats. Turn it the other way and people inside can read every small line.',
        ),
        h('h3', {}, 'The pair that arrived'),
        source(issued.first),
        source(issued.second),
        h(
          'p',
          { class: 'fine' },
          visitors[issued.visitor] + ' reached these in this order through ' + aisles[issued.aisle] + '.',
        ),
        h(
          'div',
          { class: 'row' },
          edges.map((edge) =>
            button(
              edge === 'street' ? 'Turn the lamp to the boats' : 'Turn the lamp over the reading bench',
              edge,
              { act: 'open', edge },
              edge === 'street'
                ? 'A deckhand can read the publisher from the gangway. The print indoors falls into shade.'
                : 'The close reader follows the small print. Someone on the last boat misses the heading.',
            ),
          ),
        ),
      );
      if (open) {
        const views = stackWindow(issued.first, issued.second),
          lens = s.flags['stacks.glass'];
        content.append(
          h(
            'div',
            { class: 'row' },
            button(
              'Turn the plate to the publishers',
              'glass-voices',
              { act: 'glass', lens: 'voices' },
              views.voices,
            ),
            button('Turn the plate to the dates', 'glass-years', { act: 'glass', lens: 'years' }, views.years),
          ),
        );
        if (
          s.flags['stacks.glassEdition'] === s.flags['stacks.edition'] &&
          (lens === 'voices' || lens === 'years')
        )
          content.append(h('p', { class: 'stack-receipt' }, views[lens]));
        content.append(
          h(
            'p',
            {},
            s.flags['stacks.facing'] === 'street'
              ? 'A child on the ferry calls the two publishers back separately. Inside, Opal cups a hand over the page to read the dates.'
              : 'The woman on the bench reads the dates twice. A child on the ferry sees Tallis’s coat but misses the names.',
          ),
          h(
            'div',
            { class: 'row' },
            button(
              'Sit beside Opal',
              'maker',
              { act: 'reply', voice: 'maker' },
              'Opal opens her toolbox. The pin has been in the lining since last winter.',
            ),
            button(
              'Hold the ladder for Tallis',
              'carrier',
              { act: 'reply', voice: 'carrier' },
              'Tallis lets go of one rung. “Look where the first ferry puts a child’s eyes.”',
            ),
          ),
        );
        if (s.flags['stacks.heard.maker'] === s.flags['stacks.edition'])
          content.append(
            h(
              'p',
              {},
              '“I took the hinge pin out myself,” says Opal. “Every time that door slammed, one brass name fell off. We let the visitors think somebody had stolen it.”',
            ),
          );
        if (s.flags['stacks.heard.carrier'] === s.flags['stacks.edition'])
          content.append(
            h(
              'p',
              {},
              '“I kept holding the plate up from behind,” says Tallis. “One day a small girl thanked the house. I was too embarrassed to come round and meet her.”',
            ),
          );
      }
    } else {
      content.append(
        h(
          'p',
          {},
          'The whole reading room fits inside Opal’s suitcase. The shelf by the window opens at B2. The one under the stairs opens at D4. Only one gap cuts through the middle screen.',
        ),
      );
      const prep = h('div', { class: 'stack-settings' });
      content.append(prep);
      for (const shelf of ['window', 'stair'] as Shelf[]) {
        const select = h(
          'select',
          { 'data-stack-control': 'choose-' + shelf, 'aria-label': 'Leaf for ' + seats[shelf] },
          ...leafKeys.map((k) => h('option', { value: k }, stackLeaves[k].title)),
        );
        select.value = p[shelf];
        select.addEventListener('change', () =>
          run(
            { act: 'shelve', shelf, leaf: select.value as Leaf },
            'The byline travels with its leaf. The next visitor starts at the door.',
          ),
        );
        prep.append(h('label', {}, seats[shelf], select, h('small', {}, stackLeaves[p[shelf]].credit)));
      }
      const partition = h(
        'select',
        { 'aria-label': 'Opening in the middle screen', 'data-stack-control': 'screen' },
        ...Object.keys(aisles).map((k) => h('option', { value: k }, aisles[k as Aisle])),
      );
      partition.value = p.aisle;
      partition.addEventListener('change', () =>
        run(
          { act: 'swing', aisle: partition.value as Aisle },
          'The screen swings. Invite someone to try the new floor.',
        ),
      );
      prep.append(h('label', {}, 'Gap in the screen', partition));
      content.append(
        h(
          'div',
          { class: 'row' },
          (Object.keys(visitors) as Visitor[]).map((visitor) =>
            button(
              visitor === 'wheel' ? 'Open the wheel door for Opal' : 'Open the lamp door for Tallis',
              visitor,
              { act: 'enter', visitor },
              visitor === 'wheel'
                ? 'Opal measured the cabinet. Its little wheels will fit the crossing.'
                : 'Tallis lowers his ladder so the top clears the lintel.',
            ),
          ),
        ),
      );
      const square = p.square,
        reader = p.visitor;
      if (reader && square !== undefined) {
        const shelf =
          square === shelfSquares.window ? 'window' : square === shelfSquares.stair ? 'stair' : undefined;
        const board = h('ol', {
          class: 'stack-grid',
          'aria-label': 'Floor plan. Five rows from the north wall.',
          'data-stack-control': 'floor',
          tabindex: 0,
        });
        for (let i = 0; i < 25; i++) {
          const tile = stackSquare(i, p.aisle),
            here = i === square;
          board.append(
            h(
              'li',
              {
                'data-terrain': tile,
                'data-here': here,
                'aria-label': coord(i) + ' · ' + tile + (here ? ' · visitor here' : ''),
              },
              h(
                'span',
                { 'aria-hidden': 'true' },
                here
                  ? reader === 'wheel'
                    ? '●'
                    : '◆'
                  : tile === 'partition'
                    ? '▥'
                    : i === 6
                      ? 'W'
                      : i === 18
                        ? 'S'
                        : tile.endsWith('door')
                          ? '⇥'
                          : '·',
              ),
            ),
          );
        }
        board.addEventListener('keydown', (e) => {
          const dir: Record<string, Direction> = {
            ArrowUp: 'north',
            ArrowLeft: 'west',
            ArrowRight: 'east',
            ArrowDown: 'south',
          };
          if (!Object.hasOwn(dir, e.key)) return;
          e.preventDefault();
          e.stopPropagation();
          run({ act: 'step', way: dir[e.key] }, 'I stepped ' + dir[e.key] + '.');
        });
        content.append(
          board,
          h('p', {}, visitors[reader] + ' at ' + coord(square) + ' · ' + stackSquare(square, p.aisle) + '.'),
          h(
            'p',
            { class: 'fine' },
            'W marks the window shelf. S marks the stair shelf. The striped screen is solid. Walk with the buttons or focus the floor and use arrow keys.',
          ),
          h(
            'div',
            { class: 'row' },
            ways.map((way) => button('Step ' + way, way, { act: 'step', way }, 'One step ' + way + '.')),
          ),
        );
        const guides = h('div', { class: 'stack-guides' });
        content.append(guides);
        for (const side of ['window', 'stair'] as Shelf[]) {
          const path = stackPath(square, shelfSquares[side], p.aisle);
          guides.append(
            h(
              'div',
              {},
              button(
                'Follow the path to ' + seats[side],
                'guide-' + side,
                { act: 'follow', shelf: side },
                'We followed the open aisle to ' + seats[side] + '.',
                !path.length,
              ),
              h('small', {}, path.length ? path.length + ' steps · ' + path.join(', ') : 'Here already.'),
            ),
          );
        }
        if (shelf) {
          const l = stackLeaves[p[shelf]];
          content.append(button('Open “' + l.title + '”', 'read', { act: 'read' }, l.marginal));
          if (p.order.includes(shelf === 'window' ? 'w' : 's')) content.append(source(p[shelf]));
        }
        if (p.order)
          content.append(
            h(
              'p',
              { class: 'fine' },
              'Our reading order · ' +
                [...p.order].map((m) => stackLeaves[p[m === 'w' ? 'window' : 'stair']].title).join(' → '),
            ),
          );
        content.append(
          button(
            'Bind the pair in walking order',
            'bind',
            { act: 'bind' },
            'Opal hooks the two leaves into brass rings. The bound edition will open at the Lamp Quay.',
            p.order.length !== 2,
          ),
        );
      }
      if (s.flags['stacks.read.eastern'] === true) {
        const b = s.flags['stacks.basis'];
        const chart = h(
          'section',
          { class: 'stack-leaf' },
          h('h4', {}, 'One lamp for every count'),
          h(
            'p',
            {},
            'On the certificate, 115 were for and 48 against. Six ballots were spoiled. 270 people were entitled to vote. Choose whom the full circle represents.',
          ),
        );
        const bases: Ballots[] = ['valid', 'returned', 'eligible'];
        chart.append(
          h(
            'div',
            { class: 'row' },
            bases.map((basis) =>
              button(
                ballotView(basis).label,
                basis,
                { act: 'count', basis },
                'The circle now contains ' + ballotView(basis).denominator + ' places.',
              ),
            ),
          ),
        );
        if (b === 'valid' || b === 'returned' || b === 'eligible') {
          const v = ballotView(b);
          chart.append(
            h(
              'meter',
              { min: 0, max: v.denominator, value: v.numerator, 'aria-label': 'Votes for among ' + v.label },
              v.percent + '%',
            ),
            h(
              'p',
              {},
              v.numerator +
                ' of ' +
                v.denominator +
                ' ' +
                v.label +
                ' · ' +
                v.percent +
                '%. The 115 people and the certified outcome stay the same.',
            ),
          );
        }
        if (b === 'valid') {
          chart.append(
            h(
              'div',
              { class: 'row' },
              button(
                'Lead with the votes for',
                'for',
                { act: 'headline', side: 'for' },
                'Tallis can see the large lamps from the landing.',
              ),
              button(
                'Lead with the votes against',
                'against',
                { act: 'headline', side: 'against' },
                'Opal sees the 48 before she reaches the larger row.',
              ),
            ),
          );
          const headline = s.flags['stacks.headline'];
          if (headline === 'for' || headline === 'against')
            chart.append(
              h(
                'p',
                { class: 'stack-receipt' },
                headline === 'for'
                  ? '115 of 163 valid votes were for (70.6%). Tallis reads this as a show of support. The second line still records 48 against.'
                  : '48 of 163 valid votes were against (29.4%). The disagreement catches Opal’s eye first. The second line still records 115 for.',
              ),
            );
        }
        content.append(chart);
      }
      if (issued)
        content.append(
          h(
            'p',
            { class: 'stack-receipt' },
            'Bound for the quay · ' +
              stackLeaves[issued.first].title +
              ' / ' +
              stackLeaves[issued.second].title +
              '. The model can still change here.',
          ),
        );
    }
    if (focus)
      (
        content.querySelector<HTMLElement>('[data-stack-control="' + focus + '"]:not(:disabled)') ??
        content.querySelector<HTMLElement>('[data-stack-control]:not(:disabled)')
      )?.focus();
  }
  draw();
  return root;
}

export function signatureLamp(c: GameController, sound: (key: string) => void) {
  const caption = h('p', { role: 'status' }),
    plate = h(
      'section',
      { class: 'stack-leaf' },
      h(
        'p',
        {},
        'The lens runs in a brass groove. Slide it over the three signatures or lower it to the date at the foot of page 16.',
      ),
    );
  function show(line: 'board' | 'date') {
    const issue = c
      .dispatch({ type: 'WorkTurningStacks', act: 'signature', line })
      .find((e) => e.kind === 'error');
    if (issue) {
      caption.textContent = issue.message;
      return;
    }
    sound('sfx.page');
    lineText(line);
  }
  function lineText(line: 'board' | 'date') {
    caption.textContent =
      line === 'board'
        ? 'Mary Moss served as election board chairman. Lena Mae Elliott and Glen Brock served as board members. Their signatures certify this result. The document does not identify individual voters.'
        : '17 June 1999. The printed date belongs to this election certificate. The whole constitutional file did not come into being on this day.';
  }
  const prior = c.state.flags['stacks.signature'];
  if (prior === 'board' || prior === 'date') lineText(prior);
  plate.append(
    h(
      'div',
      { class: 'row' },
      h('button', { type: 'button', onclick: () => show('board') }, 'Light the three signature lines'),
      h('button', { type: 'button', onclick: () => show('date') }, 'Light the date at the foot'),
    ),
    caption,
  );
  return plate;
}
