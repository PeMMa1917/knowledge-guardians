import type { GameController } from '../app/controller';
import { playNotes } from '../app/ambience';
import {
  bellCuts,
  bellLeaves,
  hearingChoices,
  lastBellScenes,
  lastBellObjective,
  relayRuns,
  sleeveEntry,
  secondHearing,
  type LastBellSite,
} from '../content/lastBell';
import {
  benchOrder,
  cylinder,
  fieldWalk,
  hearingExchange,
  hearingRecord,
  hearingReturns,
  lastBellReady,
  relayRun,
  routeEnding,
  type LastBellCommand,
} from '../domain/lastBell';
import { h } from './dom';
import { relayTheatre } from './relayTheatre';

export function lastBellPanel(
  c: GameController,
  site: LastBellSite,
  read: (line: string) => void,
  volume: number,
) {
  const scene = lastBellScenes[site],
    key = 'last-bell.' + site;
  const panel = h(
    'details',
    { class: 'last-bell' },
    h('summary', {}, scene.title),
    h('p', {}, scene.opening),
  );
  const ro = c.state.flags['night-watch.dispatch.left'],
    chair = c.state.flags[lastBellObjective('council')];
  if (site === 'voices' && (ro === 0 || ro === 1))
    panel.append(
      h(
        'p',
        {},
        ro === 0
          ? 'Ro brings the cylinder after last call. The girl waited up for her.'
          : 'The runner hands over the cylinder with both mittens on. The wax still feels warm.',
      ),
    );
  if (site !== 'council' && (chair === 0 || chair === 1))
    panel.append(
      h(
        'blockquote',
        {},
        chair === 0
          ? 'A chair leg has left a dent in the family’s invitation. They have called Hale back to hear the next shift.'
          : 'A dawn ticket hangs on the hook. Essi has kept a place beside the crew for whoever brings the next finding.',
      ),
    );
  panel.append(h('p', {}, scene.task));
  const tool = h('div', { class: 'last-bell-tool' }),
    reading = h('div'),
    feedback = h('p', { role: 'status', class: 'bell-feedback' }),
    choices = h('div', { class: 'lantern-controls' }),
    ending = h('blockquote');
  const button = (label: string, fn: () => void) => h('button', { type: 'button', onclick: fn }, label);
  const send = (cmd: LastBellCommand) => {
    const error = c.dispatch(cmd).find((e) => e.kind === 'error');
    if (error) {
      feedback.textContent = error.message;
      return false;
    }
    feedback.textContent = '';
    draw();
    return true;
  };
  const select = (label: string, options: readonly string[], initial: number) => {
    const input = h(
      'select',
      {},
      options.map((s, i) => h('option', { value: i }, s)),
    );
    input.selectedIndex = initial;
    tool.append(h('label', {}, label + ' ', input));
    return input;
  };
  const saved = c.state.flags[key + '.work'];
  const trial = typeof saved === 'string' && /^[0-2]{2}$/.test(saved) ? [...saved].map(Number) : [0, 0];
  const returnDesk = h('div');
  const progress = h('p', { class: 'last-bell-progress' });
  const choose = (label: string, i: number) =>
    button(label, () => {
      if (send({ type: 'WorkLastBell', site, action: 'leave', choice: i })) {
        [...choices.querySelectorAll('button')].find((b) => b.textContent === label)?.focus();
      }
    });

  if (site === 'voices') {
    const sleeve = h(
      'p',
      { role: 'status' },
      c.state.flags['last-bell.voices.sleeve']
        ? sleeveEntry
        : 'W–17. The chalk writer left a scrap of the backing stuck to the corner.',
    );
    const fetch = button('Follow W–17 to the sleeve shelf', () => {
      if (send({ type: 'WorkLastBell', site, action: 'sleeve' })) sleeve.textContent = sleeveEntry;
    });
    panel.append(fetch, sleeve);
    const marks = ['1 · handle', '2 · stove', '3 · window'];
    const start = select('Start stop', marks, trial[0]),
      end = select('End stop', marks, trial[1]);
    const turn = button('Wind the cylinder', () => {
      const first = start.selectedIndex,
        last = end.selectedIndex;
      if (send({ type: 'WorkLastBell', site, action: 'spin', first, last })) {
        playNotes([{ f: 392, at: 0, beats: 0.45 }], 0.18, 'pluck', volume);
      }
    });
    tool.append(turn);
  } else if (site === 'island') {
    const runner = select('First knock', relayRuns, trial[0]),
      shutter = select('Tower shutter', ['Clear air', 'Fog'], trial[1]);
    tool.append(
      button('Send the signal and runner', () => {
        if (
          send({
            type: 'WorkLastBell',
            site,
            action: 'send',
            runner: runner.selectedIndex,
            fog: shutter.selectedIndex === 1,
          })
        )
          playNotes(
            [
              { f: 392, at: 0, beats: 0.45 },
              { f: 523, at: 1, beats: 0.45 },
            ],
            0.18,
            'marimba',
            volume,
          );
      }),
    );
  } else {
    bellLeaves.forEach((leaf, i) =>
      tool.append(button('Lay ' + leaf, () => send({ type: 'WorkLastBell', site, action: 'lay', leaf: i }))),
    );
  }

  function draw() {
    const current = c.state.flags[key + '.work'];
    choices.replaceChildren();
    reading.replaceChildren();
    if (site === 'voices') {
      const short = c.state.flags[key + '.seen.00'] === true,
        full = c.state.flags[key + '.seen.02'] === true;
      progress.textContent =
        short && full
          ? 'The girl brings you two things she is willing to share.'
          : short
            ? 'The chalk ends here. The cylinder keeps turning.'
            : full
              ? 'You heard the whole groove. Try the part the chalk writer took.'
              : 'Two little brass stops frame the groove.';
      if (typeof current === 'string' && /^[012]{2}$/.test(current)) {
        const quote = cylinder(Number(current[0]), Number(current[1]));
        reading.append(
          h('p', {}, 'Wound from groove ' + (Number(current[0]) + 1) + ' to ' + (Number(current[1]) + 1)),
          h('q', { 'aria-live': 'polite' }, quote),
          button('Read this cut aloud', () => read(quote)),
        );
      }
      if (short && full) bellCuts.forEach((v, i) => choices.append(choose(v.label, i)));
    } else if (site === 'island') {
      const experiments = ['00', '01', '10', '11'];
      const walked = c.state.flags[key + '.walked'] === true;
      const ready = lastBellReady(c.state, site);
      const remaining = experiments.filter((s) => c.state.flags[key + '.seen.' + s] !== true);
      progress.textContent = walked
        ? fieldWalk
        : !ready
          ? 'Runs still on Ivo’s slate: ' +
            remaining
              .map((s) => relayRuns[Number(s[0])] + (s[1] === '1' ? ' in fog' : ' in clear air'))
              .join(' · ')
          : 'Joss holds out one boot. “Point me somewhere.”';
      if (typeof current === 'string' && /^[01]{2}$/.test(current)) {
        const fog = current[1] === '1',
          run = relayRun(Number(current[0]), fog, c.state.flags[key + '.run-measured'] === true);
        reading.append(
          relayTheatre(Number(current[0]), fog, c.state.flags[key + '.run-measured'] === true),
          h('p', { 'aria-live': 'polite' }, run.text),
        );
      }
      if (ready)
        relayRuns.forEach((r, i) => {
          if (!walked || c.state.flags[key + '.verified.' + i] === true)
            choices.append(choose('Send Joss to the ' + r.toLowerCase() + ' first', i));
        });
      if (
        !walked &&
        typeof c.state.flags[lastBellObjective('island')] === 'number' &&
        c.state.flags['last-bell.bridge.back'] !== true
      )
        choices.append(
          h(
            'p',
            {},
            'Joss unhooks the footpath beside the model. Leave the plinth and look three tiles east and one north. She’ll meet you at the kiln timing cord.',
          ),
        );
      if (!walked && c.state.flags['last-bell.bridge.back'] === true)
        choices.append(
          button('Tie the walked times onto Ivo’s model', () => {
            if (send({ type: 'WorkLastBell', site: 'island', action: 'walk' }))
              tool.querySelector('select')?.focus();
          }),
        );
      if (walked && !choices.childElementCount)
        choices.append(h('p', {}, 'Send the signal in fog with the measured time to post an updated route.'));
    } else {
      const order = benchOrder(c.state);
      progress.textContent =
        order.length === 2
          ? 'Moving either record to the back changes who speaks first.'
          : 'There is room for two records.';
      reading.append(
        h(
          'ol',
          { class: 'bell-leaves', 'aria-label': 'Hearing order' },
          order.map((leaf) =>
            h('li', {}, h('strong', {}, bellLeaves[leaf]), h('p', {}, hearingRecord(c.state, leaf))),
          ),
        ),
      );
      if (order.length === 2) {
        reading.append(h('blockquote', { 'aria-live': 'polite' }, hearingExchange(order)));
        hearingChoices.forEach((v, i) => choices.append(choose(v.label, i)));
      }
    }
    const kept = c.state.flags[lastBellObjective(site)];
    if (site === 'council' && (kept === 0 || kept === 1)) {
      const before = returnDesk.querySelector('details')?.open ?? false;
      const summary = h('details', {}, h('summary', {}, 'Two empty lines at dawn'));
      summary.open = before;
      const records = hearingReturns(c.state);
      summary.append(
        h(
          'p',
          {},
          'Ro returns after the chairs are stacked. “I’ve got two blank lines and a neighbour who thinks I wrote down what she heard. Will you sit with me once more?”',
        ),
        h(
          'ul',
          {},
          records.map((r) => h('li', {}, r.ready ? r.detail : 'Still to visit · ' + r.place)),
        ),
      );
      if (records.every((r) => r.ready))
        secondHearing.forEach((v, i) =>
          summary.append(
            button(v.action, () => {
              if (send({ type: 'WorkLastBell', site: 'council', action: 'reopen', petition: i }))
                returnDesk.querySelectorAll('button')[i]?.focus();
            }),
          ),
        );
      const addendum = c.state.flags['last-bell.council.addendum'];
      if (typeof addendum === 'string') summary.append(h('blockquote', {}, addendum));
      returnDesk.replaceChildren(summary);
    }
    ending.hidden = kept !== 0 && kept !== 1;
    if (!ending.hidden && (kept === 0 || kept === 1)) {
      ending.textContent =
        site === 'voices'
          ? bellCuts[kept].outcome
          : site === 'island'
            ? routeEnding(kept)
            : String(c.state.flags[key + '.minute']);
    }
  }
  panel.append(tool, feedback, reading, progress, choices, ending, returnDesk);
  draw();
  return panel;
}
