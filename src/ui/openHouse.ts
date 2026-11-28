import type { GameController } from '../app/controller';
import { h } from './dom';
import { localGuide } from './localGuide';
import { creaturePortrait } from './nightCreature';
import {
  floorSeam,
  measureLine,
  cardStep,
  houseNote,
  cartPosition,
  chairNames,
  chairs,
  chalkAccount,
  destinationNames,
  fieldMemo,
  floorNames,
  houseFlag,
  houseGuest,
  household,
  houseRoom,
  housePorch,
  inRoom,
  issuedHouse,
  knownGuests,
  lanternPosition,
  lightingLine,
  membership,
  modelFloors,
  openings,
  pastLamps,
  plans,
  reached,
  roomGuestLine,
  sight,
  sketch,
  trialWords,
  turns,
  type Destination,
  type HouseCommand,
} from '../domain/openHouse';
import './openHouse.css';
type Action = HouseCommand extends infer X ? (X extends HouseCommand ? Omit<X, 'type'> : never) : never;
type Bench = 'plan' | 'roost' | 'cart' | 'light' | 'table' | 'porch';
const keys = <T extends object>(source: T) => Object.keys(source) as (keyof T)[];
const txt = (s: string) => h('p', {}, s);
const row = (...nodes: HTMLElement[]) => h('div', { class: 'middle-buttons' }, ...nodes);
const icon = { north: '↑', south: '↓', east: '→', west: '←' };
const templateNames = {
  lunch: 'Tover’s supper floor',
  song: 'Neska’s song floor',
  green: 'Yilka’s garden floor',
};
type MoveResult = (cmd: Action, key: string) => void;
export function paintHousehold(c: GameController) {
  const pictures = new Map<string, HTMLCanvasElement>();
  return (g: CanvasRenderingContext2D, t: number) => {
    for (const { seat, f, here } of household(c.state)) {
      if (!here) continue;
      let pic = pictures.get(f.id);
      if (!pic) {
        pic = creaturePortrait(f);
        pictures.set(f.id, pic);
      }
      const [x, y] = seat === 'mat' ? [59, 112] : seat === 'sill' ? [114, 74] : [148, 102];
      const bob = t > 0 && Math.floor(t / 900 + f.site.index) % 5 === 0 ? 1 : 0;
      g.drawImage(pic, x, y - bob, 16, 14);
    }
  };
}
function button(key: string, label: string, run: () => void, pressed?: boolean) {
  return h(
    'button',
    {
      type: 'button',
      'data-house': key,
      ...(pressed === undefined ? {} : { 'aria-pressed': String(pressed) }),
      onclick: run,
    },
    label,
  );
}
function nativeWork(run: MoveResult) {
  return (key: string, label: string, act: Action, pressed?: boolean) =>
    button(key, label, () => run(act, key), pressed);
}
export function roostCorner(
  c: GameController,
  run: MoveResult,
  chosen: () => string,
  select: (v: string) => void,
) {
  const known = knownGuests(c.state),
    work = nativeWork(run),
    here = ['nexus.archive', houseRoom, housePorch].includes(c.state.mapId);
  const seats = h('div', { class: 'middle-chairs' });
  for (const chair of chairs) {
    const f = houseGuest(c.state, chair),
      box = h('section', { class: 'middle-seat' }, h('h4', {}, chairNames[chair]));
    if (f) {
      if (inRoom(c.state, f)) box.append(creaturePortrait(f), txt(f.name + ' · ' + f.family.species));
      else box.append(txt(f.name + ' is out with you. The place is waiting.'));
      if (here) {
        box.append(
          row(
            work('hear-' + chair, 'Sit with ' + f.name, { act: 'hear', chair }),
            work('clear-' + chair, 'Leave this place empty', { act: 'clear', chair }),
          ),
        );
      }
    } else box.append(txt('A place is free.'));
    if (here && known.length)
      box.append(
        button('seat-' + chair, 'Offer this place', () =>
          run({ act: 'seat', chair, guest: chosen() }, 'seat-' + chair),
        ),
      );
    seats.append(box);
  }
  const roster = h('div', { class: 'middle-roster' });
  if (here && known.length) {
    const picker = h(
      'select',
      {
        'aria-label': 'Choose a known companion',
        onchange: (event: Event) => select((event.target as HTMLSelectElement).value),
      },
      ...known.map((f) =>
        h('option', { value: f.id, selected: f.id === chosen() }, f.name + ' · ' + f.family.species),
      ),
    );
    roster.append(h('label', {}, 'Invite a returning companion', picker));
  } else
    roster.append(
      txt(
        known.length
          ? 'The house is visible from your journal. Offer a seat when you come home.'
          : 'At a chapter register a creature may let you watch, offer it a perch and travel together. Its place here will be yours to arrange.',
      ),
    );
  roster.append(seats);
  return roster;
}
export function housePanel(
  c: GameController,
  sound: (key: string) => void,
  bench: Bench,
  changed?: () => void,
) {
  let tapeOpen = false,
    active = 4,
    selected = knownGuests(c.state)[0]?.id ?? '';
  const live = h('p', {
      role: 'status',
      'aria-live': 'polite',
      class: 'middle-feedback',
      'data-work-feedback': '',
    }),
    body = h('div'),
    shell = h('section', { class: 'middle-house', 'data-reading-bench': '' }, body, live);
  const guide = localGuide(
    c,
    bench === 'cart'
      ? 'WORLD-02'
      : bench === 'light'
        ? 'WORLD-09'
        : bench === 'table'
          ? 'WORLD-14'
          : 'WORLD-01',
    bench === 'cart'
      ? 'middlehouse.cart'
      : bench === 'light'
        ? 'middlehouse.lamp'
        : bench === 'table'
          ? 'middlehouse.night'
          : bench === 'roost'
            ? 'middlehouse.guests'
            : 'middlehouse.plan',
  );
  function focus(key: string) {
    shell.querySelector<HTMLElement>('[data-house="' + key + '"]')?.focus({ preventScroll: true });
  }
  function run(cmd: Action, key: string) {
    const error = c.dispatch({ type: 'FitMiddleDoor', ...cmd }).find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    const s = c.state;
    let note = '';
    switch (cmd.act) {
      case 'seat': {
        const f = houseGuest(s, cmd.chair)!;
        note =
          chairNames[cmd.chair] +
          ' now has a place for ' +
          f.name +
          '. ' +
          (inRoom(s, f) ? 'Someone is home.' : 'The place will be waiting when your traveller gets home.');
        break;
      }
      case 'clear':
        note = 'The place is free. Its former resident still knows you.';
        break;
      case 'hear':
        note =
          roomGuestLine(s, houseGuest(s, cmd.chair)!, cmd.chair) +
          ' ' +
          (cmd.chair === 'mat'
            ? 'A route thread for the Emberford cart is in your pocket.'
            : cmd.chair === 'sill'
              ? 'A sightline tracing for the harbour lamp is in your pocket.'
              : issuedHouse(s)
                ? 'The resident has kept a fold of your issued floor.'
                : 'The resident can keep a floor here once you issue one.');
        break;
      case 'route-note': {
        const path = cardStep(s, cmd.to);
        note =
          houseNote(s, 'mat')!.name +
          '’s thread. ' +
          (path === undefined
            ? 'These wheels cannot reach that opening on this floor.'
            : path.length
              ? 'Try ' +
                path[0] +
                ' first. ' +
                path.length +
                ' moves lead to ' +
                destinationNames[cmd.to] +
                '.'
              : 'The cart is already at that opening.');
        break;
      }
      case 'lamp-note':
        note =
          houseNote(s, 'sill')!.name +
          ' left a sightline at ' +
          floorNames[lanternPosition(s)] +
          '. Light the actual lamp to check it.';
        break;
      case 'unfold':
        note = 'The hearth sheet is on the floor. The town still has the last version you issued.';
        break;
      case 'seam':
        note =
          cmd.seam === 'stretched'
            ? 'Three extra paces of cloth unfolded between the middle and right columns. Each door still meets the same room.'
            : 'The long seam is tucked in. Every crossing is one pace.';
        break;
      case 'measure':
        note = measureLine(sketch(s), cmd.visitor, cmd.to, floorSeam(s));
        break;
      case 'turn':
        note = floorNames[cmd.cell] + ' now opens ' + openings(sketch(s), cmd.cell).join(', ') + '.';
        break;
      case 'template':
        note = templateNames[cmd.layout] + ' is open for changes.';
        break;
      case 'chalk':
        note = chalkAccount({ visitor: cmd.visitor, floor: sketch(s) });
        break;
      case 'issue':
        note =
          'The pressed floor goes out with a request. ' +
          plans[cmd.purpose] +
          '. Tover can try the cart in Emberford.';
        break;
      case 'step':
      case 'undo':
      case 'restart':
        note =
          'The kettle is at ' +
          floorNames[cartPosition(s)] +
          '. ' +
          (reached(issuedHouse(s)!, cartPosition(s))
            ? 'The outside opening is clear.'
            : 'The buttons settle in the pot.');
        break;
      case 'park':
        note = trialWords[fieldMemo(s).r!];
        break;
      case 'place':
        note = 'The shutter is at ' + floorNames[cmd.cell] + '. Open it to take a reading.';
        break;
      case 'light':
        note = lightingLine(issuedHouse(s)!, lanternPosition(s));
        break;
      case 'file':
        note =
          'Yilka keeps the lamp at ' +
          floorNames[lanternPosition(s)] +
          '. ' +
          lightingLine(issuedHouse(s)!, lanternPosition(s));
        break;
      case 'table':
        note = String(houseFlag(s, 'houseEcho'));
        break;
    }
    sound(cmd.act === 'issue' || cmd.act === 'table' ? 'sfx.page' : 'sfx.click');
    draw();
    changed?.();
    focus(key);
    live.textContent = note;
  }
  const work = nativeWork(run);
  function board(floor: string, kind: 'draft' | 'cart' | 'lamp') {
    const source =
      kind === 'cart' ? cartPosition(c.state) : kind === 'lamp' ? lanternPosition(c.state) : active;
    const marked = kind === 'lamp' && pastLamps(c.state).includes(source) ? sight(floor, source) : [];
    const tiles = h('div', {
      class: 'middle-floor',
      'aria-label': 'Nine rooms, from the coat hooks to the pantry',
    });
    for (const [i, name] of floorNames.entries()) {
      const ways = openings(floor, i),
        text = ways.map((d) => icon[d]).join(' '),
        cell =
          kind === 'draft' || kind === 'lamp'
            ? button(
                'tile-' + i,
                '',
                () => {
                  if (kind === 'lamp') run({ act: 'place', cell: i }, 'tile-' + i);
                  else {
                    active = i;
                    draw();
                    focus('tile-' + i);
                    live.textContent = name + '. Open ends face ' + ways.join(', ') + '.';
                  }
                },
                source === i,
              )
            : h('div', { class: 'middle-fixed' });
      cell.classList.add('middle-tile');
      if (marked.includes(i)) cell.classList.add('lit');
      cell.setAttribute(
        'aria-label',
        name +
          ', opens ' +
          ways.join(', ') +
          (source === i
            ? kind === 'cart'
              ? ', kettle here'
              : kind === 'lamp'
                ? ', lantern here'
                : ', selected'
            : '') +
          (marked.includes(i) ? ', visible' : ''),
      );
      cell.append(h('span', { class: 'middle-pip', 'aria-hidden': 'true' }, text), h('small', {}, name));
      if (source === i)
        cell.append(
          h(
            'b',
            { class: 'middle-marker' },
            kind === 'cart' ? 'Kettle' : kind === 'lamp' ? 'Lamp' : 'Selected',
          ),
        );
      if (marked.includes(i) && kind === 'lamp' && source !== i)
        cell.append(h('b', { class: 'middle-marker' }, 'In sight'));
      tiles.append(cell);
    }
    return tiles;
  }
  function design() {
    const s = c.state,
      plan = sketch(s);
    return [
      h('h3', {}, 'The floor that fits under a mat'),
      txt(
        'Turn any room. The two ends of a doorway must face each other. The mat opens to the street on its west. The middle sill catches a wheel coming from either side.',
      ),
      row(
        ...keys(modelFloors).map((v) =>
          work('layout-' + v, templateNames[v], { act: 'template', layout: v }, plan === modelFloors[v]),
        ),
      ),
      board(plan, 'draft'),
      ...(houseNote(s, 'hearth') && houseFlag(s, 'foldedFloor')
        ? [
            work('unfold', 'Unfold ' + houseNote(s, 'hearth')!.name + '’s remembered floor', {
              act: 'unfold',
            }),
          ]
        : []),
      h('h4', {}, floorNames[active]),
      row(
        work('left', 'Turn a quarter left', { act: 'turn', cell: active, by: -1 }),
        work('right', 'Turn a quarter right', { act: 'turn', cell: active, by: 1 }),
      ),
      h('h4', {}, 'Two ways to trace the rooms'),
      row(
        work('chalk-foot', 'Lay down a flat shoe', { act: 'chalk', visitor: 'foot' }),
        work('chalk-wheel', 'Roll a handcart through', { act: 'chalk', visitor: 'wheel' }),
      ),
      ...(['foot', 'wheel'] as const)
        .filter((v) => houseFlag(s, 'walk.' + v) === plan)
        .map((v) => txt(chalkAccount({ visitor: v, floor: plan }))),
      h(
        'details',
        {
          open: tapeOpen,
          ontoggle: (event: Event) => {
            const box = event.currentTarget as HTMLDetailsElement;
            if (box.isConnected) tapeOpen = box.open;
          },
        },
        h('summary', {}, 'The concertina seam and Tover’s tape'),
        txt(
          'On the folded floor each door is one pace from the next. Pull the seam out and each crossing between the middle and right columns takes four paces. The nine rooms stay joined in the same places.',
        ),
        row(
          work('folded', 'Fold in the east seam', { act: 'seam', seam: 'folded' }, floorSeam(s) === 'folded'),
          work(
            'stretched',
            'Stretch the east seam',
            { act: 'seam', seam: 'stretched' },
            floorSeam(s) === 'stretched',
          ),
        ),
        ...(['foot', 'wheel'] as const).map((visitor) =>
          row(
            ...keys(plans).map((to) =>
              work(
                'measure-' + visitor + '-' + to,
                'Measure the ' + (visitor === 'foot' ? 'shoe' : 'cart') + ' to ' + destinationNames[to],
                { act: 'measure', visitor, to },
              ),
            ),
          ),
        ),
      ),
      h('h4', {}, 'What should this house make possible?'),
      row(...keys(plans).map((k) => work('issue-' + k, plans[k], { act: 'issue', purpose: k }))),
      ...(issuedHouse(s)
        ? [
            txt(
              'A pressed copy is in Emberford, on the harbour stair and in the Listening Room. You can still turn the paper tiles here.',
            ),
          ]
        : []),
    ];
  }
  function cart() {
    const s = c.state,
      f = issuedHouse(s)!;
    return [
      h('h3', {}, 'Soup for somebody with a spoon'),
      txt(
        'The chalk rooms are life size here. The kettle starts at the front mat. Push through a doorway or pull in the last chalk line.',
      ),
      board(f, 'cart'),
      ...(houseNote(s, 'mat')
        ? [
            h('h4', {}, houseNote(s, 'mat')!.name + '’s door thread'),
            row(
              ...keys(plans).map((to) =>
                work('thread-' + to, 'Find a way to ' + destinationNames[to], { act: 'route-note', to }),
              ),
            ),
          ]
        : []),
      row(...turns.map((face) => work('push-' + face, 'Push ' + face, { act: 'step', face }))),
      row(
        work('undo', 'Pull in the last chalk line', { act: 'undo' }),
        work('restart', 'Roll back to the mat', { act: 'restart' }),
        work('park', 'Park the kettle at this opening', { act: 'park' }),
      ),
    ];
  }
  function lamp() {
    const s = c.state,
      f = issuedHouse(s)!,
      shots = pastLamps(s);
    return [
      h('h3', {}, 'One lamp for the harbour'),
      txt(
        'Choose a reachable hook on the floor. Light travels in a straight line through open doors. A person can walk round the corner.',
      ),
      board(f, 'lamp'),
      ...(houseNote(s, 'sill')
        ? [
            h('h4', {}, houseNote(s, 'sill')!.name + '’s sightline'),
            row(
              ...keys(plans).map((to) =>
                work('sight-' + to, 'Find a hook for ' + destinationNames[to], { act: 'lamp-note', to }),
              ),
            ),
          ]
        : []),
      row(
        work('light', 'Open the lamp at this hook', { act: 'light' }),
        work('file', 'Leave Yilka the lamp here', { act: 'file' }),
      ),
      ...shots.map((i) => txt(floorNames[i] + '. ' + lightingLine(f, i))),
    ];
  }
  function meeting() {
    const s = c.state,
      info = fieldMemo(s);
    if (bench === 'porch')
      return [
        h('h3', {}, 'The room that was missing'),
        txt(String(houseFlag(s, 'houseEcho') ?? 'Somebody has left a spoon by the door.')),
        txt(
          String(
            houseFlag(s, 'porchJourney') ??
              'The kettle first came to ' +
                destinationNames[houseFlag(s, 'porchStop') as Destination] +
                '. ' +
                String(houseFlag(s, 'porchLamp') ?? ''),
          ),
        ),
      ];
    return [
      h('h3', {}, 'Three keys for the same room'),
      txt(
        info.r
          ? 'Tover’s cart reached ' + destinationNames[info.r] + '.'
          : 'There is a clean place for the Emberford cart slip.',
      ),
      txt(
        info.spot === undefined
          ? 'The harbour light has not been returned for this floor.'
          : lightingLine(info.floor!, info.spot),
      ),
      row(...keys(plans).map((k) => work('table-' + k, plans[k], { act: 'table', who: k }))),
      ...(typeof houseFlag(s, 'houseEcho') === 'string' ? [txt(String(houseFlag(s, 'houseEcho')))] : []),
    ];
  }
  function draw() {
    const s = c.state,
      f = issuedHouse(s);
    let content: HTMLElement[];
    if (bench === 'roost')
      content = [
        roostCorner(
          c,
          run,
          () => selected,
          (v) => {
            selected = v;
          },
        ),
      ];
    else if (bench === 'plan') content = design();
    else if (!f) content = [txt('A travelling floor can be made at the inn under the Nexus mat.')];
    else content = bench === 'cart' ? cart() : bench === 'light' ? lamp() : meeting();
    body.replaceChildren(...content, txt('The open-house guild · ' + membership(s)));
  }
  draw();
  shell.append(guide);
  return shell;
}
