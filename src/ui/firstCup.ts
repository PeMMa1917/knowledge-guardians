import type { GameController } from '../app/controller';
import {
  allTrays,
  benches,
  brew,
  cupFlag,
  cupVotes,
  dispatchedCup,
  meanBid,
  mixDegrees,
  servingLine,
  stops,
  streetDegrees,
  tickets,
  wearingCocoa,
  type Bench,
  type CupCommand,
} from '../domain/firstCup';
import { h } from './dom';
import { artURL } from './illustrations';

type Move = CupCommand extends infer C ? (C extends CupCommand ? Omit<C, 'type'> : never) : never;
const keys = ['two', 'blank', 'eight'] as const;
export function firstCupPanel(c: GameController, sound: (key: string) => void, street: boolean) {
  const root = h('section', { class: 'first-cup' }),
    content = h('div', {}),
    live = h('p', { role: 'status', 'aria-live': 'polite' });
  root.append(content, live);
  let bench: Bench = 'mill';
  const move = (cmd: Move, msg: string) => {
    const error = c.dispatch({ type: 'WorkFirstCup', ...cmd }).find((e) => e.kind === 'error');
    if (error?.kind === 'error') {
      live.textContent = error.message;
      return;
    }
    if (cmd.act === 'tip' || cmd.act === 'unfold') sound('sfx.page');
    if (cmd.act === 'roll' || cmd.act === 'bringBack') sound('sfx.step');
    draw();
    live.textContent = msg;
  };
  const button = (title: string, id: string, fn: () => void, disabled = false) =>
    h('button', { type: 'button', 'data-cup-key': id, onclick: fn, disabled }, title);
  const twist = (labels: string[], pieces: string[]) =>
    h(
      'ol',
      { class: 'cup-measures', 'aria-label': labels.join(' · ') },
      pieces.map((p, i) =>
        h('li', { 'aria-hidden': 'true', 'data-pour': p }, p === 'w' ? '☀' : p === 'c' ? '≈' : String(i + 1)),
      ),
    );
  const picture = (art: string, alt: string) => h('img', { class: 'cup-picture', src: artURL('cup.' + art), alt });
  function draw() {
    const held = root.contains(document.activeElement)
      ? document.activeElement?.getAttribute('data-cup-key')
      : null;
    const s = c.state,
      batch = dispatchedCup(s);
    content.replaceChildren();
    if (street) {
      if (!batch) {
        content.append(
          h(
            'p',
            {},
            'The wheels have gone home. Two dark rings are drying on the paving. The covered lane leads back to the cocoa shop.',
          ),
        );
        return;
      }
      const mixture = mixDegrees(batch.pour)!,
        corrected = cupFlag(s, 'gauge') === true,
        number = streetDegrees(mixture, batch.stop, batch.wrap);
      const displayed = Number((number + (corrected ? 0 : 2)).toFixed(1));
      content.append(
        picture('cart', 'A copper jug in a red two-wheeled cart with a saucer balanced on its rail.'),
        h('h3', {}, stops[batch.stop]),
        h(
          'p',
          {},
          batch.stop === 'weir'
            ? 'A runner holds the rail with one hand. The people who sent him are across the water.'
            : 'A mason brushes grit from the place where the left wheel fit the stone. Her break has already started.',
        ),
        h(
          'div',
          { class: 'row' },
          button('Unfold the shop reading', 'inside', () =>
            move({ act: 'taste', spot: 'inside' }, 'Shop glass · ' + mixture + ' °C.'),
          ),
          button('Read the street dial', 'street', () =>
            move({ act: 'taste', spot: 'street' }, 'Street dial · ' + displayed + ' °C.'),
          ),
        ),
      );
      if (cupFlag(s, 'inside')) content.append(h('p', {}, 'Shop glass · ' + mixture + ' °C before the journey.'));
      if (cupFlag(s, 'street'))
        content.append(
          h(
            'p',
            {},
            'Street dial · ' +
              displayed +
              ' °C' +
              (corrected ? ' with its reference correction.' : ' on its original scale.'),
          ),
        );
      const gauge = h(
        'details',
        {},
        h('summary', {}, 'Set both thermometers in the shade'),
        h(
          'p',
          {},
          'In the same shade the reference glass reads 18 °C and the unadjusted travel dial reads 20 °C.',
        ),
        button(
          'Slide the ring back two degrees',
          'calibrate',
          () => move({ act: 'compareGauge' }, 'The two needles now meet at 18 °C in the shade.'),
          corrected,
        ),
      );
      content.append(gauge);
      const ready = Boolean(cupFlag(s, 'inside') && cupFlag(s, 'street'));
      content.append(
        h('h3', {}, 'Open the counter'),
        h(
          'p',
          {},
          ready
            ? 'Someone at the edge of the lane is watching for your hand.'
            : 'Read both instruments before opening the counter.',
        ),
        h(
          'div',
          { class: 'row' },
          ...(['chalk', 'slips'] as const).map((sign) =>
            button(
              sign === 'chalk' ? 'Chalk a starting price' : 'Set out folded offers',
              sign,
              () => move({ act: 'serve', sign }, servingLine(batch.stop, sign)),
              !ready,
            ),
          ),
        ),
      );
      const sign = cupFlag(s, 'serving');
      if (sign === 'chalk' || sign === 'slips')
        content.append(h('p', { class: 'cup-receipt' }, servingLine(batch.stop, sign)));
      if (sign && cupFlag(s, 'tversky.return')) {
        content.append(
          h('h3', {}, 'The two notes from the mill'),
          h('p', {}, 'Amos kept the offers with the reasons their writers agreed to share.'),
          h(
            'div',
            { class: 'row' },
            button('Unfold the ticket marked 2', 'loose', () =>
              move(
                { act: 'unfold', seat: 'loose' },
                'They saw 2 and offered 8 to leave a cup for the next shift.',
              ),
            ),
            button('Unfold the ticket marked 8', 'heavy', () =>
              move(
                { act: 'unfold', seat: 'heavy' },
                'They saw 8 and offered the 5 left after buying a wheel nut.',
              ),
            ),
          ),
        );
        if (cupFlag(s, 'seat.loose'))
          content.append(
            h(
              'p',
              {},
              '“Eight. Enough for the people coming on when we go.” A thumbprint where the mill wheel drips.',
            ),
          );
        if (cupFlag(s, 'seat.heavy'))
          content.append(
            h('p', {}, '“Five. The new nut cost the rest.” A drawing of the nut, with all six sides counted.'),
          );
      }
      if (sign && corrected && cupFlag(s, 'seat.loose') && cupFlag(s, 'seat.heavy')) {
        content.append(
          h('h3', {}, 'Turn the cart towards the road'),
          h('p', {}, 'Kit has space for one thing at eye level. The other reading stays on the inside.'),
          h(
            'div',
            { class: 'row' },
            button('Hang the corrected dial outside', 'hang-dial', () =>
              move(
                { act: 'hang', first: 'dial' },
                'Kit can correct the dial by two degrees. She keeps the individual offers intact.',
              ),
            ),
            button('Hang the two mill offers outside', 'hang-offers', () =>
              move(
                { act: 'hang', first: 'offers' },
                'The crew pattern and the two different reasons face the street. Kit keeps the reference glass inside.',
              ),
            ),
          ),
        );
        const facing = cupFlag(s, 'facing.' + batch.stop);
        if (facing)
          content.append(
            h(
              'p',
              {},
              facing === 'dial'
                ? 'A two-degree correction faces the road. Kit would have to ask the bidders about their reasons.'
                : 'The two offers and their different reasons face the road. Kit still checks her thermometer against the same reference.',
            ),
          );
      }
      content.append(
        button('Bring the wheels home', 'home', () =>
          move({ act: 'bringBack' }, 'The cart is back at the shop. The covered lane stays open.'),
        ),
      );
    } else {
      const p = brew(s),
        packed = cupFlag(s, 'wrap'),
        temp = mixDegrees(p);
      content.append(
        picture(
          'pots',
          'Two copper carafes stand behind a tray with four separate wells.',
        ),
        h('h3', {}, 'Kit’s four-well tipping tray'),
        h(
          'p',
          {},
          'Both carafes hold the same cocoa. One stands at 54 °C and one at 18 °C. Rest each scoop in its own well. Kit tips the tray into the jug when the wheels leave.',
        ),
      );
      if (batch)
        content.append(
          h(
            'p',
            { class: 'cup-receipt' },
            'The cart is at ' + stops[batch.stop] + '. The tray you fill here will wait until the wheels come home.',
          ),
        );
      const pieces = [...p, ...Array(4 - p.length).fill('')],
        labels = pieces.map((v) => (v === 'w' ? 'warm' : v === 'c' ? 'cool' : 'empty'));
      content.append(
        twist(labels, pieces),
        h(
          'p',
          {},
          p.length +
            ' of 4 scoops' +
            (temp === undefined ? ' · the tray is empty.' : ' · estimated blend ' + temp + ' °C.'),
        ),
        h(
          'div',
          { class: 'row' },
          button(
            'Pour a warm scoop',
            'warm',
            () => move({ act: 'pour', carafe: 'warm' }, 'A warm scoop fills the next well.'),
            p.length >= 4,
          ),
          button(
            'Pour a cool scoop',
            'cool',
            () => move({ act: 'pour', carafe: 'cool' }, 'A cool scoop fills the next well.'),
            p.length >= 4,
          ),
          button(
            'Empty the last well',
            'undo',
            () => move({ act: 'takeBack' }, 'Kit empties one well. The other scoops stay where they are.'),
            !p.length,
          ),
        ),
        h(
          'details',
          {},
          h('summary', {}, 'Look under the tipping tray'),
          h(
            'p',
            {},
            'Kit’s trial gives each scoop the same mass and assumes no heat escapes while they mix. Add their temperatures and divide by the number of scoops. On the road the jug loses heat.',
          ),
        ),
      );
      content.append(
        h(
          'div',
          { class: 'row' },
          button('Slip on the felt sleeve', 'felt', () =>
            move({ act: 'wrap', wrap: 'felt' }, 'The felt covers the copper.'),
          ),
          button('Keep the copper bare', 'bare', () =>
            move({ act: 'wrap', wrap: 'bare' }, 'The bare jug rests in its hoop.'),
          ),
        ),
      );
      if (packed === 'felt' || packed === 'bare')
        content.append(
          h(
            'p',
            {},
            packed === 'felt' ? 'Packed with the fitted felt sleeve.' : 'Packed with the copper showing.',
          ),
        );
      content.append(
        h('h3', {}, 'The saucers under the till'),
        h(
          'p',
          {},
          'Nine volunteers at each stop drew shuffled tickets. Each tasted the same reference cup once and made a pretend offer. Your pot is for the next shift.',
        ),
      );
      const select = h('select', {
        'data-cup-key': 'bench',
        'aria-label': 'Crew whose saucers to open',
        onchange: () => {
          bench = select.value as Bench;
          draw();
        },
      });
      (Object.keys(benches) as Bench[]).forEach((key) => select.append(h('option', { value: key }, benches[key])));
      select.value = bench;
      content.append(select);
      const rack = h('div', { class: 'cup-trays' });
      const order = cupFlag(s, 'display') === 'middle' ? keys : (['blank', 'two', 'eight'] as const);
      for (const ticket of order) {
        const up = cupFlag(s, bench + '.' + ticket) === true,
          offers = cupVotes[bench][ticket];
        const name = ticket === 'blank' ? 'Empty ticket' : 'Ticket marked ' + tickets[ticket];
        const well = h(
          'section',
          {},
          button(name, 'tray-' + ticket, () =>
            move({ act: 'tip', bench, ticket }, name + ' · three offers: ' + offers.join(', ') + '.'),
          ),
        );
        if (up) {
          well.append(h('p', {}, 'Offered · ' + offers.join(' / ')));
          if (cupFlag(s, 'display') === 'seats' || cupFlag(s, 'folds') === 'seats')
            well.append(h('small', {}, 'Three different seats drew this ticket.'));
        }
        rack.append(well);
      }
      content.append(rack);
      if (allTrays(s, bench))
        content.append(
          h(
            'details',
            {},
            h('summary', {}, 'Count this crew’s counters'),
            h(
              'p',
              {},
              keys.map((t) => tickets[t] + ' → mean offer ' + meanBid(cupVotes[bench][t])).join(' · ') +
                '. Three people per ticket. One person’s offer can cross the group pattern. Nobody who passed the cart was counted.',
            ),
          ),
        );
      if (allTrays(s, bench)) {
        const count = bench === 'mill' ? 4 : 6;
        const floor = h(
          'details',
          {},
          h('summary', {}, 'Turn over the runner’s tray'),
          h(
            'p',
            {},
            'A runner made one mark for each person they invited and pressed one cup ring for each offer.',
          ),
          h(
            'div',
            { class: 'row' },
            button('Trace the cup rings', 'count-cups', () =>
              move({ act: 'passers', bench, view: 'cups' }, 'There are nine offers. Each person appears once.'),
            ),
            button('Trace every invitation', 'count-feet', () =>
              move(
                { act: 'passers', bench, view: 'footsteps' },
                9 + count + ' invitations and nine offers. ' + count + ' people passed.',
              ),
            ),
          ),
        );
        const role = cupFlag(s, bench + '.view');
        if (role)
          floor.append(
            h(
              'p',
              {},
              role === 'cups'
                ? 'Nine cup rings. The average describes those who chose to offer.'
                : 9 +
                    count +
                    ' invitation marks. ' +
                    count +
                    ' have no cup ring. There is no amount to put in those places.',
            ),
          );
        if (role) floor.open = true;
        content.append(floor);
      }
      if (wearingCocoa(s)) {
        content.append(
          button('Set the unopened Carson’s tin beside the sign', 'tin', () =>
            move(
              { act: 'readTin' },
              'The label survives on the unopened tin. Neither its taste nor a crew’s full menu is on that label.',
            ),
          ),
        );
        if (cupFlag(s, 'label'))
          content.append(
            h(
              'p',
              {},
              'Scott Polar Research Institute · Y: 72/1/2. The cocoa label helps Kit name a product and leaves the taste of its contents open.',
            ),
          );
      }
      content.append(h('h3', {}, 'A wheel turns under the flap'));
      if (!cupFlag(s, 'rain'))
        content.append(
          button('Lift the rain flap', 'rain', () =>
            move({ act: 'rain' }, 'Rain carries the first figure off the chalkboard. Cen takes the wheel.'),
          ),
        );
      else
        content.append(
          h('p', {}, 'Rain threads the gutter. The open lane forks to the North Steps and the Old Weir.'),
        );
      if (!batch) {
        const ready =
          p.length === 4 &&
          (packed === 'bare' || packed === 'felt') &&
          Boolean(cupFlag(s, 'rain')) &&
          (allTrays(s, 'mill') || allTrays(s, 'steps'));
        if (!ready)
          content.append(
            h(
              'p',
              { class: 'fine' },
              'For the road, fill four scoops, pack the jug, open three ticket lids at one stop and look through the flap.',
            ),
          );
        content.append(
          h(
            'div',
            { class: 'row' },
            ...(['weir', 'steps'] as const).map((stop) =>
              button(
                'Roll to ' + stops[stop],
                'roll-' + stop,
                () =>
                  move(
                    { act: 'roll', stop },
                    'Cen takes the covered lane to ' + stops[stop] + '. Meet her through the flap on the right.',
                  ),
                !ready,
              ),
            ),
          ),
        );
      }
    }
    if (held) {
      const focus = content.querySelector<HTMLElement>('[data-cup-key="' + held + '"]:not(:disabled)');
      if (focus) focus.focus({ preventScroll: true });
      else if (root.isConnected) {
        live.tabIndex = -1;
        live.focus({ preventScroll: true });
      }
    }
  }
  draw();
  return root;
}
