import { RANKED_STITCH as rules } from '../shared/rankedStitch.mjs';
import { approved } from './classNames.mjs';

const tileCount = rules.pairs * 2;
const complete = (1 << tileCount) - 1;
const maxAge = rules.maxSeconds * 1000;
const flipPause = 350;
const makeDeck = () => {
  const deck = Array.from({ length: tileCount }, (_, i) => i % rules.pairs);
  const random = crypto.getRandomValues(new Uint32Array(tileCount));
  for (let i = tileCount - 1; i > 0; i--) {
    const j = Math.floor((random[i] / 2 ** 32) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
function publicRound(row, now) {
  if (!row) return null;
  const deck = JSON.parse(row.deck);
  const expired = !row.finished && (now - row.started >= maxAge || row.turns >= rules.maxMoves * 2);
  return {
    id: row.id,
    turns: row.turns,
    moves: Math.floor(row.turns / 2),
    expired,
    finished: row.finished !== null,
    seconds: row.finished === null ? null : Math.max(1, Math.ceil((row.finished - row.started) / 1000)),
    waitMs: row.turns ? Math.max(0, row.updated + flipPause - now) : 0,
    tiles: deck.map((value, i) => {
      const matched = !!(row.matched & (1 << i));
      return { value: matched || i === row.first_tile || i === row.second_tile ? value : null, matched };
    }),
    first: row.turns % 2 ? row.first_tile : null,
  };
}
export async function stitchRound({ db, req, role, account, cls, url, reply, deny, body }) {
  if (role !== 'student') return deny();
  const scope = [account, cls, url.searchParams.get('teacher')];
  if (
    !(await db
      .prepare('SELECT 1 WHERE ' + approved)
      .bind(...scope)
      .first())
  )
    return deny();
  const read = () =>
    db
      .prepare(`SELECT * FROM stitch_rounds WHERE student=? AND class=? AND teacher=? AND ${approved}`)
      .bind(...scope, ...scope)
      .first();
  const row = await read(),
    now = Date.now(),
    state = publicRound(row, now);
  if (req.method === 'GET') return reply(200, { round: state });
  if (req.method !== 'POST') return deny();
  const move = await body(req, 512);
  const conflict = () => reply(409, { error: 'This round has changed. Resume it to see the current tiles.' });
  if (move?.action === 'start' && Object.keys(move).length === 1) {
    if (state && !state.finished && !state.expired) return reply(200, { round: state });
    const result = await db
      .prepare(
        `INSERT INTO stitch_rounds(student,class,teacher,id,deck,started,updated)
      SELECT ?,?,?,?,?,?,? WHERE ${approved} ON CONFLICT(student,class,teacher) DO UPDATE SET
      id=excluded.id,deck=excluded.deck,started=excluded.started,updated=excluded.updated,
      turns=0,matched=0,first_tile=NULL,second_tile=NULL,finished=NULL
      WHERE stitch_rounds.finished IS NOT NULL OR stitch_rounds.started<=? OR stitch_rounds.turns>=?`,
      )
      .bind(
        ...scope,
        crypto.randomUUID(),
        JSON.stringify(makeDeck()),
        now,
        now,
        ...scope,
        now - maxAge,
        rules.maxMoves * 2,
      )
      .run();
    return result.meta.changes ? reply(200, { round: publicRound(await read(), Date.now()) }) : conflict();
  }
  if (
    move?.action !== 'flip' ||
    Object.keys(move).length !== 4 ||
    typeof move.id !== 'string' ||
    !Number.isSafeInteger(move.turns) ||
    !Number.isInteger(move.tile) ||
    move.tile < 0 ||
    move.tile >= tileCount
  )
    throw 400;
  if (!row || row.id !== move.id || row.turns !== move.turns || state.finished || state.expired)
    return conflict();
  const tile = move.tile,
    first = state.first;
  if (state.tiles[tile].matched || tile === first) throw 422;
  if (state.waitMs > 0) return reply(429, { error: 'Give the tile a moment to turn, then try again.' });
  const deck = JSON.parse(row.deck);
  const matched =
    first !== null && deck[first] === deck[tile] ? row.matched | (1 << first) | (1 << tile) : row.matched;
  const result = await db
    .prepare(
      `UPDATE stitch_rounds SET turns=turns+1,first_tile=?,second_tile=?,matched=?,updated=?,finished=?
    WHERE student=? AND class=? AND teacher=? AND id=? AND turns=? AND finished IS NULL AND ${approved}`,
    )
    .bind(
      first ?? tile,
      first === null ? null : tile,
      matched,
      now,
      matched === complete ? now : null,
      ...scope,
      row.id,
      row.turns,
      ...scope,
    )
    .run();
  return result.meta.changes ? reply(200, { round: publicRound(await read(), Date.now()) }) : conflict();
}
