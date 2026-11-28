import type { GameController } from '../app/controller';
import {
  billNames,
  billOrder,
  heardPages,
  billParts,
  faceAtPart,
  partLine,
  slotSheet,
  type BillPart,
} from '../domain/ferryBill';
import {
  carriesSheet,
  ferrySheets,
  printedSailing,
} from '../domain/pictureFerry';
import { h } from './dom';

export function ferryBillLine(c: GameController, sound: (key: string) => void) {
  const root = h('section', { class: 'picture-ferry-work' }),
    ready = ferrySheets.filter(
      (s) => s.item && carriesSheet(c.state, s) && printedSailing(c.state, s),
    );
  root.append(
    h(
      'p',
      {},
      'Bo has drawn three clothes pegs on the old supper bill. “One for what you saw, one for who kept it, and one for the thing they’re still arguing about over supper.”',
    ),
  );
  if (!ready.length) {
    root.append(
      h(
        'p',
        {},
        'Bring a signed Civic print and give it one crossing in the lamp. Bo can hang the first page as soon as it comes out.',
      ),
    );
    return root;
  }
  const choice = h(
    'select',
    { 'aria-label': 'Print to rehearse' },
    ...ready.map((s) => h('option', { value: s.slug }, s.title)),
  );
  const part = h(
    'select',
    { 'aria-label': 'Part of the show' },
    ...billParts.map((p) => h('option', { value: p }, billNames[p])),
  );
  const preview = h('p', { class: 'clue-view' }),
    list = h('ol', {}),
    status = h('p', { role: 'status' }),
    bill = h('div', {});
  const refresh = () => {
    const candidate = ready.find((x) => x.slug === choice.value)!;
    const role = part.value as BillPart,
      current = slotSheet(c.state, role);
    preview.textContent =
      faceAtPart(role) +
      ' · ' +
      partLine(role, candidate) +
      (current && current.slug !== candidate.slug
        ? ' In this place now: ' + current.title + '.'
        : '');
    list.replaceChildren(
      ...billParts.map((p) =>
        h(
          'li',
          {},
          h('strong', {}, billNames[p] + ' · '),
          slotSheet(c.state, p)?.title ?? 'Empty peg',
        ),
      ),
    );
    const full = billParts.every((p) => slotSheet(c.state, p));
    for (const b of bill.querySelectorAll('button')) b.disabled = !full;
  };
  choice.onchange = part.onchange = refresh;
  const hang = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        const e = c
          .dispatch({
            type: 'HangFerryPrint',
            part: part.value as BillPart,
            slug: choice.value,
          })
          .find((e) => e.kind === 'error');
        if (e) {
          status.textContent = e.message;
          return;
        }
        sound('sfx.page');
        refresh();
        status.textContent =
          'Neris pegs the page in place. The rest of the drying line is ready to try.';
      },
    },
    'Hang this page in the show',
  );
  for (const who of ['rail', 'bunk'] as const)
    bill.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () => {
            const e = c
              .dispatch({ type: 'OpenFerryBill', first: who })
              .find((e) => e.kind === 'error');
            if (e) {
              status.textContent = e.message;
              return;
            }
            sound('sfx.book');
            status.textContent =
              who === 'rail'
                ? 'The picture opens the performance. Hari has taken the bill to the theatre gallery.'
                : 'The child asks the open question first. Listen to what the next two pages do with it in the theatre gallery.';
          },
        },
        who === 'rail'
          ? 'Give the rail the opening picture'
          : 'Let the bunk open with its question',
      ),
    );
  bill.className = 'row';
  root.append(
    h('label', { class: 'ferry-choose' }, 'Print to rehearse', choice),
    h('label', { class: 'ferry-choose' }, 'Part of the show', part),
    preview,
    hang,
    list,
    bill,
    status,
  );
  refresh();
  return root;
}
export function ferryBillAudience(
  c: GameController,
  sound: (key: string) => void,
) {
  const root = h('section', { class: 'picture-ferry-work' });
  if (!billParts.every((p) => slotSheet(c.state, p, true))) {
    root.append(
      h(
        'p',
        {},
        'Hari has reserved three spaces on the evening bill. The ferry has the programme line.',
      ),
    );
    return root;
  }
  const order = billOrder(c.state),
    pages = h('ol', {}),
    status = h('p', { role: 'status' });
  const draw = () => {
    const shown = heardPages(c.state);
    pages.replaceChildren(
      ...order.slice(0, shown).map((part) => {
        const sheet = slotSheet(c.state, part, true)!;
        return h(
          'li',
          {},
          h('strong', {}, sheet.title),
          h('p', {}, partLine(part, sheet)),
        );
      }),
    );
    next.textContent =
      shown === order.length
        ? 'Ask Hari to read the bill again'
        : 'Let Hari turn the next page';
    status.textContent =
      shown === order.length
        ? order[0] === 'afterword'
          ? 'The last person in the queue repeats Bo’s opening question. Hari leaves it on the ticket rack for tomorrow.'
          : 'A child runs back to the picture from the first act. Hari holds the lamp while they look again.'
        : shown
          ? shown + ' of 3 pages heard.'
          : '';
  };
  const next = h('button', {
    type: 'button',
    onclick: () => {
      const error = c
        .dispatch({
          type: 'HearFerryBill',
          action: heardPages(c.state) === order.length ? 'reopen' : 'turn',
        })
        .find((e) => e.kind === 'error');
      if (error) {
        status.textContent = error.message;
        return;
      }
      sound('sfx.page');
      draw();
    },
  });
  draw();
  root.append(
    h(
      'p',
      {},
      '“Bo picked a place for everyone,” says Hari. “I’ve kept the order you sent.”',
    ),
    pages,
    next,
    status,
  );
  return root;
}
