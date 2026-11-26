import type { GameController } from '../app/controller';
import {
  BEATER_CARRY, BEATER_KEY, BEATER_PLACEMENT, BEATER_RECORD, BEATER_SOURCE, BEATER_USED, PROOF_FACES, PROOF_STOPS,
  carriedProof, hasMatchedPair, hasPress, pressTrace, recordPress, type ProofFace, type ProofStop,
} from '../domain/beaterProof';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './beaterProof.css';

const FACE_NAMES = { wide: 'Face A', close: 'Face B' } as const;
const STOP_NAMES = { light: 'Light', firm: 'Firm' } as const;
const POSITIONS = [1, 2, 3, 4, 5, 6, 7];

function trace(face: ProofFace, stop: ProofStop, label: string = FACE_NAMES[face], offset = 0) {
  const marks = pressTrace(face, stop).map((position) => position + offset);
  return h('div', { class: 'beater-trace' },
    h('strong', {}, label),
    h('div', { class: 'beater-trace-strip', 'aria-hidden': 'true' }, ...POSITIONS.map((slot) =>
      h('span', { class: marks.includes(slot) ? 'marked' : '' }, String(slot)))),
    h('span', { class: 'fine' }, `Marks at ${marks.join(', ')}.`));
}

function pair(stop: ProofStop) {
  return h('section', { class: 'clue-view' }, h('h3', {}, `${STOP_NAMES[stop]} stop`),
    ...PROOF_FACES.map((face) => trace(face, stop)));
}

export function beaterProofPanel(controller: GameController, place: string, sound: (key: string) => void, refresh: () => void) {
  const panel = h('div', { class: 'beater-proof' });
  const value = (flag: string) => controller.state.flags[flag];
  const set = (flag: string, next: string | number | boolean) => {
    controller.dispatch({ type: 'SetFlag', flag, value: next });
    refresh();
  };

  if (place === 'press') {
    if (!controller.check(specimenEquipped(BEATER_KEY))) return panel;
    const source = controller.pack.sources.find(({ id }) => id === BEATER_SOURCE);
    let face: ProofFace = 'wide';
    let stop: ProofStop = 'light';
    const report = h('p', { role: 'status' });
    const sheets = h('div', { class: 'beater-trials' });
    const faces = PROOF_FACES.map((candidate) => h('button', { type: 'button', onclick: () => {
      face = candidate;
      report.textContent = `${FACE_NAMES[face]} is over a fresh strip.`;
      sound('sfx.click');
      paint();
    } }, `Turn to ${FACE_NAMES[candidate]}`));
    const stops = PROOF_STOPS.map((candidate) => h('button', { type: 'button', onclick: () => {
      stop = candidate;
      report.textContent = `${STOP_NAMES[stop]} stop set.`;
      sound('sfx.click');
      paint();
    } }, `${STOP_NAMES[candidate]} stop`));
    const take = PROOF_STOPS.map((candidate) => h('button', { type: 'button', onclick: () => {
      if (!hasMatchedPair(value(BEATER_RECORD), candidate) || value(BEATER_PLACEMENT)) return;
      set(BEATER_CARRY, candidate);
      sound('sfx.page');
      report.textContent = `Both strips from the ${STOP_NAMES[candidate]} stop are clipped together. Take them to Aster’s fitting table in the Cold Store.`;
      paint();
    } }, `Take the ${STOP_NAMES[candidate]} pair`));

    function paint() {
      const current = value(BEATER_RECORD);
      faces.forEach((button, index) => button.setAttribute('aria-pressed', String(PROOF_FACES[index] === face)));
      stops.forEach((button, index) => button.setAttribute('aria-pressed', String(PROOF_STOPS[index] === stop)));
      take.forEach((button, index) => {
        const candidate = PROOF_STOPS[index];
        button.disabled = !hasMatchedPair(current, candidate) || !!value(BEATER_PLACEMENT);
        button.setAttribute('aria-pressed', String(value(BEATER_CARRY) === candidate));
      });
      sheets.replaceChildren(...PROOF_STOPS.map((setting) => h('section', { class: 'clue-view' },
        h('h3', {}, `${STOP_NAMES[setting]} stop`), ...PROOF_FACES.map((side) => hasPress(current, side, setting)
          ? trace(side, setting) : h('p', { class: 'fine' }, `${FACE_NAMES[side]} has no strip at this stop yet.`)))));
    }

    const press = h('button', { type: 'button', class: 'primary', onclick: () => {
      set(BEATER_RECORD, recordPress(value(BEATER_RECORD), face, stop));
      report.textContent = `${FACE_NAMES[face]} at ${STOP_NAMES[stop]} stop. Marks at ${pressTrace(face, stop).join(', ')}.`;
      sound('sfx.page');
      paint();
    } }, 'Press a fresh strip');
    panel.append(h('h2', {}, 'Both Faces at the Same Stop'),
      h('p', {}, 'Cleveland records a wooden beater from Hawaiʻi with four differently grooved faces, made before 1930. The 38.7 cm length describes the whole tool.'));
    if (source) panel.append(h('p', { class: 'fine' }, h('a', { href: source.url, target: '_blank', rel: 'noopener' }, 'Cleveland Museum of Art · 1971.152')));
    panel.append(
      h('p', {}, 'Aster’s blank practice block has two plain contact faces. It makes a local proof strip for trainees. Use the same strip stock and stop for both faces.'),
      h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Block face' }, faces),
      h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Press stop' }, stops),
      press, report, sheets, h('div', { class: 'row wrap' }, take));
    paint();
    return panel;
  }

  const carried = carriedProof(value(BEATER_RECORD), value(BEATER_CARRY));
  if (!carried) return panel;
  const stop = carried;
  if (place === 'fitting') {
    if (value(BEATER_PLACEMENT)) return panel;
    const installed = h('p', { role: 'status', tabindex: -1 });
    const choices = h('div', { class: 'row wrap' },
      ...(['rail', 'bench'] as const).map((location) => h('button', { type: 'button', onclick: () => {
        set(BEATER_PLACEMENT, location);
        sound('sfx.sparkle');
        choices.remove();
        installed.textContent = location === 'rail' ? 'The fitted pair and a spare strip wait at the low rail.' : 'Aster has turned the new practice block to the recorded stop at the east bench.';
        installed.focus();
      } }, location === 'rail' ? 'Fit the matched pair to the low rail' : 'Staff a repeat at the east bench')));
    panel.append(h('h2', {}, 'Aster’s fitting table'),
      h('p', {}, 'People can line up a spare strip at the low rail while the shop is busy. A trainee at the east bench can watch a repeat and ask what stayed fixed, once Aster is free.'),
      pair(stop), choices, installed);
    return panel;
  }

  if ((place !== 'rail' && place !== 'bench') || value(BEATER_PLACEMENT) !== place) return panel;
  const outcome = h('div', { role: 'status' });
  if (place === 'rail') {
    let offset = -1;
    const spare = h('div', {});
    const left = h('button', { type: 'button', onclick: () => shift(-1) }, 'Slide the spare strip left');
    const right = h('button', { type: 'button', onclick: () => shift(1) }, 'Slide the spare strip right');
    function shift(amount: number) {
      offset = Math.max(-1, Math.min(1, offset + amount));
      sound('sfx.click');
      drawSpare();
      if (offset === -1) right.focus();
      else if (offset === 1) left.focus();
    }
    function drawSpare() {
      spare.replaceChildren(trace('close', stop, 'Spare strip', offset));
      left.disabled = offset === -1;
      right.disabled = offset === 1;
    }
    const check = h('button', { type: 'button', class: 'primary', onclick: () => {
      if (offset === 0) set(BEATER_USED, true);
      sound('sfx.page');
      outcome.textContent = offset === 0
        ? 'The marks line up with Face B. Visitors can make the same check here on their own. The stop stays on the rail beside the two strips.'
        : 'Some marks sit to the side of Face B’s trace. Slide the spare along the rail and check again.';
    } }, 'Check the spare against Face B');
    panel.append(h('h2', {}, 'The low rail'), pair(stop), spare, h('div', { class: 'row wrap' }, left, right, check), outcome);
    drawSpare();
  } else {
    const repeat = h('button', { type: 'button', class: 'primary', onclick: () => {
      set(BEATER_USED, true);
      sound('sfx.page');
      outcome.replaceChildren(trace('close', stop, 'Trainee’s fresh Face B strip'),
        h('p', {}, 'Aster leaves the stop in place. The trainee turns to Face B and the fresh strip agrees with its earlier proof. They can repeat this next time Aster is on duty.'));
    } }, 'Repeat Face B at the recorded stop');
    panel.append(h('h2', {}, 'The east bench'), pair(stop), repeat, outcome);
  }
  return panel;
}
