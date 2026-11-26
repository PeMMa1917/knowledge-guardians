import type { GameController } from '../app/controller';
import { hasTalent } from '../domain/talents';
import { dayOf } from '../domain/ledger';
import { DISPATCH_DESKS, DISPATCH_SLIPS, TILE_PAIRS, dailySeed, dealTiles, decodeGhost, dispatchFlag, ghostPairs,
  isPair, runNumber, selectableSlips, speedRank, tileRank, type DispatchDesk, type DispatchSlip } from '../domain/tiles';
import { h } from './dom';

export const SEFA_TABLE = 'Sefa’s stitching table';

const desks = Object.keys(DISPATCH_DESKS) as DispatchDesk[];

function slipText(slip: DispatchSlip): HTMLElement {
  return h('div', { class: 'sefa-slip-text' },
    h('p', {}, h('strong', {}, 'Reading. '), slip.reading),
    h('p', {}, h('strong', {}, 'What stayed unchecked. '), slip.limit));
}

interface StitchOptions {
  daily: boolean;
  calm: boolean;
  sound: (key: string) => void;
  replay: (daily: boolean) => void;
  refresh: () => void;
}

export function sefaStitching(c: GameController, options: StitchOptions): { panel: HTMLElement; dispose: () => void } {
  const { daily, calm, sound, replay, refresh } = options;
  const today = new Date(), day = dayOf(today), run = runNumber(c.state);
  const tiles = dealTiles(daily ? dailySeed(today) : run);
  const recall = hasTalent(c.state, 'recall');
  const matched = new Set<number>();
  let open = recall ? tiles.map((_, index) => index) : [];
  let moves = 0, started: number | undefined, finished = false, paused = recall;
  let turnTimer: ReturnType<typeof setTimeout> | undefined, ghostTimer: ReturnType<typeof setInterval> | undefined;
  const times: number[] = [];
  const ghost = calm ? [] : decodeGhost(c.state.flags['tiles.ghost']);
  let showGhost = ghost.length > 0;
  const bestMoves = Number(c.state.flags['tiles.best.moves'] ?? 0);
  const bestSecs = Number(c.state.flags['tiles.best.secs'] ?? 0);
  const dailyBest = daily && c.state.flags['tiles.daily.day'] === day
    ? ` Today’s best: ${c.state.flags['tiles.daily.moves']} moves, ${c.state.flags['tiles.daily.secs']} s.` : '';
  const status = h('p', { class: 'fine', role: 'status' });
  const feedback = h('p', { class: 'fine', role: 'status' });
  const ghostLine = h('p', { class: 'fine ghost-line' });
  const slipReadings = h('div', { class: 'sefa-slip-text' });
  const result = h('div', { class: 'sefa-dispatch-result' });
  const pending = h('div', { class: 'sefa-pending' });
  const grid = h('div', { class: 'tiles-grid', 'aria-label': 'The twelve slip halves' });
  const controls = tiles.map((_, i) => h('button', { type: 'button', class: 'word-tile', 'data-slip-index': String(i),
    'data-autofocus': i === 0, onclick: () => flip(i) }));
  grid.append(...controls);

  const pace = ghost.length ? h('button', { type: 'button', 'aria-pressed': 'true', onclick: () => {
    showGhost = !showGhost;
    pace?.setAttribute('aria-pressed', String(showGhost));
    syncGhost();
  } }, 'Show personal pace') : null;
  const help = h('details', { class: 'sefa-stitch-help' }, h('summary', {}, 'Sefa’s stitching clue'),
    h('p', {}, 'Both halves have the same stamp and cut edge. A stamp can occur on more than one slip. Count the cuts and check whether they are round or pointed.'));
  const panel = h('section', {}, h('h2', {}, daily ? `${SEFA_TABLE} · today’s work` : SEFA_TABLE),
    h('p', {}, 'The cord came loose on six of Sefa’s work slips. Turn two halves and stitch matching prints. Bring the reading and its edge to the same desk.'),
    daily ? h('p', { class: 'fine' }, `Same tray for everyone today (${day}).${dailyBest}`) : null,
    h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => replay(!daily) }, daily ? 'Open an ordinary tray' : 'Open today’s tray'), pace),
    pending, help, status, feedback, ghostLine, grid, slipReadings, result);

  function updateGhost(): void {
    if (!showGhost || finished) { ghostLine.textContent = ''; return; }
    const elapsed = started === undefined ? 0 : (performance.now() - started) / 1000;
    ghostLine.textContent = `Your previous fastest tray had ${ghostPairs(ghost, elapsed)} of ${TILE_PAIRS} slips stitched at this point.`;
  }

  function syncGhost(): void {
    clearInterval(ghostTimer);
    ghostTimer = undefined;
    updateGhost();
    if (showGhost && started !== undefined && !finished) ghostTimer = setInterval(updateGhost, 300);
  }

  function render(): void {
    for (const [i, control] of controls.entries()) {
      const tile = tiles[i], showing = open.includes(i) || matched.has(i);
      control.classList.toggle('open', showing);
      control.classList.toggle('matched', matched.has(i));
      control.disabled = finished || matched.has(i);
      control.setAttribute('aria-label', showing
        ? `${tile.slip.print}. ${tile.kind === 'reading' ? 'Reading' : 'Unchecked part'}. ${tile.text}${matched.has(i) ? ' Stitched.' : ''}`
        : `Slip half ${i + 1}, face down`);
      control.replaceChildren(showing ? h('span', {},
        h('span', { class: 'sefa-stamp', 'aria-hidden': 'true' }, tile.slip.mark),
        h('span', { class: 'sefa-print' }, tile.slip.print),
        h('span', { class: 'fine' }, tile.kind === 'reading' ? 'Reading' : 'Unchecked part'))
        : h('span', { class: 'tile-back', 'aria-hidden': 'true' }, '✦'));
    }
    status.textContent = `${matched.size / 2} of ${TILE_PAIRS} slips stitched · ${moves} move${moves === 1 ? '' : 's'}` +
      (bestMoves ? ` · best ${bestMoves} moves, ${bestSecs} s` : '');
  }

  function flip(index: number): void {
    if (finished || paused || open.includes(index) || matched.has(index)) return;
    if (started === undefined) { started = performance.now(); syncGhost(); }
    const focused = document.activeElement === controls[index];
    open.push(index);
    sound('sfx.page');
    slipReadings.replaceChildren(...open.map((i) => h('p', {}, h('strong', {}, `${tiles[i].slip.print}. `), tiles[i].text)));
    if (open.length === 2) {
      moves++;
      const [a, b] = open;
      if (isPair(tiles[a], tiles[b])) {
        matched.add(a); matched.add(b);
        open = [];
        times.push((performance.now() - started) / 1000);
        feedback.textContent = `Stitched ${tiles[a].slip.name.toLowerCase()}. Its reading and limit stay together.`;
        sound('sfx.sparkle');
        if (matched.size === tiles.length) finish();
      } else {
        feedback.textContent = 'The prints differ. The two halves go back on the tray.';
        paused = true;
        turnTimer = setTimeout(() => { open = []; paused = false; render(); }, 1100);
      }
    }
    render();
    if (focused && controls[index].disabled && !finished) {
      const next = controls.slice(index + 1).find((button) => !button.disabled) ?? controls.find((button) => !button.disabled);
      next?.focus({ preventScroll: true });
    }
  }

  function finish(): void {
    finished = true;
    syncGhost();
    const secs = Math.max(1, Math.round((performance.now() - (started ?? performance.now())) / 1000));
    const pairs = [...new Set([...matched].map((index) => tiles[index].slip.id))];
    const error = c.dispatch({ type: 'CompleteTileStitch', daily: daily ? day : null, run, pairs, moves, secs, times })
      .find((event) => event.kind === 'error');
    if (error) {
      feedback.textContent = error.message;
      const retry = h('button', { type: 'button', onclick: () => replay(daily) }, 'Deal a fresh tray');
      result.replaceChildren(retry);
      retry.focus({ preventScroll: true });
      return;
    }
    sound('sfx.award');
    pending.replaceChildren();
    const score = h('p', { class: 'fine' }, `${moves} moves · ${secs} s. Precision ${tileRank(moves, TILE_PAIRS)}. Pace ${speedRank(secs, TILE_PAIRS)}.`);
    const heading = h('h3', { tabindex: '-1' }, 'The joined slips are ready');
    result.replaceChildren(heading, score, routePacket(c, refresh, sound),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => replay(false) }, 'Play again with new slips'),
        daily ? h('button', { type: 'button', onclick: () => replay(true) }, 'Replay today’s tray') : null));
    heading.focus();
  }

  if (selectableSlips(c.state).length) {
    const packet = h('details', {}, h('summary', {}, 'Open the previously stitched packet'), routePacket(c, refresh, sound));
    pending.append(packet);
  }
  if (recall) turnTimer = setTimeout(() => { open = []; paused = false; render(); }, 3000);
  render();
  updateGhost();
  return { panel, dispose: () => { clearInterval(ghostTimer); clearTimeout(turnTimer); } };
}

function routePacket(c: GameController, refresh: () => void, sound: (key: string) => void): HTMLElement {
  const panel = h('section', { class: 'sefa-route-packet' });
  const together = h('div', {});
  const reply = h('p', { role: 'status', tabindex: '-1' });
  const choices = h('div', { class: 'row', role: 'group', 'aria-label': 'Stitched slips' });
  let selected: DispatchSlip | undefined;
  const destinations = desks.map((desk) => h('button', { type: 'button', disabled: true, onclick: () => {
    if (!selected) return;
    const previous = c.state.flags[dispatchFlag(desk, selected.id)];
    const error = c.dispatch({ type: 'SendTileDispatch', slip: selected.id, desk }).find((event) => event.kind === 'error');
    if (error) { reply.textContent = error.message; return; }
    reply.textContent = previous === 'received' ? `${DISPATCH_DESKS[desk]} already has the signed ${selected.name.toLowerCase()} slip.` :
      `${selected.name} is clipped for the ${DISPATCH_DESKS[desk]}. Take both halves to Sefa’s dispatch clip there.`;
    if (desk === 'ferry' && !c.state.flags['clue.oldmap.folded-map']) {
      reply.append(' The folded map shows the older road from Emberford. The slip can wait here until the road opens.');
    }
    choices.replaceChildren();
    together.replaceChildren();
    destinations.forEach((button) => { button.hidden = true; });
    sound('sfx.page');
    refresh();
    reply.focus();
  } }, `Send to ${DISPATCH_DESKS[desk]}`));
  const buttons = selectableSlips(c.state).map((slip) => h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
    selected = slip;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.textContent === slip.name)));
    together.replaceChildren(slipText(slip));
    destinations.forEach((button) => { button.disabled = false; });
  } }, slip.name));
  choices.append(...buttons);
  panel.append(h('p', {}, 'Choose one stitched slip to carry. The guild desk uses it for town work. The Ferry desk needs a separate check for the landing.'),
    choices, together, h('div', { class: 'row' }, destinations), reply);
  return panel;
}

export function sefaDeskPanel(c: GameController, desk: DispatchDesk, refresh: () => void, sound: (key: string) => void): HTMLElement {
  const panel = h('section', {}, h('h2', {}, DISPATCH_DESKS[desk]));
  for (const slip of DISPATCH_SLIPS) {
    const key = dispatchFlag(desk, slip.id);
    if (!c.state.flags[key]) continue;
    const reply = h('p', { class: 'clue-view', role: 'status', tabindex: '-1' });
    const deliver = h('button', { type: 'button', onclick: () => {
      const error = c.dispatch({ type: 'ReceiveTileDispatch', slip: slip.id, desk }).find((event) => event.kind === 'error');
      if (error) { reply.textContent = error.message; return; }
      sound('sfx.page');
      render();
      reply.focus();
      refresh();
    } }, `Hand over the ${slip.name.toLowerCase()} slip`);
    function render(): void {
      const received = c.state.flags[key] === 'received';
      deliver.hidden = received;
      reply.textContent = received ? slip[desk] : 'Bring both parts together before the keeper clips the reading to the next job.';
    }
    panel.append(h('article', { class: 'sefa-desk-slip' }, h('h3', {}, slip.name), slipText(slip), deliver, reply));
    render();
  }
  return panel;
}
