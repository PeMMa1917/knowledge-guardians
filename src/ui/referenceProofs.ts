import type { GameController } from '../app/controller';
import { PLATES, relativeAngle, type PracticePlate } from '../domain/referenceProofs';
import type { FlagValue } from '../domain/types';
import { h } from './dom';
import './referenceProofs.css';

type Scope = 'bone' | 'jikji' | 'astrolabe';
type Route = 'short' | 'full';

const routes: Record<Scope, { station: string; pitch: string; detail: string }[]> = {
  bone: [
    { station: 'dating card', pitch: 'Put the period and gift in separate rows on the reading rail.', detail: 'Both dated entries are visible in passing. The original catalogue stays at the case.' },
    { station: 'study folder', pitch: 'Keep the two dates with their different catalogue fields.', detail: 'The reader can open the longer original reference beside the guide.' },
  ],
  jikji: [
    { station: 'edition card', pitch: 'Send the accession, volume number and metal-type date on a single card.', detail: 'The runner hands readers one stable reference. A second workshop turn is needed to see the experiments.' },
    { station: 'press folder', pitch: 'File both practice pulls beside the accession and edition.', detail: 'A visitor can see which pieces moved independently. The second turn at the press takes longer.' },
  ],
  astrolabe: [
    { station: 'quay note', pitch: 'Carry one reading with its plate and observation back to the quay.', detail: 'The observer can use the note at the named practice site.' },
    { station: 'archive pair', pitch: 'Keep both readings and the common observation together at the Bell Archive.', detail: 'The keeper can show the two results from the fixed mark.' },
  ],
};

export function referenceProofPanel(controller: GameController, station: string, sound: (name: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'reference-proof', tabindex: -1 });
  const [key, role] = station.split('.');
  if (key !== 'bone' && key !== 'jikji' && key !== 'astrolabe') return panel;
  const scope = key;
  const flag = (suffix: string) => controller.state.flags[`scope.${scope}.${suffix}`];
  const set = (suffix: string, value: FlagValue) => {
    controller.dispatch({ type: 'SetFlag', flag: `scope.${scope}.${suffix}`, value });
    sound('sfx.page');
    refresh();
  };

  if (role === 'short' || role === 'full') {
    const description = routes[scope][role === 'short' ? 0 : 1];
    const note = h('p', { class: 'fine', role: 'status' });
    const button = h('button', { type: 'button', onclick: () => {
      if (flag('sent') !== role) return;
      set('mounted', true);
      set('display', role);
      update();
      note.tabIndex = -1;
      note.focus();
    } }, 'Mount the checked copy');
    const update = () => {
      const hung = flag('display') === role;
      button.disabled = hung || flag('sent') !== role;
      note.textContent = hung ? description.detail : 'The clips are ready for the checked copy.';
      button.textContent = hung ? 'Copy mounted' : 'Mount the checked copy';
    };
    const postedAngle = Number(flag('sent.angle'));
    const contents = scope === 'bone' ? 'Period in the collection record: Shang dynasty, about 1600–1046 BCE. Gift recorded in 1967.'
      : scope === 'jikji' ? 'Coréen 109: second volume, cast movable metal type, Cheongju, 1377. The reported woodblock edition has its own date of 1378.'
      : role === 'short'
        ? `Quay plate: ${relativeAngle(postedAngle, 'quay')}° from the plate reference, with the arm at ${postedAngle}° in the practice dial.`
        : `Arm at ${postedAngle}° in both runs. Quay reading ${relativeAngle(postedAngle, 'quay')}°. Ledge reading ${relativeAngle(postedAngle, 'ledge')}°.`;
    panel.append(h('h2', {}, description.station), h('p', {}, contents));
    if (scope === 'jikji' && role === 'full') panel.append(
      h('p', { class: 'reference-glyphs' }, '◆ ▲ ■'), h('p', {}, 'Only the middle piece changed on the new movable-type pull.'),
      h('p', { class: 'reference-glyphs' }, '◆ ● ■'), h('p', {}, 'The solid block kept all three marks together.'));
    panel.append(button, note);
    update();
    return panel;
  }

  const routeReady = () => scope === 'bone' ? flag('period') === true && flag('gift') === true
    : scope === 'jikji' ? flag('types.updated') === true && flag('block.printed') === true
      : typeof flag('angle.quay') === 'number' && flag('angle.quay') === flag('angle.ledge');

  const notice = h('p', { class: 'fine', role: 'status' });
  const decisions = routes[scope].map(({ pitch }, i) => h('button', { type: 'button', onclick: () => {
    if (!routeReady()) return;
    const route: Route = i === 0 ? 'short' : 'full';
    if (flag('sent') !== route || (scope === 'astrolabe' && flag('sent.angle') !== flag('angle.quay'))) set('display', false);
    if (scope === 'astrolabe') set('sent.angle', Number(flag('angle.quay')));
    set('sent', route);
    updateRoutes();
  } }, pitch));
  const updateRoutes = () => {
    decisions.forEach((button, i) => {
      button.disabled = !routeReady();
      button.setAttribute('aria-pressed', String(flag('sent') === (i === 0 ? 'short' : 'full')));
    });
    const selected = flag('sent');
    notice.textContent = selected === 'short' || selected === 'full'
      ? `Follow the copy to the ${routes[scope][selected === 'short' ? 0 : 1].station}.`
      : 'Keep the checked references with the next copy.';
  };

  if (scope === 'bone') {
    panel.append(h('h2', {}, 'Two dates for one object'),
      h('p', {}, '67.43.16 is the inscribed specimen. Walk to both drawers and clip a record tab from each. The gift line names Paul E. Manheim. The other tab gives the period.'),
      h('div', { class: 'row' },
        h('p', {}, flag('period') ? 'Period tab: Shang dynasty, about 1600–1046 BCE.' : 'Period tab empty.'),
        h('p', {}, flag('gift') ? 'Gift tab: 1967.' : 'Gift tab empty.')));
  } else if (scope === 'jikji') {
    // Abstract shapes keep the printing action separate from the historical religious text.
    const feed = h('div', { class: 'reference-print-feed', role: 'status' });
    const shape = (pattern: string, label: string) => h('figure', {}, h('div', {
      class: 'reference-glyphs', role: 'img', 'aria-label': label,
    }, pattern), h('figcaption', {}, label));
    const updatePaper = () => {
      const old = flag('types.old');
      const changed = flag('types.updated');
      const block = flag('block.printed');
      feed.replaceChildren(
        ...(old ? [shape('◆ ● ■', 'First movable-type pull')] : []),
        ...(changed ? [shape('◆ ▲ ■', 'Movable type with the middle piece exchanged')] : []),
        ...(block ? [shape('◆ ● ■', 'Single proof from a whole block')] : []),
      );
      exchange.disabled = !old;
      updateRoutes();
    };
    const first = h('button', { type: 'button', onclick: () => { set('types.old', true); updatePaper(); } }, 'Pull with three separate type pieces');
    const exchange = h('button', { type: 'button', onclick: () => { set('types.updated', true); updatePaper(); } }, 'Exchange the middle piece and pull again');
    const whole = h('button', { type: 'button', onclick: () => { set('block.printed', true); updatePaper(); } }, 'Pull one impression from the carved block');
    panel.append(h('h2', {}, 'The volume and the proof'),
      h('p', {}, 'Baegun compiled the work. The BnF identifies the printing with its own date and method. Try two forms with the same three practice shapes. Only the movable form has a middle piece you can lift out alone.'),
      h('div', { class: 'row' }, first, exchange, whole), feed);
    updatePaper();
  } else {
    const angle = h('input', { type: 'range', min: 0, max: 90, step: 15, value: 45, 'aria-label': 'Arm angle on the practice dial' });
    const dial = h('div', { class: 'reference-dial', 'aria-hidden': 'true' }, h('span'));
    const status = h('div', { class: 'fine', role: 'status' });
    let active: PracticePlate = 'quay';
    const read = (plate: PracticePlate) => {
      active = plate;
      set(`angle.${plate}`, Number(angle.value));
      updateDial();
    };
    const updateDial = () => {
      dial.style.setProperty('--arm', `${Number(angle.value)}deg`);
      const plate = PLATES.find(({ id }) => id === active)!;
      dial.style.setProperty('--plate-offset', `${plate.offset}deg`);
      const readings = PLATES.flatMap(({ id, name }) => {
        const held = flag(`angle.${id}`);
        return typeof held === 'number' ? [`${name}: arm at ${held}°, reading ${relativeAngle(held, id)}°.`] : [];
      });
      status.textContent = [`Practice arm at ${angle.value}°. ${plate.name} in place.`, ...readings, 'Keep the same arm angle for both plate readings.'].join(' ');
      updateRoutes();
    };
    angle.addEventListener('input', updateDial);
    panel.append(h('h2', {}, 'One arm and two place plates'),
      h('p', {}, 'The historical case names ‘Umar ibn Yusuf. These two fictional practice plates are for comparing how a place scale changes a reading. Hold one observation while you change its plate.'),
      dial, h('label', {}, 'Turn the arm', angle),
      h('div', { class: 'row' }, ...PLATES.map(({ id, name }) => h('button', { type: 'button', onclick: () => read(id) }, `Read with the ${name.toLowerCase()}`))), status);
    updateDial();
  }

  panel.append(notice, ...decisions);
  updateRoutes();
  return panel;
}
