import type { GameController } from '../app/controller';
import { guideObjectives } from '../domain/guidance';
import { h } from './dom';
import './localGuide.css';

export function localGuide(controller: GameController, world: string, preferred?: string | (() => string | undefined)): HTMLElement {
  const options = () => guideObjectives(controller.engine.visibleObjectives(controller.state), world,
    typeof preferred === 'function' ? preferred() : preferred);
  const details = h('details', { class: 'work-guide' }, h('summary', {}, 'Lumen’s help'));
  const body = h('div', { class: 'work-guide-body' });
  details.append(body);
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    const help = h('p', { role: 'status', class: 'hint-text' });
    const steps = options();
    if (!steps.length) {
      body.replaceChildren(h('p', {}, 'This station is open for another look. Check your journal for other leads.'));
      return;
    }
    const step = h('select', { 'aria-label': 'Choose a step for help' }, ...steps.map((entry) => h('option', { value: entry.id }, entry.title)));
    const request = h('button', { type: 'button', onclick: () => {
      if (!options().some(({ id }) => id === step.value)) {
        help.textContent = 'You have finished that step. Close this help to refresh the list.';
        return;
      }
      const reply = controller.dispatch({ type: 'RequestHint', objective: step.value }).find(({ kind }) => kind === 'hint');
      if (!reply || reply.kind !== 'hint') return;
      help.textContent = reply.hint.text;
      request.textContent = reply.hint.depth < 4 ? 'A clearer clue' : 'Repeat this clue';
    } }, 'Show a clue');
    step.addEventListener('change', () => { help.textContent = ''; request.textContent = 'Show a clue'; });
    body.replaceChildren(h('label', {}, 'Pick the step you’re on', step), request, help);
  });
  return details;
}

export function workFeedback(box: HTMLElement, message: string) {
  let row = box.querySelector<HTMLElement>('.work-feedback');
  if (!row) {
    row = h('p', { class: 'work-feedback', role: 'status' });
    const control = document.activeElement;
    if (control instanceof HTMLButtonElement && box.contains(control)) control.after(row);
    else box.prepend(row);
  }
  row.textContent = message;
}
