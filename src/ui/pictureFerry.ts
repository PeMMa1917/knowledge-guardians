import type { GameController } from '../app/controller';
import { ferryCommissions } from '../content/ferryCommissions';
import { CALLBOARD_CASES } from '../content/callboardCases';
import {
  activePrint,
  carriesSheet,
  faceNames,
  ferrySheets,
  fittedSheet,
  lastSailing,
  printedSailing,
  seenSeat,
  wheelPose,
  windows,
  type FerryCommand,
  type FerrySeat,
  type FerrySheet,
} from '../domain/pictureFerry';
import { recordView } from '../domain/contentNotes';
import { h } from './dom';
import { artURL } from './illustrations';
import './pictureFerry.css';

function selector(label: string, sheets: readonly FerrySheet[], slug: string) {
  const select = h(
    'select',
    { 'aria-label': label },
    ...sheets.map((p) => h('option', { value: p.slug }, p.title)),
  );
  select.value = slug;
  return {
    select,
    label: h(
      'label',
      { class: 'ferry-choose' },
      label,
      h('span', { class: 'ferry-select-frame' }, select),
    ),
  };
}
function proof(sheet: FerrySheet, c: GameController) {
  const object = CALLBOARD_CASES.find((x) => x.slug === sheet.slug);
  if (!object)
    return h(
      'details',
      {},
      h('summary', {}, 'Bo’s supper ticket'),
      h('p', {}, sheet.lines.source),
    );
  const detail = h(
    'details',
    {},
    h('summary', {}, 'Open the print’s collection ticket'),
    h(
      'p',
      {},
      object.institution + ' · ' + object.accession + ' · ' + object.date,
    ),
    h('p', {}, object.record),
    h('p', {}, object.limit),
    h(
      'a',
      { href: object.sourceUrl, target: '_blank', rel: 'noopener noreferrer' },
      'Read the collection record',
    ),
  );
  const view = recordView(object.artifact, c.state.flags);
  if (view === 'illustrated' && object.asset) {
    const flap = h('details', {}, h('summary', {}, 'Unfold the picture'));
    flap.addEventListener('toggle', () => {
      if (flap.open && !flap.querySelector('img'))
        flap.append(
          h('img', {
            class: 'ferry-print',
            alt: object.alt,
            src: import.meta.env.BASE_URL + 'assets/' + object.asset,
            loading: 'lazy',
          }),
        );
    });
    detail.append(flap);
  }
  return detail;
}
const seatWord = { rail: 'At the outer rail', bunk: 'From the low bunk' };
function windowFigure(seat: FerrySeat) {
  const window = h('strong', {}),
    evidence = h('p', {});
  const figure = h(
    'article',
    { class: 'ferry-window', 'data-seat': seat },
    h('h3', {}, seatWord[seat]),
    window,
    evidence,
  );
  return { window, evidence, figure };
}
const crewLine = {
  sail: 'Bo rings from the bunk. The cook catches the light as the line slips free. Neris guards the remaining leaf for the next sailing.',
  moor: 'Tova makes fast. The cook and the child can trade windows. Neris takes the wet bank path so a passenger can have their seat on the connecting boat.',
};
export function printWheel(c: GameController, sound: (key: string) => void) {
  let sheet = activePrint(c.state);
  const owned = ferrySheets.filter((p) => carriesSheet(c.state, p));
  const root = h('section', { class: 'picture-ferry-work' }),
    choose = selector('Paper in the case', owned, sheet.slug);
  const voice = h('p', {}),
    flap = h('div', {}),
    rail = windowFigure('rail'),
    bunk = windowFigure('bunk');
  const instruction = h('p', {}),
    status = h('p', { role: 'status', class: 'ferry-response' });
  const commands = new Map<FerryCommand['action'], HTMLButtonElement>();
  function control(action: FerryCommand['action'], name: string) {
    const btn = h(
      'button',
      {
        type: 'button',
        onclick: () => {
          const ev = c.dispatch({
            type: 'TurnPictureFerry',
            slug: sheet.slug,
            action,
          });
          const error = ev.find((e) => e.kind === 'error');
          if (error) {
            status.textContent = error.message;
            return;
          }
          const arrangement = windows(wheelPose(c.state, sheet.slug));
          const line =
            action === 'fit'
              ? 'The sleeve catches on the spindle.'
              : action === 'turn'
                ? 'The handle clicks forward.'
                : action === 'reverse'
                  ? 'The rail keeps its leaf. The folded leaf and the bunk leaf exchange places.'
                  : action === 'rail' || action === 'bunk'
                    ? seatWord[action] + '. ' + sheet.lines[arrangement[action]]
                    : action === 'moor' || action === 'sail'
                      ? crewLine[action]
                      : '';
          sound(
            action === 'moor' || action === 'sail' ? 'sfx.coin' : 'sfx.page',
          );
          draw();
          status.textContent = line;
        },
      },
      name,
    );
    commands.set(action, btn);
    return btn;
  }
  const stage = h(
    'div',
    { class: 'ferry-window-stage' },
    rail.figure,
    h(
      'div',
      { class: 'ferry-spindle', 'aria-hidden': 'true' },
      h('img', { src: artURL('picture-ferry.lamp'), alt: '' }),
    ),
    bunk.figure,
  );
  root.append(
    h(
      'p',
      {},
      'Two windows share a lamp aboard Tova’s ferry. Bo waits by the low bunk. Neris squeezes in at the outer rail.',
    ),
    choose.label,
    voice,
    control('fit', 'Fit this paper to the spindle'),
    stage,
    h(
      'div',
      { class: 'row' },
      control('turn', 'Turn one notch'),
      control('reverse', 'Reverse the sleeve'),
    ),
    h(
      'div',
      { class: 'row' },
      control('rail', 'Stand at the rail'),
      control('bunk', 'Lie by the low bunk'),
    ),
    instruction,
    h(
      'div',
      { class: 'row' },
      control('sail', 'Ring the sailing bell'),
      control('moor', 'Tie up for the folded leaf'),
    ),
    status,
    flap,
  );
  function draw() {
    const fitted = fittedSheet(c.state, sheet.slug),
      pose = wheelPose(c.state, sheet.slug),
      faces = windows(pose);
    const checked =
      fitted &&
      seenSeat(c.state, sheet.slug, 'rail') &&
      seenSeat(c.state, sheet.slug, 'bunk');
    for (const [action, btn] of commands)
      btn.disabled =
        action === 'fit'
          ? fitted
          : action === 'moor' || action === 'sail'
            ? !checked
            : !fitted;
    for (const [side, window] of [
      ['rail', rail],
      ['bunk', bunk],
    ] as const) {
      const seen = fitted && seenSeat(c.state, sheet.slug, side);
      window.window.textContent = fitted
        ? faceNames[faces[side]]
        : 'Empty window';
      window.evidence.textContent = seen
        ? sheet.lines[faces[side]]
        : fitted
          ? 'Look through this window.'
          : 'A little light falls on the empty frame.';
      window.figure.dataset.face = fitted ? faces[side] : 'empty';
    }
    const job = ferryCommissions[sheet.slug];
    voice.textContent =
      sheet.title + ' · ' + job.caller + ' · “' + job.request + '”';
    instruction.textContent = checked
      ? 'Ring now to keep the connection. Tie up and let the crowd walk round to the folded leaf.'
      : fitted
        ? 'Try both windows with the sleeve in one position before you ring.'
        : 'Slide a sheet into the lamp to begin.';
    if (flap.dataset.slug !== sheet.slug) {
      flap.dataset.slug = sheet.slug;
      flap.replaceChildren(proof(sheet, c));
    }
  }
  choose.select.onchange = () => {
    sheet = owned.find((s) => s.slug === choose.select.value)!;
    status.textContent = '';
    draw();
  };
  draw();
  return root;
}
export function printPassenger(
  c: GameController,
  sound: (key: string) => void,
) {
  const root = h('section', { class: 'picture-ferry-work' }),
    trips = ferrySheets.filter(
      (s) => carriesSheet(c.state, s) && printedSailing(c.state, s),
    );
  if (!trips.length) {
    root.append(
      h(
        'p',
        {},
        'The passenger is waiting for the light to come on aboard the ferry.',
      ),
    );
    return root;
  }
  let sheet = lastSailing(c.state)?.sheet ?? trips[0];
  const choose = selector('Crossing to talk about', trips, sheet.slug),
    summary = h('p', {}),
    folded = h('p', {}),
    status = h('p', { role: 'status' }),
    flap = h('div', {});
  function speak(action: 'hear' | 'unfold', label: string) {
    return h(
      'button',
      {
        type: 'button',
        onclick: () => {
          const error = c
            .dispatch({ type: 'TurnPictureFerry', slug: sheet.slug, action })
            .find((e) => e.kind === 'error');
          if (error) {
            status.textContent = error.message;
            return;
          }
          const trip = printedSailing(c.state, sheet)!;
          sound('sfx.book');
          status.textContent =
            (action === 'unfold'
              ? 'I unfolded the third leaf. ' +
                sheet.lines[trip.faces.inside] +
                ' '
              : '') +
            ferryCommissions[sheet.slug].caller +
            ' · “' +
            ferryCommissions[sheet.slug].answer +
            '”';
        },
      },
      label,
    );
  }
  function draw() {
    const trip = printedSailing(c.state, sheet)!;
    summary.textContent =
      trip.route === 'moor'
        ? 'The passenger came aboard while Tova was tied up.'
        : 'The passenger saw the boat leave from the outer rail.';
    folded.textContent =
      trip.route === 'moor'
        ? 'At the open cabin, the third leaf read: ' +
          sheet.lines[trip.faces.inside]
        : 'The passenger took these words home from the lit rail: ' +
          sheet.lines[trip.faces.rail];
    status.textContent =
      typeof c.state.flags['picture-ferry.' + sheet.slug + '.readback'] ===
      'string'
        ? ferryCommissions[sheet.slug].answer
        : '';
    flap.replaceChildren(proof(sheet, c));
  }
  choose.select.onchange = () => {
    sheet = trips.find((s) => s.slug === choose.select.value)!;
    draw();
  };
  root.append(
    choose.label,
    summary,
    folded,
    h(
      'div',
      { class: 'row' },
      speak('hear', 'Listen to what the passenger remembers'),
      speak('unfold', 'Open the folded leaf together'),
    ),
    status,
    flap,
  );
  draw();
  return root;
}
