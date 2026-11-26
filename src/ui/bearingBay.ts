import type { GameController } from '../app/controller';
import { BEARING_CASES, BEARING_GATE, type BearingCase } from '../content/bearingBay';
import { BEARING_FIXES, BEARING_POSTS, bearingMove, firstSight, matchingCells, readBearing, repeatSights,
  type BearingMove, type BearingRoute, type Point, type SightLine } from '../domain/bearingBay';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './bearingBay.css';

const ROUTE = { quay: 'the low west dock in Slate Harbour', fold: 'Marl Fold’s guided sight rail' } as const;
const postName = (i: number) => i === 0 ? 'West post' : 'East post';
const lineNote = ([origin, direction]: SightLine) => `Post ${origin.join(', ')}. Aim ${Math.abs(direction[0])} ${direction[0] < 0 ? 'west' : 'east'} and ${Math.abs(direction[1])} ${direction[1] < 0 ? 'south' : 'north'}.`;
const candidates = (lines: readonly SightLine[]) => {
  const cells = matchingCells(lines);
  if (!cells.length) return 'The sight strips do not meet on this board.';
  const places = cells.map(([east, north]) => `${east} east, ${north} north`);
  return cells.length === 1 ? `The sights meet at ${places[0]}.` : `The strip passes through ${cells.length} possible squares. ${places.join(' · ')}.`;
};

function sightBoard(lines: readonly SightLine[]) {
  const art = h('canvas', { width: 232, height: 232, 'aria-hidden': true });
  const g = art.getContext('2d');
  if (g) {
    const xy = ([east, north]: Point) => [20 + east * 24, 212 - north * 24] as const;
    g.fillStyle = '#223048';
    g.fillRect(0, 0, 232, 232);
    for (let north = 0; north <= 8; ++north) for (let east = 0; east <= 8; ++east) {
      const [x, y] = xy([east, north]);
      g.fillStyle = '#7b9caa';
      g.fillRect(x - 1, y - 1, 3, 3);
    }
    lines.forEach(([origin, direction], i) => {
      const [x, y] = xy(origin);
      g.strokeStyle = i ? '#f7c679' : '#b1f1e4';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = 2;
      g.setLineDash(i ? [4, 3] : []);
      g.beginPath(); g.moveTo(x, y);
      g.lineTo(...xy([origin[0] + direction[0] * 10, origin[1] + direction[1] * 10]));
      g.stroke();
      g.fillRect(x - 3, y - 3, 7, 7);
    });
    for (const point of matchingCells(lines)) {
      const [x, y] = xy(point);
      g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.setLineDash([]);
      g.strokeRect(x - 4, y - 4, 8, 8);
    }
  }
  return h('figure', { class: 'bearing-board' }, art, h('figcaption', {}, h('p', {}, candidates(lines)),
    h('ul', { class: 'fine' }, ...lines.map((line) => h('li', {}, lineNote(line))))));
}

export function bearingBayPanel(place: string, controller: GameController, sound: (key: string) => void, refreshWorld: () => void) {
  const [station, slug] = place.split(':');
  const body = h('div'), feedback = h('p', { role: 'status', class: 'fine' });
  const panel = h('div', { class: 'bearing-panel', tabindex: -1 }, body, feedback);

  function control(record: BearingCase, id: string, label: string, move: BearingMove, response: string, disabled = false) {
    return h('button', { type: 'button', 'data-bearing-step': id, disabled, onclick: () => {
      if (!controller.check(BEARING_GATE) || !controller.check({ card: record.card })) return;
      if (station === 'return' && !controller.check(specimenEquipped(record.key))) return;
      const effect = bearingMove(record.slug, controller.state.flags, move);
      if (!effect) return;
      const result = controller.dispatch({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
      if (result.some(({ kind }) => kind === 'error')) return;
      sound(move.kind === 'fit' || move.kind === 'receive' ? 'sfx.sparkle' : 'sfx.pickup');
      if (move.kind === 'send' || move.kind === 'receive' || move.kind === 'fit') refreshWorld();
      render(); feedback.textContent = response;
      const end = move.kind === 'fit' ? body.querySelector<HTMLElement>('[data-bearing-end]') : null;
      (end ?? body.querySelector<HTMLElement>(`button[data-bearing-step="${id}"]:enabled`) ?? body.querySelector<HTMLElement>('button:enabled') ?? panel).focus();
    } }, label);
  }

  function first(record: BearingCase) {
    body.append(h('h2', {}, record.name), h('p', {}, record.stake));
    if (!controller.check({ card: record.card })) {
      body.append(h('p', {}, 'Read the dated source beside this sighting board.'));
      return;
    }
    const state = readBearing(record.slug, controller.state.flags);
    const lines = state.sighted.map((post) => firstSight(post, record.start));
    body.append(h('p', { class: 'fine' }, record.evidence), h('p', {}, record.limit),
      h('p', {}, `The practice lamp for ${record.job} holds still through the first bell. Sweep the sight at each post.`));
    body.append(h('div', { class: 'row wrap' }, ...BEARING_POSTS.map((post, i) => control(record, post, `Trace the ${post} sight`,
      { kind: 'read', post }, `${postName(i)} at the first bell. ${lineNote(firstSight(post, record.start))}`, state.sighted.includes(post) || !!state.route))));
    if (lines.length) body.append(sightBoard(lines));
    if (state.route) {
      body.append(h('p', {}, state.received ? `The fitted route aid stays at ${ROUTE[state.route]}.` : `Take the paired trace to ${ROUTE[state.route]}.`));
      return;
    }
    if (lines.length < 2) return;
    body.append(h('div', { class: 'row wrap' },
      control(record, 'send-quay', 'Carry the paired trace to the west dock', { kind: 'send', route: 'quay' }, 'A low lamp frame waits at the west dock.'),
      control(record, 'send-fold', 'Carry the two sight strips to Marl Fold', { kind: 'send', route: 'fold' }, 'Two free hooks wait beside the Fold’s guided rail.')));
  }

  function receive(route: BearingRoute) {
    body.append(h('h2', {}, ROUTE[route]));
    for (const record of BEARING_CASES) {
      const state = readBearing(record.slug, controller.state.flags);
      if (state.route !== route) continue;
      const lines = BEARING_POSTS.map((post) => firstSight(post, record.start));
      const reply = route === 'quay'
        ? `The west dock has a low lamp at the checked mark for ${record.job}. A carrier can read it alone. A fresh sight is needed if the lamp moves.`
        : `The Fold keeps two slide strips for ${record.job}. A visitor can follow the crossing on the rail when the guide is there.`;
      body.append(h('section', { class: 'clue-view' }, h('h3', {}, record.name), sightBoard(lines),
        h('p', { class: 'fine' }, `${record.institution} · ${record.accession}`),
        state.received ? h('p', {}, reply) : control(record, `receive-${record.slug}`,
          route === 'quay' ? 'Fit the checked low lamp' : 'Set both strips on the guided rail', { kind: 'receive', route }, reply)));
    }
    if (body.childElementCount === 1) body.append(h('p', {}, 'There is room here for a trace from Headland Station.'));
  }

  function revisit(record: BearingCase) {
    const state = readBearing(record.slug, controller.state.flags);
    body.append(h('h2', {}, record.name));
    if (!state.received || !controller.check(specimenEquipped(record.key))) {
      body.append(h('p', {}, 'The right working copy must be in use to lift this shutter.'));
      return;
    }
    const flawed = record.kind === 'fog' ? 'The east sight is missing behind the screen.' : record.kind === 'late'
      ? 'The east sight is from the earlier bell. The practice lamp may have moved.' : 'The old east strip starts at a post that is no longer there.';
    const provisional = repeatSights(record.changed, record.kind);
    body.append(h('p', {}, record.change), control(record, 'old', 'Lay the old pair over today’s field', { kind: 'old' }, flawed, state.old));
    if (!state.old) return;
    body.append(h('p', {}, `${flawed} Only the current west sight can be used yet.`), sightBoard(provisional));
    const choices = h('div', { class: 'bearing-layout' });
    for (const fix of BEARING_FIXES) {
      const pair = repeatSights(record.changed, record.kind, fix);
      const left = state.repeated.includes(fix);
      const fit = fix === 'wait' ? record.waitResult : record.sideResult;
      choices.append(h('section', { class: 'clue-view' }, h('h3', {}, fix === 'wait' ? 'Matched at the next bell' : 'Side post this bell'),
        left ? sightBoard(pair) : null, control(record, `repeat-${fix}`, fix === 'wait' ? 'Take both sights one bell later' : 'Trace from the side post this bell',
          { kind: 'repeat', fix }, candidates(pair), left),
        !state.fitted && state.repeated.length === BEARING_FIXES.length ? control(record, `fit-${fix}`,
          fix === 'wait' ? 'Fit the repeat-bell rack' : 'Fit the side-view guide', { kind: 'fit', fix }, fit) : null));
    }
    body.append(choices);
    if (state.fitted) body.append(h('section', { class: 'clue-view', 'data-bearing-end': '', tabindex: -1 }, h('h3', {}, 'The fitted sight rack'),
      h('p', {}, state.fitted === 'wait' ? record.waitResult : record.sideResult), sightBoard(repeatSights(record.changed, record.kind, state.fitted))));
  }

  function render() {
    body.replaceChildren();
    if (station === 'quay' || station === 'fold') { receive(station); return; }
    const record = BEARING_CASES.find((entry) => entry.slug === slug);
    if (!record) return;
    if (station === 'first') first(record);
    else if (station === 'return') revisit(record);
  }
  render();
  return panel;
}
