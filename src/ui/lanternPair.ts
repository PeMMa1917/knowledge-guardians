import type { GameController } from '../app/controller';
import { LANTERN_PEOPLE, pairReady, type LanternSite } from '../domain/lamplight';
import { type Piece } from '../domain/lanternInstruments';
import { h } from './dom';

export function lanternPair(c: GameController, site: LanternSite) {
  const box = h('section', { class: 'lantern-pair', 'aria-label': site.pair.title });
  const first = LANTERN_PEOPLE.find((p) => p.id === site.pair.guests[0])!;
  const second = LANTERN_PEOPLE.find((p) => p.id === site.pair.guests[1])!;
  const explanation = 'The lamp has two grooves. One fits ' + first.name + '’s work and one fits ' + second.name + '’s.';
  const title = h('h4', {}, site.pair.title);
  if (!pairReady(c.state, site)) {
    box.append(h('details', {}, h('summary', {}, 'A second groove in the lamp'), h('p', {}, explanation)));
    return box;
  }
  const base = 'lamplight-pair.' + site.id;
  const views = [first.name + '’s sheet', 'Both sheets', second.name + '’s sheet'];
  let current = ([0, 1, 2] as Piece[]).find((i) => c.state.flags[base + '.seen.' + i] === true);
  const status = h('p', { role: 'status' }), choices = h('div', { class: 'options' });
  function render() {
    status.textContent = current === undefined ? 'Turn the wheel to bring a sheet into the light.' : site.pair.sights[current];
    choices.replaceChildren();
    if ([0, 1, 2].every((i) => c.state.flags[base + '.seen.' + i] === true)) {
      site.pair.choices.forEach((ch, i) => choices.append(h('button', { type: 'button', onclick: () => {
        const events = c.dispatch({ type: 'TurnLanternGlass', site: site.id, stage: 'mount', choice: i ? 1 : 0 });
        if (!events.some((e) => e.kind === 'error')) render();
      } }, ch.action)));
    }
    const chosen = c.state.flags[base + '.mounted'];
    if (chosen === 0 || chosen === 1) choices.append(h('p', { role: 'status' }, site.pair.choices[chosen].reply));
  }
  box.append(title, h('p', {}, explanation), h('div', { class: 'lantern-controls' }, ...views.map((name, i) =>
    h('button', { type: 'button', onclick: () => {
      const aperture = i as Piece;
      const events = c.dispatch({ type: 'TurnLanternGlass', site: site.id, stage: 'look', aperture });
      if (!events.some((e) => e.kind === 'error')) { current = aperture; render(); }
    } }, name))), status, choices);
  render();
  return box;
}
