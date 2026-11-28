import { DISPATCH_SLIPS } from '../domain/tiles';
import { h } from '../ui/dom';
import { request, ServiceError } from './request';
import type { BoardAudience } from './scoreBoard';

type Round = {
  id: string;
  turns: number;
  moves: number;
  expired: boolean;
  finished: boolean;
  seconds: number | null;
  waitMs: number;
  first: number | null;
  tiles: { value: number | null; matched: boolean }[];
};
export function rankedStitch(audience: BoardAudience, onFinish?: () => void) {
  const path =
    'student/stitch?' +
    new URLSearchParams({ account: audience.account, class: audience.classId, teacher: audience.teacher! });
  const status = h('p', { role: 'status' }),
    grid = h('div', { class: 'ranked-stitch-grid', 'aria-label': 'Stitching slips' });
  const start = h(
    'button',
    { type: 'button', onclick: () => play({ action: 'start' }) },
    'Play or resume online stitching',
  );
  const section = h(
    'section',
    { class: 'ranked-stitch' },
    h('h3', {}, 'Sefa’s online stitching table'),
    h(
      'p',
      {},
      'Match six pairs of dispatch slips. The school server turns the tiles and records your best moves and time. The result stays private until you share it with your class.',
    ),
    start,
    grid,
    status,
  );
  let busy = false,
    round: Round | null = null,
    ready = 0;
  async function play(input: Record<string, unknown>) {
    if (busy || !section.isConnected) return;
    busy = true;
    try {
      const response = await request<{ round: Round | null }>(path, 'POST', input);
      if (!section.isConnected) return;
      round = response.round;
      if (!round) {
        status.textContent = 'The class round is unavailable.';
        return;
      }
      ready = Date.now() + round.waitMs;
      const state = round;
      const selected = grid.contains(document.activeElement)
        ? (document.activeElement as HTMLElement).dataset.tile
        : undefined;
      grid.replaceChildren(
        ...state.tiles.map((tile, i) => {
          const slip = tile.value === null ? null : DISPATCH_SLIPS[tile.value];
          const button = h(
            'button',
            {
              type: 'button',
              'data-tile': i,
              'aria-disabled':
                tile.matched || state.expired || state.finished || state.first === i ? 'true' : 'false',
              onclick: () => flip(i),
            },
            'Slip ' +
              (i + 1) +
              ' · ' +
              (slip ? slip.name : 'Face down') +
              (tile.matched ? ' · Stitched' : ''),
          );
          return button;
        }),
      );
      if (selected !== undefined)
        grid.querySelector<HTMLButtonElement>('[data-tile="' + selected + '"]')?.focus();
      start.hidden = !state.finished && !state.expired;
      start.textContent = 'Start a new online round';
      const shown = state.tiles.filter((tile) => !tile.matched && tile.value !== null);
      status.textContent = state.finished
        ? 'Six pairs stitched in ' +
          state.moves +
          ' moves and ' +
          state.seconds +
          ' seconds. Your server result is ready to share from the class board.'
        : state.expired
          ? 'This round reached its limit. Start a new round when you like.'
          : (state.first !== null
              ? 'Choose the matching slip.'
              : shown.length === 2
                ? 'Two different slips. Try another pair.'
                : state.moves
                  ? 'The pair is stitched. Choose another slip.'
                  : 'Choose your first slip.') +
            ' Moves: ' +
            state.moves +
            '.';
      const tile = typeof input.tile === 'number' ? state.tiles[input.tile] : null;
      if (tile?.matched && tile.value !== null) {
        const slip = DISPATCH_SLIPS[tile.value];
        status.append(' ' + slip.reading + ' ' + slip.limit);
      }
      if (state.finished) onFinish?.();
    } catch (error) {
      if (!section.isConnected) return;
      status.textContent = (error as Error).message;
      start.hidden = false;
      start.textContent = 'Resume online stitching';
      if (error instanceof ServiceError && error.status === 403) grid.replaceChildren();
    } finally {
      busy = false;
    }
  }
  async function flip(tile: number) {
    if (
      busy ||
      !round ||
      round.finished ||
      round.expired ||
      round.first === tile ||
      round.tiles[tile].matched
    )
      return;
    if (Date.now() < ready) {
      status.textContent = 'Let the slip turn, then choose again.';
      return;
    }
    await play({ action: 'flip', id: round.id, turns: round.turns, tile });
  }
  return section;
}
