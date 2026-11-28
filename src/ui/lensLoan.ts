import type { GameController } from '../app/controller';
import {
  borrowed,
  drawings,
  fittingIds,
  fittings,
  issuedLens,
  lampSetup,
  lensPicks,
  lensSamples,
  lensTiles,
  lensView,
  notices,
  opticCaption,
  overlap,
  predictLamps,
  preset,
  projection,
  quarterOrbit,
  readingsAt,
  seatNames,
  seenLamps,
  stageVoices,
  stopNames,
  tileNames,
  unpackRead,
  windows,
  type LensCommand,
  type Mark,
  type OpticRead,
  type Seat,
  type Stop,
  type Drawing,
} from '../domain/lensLoan';
import { h } from './dom';
import { artURL } from './illustrations';
import './lensLoan.css';

type Action = LensCommand extends infer C ? (C extends LensCommand ? Omit<C, 'type'> : never) : never;
const keys = <T extends object>(object: T) => Object.keys(object) as (keyof T)[];
function glass(r: OpticRead) {
  const tiles = lensTiles(r),
    grid = h('div', {
      class: 'optic-glass',
      'aria-hidden': 'true',
      style: '--cols:' + (r.frame === 'whole' ? 7 : 3),
    });
  const rows = new Map<number, string[]>();
  const chars = { blank: '·', edge: '◆', score: '│', both: '╫' };
  for (const t of tiles) {
    grid.append(h('span', { 'data-mark': t.mark }, chars[t.mark]));
    const row = rows.get(t.y) || [];
    row.push(String.fromCharCode(65 + t.x) + (1 + t.y) + ' ' + tileNames[t.mark]);
    rows.set(t.y, row);
  }
  return h(
    'figure',
    { class: 'optics-glass-sheet' },
    grid,
    h('figcaption', {}, opticCaption(r)),
    h(
      'details',
      { 'data-fold': 'cells' },
      h('summary', {}, 'Read the marks by square'),
      ...Array.from(rows.values(), (row) => h('p', {}, row.join(' · '))),
    ),
  );
}
export function lensLoanPanel(c: GameController, sound: (key: string) => void, street: boolean) {
  const root = h('section', { class: 'optics-panel' }),
    body = h('div', {}),
    live = h('p', {
      role: 'status',
      'aria-live': 'polite',
      class: 'optics-feedback',
      'data-work-feedback': '',
    });
  root.append(live, body);
  let message = '',
    corner: [number, number] = [1, 2];
  const act = (cmd: Action, feedback: string) => {
    const err = c.dispatch({ type: 'WorkLensLoan', ...cmd }).find((e) => e.kind === 'error');
    if (err?.kind === 'error') {
      if (live.textContent !== err.message) live.textContent = err.message;
      return;
    }
    message = feedback;
    sound(cmd.act === 'travel' || cmd.act === 'return' ? 'sfx.step' : 'sfx.page');
    draw();
  };
  const action = (label: string, id: string, cmd: Action, feedback: string, pressed?: boolean) =>
    h(
      'button',
      {
        type: 'button',
        'data-optic-key': id,
        ...(pressed !== undefined ? { 'aria-pressed': String(pressed) } : {}),
        onclick: () => act(cmd, feedback),
      },
      label,
    );
  const row = (...nodes: HTMLElement[]) => h('div', { class: 'optic-controls' }, ...nodes);
  const picture = (id: string, alt: string) =>
    h('img', { class: 'optic-picture', src: artURL('optic.' + id), alt });
  const fold = (key: string, heading: string, ...nodes: HTMLElement[]) =>
    h('details', { 'data-fold': key }, h('summary', {}, heading), ...nodes);
  const text = (v: string) => h('p', {}, v);
  function draw() {
    const keep = root.contains(document.activeElement)
      ? document.activeElement?.getAttribute('data-optic-key')
      : null;
    const open = Array.from(body.querySelectorAll<HTMLDetailsElement>('details[open]')).map(
      (n) => n.dataset.fold,
    );
    body.replaceChildren();
    live.textContent = message;
    const s = c.state,
      kit = borrowed(s),
      working = lensView(s),
      pair = issuedLens(s);
    if (street && pair) {
      body.append(
        picture('curtain', 'A silver seam crosses two folds of a plum-coloured stage curtain.'),
        h('h3', {}, 'A crossing for Nim'),
        text('The hem is in the audience’s hands. Mayle keeps the two slips you sealed in the loft.'),
      );
      body.append(
        fold(
          'envelope',
          'Unroll the two slips that travelled',
          text('Amber • ' + opticCaption(pair.amber)),
          text('Blue • ' + opticCaption(pair.blue)),
        ),
      );
      body.append(
        row(
          ...keys(notices).map((k) =>
            action(
              'Hang ' + notices[k],
              k,
              { act: 'print', notice: k },
              'Nim crosses to her new mark.',
              s.flags['optics.notice'] === k,
            ),
          ),
        ),
      );
      if (s.flags['optics.showEdition'] === s.flags['optics.dispatch']) {
        body.append(
          h('h4', {}, 'Walk around the entrance'),
          row(
            action(
              'Wheel the lamp to the rear',
              'rear',
              { act: 'lamp', position: 'rear' },
              'The silver shows from the last seats.',
              s.flags['optics.lamp'] !== 'side',
            ),
            action(
              'Wheel the lamp to the wing',
              'side',
              { act: 'lamp', position: 'side' },
              'The second edge of the seam catches light.',
              s.flags['optics.lamp'] === 'side',
            ),
          ),
          row(
            action('Sit with Mayle', 'porter', { act: 'listen', person: 'porter' }, stageVoices(s, 'porter')),
            action(
              'Wait in the wing with Nim',
              'understudy',
              { act: 'listen', person: 'understudy' },
              stageVoices(s, 'understudy'),
            ),
          ),
        );
      }
      const set = lampSetup(s) ?? { seat: 'wing' as Seat, stop: 'broad' as Stop, drawing: 'rays' as Drawing };
      const arrange = (stop: Stop, seat: Seat, drawing: Drawing) =>
        ({ act: 'forecast', stop, seat, drawing }) as const;
      const run = (st: Stop, seat: Seat, d: Drawing) =>
        drawings[d] + ' reach ' + predictLamps(st, seat, d) + ' of four lamp marks at ' + seatNames[seat] + '.';
      const experiment = h(
        'section',
        {},
        text(
          'Huygens has sketched two little stages. They make different promises in the wing. Three stagehands left separate slips at each seat.',
        ),
        h('h4', {}, 'The doorway'),
        row(
          ...keys(stopNames).map((st) =>
            action(
              'Use ' + stopNames[st],
              'stop-' + st,
              arrange(st, set.seat, set.drawing),
              run(st, set.seat, set.drawing),
              set.stop === st,
            ),
          ),
        ),
        h('h4', {}, 'The seat'),
        row(
          ...keys(seatNames).map((v) =>
            action(
              'Visit ' + seatNames[v],
              'seat-' + v,
              arrange(set.stop, v, set.drawing),
              run(set.stop, v, set.drawing),
              set.seat === v,
            ),
          ),
        ),
        h('h4', {}, 'The chalk'),
        row(
          ...keys(drawings).map((v) =>
            action(
              'Pin ' + drawings[v],
              'drawing-' + v,
              arrange(set.stop, set.seat, v),
              run(set.stop, set.seat, v),
              !!lampSetup(s) && set.drawing === v,
            ),
          ),
        ),
      );
      if (lampSetup(s)) {
        const n = readingsAt(s, set.stop, set.seat);
        experiment.append(
          text('Drawing • ' + run(set.stop, set.seat, set.drawing)),
          text(
            n
              ? 'Crew slips at this opening • ' +
                  seenLamps(set.stop, set.seat).slice(0, n).join(', ') +
                  ' marks out of 4.'
              : 'The three slips for this seat are still folded.',
          ),
        );
        if (n < 3)
          experiment.append(
            action(
              'Open rehearsal slip ' + (n + 1),
              'rehearse',
              { act: 'rehearse' },
              'A stagehand saw ' + seenLamps(set.stop, set.seat)[n] + ' marks.',
            ),
          );
        const other = set.stop === 'broad' ? 'slit' : 'broad';
        if (readingsAt(s, other, set.seat))
          experiment.append(
            text(
              'From ' +
                stopNames[other] +
                ' at this same seat • ' +
                seenLamps(other, set.seat)
                  .slice(0, readingsAt(s, other, set.seat))
                  .join(', ') +
                ' marks.',
            ),
          );
      }
      experiment.append(
        row(
          action(
            'Give Nim a working entrance cue',
            'cue',
            { act: 'entrust', purpose: 'cue' },
            'A dresser sews a second signal beside the wing.',
          ),
          action(
            'Reserve the seat for a new test',
            'test',
            { act: 'entrust', purpose: 'test' },
            'There are now two chalk hooks beside the marked seat.',
          ),
        ),
      );
      if (s.flags['optics.gridFold'])
        experiment.append(
          action(
            'Bind the grid fold beside the rehearsal slips',
            'margin',
            { act: 'margin' },
            'Nim keeps both margins. One shows why every square returns. The other keeps a seat open for another observation.',
          ),
        );
      body.append(fold('waves', 'Try the two chalk stages', experiment));
      if (kit.length)
        body.append(
          action(
            'Fit the travelling pair to the projector',
            'project',
            { act: 'project' },
            'The amber tracing takes the light in the travelling frame.',
          ),
        );
      const projected = projection(s);
      if (projected)
        body.append(
          fold(
            'projection',
            'Look through the company projector',
            text(projected.caption),
            text('First position • ' + opticCaption(projected.first)),
            text('Second position • ' + opticCaption(projected.second)),
            glass(projected.first),
            glass(projected.second),
          ),
        );
      if (kit.length)
        body.append(
          action(
            'Hand the fittings back to Mayle',
            'return',
            { act: 'return' },
            'Mayle takes both fittings. The company keeps its envelope.',
          ),
        );
    } else if (!street) {
      body.append(
        picture('drawer', 'A felt-lined wooden drawer fitted with two little brass hooks.'),
        h('h3', {}, kit.length ? 'Under the frosted square' : 'Two places in the felt'),
      );
      if (!kit.length) {
        const picks = lensPicks(s);
        body.append(
          text(
            'Four fittings are waiting. Nim holds the torn hem above a square of frosted glass. Mayle offers you the lighter end of the drawer.',
          ),
          row(
            ...fittingIds.map((v) =>
              action(
                (picks.includes(v) ? 'Unhook ' : 'Pack ') + fittings[v],
                v,
                { act: 'pick', fitting: v },
                picks.includes(v) ? 'One hook swings free.' : 'The fitting sits in the felt.',
                picks.includes(v),
              ),
            ),
          ),
          text(
            picks.length
              ? picks.map((v) => fittings[v]).join(' and ') + ' · ' + picks.length + '/2 places'
              : 'Both places are empty.',
          ),
          action('Lift the loan drawer', 'borrow', { act: 'borrow' }, 'The drawer is on the glass bench.'),
        );
        const stamps = h('div', {}, text('Each mark remembers a pair you can pack again.'));
        for (const mark of ['knot', 'star'] as Mark[]) {
          const set = preset(s, mark);
          stamps.append(
            text(
              'The ' +
                mark +
                ' • ' +
                (set.length ? set.map((v) => fittings[v]).join(' and ') : 'no impressions yet'),
            ),
            row(
              action(
                'Stamp the ' + mark,
                'stamp-' + mark,
                { act: 'putMark', mark },
                'The two fittings have left their shapes in the ' + mark + '.',
              ),
              action(
                'Recall the ' + mark,
                'recall-' + mark,
                { act: 'useMark', mark },
                'Your saved pair sits on the hooks.',
              ),
            ),
          );
        }
        body.append(fold('stamps', 'Mayle’s knot and star stamps', stamps));
      } else {
        body.append(
          text('Borrowed • ' + kit.map((v) => fittings[v]).join(' and ')),
          row(
            ...keys(lensSamples).map((v) =>
              action(
                'Place ' + lensSamples[v],
                'slide-' + v,
                { act: 'slide', slide: v },
                'The study slides under the glass.',
                working.slide === v,
              ),
            ),
          ),
        );
        const frame = [
          action(
            'Use the nine locators',
            'eye',
            { act: 'frame', frame: 'eye' },
            'Nine squares are visible.',
            working.frame === 'eye',
          ),
        ];
        if (kit.includes('field'))
          frame.push(
            action(
              'See the whole field',
              'whole',
              { act: 'frame', frame: 'whole' },
              'The seven rows fit inside the field lens.',
              working.frame === 'whole',
            ),
          );
        if (kit.includes('close'))
          frame.push(
            action(
              'Lower the close lens',
              'close',
              { act: 'frame', frame: 'close' },
              'The close lens holds three rows of three squares.',
              working.frame === 'close',
            ),
          );
        if (kit.includes('stage'))
          frame.push(
            action(
              'Turn the study a quarter turn',
              'turn',
              { act: 'turn' },
              'The study turns. The holder stays still.',
            ),
          );
        if (kit.includes('sleeve'))
          frame.push(
            action(
              working.cover ? 'Lift the sleeve' : 'Lower the sleeve',
              'cover',
              { act: 'cover' },
              working.cover ? 'The scored glass lifts away.' : 'The scored glass comes down.',
            ),
          );
        body.append(row(...frame));
        if (working.frame === 'close')
          body.append(
            row(
              ...keys(windows).map((v) =>
                action(
                  'Pan to ' + v,
                  'window-' + v,
                  { act: 'pan', window: v },
                  'The little window moves to ' + v + '.',
                  working.window === v,
                ),
              ),
            ),
          );
        if (kit.includes('stage') && kit.includes('field')) {
          const folds = h(
            'section',
            {},
            text(
              'Follow a square through four quarter turns. Put the ruled glass under the whole field and turn it all the way home.',
            ),
            action(
              'Unfold the four-turn grid',
              'unroll',
              { act: 'unroll' },
              'All 49 positions are free to try.',
            ),
          );
          if (s.flags['optics.gridFold']) {
            const coords = (p: readonly number[]) => String.fromCharCode(65 + p[0]) + (1 + p[1]);
            const select = h('select', {
              'aria-label': 'Starting square',
              'data-optic-key': 'starting-square',
              onchange: (e: Event) => {
                const key = (e.target as HTMLSelectElement).value;
                corner = [Number(key[0]), Number(key[1])];
                draw();
              },
            });
            for (let y = 0; y < 7; y++)
              for (let x = 0; x < 7; x++)
                select.append(
                  h(
                    'option',
                    { value: String(x) + y, selected: x === corner[0] && y === corner[1] },
                    coords([x, y]),
                  ),
                );
            folds.append(
              h('label', {}, 'Follow a starting square ', select),
              text(
                quarterOrbit(...corner)
                  .map(coords)
                  .join(' → '),
              ),
              text(
                'Turn sends column and row (x, y) to (6 − y, x), counting from zero. Twice gives (6 − x, 6 − y). Twice again gives (x, y). This works for every square in the field.',
              ),
            );
          }
          body.append(fold('turns', 'The ruled glass and its four-fold corner', folds));
        }
        body.append(
          glass(working),
          row(
            action('Trace in amber', 'amber', { act: 'trace', slot: 'amber' }, 'Amber holds this reading.'),
            action('Trace in blue', 'blue', { act: 'trace', slot: 'blue' }, 'Blue holds this reading.'),
          ),
        );
        const a = unpackRead(s.flags['optics.amber']),
          b = unpackRead(s.flags['optics.blue']);
        body.append(
          text('Amber • ' + (a ? opticCaption(a) : 'empty')),
          text('Blue • ' + (b ? opticCaption(b) : 'empty')),
        );
        body.append(
          action('Lay the slips together', 'blend', { act: 'blend' }, 'The amber slip lies over the blue.'),
        );
        if (a && b && s.flags['optics.blend']) {
          const d = overlap(a, b);
          body.append(text(d.shared + ' shared squares · ' + d.changed + ' changed marks.'));
          if (
            s.flags['optics.compared.preparation'] &&
            a.slide !== b.slide &&
            [a.slide, b.slide].every((v) => v === 'fresh' || v === 'petal')
          )
            body.append(
              text(
                'The pressed study has a central crease. The fresh study was drawn before folding. Cajal has left room to put both slips under his page.',
              ),
            );
        }
        if (kit.includes('field') && kit.includes('close'))
          body.append(
            action(
              'Fit the small window into the field',
              'register',
              { act: 'register' },
              'The nine squares click into the whole field. Nim marks the spot with her thimble.',
            ),
          );
        if (kit.includes('stage') && kit.includes('sleeve'))
          body.append(
            action(
              'Separate the holder from the study',
              'isolate',
              { act: 'isolate' },
              'The light line follows the sleeve. The darker shape turns with the study.',
            ),
          );
        body.append(
          row(
            action(
              'Seal this pair for the company',
              'travel',
              { act: 'travel' },
              'The addressed envelope goes to the rehearsal room.',
            ),
            action(
              'Return the loan drawer',
              'return',
              { act: 'return' },
              'Both fittings are back on their hooks.',
            ),
          ),
        );
      }
      body.append(
        fold(
          'clips',
          'The two brass number clips',
          text(
            'Eland found different numbers on the microscope and the case downstairs. The tags have separate clips here.',
          ),
          action(
            'Clip both catalogue readings beside the drawer',
            'clips',
            { act: 'fitCard' },
            'Swift body 16616 • Reused case marked 30607. Its ×4, ×10 and ×40 adjustments name the earlier instrument. The body has one fitted objective marked one inch.',
          ),
        ),
      );
      if (pair)
        body.append(
          text(
            'The company envelope holds ' +
              lensSamples[pair.amber.slide] +
              ' and ' +
              lensSamples[pair.blue.slide] +
              '. New work at this bench travels when you seal it.',
          ),
        );
    } else body.append(text('The company is waiting for the two tracings from Mayle’s loan loft.'));
    for (const el of body.querySelectorAll<HTMLDetailsElement>('details'))
      if (open.includes(el.dataset.fold)) el.open = true;
    if (keep)
      body.querySelector<HTMLElement>('[data-optic-key="' + keep + '"]')?.focus({ preventScroll: true });
  }
  draw();
  return root;
}
