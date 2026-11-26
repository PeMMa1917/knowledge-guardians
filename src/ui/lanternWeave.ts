import type { GameController } from '../app/controller';
import { specimenArt } from '../app/specimenArt';
import { DISPLAY_ROUTES, LANTERN_LEAVES, type LanternLeaf, type LanternRoute } from '../content/lanternWeave';
import { BEAM_TRAVEL, BEAM_WIDTH, beamCovers, SIDES, type BeamSide } from '../domain/lanternWeave';
import { h } from './dom';
import './lanternWeave.css';

const READERS = { window: 'Nell’s daylight stand', table: 'Hem’s whole-sheet drawer' };
const PRESS_PREVIEWS = {
  flow: 'The first sign faces the line and points towards the clear ramp. At the turn, a reader can draw out the date and source without standing in the middle of the line.',
  review: 'The full sheet faces the waiting bench, beside the source drawer. A separate arrow at the first hook leaves the footway clear. A returning carrier has to stop before reading the date.',
} as const;

export function lanternWeavePanel(controller: GameController, station: string, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'half-light', tabindex: -1 });
  const flag = (key: string) => controller.state.flags[key];
  const set = (key: string, value: string | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag: key, value });
    sound('sfx.page');
    refresh();
  };
  const split = (record: LanternLeaf) => h('a', { href: record.source, target: '_blank', rel: 'noopener' }, `Collection ${record.accession} · ${record.date}`);
  function reader(route: LanternRoute) {
    const copies = LANTERN_LEAVES.filter((record) => flag(`${record.flag}.sent`) === route);
    const list = h('div', { class: 'half-light-copies' });
    panel.append(h('h2', {}, READERS[route]),
      h('p', {}, route === 'window' ? 'One side of the picture can catch a reader before the queue moves.'
        : 'The drawer keeps the edge of the paper and the name of the artist with the scene.'),
      copies.length ? list : h('p', {}, 'The hook is free. Bring a viewing copy from a lantern arm in the Half-Light Room.'));
    for (const record of copies) {
      const hung = flag(`${record.flag}.hung`) === route;
      const reply = h('p', { class: 'fine', role: 'status' }, hung ? record[route === 'window' ? 'windowReply' : 'tableReply'] : 'The copy is rolled beneath the hook.');
      const hook = h('button', { type: 'button', disabled: hung, onclick: () => {
        set(`${record.flag}.hung`, route);
        reply.textContent = record[route === 'window' ? 'windowReply' : 'tableReply'];
        hook.textContent = 'Copy on the hook';
        hook.disabled = true;
        reply.tabIndex = -1;
        reply.focus();
      } }, hung ? 'Copy on the hook' : `Hang ${record.accession} here`);
      const sourceSlip = h('p', { class: 'fine' }, split(record));
      list.append(h('article', { class: 'half-light-copy' }, h('h3', {}, record.title), sourceSlip, hook, reply));
    }
  }
  function printHook() {
    const needed = ['flow', 'review'] as const;
    const state = h('p', { role: 'status', class: 'fine' });
    const proof = LANTERN_LEAVES.find(({ objective }) => controller.state.objectivesDone.includes(objective));
    const trialNote = h('p', { role: 'status', class: 'fine' });
    const example = (route: typeof needed[number]) => {
      if (!proof) return;
      trialNote.textContent = route === 'flow'
        ? `A returning carrier can use one visible detail from the practice sheet. ${proof.left} Keep the place and maker on the second slip.`
        : `At the waiting bench, a reader pairs a detail with its maker and place. ${proof.right} ${proof.makerAndPlace}. ${proof.limit}`;
    };
    const choices = needed.map((route) => h('button', { type: 'button', onclick: () => {
      set('lantern.weave.copies.notice', route);
      update();
    } }, route === 'flow' ? 'Hang the arrow where the queue starts' : 'Hang the full guide at the waiting bench'));
    const update = () => {
      const chosen = flag('lantern.weave.copies.notice');
      const ready = needed.every((kind) => flag(`lantern.weave.copies.trial.${kind}`) === true);
      choices.forEach((control, i) => {
        control.disabled = !ready;
        control.setAttribute('aria-pressed', String(chosen === needed[i]));
      });
      state.textContent = chosen === 'flow' || chosen === 'review' ? PRESS_PREVIEWS[chosen] : 'Walk both trials before setting the hooks.';
      if (chosen === 'flow' || chosen === 'review') example(chosen);
    };
    const trials = needed.map((route) => h('button', { type: 'button', onclick: () => {
      set(`lantern.weave.copies.trial.${route}`, true);
      update();
      state.textContent = PRESS_PREVIEWS[route];
      example(route);
    } }, route === 'flow' ? 'Try the opening where the line bends' : 'Try the sheet from the bench'));
    panel.append(h('h2', {}, 'The two places a notice can wait'),
      h('p', {}, 'There are two hooks. One holds a short direction and the other holds the source line. Try the queue and the bench before deciding where to lead with each.'),
      h('p', {}, proof ? ['Your Nexus copy is on the practice hook. ', split(proof)] : 'The practice hook is empty.'),
      h('div', { class: 'row' }, trials), state, trialNote, h('div', { class: 'row' }, choices));
    update();
  }

  if (station === 'window' || station === 'table') { reader(station); return panel; }
  if (station === 'press') { printHook(); return panel; }
  const found = LANTERN_LEAVES.find(({ slug }) => slug === station);
  if (!found) return panel;
  const record: LanternLeaf = found;
  const position = h('input', { type: 'range', min: BEAM_TRAVEL.min, max: BEAM_TRAVEL.max, value: 50, 'aria-label': 'Lantern position across the picture' });
  const glow = h('div', { class: 'half-light-beam', 'aria-hidden': 'true' });
  const photo = h('img', { alt: '', 'aria-hidden': 'true' });
  const stage = h('div', { class: 'half-light-stage', 'aria-hidden': 'true' }, photo, glow);
  void specimenArt(record.asset).then((drawing) => {
    if (drawing) photo.src = drawing.toDataURL('image/png');
  });
  const note = h('p', { class: 'fine half-light-note', role: 'status' });
  const status = h('p', { class: 'fine', role: 'status' });
  const anchor = (side: BeamSide) => side === 'left' ? record.leftPosition : record.rightPosition;
  const text = (side: BeamSide) => side === 'left' ? record.left : record.right;
  const wasRead = (side: BeamSide) => flag(`${record.flag}.read.${side}`) === true;
  let full = false;
  const visibleSides = () => SIDES.filter((side) => full || beamCovers(Number(position.value), anchor(side)));
  const trace = h('button', { type: 'button', onclick: () => {
    for (const side of visibleSides()) set(`${record.flag}.read.${side}`, true);
    update();
    if (trace.disabled) position.focus();
  } }, 'Mark the lit detail on the guide');
  const routeButtons = DISPLAY_ROUTES.map((side) => h('button', { type: 'button', onclick: () => {
    set(`${record.flag}.sent`, side);
    update();
  } }, side === 'window' ? 'Roll a cut for Nell’s window' : 'Keep the whole sheet for Hem'));
  const whole = h('button', { type: 'button', onclick: () => { full = !full; update(); } }, 'Raise the full light');

  function update() {
    glow.style.width = `${BEAM_WIDTH}%`;
    glow.style.left = `${Number(position.value) - BEAM_WIDTH / 2}%`;
    stage.classList.toggle('full', full);
    whole.setAttribute('aria-pressed', String(full));
    const visible = visibleSides();
    note.textContent = visible.length ? visible.map(text).join(' ') : 'The light lies between the two details. Move it towards either end.';
    trace.disabled = full || visible.every(wasRead);
    const sent = flag(`${record.flag}.sent`);
    routeButtons.forEach((button, index) => {
      button.disabled = !SIDES.every(wasRead);
      button.setAttribute('aria-pressed', String(sent === DISPLAY_ROUTES[index]));
    });
    status.textContent = sent === 'window' || sent === 'table' ? `The viewing copy is ready for ${READERS[sent]}. The original case stays here.`
      : SIDES.every(wasRead) ? `Both parts are marked. ${record.limit}` : `Marked ${SIDES.filter(wasRead).length} of ${SIDES.length} details.`;
  }
  position.addEventListener('input', () => { full = false; update(); });
  const waypoints = SIDES.map((side) => h('button', { type: 'button', onclick: () => {
    position.value = String(anchor(side));
    full = false;
    update();
  } }, `Swing towards the ${side}`));
  panel.append(h('h2', {}, record.title), stage, position,
    h('div', { class: 'row' }, waypoints, whole), note, trace, status, h('div', { class: 'row' }, routeButtons));
  update();
  return panel;
}
