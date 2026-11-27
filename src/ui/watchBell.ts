import type { GameController } from '../app/controller';
import { bellResult, watchEnding, watchReading, watches, type WatchSite } from '../domain/watchBell';
import { h } from './dom';
export function nightWatch(c: GameController, site: WatchSite) {
  const record = watches[site],
    key = 'night-watch.' + site;
  const panel = h(
    'details',
    {},
    h('summary', {}, record.title),
    h('p', {}, record.opening),
    h('p', {}, record.task),
  );
  const prior = c.state.flags['night-watch.gate.left'];
  if (site === 'dispatch' && typeof prior === 'number')
    panel.append(h('p', {}, 'A note in Maro’s hand came upriver. ' + watchEnding('gate', prior)));
  const result = h('div', { 'aria-live': 'polite' }),
    controls = h('div', { class: 'lantern-controls' });
  function choose(stage: 'try' | 'leave', setting: number) {
    const errors = c.dispatch({ type: 'WorkNightWatch', site, stage, setting });
    if (errors.some((e) => e.kind === 'error')) return;
    draw();
  }
  for (const [i, trial] of record.trials.entries())
    controls.append(h('button', { type: 'button', onclick: () => choose('try', i) }, trial));
  function draw() {
    result.replaceChildren();
    const current = c.state.flags[key + '.current'];
    if (typeof current !== 'number') return;
    if (site === 'gate')
      result.append(
        h(
          'table',
          {},
          h('caption', {}, record.trials[current]),
          h(
            'thead',
            {},
            h(
              'tr',
              {},
              ...['Night', 'Height', 'At midnight', 'With this clip'].map((label) =>
                h('th', { scope: 'col' }, label),
              ),
            ),
          ),
          h(
            'tbody',
            {},
            ...bellResult(current).map((row) =>
              h(
                'tr',
                {},
                h('th', { scope: 'row' }, row.label),
                h('td', {}, String(row.mark)),
                h('td', {}, row.flood ? 'Flooded' : 'Dry'),
                h('td', {}, row.outcome),
              ),
            ),
          ),
        ),
      );
    result.append(h('p', {}, watchReading(site, current)));
    if (record.trials.filter((_, i) => c.state.flags[key + '.tested.' + i] === true).length >= 2) {
      const labels =
        site === 'gate'
          ? ['Leave the low clip', 'Leave the middle clip', 'Leave the high clip']
          : ['Keep the relay staffed until last call', 'Send the runner to the dark windows now'];
      labels.forEach((label, i) => {
        if (site === 'dispatch' || c.state.flags[key + '.tested.' + i] === true)
          result.append(h('button', { type: 'button', onclick: () => choose('leave', i) }, label));
      });
    }
    const kept = c.state.flags[key + '.left'];
    if (typeof kept === 'number') result.append(h('blockquote', {}, watchEnding(site, kept)));
  }
  panel.append(controls, result);
  draw();
  return panel;
}
