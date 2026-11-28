import type { GameController } from '../app/controller';
import {
  carriedInk,
  challengeLines,
  counterResult,
  inkActions,
  inkAnswer,
  inkCases,
  inkChallenge,
  inkComparison,
  inkEdition,
  inkEditions,
  inkHours,
  inkKey,
  inkObservation,
  inkPaper,
  inkProof,
  inkReadout,
  inkRival,
  inkSetup,
  inkTools,
  pressNames,
  triedInk,
  type InkCommand,
  type InkEdition,
} from '../domain/secondInk';
import { h } from './dom';
import { localGuide } from './localGuide';
import './secondInk.css';

type BareCommand = InkCommand extends infer C
  ? C extends InkCommand
    ? Omit<C, 'type' | 'site'>
    : never
  : never;
export const inkAisles: Record<InkEdition, string> = {
  exhibit: 'the pin rail in the east aisle',
  serve: 'the service tray in the west aisle',
  entrust: 'the witness seat in the south aisle',
};
export function secondInkPanel(c: GameController, sound: (key: string) => void, receiver = false) {
  const k = inkCases.find((story) => story.room === c.state.mapId);
  if (!k) return h('p', {}, 'The moth has gone back to its register.');
  const site = k;
  const body = h('div'),
    live = h('p', { role: 'status', class: 'ink-response' }),
    shell = h('section', { class: 'second-ink', 'data-reading-bench': '' }, body, live);
  const guide = localGuide(
    c,
    k.world,
    () => 'secondink.' + k.site + '.' + (receiver ? 'delivery' : inkSetup(c.state, k).tool),
  );
  shell.append(guide);
  let ribbon = false,
    readMargins = false;
  function ctrl(key: string, label: string, command: BareCommand, pressed?: boolean) {
    return h(
      'button',
      {
        type: 'button',
        'data-ink': key,
        'aria-pressed': pressed === undefined ? undefined : String(pressed),
        onclick: () => act(command, key),
      },
      label,
    );
  }
  function act(command: BareCommand, key: string) {
    const error = c
      .dispatch({ type: 'WorkSecondInk', site: site.site, ...command })
      .find((e) => e.kind === 'error');
    if (error) {
      live.textContent = error.message;
      return;
    }
    const s = c.state;
    sound(['read', 'sign', 'carry', 'compare'].includes(command.work) ? 'sfx.page' : 'sfx.click');
    let response = '';
    switch (command.work) {
      case 'read':
        response = 'Kept. ' + inkReadout(s, site);
        break;
      case 'set':
      case 'pull':
      case 'turn':
        response = inkReadout(s, site);
        break;
      case 'sign':
        response = 'The notice has gone to ' + inkAisles[command.edition] + '.';
        break;
      case 'visit':
        response = site[inkEdition(s, site)!.edition];
        break;
      case 'carry':
        response = 'The folded notice from “' + site.title + '” is in your moth pocket.';
        break;
      case 'challenge':
        response = challengeLines[inkChallenge(s, site)!.tool];
        break;
      case 'answer':
        response = 'Agate puts her mark beside your comparison. ' + counterResult(s, site);
        break;
      case 'compare': {
        const x = inkComparison(s, site)!;
        response = 'From “' + x.carried.site.title + '” · ' + x.there + ' Here · ' + x.here;
        break;
      }
    }
    draw();
    const same = body.querySelector<HTMLElement>('[data-ink="' + key + '"]');
    (
      same ?? body.querySelector<HTMLElement>('[data-ink="' + (receiver ? 'visit' : 'read') + '"]')
    )?.focus({ preventScroll: true });
    live.textContent = response;
  }
  function graph() {
    const s = c.state,
      { tool, index, depth, back } = inkSetup(s, site);
    if (tool === 'slip') {
      const trace = inkPaper(s, site);
      return h(
        'div',
        { class: 'ink-hatch', 'aria-hidden': 'true' },
        ...[1, 2, 3, 4].map((n) =>
          h(
            'span',
            { class: n === trace.pin ? 'ink-pin' : n === trace.notch ? 'ink-scar' : '' },
            n === trace.pin ? '◆' : n === trace.notch ? '✶' : '·',
          ),
        ),
      );
    }
    if (tool === 'cord')
      return h(
        'div',
        { class: 'ink-cord', 'aria-hidden': 'true' },
        h('span', {}, site.desks[index]),
        ' ─ ',
        h('span', {}, depth > 0 ? (site.origin[index] === 0 ? '○' : '□') : '…'),
        ' ─ ',
        h('span', {}, depth > 1 ? site.writers[site.origin[index]] : '…'),
      );
    const times = back ? site.older : site.tide;
    return h(
      'div',
      { class: 'ink-shutters', 'aria-hidden': 'true' },
      ...inkHours.map((_, i) =>
        h(
          'span',
          { class: i === index ? 'open' : '' },
          i === index ? '▣ ' + times.filter((n) => n === i).length : '▤',
        ),
      ),
    );
  }
  function draw() {
    const s = c.state,
      setup = inkSetup(s, site),
      issued = inkEdition(s, site),
      carried = carriedInk(s);
    if (receiver) {
      if (!issued) {
        body.replaceChildren(h('p', {}, 'The moth has an empty fold.'));
        return;
      }
      const delivered = s.flags[inkKey(site, 'receivedStamp')] === issued.stamp;
      const readings = h(
        'details',
        {},
        h('summary', {}, 'Read the marks on this notice'),
        ...issued.samples.map((i) => h('p', {}, inkObservation(site, issued.tool, i))),
      );
      body.replaceChildren(
        h('h3', {}, site.title),
        h('p', {}, 'At ' + inkAisles[issued.edition] + '.'),
        readings,
        ctrl('visit', delivered ? 'See who is here now' : 'Follow the notice to its user', {
          work: 'visit',
        }),
        ...(delivered
          ? [
              h('p', {}, site[issued.edition]),
              ctrl('carry', 'Fold this notice for another town', { work: 'carry' }),
            ]
          : []),
      );
      return;
    }
    const tools = h(
      'div',
      { class: 'ink-tools', role: 'group', 'aria-label': 'Tools on the worktable' },
      ...inkTools.map((tool) =>
        ctrl(tool, pressNames[tool], { work: 'set', tool, index: 0 }, tool === setup.tool),
      ),
    );
    const labels =
      setup.tool === 'slip'
        ? ['Left peg', 'Middle peg', 'Right peg']
        : setup.tool === 'cord'
          ? site.desks
          : inkHours;
    const positions = h(
      'div',
      { class: 'ink-positions', role: 'group', 'aria-label': 'Position on the tool' },
      ...labels.map((label, i) => {
        const b = ctrl('p' + i, label, { work: 'set', tool: setup.tool, index: i }, i === setup.index);
        b.addEventListener('keydown', (event) => {
          const d = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          event.preventDefault();
          const dest = (3 + i + d) % 3;
          act({ work: 'set', tool: setup.tool, index: dest }, 'p' + dest);
        });
        return b;
      }),
    );
    const held = triedInk(s, site, setup.tool, setup.back);
    const special =
      setup.tool === 'cord'
        ? ctrl('pull', setup.depth === 2 ? 'The far knot is open' : 'Pull the cord one knot', {
            work: 'pull',
          })
        : ctrl(
            'turn',
            setup.tool === 'slip'
              ? setup.back
                ? 'Turn to the inked face'
                : 'Turn to the back at this peg'
              : setup.back
                ? 'Watch this shift'
                : 'Watch the previous shift',
            { work: 'turn' },
          );
    if (setup.tool === 'cord' && setup.depth === 2) special.disabled = true;
    const sign = h('div', { class: 'ink-issue' });
    if (inkProof(s, site, setup.tool))
      sign.append(
        h('h4', {}, 'Who gets the notice?'),
        h('p', {}, 'Seal it with the readings on ' + pressNames[setup.tool].toLowerCase() + '.'),
        ...inkEditions.map((edition) =>
          ctrl('sign-' + edition, inkActions[edition], { work: 'sign', tool: setup.tool, edition }),
        ),
      );
    const rival = inkRival(s, site),
      accepted = inkChallenge(s, site);
    const margin = h('details', { open: readMargins }, h('summary', {}, 'Agate’s folded margin'));
    margin.ontoggle = () => {
      readMargins = margin.open;
    };
    if (rival.level)
      margin.append(
        h(
          'p',
          {},
          'The moth recognizes ' +
            pressNames[rival.tool].toLowerCase() +
            ' from ' +
            rival.cases
              .slice(0, 4)
              .map((k) => k.title)
              .join(' and ') +
            '.',
        ),
        ctrl('challenge', accepted ? 'Ask Agate for today’s margin' : 'Open her counterproof', {
          work: 'challenge',
        }),
      );
    else
      margin.append(
        h(
          'p',
          {},
          'Agate can send a counterproof when you have signed notices in two other towns with the same tool. She sells you the paper for one dead moth. Tritta puts a scrap moth on the scale. The deal stands.',
        ),
      );
    if (accepted)
      margin.append(
        h('p', {}, challengeLines[accepted.tool]),
        ...(accepted.level === 2
          ? [h('p', {}, 'A second fold opens. “Can you come at this with another tool as well?”')]
          : []),
        ctrl('answer', 'Bring Agate your comparison', { work: 'answer' }),
      );
    if (accepted && inkAnswer(s, site)) margin.append(h('p', {}, counterResult(s, site)));
    const pocket = h('details', { open: ribbon }, h('summary', {}, 'The moth pocket'));
    pocket.ontoggle = () => {
      ribbon = pocket.open;
    };
    if (carried)
      pocket.append(
        h(
          'p',
          {},
          '“' +
            carried.site.title +
            '” · ' +
            inkActions[carried.edition] +
            '. ' +
            pressNames[carried.tool] +
            '.',
        ),
        ...(carried.site.site !== site.site
          ? [ctrl('compare', 'Lay the folded notice beside this reading', { work: 'compare' })]
          : []),
      );
    else
      pocket.append(
        h(
          'p',
          {},
          'A signed notice can travel after you have seen who used it. There is room for one in the fold.',
        ),
      );
    body.replaceChildren(
      h('h3', {}, site.title),
      h('p', {}, site.hook),
      h('p', { class: 'ink-claim' }, site.claim),
      tools,
      h(
        'section',
        { class: 'ink-instrument' },
        graph(),
        positions,
        special,
        h('p', {}, inkReadout(s, site)),
        ctrl('read', 'Keep this reading', { work: 'read' }),
        h(
          'p',
          { class: 'fine' },
          held.length
            ? 'Kept on this side · ' + held.map((i) => labels[i]).join(' · ')
            : 'The strip on this side is blank.',
        ),
      ),
      sign,
      ...(issued ? [h('p', {}, 'Your signed notice is at ' + inkAisles[issued.edition] + '.')] : []),
      margin,
      pocket,
    );
  }
  draw();
  return shell;
}
