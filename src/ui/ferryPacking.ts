import type { GameController } from '../app/controller';
import { FERRY_PACKING_CASES, type FerryPackingCase } from '../content/ferryPackingCases';
import { handoffText, intakeModel, PACKING_LATEST, PACKING_POSITIONS, PACKING_STAGES, pickupTag, postedTag,
  tagFlag, tagReading, type TagPosition } from '../domain/ferryPacking';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './ferryPacking.css';

const placements: Record<TagPosition, string> = {
  outside: 'Clip the claim outside',
  inside: 'Tuck the claim inside',
};

function pickupText(record: FerryPackingCase, position: TagPosition, shelter: boolean): string {
  const reading = tagReading(intakeModel(record), position, PACKING_STAGES.length, shelter);
  const reader = reading.legible ? 'The keeper signs the source line.' : 'The keeper sends for a dry copy before signing.';
  return `${shelter ? 'The canopy route is marked.' : 'The open aisle is marked.'} ${reading.delay} extra handling ${reading.delay === 1 ? 'move' : 'moves'}. ${reader}`;
}

export function ferryPackingPanel(
  controller: GameController,
  station: string,
  sound: (name: string) => void,
  refresh: () => void,
): HTMLElement {
  const panel = h('div', { class: 'packing-panel' });
  const returning = station.startsWith('return.');
  const slug = returning ? station.slice('return.'.length) : station;
  const entry = FERRY_PACKING_CASES.find((candidate) => candidate.slug === slug);
  if (!entry || !controller.check(returning ? specimenEquipped(entry.key) : { card: entry.card })) return panel;
  const record = entry;

  const model = returning ? intakeModel(record) : record;
  const flags = () => controller.state.flags;
  const destination = postedTag(record.stem);
  const intake = pickupTag(record.stem);
  const returnedPosition = flags()[`${intake}.position`];
  const sentPosition = flags()[destination];
  const savedPosition = returning ? returnedPosition ?? sentPosition : sentPosition;
  let position: TagPosition = savedPosition === 'inside' ? 'inside' : 'outside';
  let shelter = returning && flags()[intake] === 'canopy';
  let step = 0;

  const reply = h('p', { class: 'packing-reply', role: 'status' });
  function restoreReply() {
    const markedAisle = flags()[intake];
    if (returning && (markedAisle === 'canopy' || markedAisle === 'open')) {
      const markedPlacement = flags()[`${intake}.position`] === 'inside' ? 'inside' : 'outside';
      reply.textContent = pickupText(record, markedPlacement, markedAisle === 'canopy');
    } else if (!returning && (flags()[destination] === 'outside' || flags()[destination] === 'inside')) {
      const inside = flags()[destination] === 'inside';
      reply.textContent = `${handoffText(record, inside ? 'inside' : 'outside')} Check the receipt ${inside ? 'on the east drying table' : 'at the west queue rail'}.`;
    }
  }

  const status = h('p', { role: 'status', class: 'packing-status' });
  const route = h('ol', { class: 'packing-route', 'aria-label': 'Handling route' },
    PACKING_STAGES.map((stage) => h('li', {}, stage)));
  const tag = h('div', { class: 'packing-tag', 'aria-hidden': 'true' });
  const trace = h('ul', { class: 'packing-trace', 'aria-label': 'Trial readbacks' });
  const stepButton = h('button', { type: 'button', onclick: advance });
  const resetButton = h('button', { type: 'button', onclick: () => restart(position, shelter) }, 'Reset this run');
  const positionButtons = PACKING_POSITIONS.map((option) =>
    h('button', { type: 'button', onclick: () => restart(option, shelter) }, placements[option]));
  const pathButtons = [false, true].map((covered) =>
    h('button', { type: 'button', onclick: () => restart(position, covered) },
      covered ? 'Pass under the canopy' : 'Take the open aisle'));
  const postButtons = PACKING_POSITIONS.map((option) => h('button', { type: 'button', onclick: () => {
    if (!PACKING_POSITIONS.every((placement) => flags()[tagFlag(record.stem, placement)])) return;
    controller.dispatch({ type: 'SetFlag', flag: destination, value: option });
    controller.dispatch({ type: 'SetFlag', flag: PACKING_LATEST, value: slug });
    sound('sfx.page');
    restoreReply();
    refresh();
  } }, option === 'outside' ? 'Give Tova the outside claim' : 'Send Wenna the protected claim'));
  const keepButton = h('button', { type: 'button', onclick: () => {
    if (step < PACKING_STAGES.length) return;
    controller.dispatch({ type: 'SetFlag', flag: `${intake}.position`, value: position });
    controller.dispatch({ type: 'SetFlag', flag: intake, value: shelter ? 'canopy' : 'open' });
    sound('sfx.page');
    restoreReply();
    refresh();
  } }, 'Mark this receiving route');

  function restart(nextPosition: TagPosition, nextShelter: boolean) {
    if (position === nextPosition && shelter === nextShelter && step === 0) return;
    position = nextPosition;
    shelter = nextShelter;
    step = 0;
    renderReading();
  }

  function advance() {
    if (step >= PACKING_STAGES.length) return;
    step += 1;
    if (!returning && step === PACKING_STAGES.length) {
      const sample = tagReading(model, position, step);
      controller.dispatch({ type: 'SetFlag', flag: tagFlag(record.stem, position), value: sample.legible ? 'clear' : 'blurred' });
      refresh();
      sound('sfx.page');
    }
    renderReading();
  }

  function renderReading() {
    const reading = tagReading(model, position, step, shelter);
    const complete = step >= PACKING_STAGES.length;
    const legibility = reading.legible ? 'Source line readable.' : 'Source line blurred.';
    const placement = position === 'inside' ? 'Inside' : 'Outside';
    const extra = complete ? ` ${reading.delay} extra handling ${reading.delay === 1 ? 'move' : 'moves'}.` : '';
    const visible = reading.available ? legibility : 'Source line still covered.';
    status.textContent = step === 0 ? `${placement} claim ready. Practice spray exposure is ${shelter ? 0 : model.spray} marks.`
      : `${placement} claim. ${visible} ${reading.rain} spray marks reached it.${extra}`;
    tag.dataset.state = reading.available ? String(reading.legible) : 'covered';
    tag.textContent = reading.available ? (reading.legible ? record.accession : '≈≈≈≈≈') : '•••••';
    Array.from(route.children).forEach((item, index) => {
      item.classList.toggle('packing-reached', index < step);
      if (index === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    positionButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(PACKING_POSITIONS[index] === position)));
    pathButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(Boolean(index) === shelter)));
    stepButton.textContent = complete ? 'Reading filed' : step === 2 && position === 'inside' ? record.openAction : PACKING_STAGES[step];
    stepButton.disabled = complete;
    keepButton.disabled = !complete;
    if (returning) return;
    trace.replaceChildren(...PACKING_POSITIONS.map((option) => {
      const filed = flags()[tagFlag(record.stem, option)];
      const sample = tagReading(model, option, PACKING_STAGES.length);
      const reading = filed
        ? `${filed === 'clear' ? 'Readable' : 'Blurred'} at the table · ${sample.delay} extra handling ${sample.delay === 1 ? 'move' : 'moves'}`
        : 'Waiting for a run';
      return h('li', {}, `${option === 'inside' ? 'Inside' : 'Outside'} · ${reading}`);
    }));
    postButtons.forEach((button) => { button.disabled = !PACKING_POSITIONS.every((option) => flags()[tagFlag(record.stem, option)]); });
  }

  const intro = returning
    ? 'The Nexus approach catches an extra spray mark. Its canopy adds one move. Try a fresh arrival and leave a usable route for the next carrier.'
    : 'Tova reads at the queue rail. Wenna reads after opening. Move the same claim through both positions and choose where the next load should go.';
  panel.append(h('h2', {}, record.title), h('p', {}, intro),
    h('p', { class: 'fine' }, `Ferry model of the ${record.feature}. The trial uses ${model.spray} spray marks. The practice ink blurs at ${model.resistance}.`),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Claim position' }, ...positionButtons),
    ...(returning ? [h('div', { class: 'row', role: 'group', 'aria-label': 'Receiving aisle' }, ...pathButtons)] : []),
    h('div', { class: 'packing-counter' }, route, tag),
    status, h('div', { class: 'row' }, stepButton, resetButton),
    returning ? keepButton : h('div', {}, trace, h('div', { class: 'row' }, ...postButtons)),
    reply,
    h('details', {}, h('summary', {}, 'Object record'), h('p', {}, record.fact), h('p', {}, record.limit),
      h('p', {}, h('a', { href: record.catalogue, rel: 'noopener', target: '_blank' }, `Collection record ${record.accession}`))));
  renderReading();
  restoreReply();
  return panel;
}
