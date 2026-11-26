import type { GameController } from '../app/controller';
import { STAR_STATIONS, starStation } from '../content/starPaths';
import { STAR_METHODS, STAR_STAGES, starFlag, starMethodReady, triedStarStep } from '../domain/starPaths';
import { h } from './dom';
import './starPaths.css';

export function starChart(controller: GameController) {
  const state = controller.state;
  return h('div', { class: 'star-chart' }, ...STAR_STATIONS.map(({ path, name, place }) =>
    h('section', { class: `star-path star-${path.color}` }, h('h3', {}, path.name), h('p', {}, path.focus),
      ...path.skills.map((skill) => h('details', { class: 'star-skill' },
        h('summary', {}, h('span', {}, skill.name),
          h('span', { class: 'star-nodes' }, ...skill.steps.map((step, index) => {
            const met = triedStarStep(state, step);
            return h('span', { class: met ? 'lit' : '', 'aria-label': `${STAR_STAGES[index]} ${met ? 'done' : 'open'}` }, met ? '◆' : '◇');
          }))),
        h('ol', {}, ...skill.steps.map((step, index) => h('li', { class: triedStarStep(state, step) ? 'lit' : '' },
          h('strong', {}, `${STAR_STAGES[index]} · `), step.action))),
        controller.check(starMethodReady(skill)) ? h('p', { class: 'field-aid' }, `Use this method at ${name} in ${place}.`) : null)))));
}

export function starField(controller: GameController, id: string, sound: (key: string) => void, refresh: () => void) {
  const [pathId, side] = id.split(':');
  const site = starStation(pathId);
  const panel = h('div', { class: 'star-field' });
  if (!site) return panel;
  panel.classList.add(`star-${site.path.color}`);
  panel.append(h('h2', {}, side === 'work' ? site.name : 'Pinned field notices'));
  for (const skill of site.path.skills) {
    if (!controller.check(starMethodReady(skill))) continue;
    const flag = starFlag(site.path, skill);
    const active = () => STAR_METHODS.findIndex((key) => controller.state.flags[`${flag}.layout`] === key);
    const card = h('article', { class: 'star-field-aid' }, h('h3', {}, skill.name));
    if (side === 'work') {
      const feedback = h('p', { role: 'status' });
      const sockets = h('div', { class: 'star-field-sockets', 'aria-hidden': 'true' });
      const controls = skill.choices.map((choice, index) => h('button', { type: 'button', onclick: () => {
        controller.dispatch({ type: 'SetFlag', flag: `${flag}.layout`, value: STAR_METHODS[index] });
        sound('sfx.page');
        refresh();
        paint(index);
      } }, choice.label));
      function paint(index: number) {
        feedback.textContent = index < 0 ? 'Both clips are open.' : `${skill.choices[index].short} is posted at the other end.`;
        controls.forEach((control, i) => control.setAttribute('aria-pressed', String(i === index)));
        sockets.replaceChildren(...controls.map((_, i) => h('span', { class: i === index ? 'filled' : '' }, i === index ? skill.choices[i].short : '')));
      }
      card.append(h('p', {}, skill.task), sockets, h('div', { class: 'row' }, ...controls), feedback);
      paint(active());
    } else {
      const index = active();
      if (index < 0) continue;
      const choice = skill.choices[index];
      const result = h('p', { role: 'status', tabIndex: -1 });
      const checked = () => controller.state.flags[`${flag}.checked`] === STAR_METHODS[index];
      const read = h('button', { type: 'button', onclick: () => {
        controller.dispatch({ type: 'SetFlag', flag: `${flag}.checked`, value: STAR_METHODS[index] });
        sound('sfx.page');
        read.remove();
        result.textContent = choice.result;
        result.focus();
        refresh();
      } }, `See who uses ${choice.short.toLowerCase()}`);
      card.append(h('p', {}, choice.short));
      if (checked()) result.textContent = choice.result;
      else card.append(read);
      card.append(result);
    }
    panel.append(card);
  }
  return panel;
}
