import { councilDirection } from '../content/originHomecomings';
import { originStage } from './originStage';
import { playNotes } from '../app/ambience';
import type { GameController } from '../app/controller';
import { h } from './dom';
import {
  scores,
  impression,
  invitation,
  positions,
  readyToSend,
  originFlag,
  type Origin,
  type InstrumentCommand,
} from '../domain/originInstruments';
import './originInstrument.css';

type Move = InstrumentCommand extends infer T
  ? T extends InstrumentCommand
    ? Omit<T, 'type' | 'origin'>
    : never
  : never;
export function originInstrument(
  c: GameController,
  o: Origin,
  away: boolean,
  sound: (id: string) => void,
  volume: () => number,
) {
  let stop = () => {};
  const q = scores[o],
    root = h('section', { class: 'origin-instrument origin-' + o }),
    feedback = h('p', { role: 'status' }),
    controls = h('div', { class: 'origin-controls' }),
    display = h('ol', { 'aria-label': q.title, class: 'origin-result' }),
    notes = h('details', {}),
    instruction = h('p', {}),
    handover = h('div', { class: 'row' });
  const picture = originStage();
  const buttons: HTMLButtonElement[][] = [];
  const act = (m: Move) => {
    const fail = c
      .dispatch({ type: 'WorkOriginInstrument', origin: o, ...m })
      .find((e) => e.kind === 'error');
    if (fail?.kind === 'error') {
      feedback.textContent = fail.message;
      return;
    }
    stop();
    if (o === 'singer' && m.action === 'try') {
      const [fourth, next] = positions(c.state, o),
        tones = [
          220,
          277.18,
          246.94,
          [0, 329.63, 196][fourth],
          [220, 329.63, 261.63][next],
        ];
      stop = playNotes(
        tones.flatMap((f, at) => (f ? [{ f, at, beats: 0.7 }] : [])),
        0.33,
        'pluck',
        volume(),
      );
    } else sound(m.action === 'try' ? 'sfx.page' : 'sfx.click');
    render();
    if (m.action === 'set')
      feedback.textContent =
        q.controls[m.control].positions[m.value] + '. ' + staging[o];
    else if (m.action === 'try')
      feedback.textContent = impression(o, positions(c.state, o)).line;
    else feedback.textContent = (away ? q.returnLines : q.arrives)[m.side];
  };
  if (!away) {
    root.append(h('p', {}, q.setup), controls);
    q.controls.forEach((control, i) => {
      const field = h('fieldset', {}, h('legend', {}, control.label));
      buttons[i] = control.positions.map((p, j) =>
        h(
          'button',
          {
            type: 'button',
            onclick: () => act({ action: 'set', control: i, value: j }),
          },
          p,
        ),
      );
      field.append(...buttons[i]);
      controls.append(field);
    });
    root.append(
      h(
        'button',
        { type: 'button', onclick: () => act({ action: 'try' }) },
        q.test,
      ),
    );
  } else {
    const sent = c.state.flags[originFlag(o, 'sent')];
    root.append(
      h('p', {}, q.arrives[sent === 'second' ? 1 : 0]),
      h('h3', {}, 'What arrived'),
    );
  }
  (away ? q.returnLabels : q.send).forEach((label, side) =>
    handover.append(
      h(
        'button',
        {
          type: 'button',
          onclick: () =>
            act({ action: away ? 'return' : 'send', side: side as 0 | 1 }),
        },
        label,
      ),
    ),
  );
  notes.append(h('summary', {}, 'Earlier runs'));
  root.append(picture.el, display, feedback, instruction, handover);
  if (!away) root.append(notes);
  function render() {
    const s = c.state,
      v = positions(s, o);
    buttons.forEach((group, i) =>
      group.forEach((b, j) =>
        b.setAttribute('aria-pressed', String(v[i] === j)),
      ),
    );
    const raw = s.flags[originFlag(o, away ? 'edition' : 'last')];
    display.replaceChildren();
    const view =
      away && typeof raw === 'string' ? raw.split('.').map(Number) : v;
    picture.draw(o, view, raw === view.join('.'));
    if (typeof raw === 'string') {
      const read = impression(o, raw.split('.').map(Number));
      display.append(...read.marks.map((mark) => h('li', {}, mark)));
      // Reload restores which arrangement produced these marks while the controls can be changed for the next trial.
      feedback.textContent = read.line;
    } else feedback.textContent = staging[o];
    if (!away) {
      const old = notes.querySelector('ul');
      old?.remove();
      const log = s.adventureDiary.entries.filter((e) =>
        e.event?.key.startsWith('origin-work:' + o + '.try.'),
      );
      notes.append(
        h('ul', {}, ...log.slice(-12).map((e) => h('li', {}, e.text))),
      );
      const tried = readyToSend(s, o),
        ready = tried && s.flags[originFlag(o, 'last')] === v.join('.');
      instruction.textContent =
        tried && !ready
          ? 'Run this arrangement before you pack it.'
          : ready
            ? 'The keeper is ready for a second town.'
            : invitation[o];
      handover.querySelectorAll('button').forEach((b) => (b.disabled = !ready));
      const already = s.flags[originFlag(o, 'sent')];
      if (already)
        instruction.textContent += ' ' + q.arrives[already === 'first' ? 0 : 1];
    } else {
      const reply = s.flags[originFlag(o, 'replyEdition')];
      const remembered = reply === String(s.flags[originFlag(o, 'sent')]) + ':' + String(raw) && s.flags[originFlag(o, 'returned')];
      instruction.textContent = remembered
        ? q.returnLines[remembered === 'first' ? 0 : 1] + ' ' + councilDirection(o)
        : 'The next performance belongs to someone in this room.';
    }
  }
  render();
  return { panel: root, dispose: () => stop() };
}
const staging: Record<Origin, string> = {
  archive: 'Open a drawer to follow the slip.',
  traveller: 'Pull the cord at this moment in the procession.',
  harbour: 'Float the boat to learn what reached the quay.',
  workshop: 'Release the clips to see where the paper settles.',
  singer: 'Play the stools to hear who comes in next.',
};
