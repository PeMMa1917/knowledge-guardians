import { normalizeLeaderboardAlias, normalizeScoreValue } from '../shared/scoreValues.mjs';
// Only snapshots explicitly posted to the class belong in this store.
const activities = [
  'xp',
  'active-seconds',
  'quests',
  'npcs-met',
  'npcs-befriended',
  'map-discovery',
  'game:dive-depth',
  'game:forecast-brier',
  'game:stitch-moves',
  'game:stitch-seconds',
  ...'evidence certainty truth interpretation power justification explanation objectivity perspective culture values responsibility'
    .split(' ')
    .map((k) => 'concept:' + k),
  ...['HIS', 'NAT', 'HUM', 'ART', 'MAT'].map((k) => 'aok:' + k),
  ...['scope', 'perspectives', 'methods-and-tools', 'ethics'].map((k) => 'framework:' + k),
];
export const scoreActivities = new Set(activities);
const periods = new Set(['daily', 'weekly', 'monthly', 'ytd']);

function currentPeriod(period, through, now) {
  if (!periods.has(period) || !/^\d{4}-\d{2}-\d{2}$/.test(through)) return null;
  const end = new Date(through + 'T00:00:00Z');
  if (!Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== through) return null;
  // The existing game records calendar days on the player's device. The
  // earliest and latest inhabited time zones can legitimately use adjacent dates.
  const utcDay = Date.parse(new Date(now).toISOString().slice(0, 10) + 'T00:00:00Z');
  if (Math.abs(end.getTime() - utcDay) > 86400000) return null;
  if (period === 'weekly') end.setUTCDate(end.getUTCDate() - ((end.getUTCDay() + 6) % 7));
  if (period === 'monthly' || period === 'ytd') end.setUTCDate(1);
  if (period === 'ytd') end.setUTCMonth(0);
  return end.toISOString().slice(0, 10);
}

const approved = `EXISTS (SELECT 1 FROM memberships m JOIN classes c ON c.id=m.class
 WHERE m.student=? AND m.class=? AND c.teacher=? AND m.approved=1)`;
const teaching = 'EXISTS (SELECT 1 FROM classes WHERE id=? AND teacher=?)';

export async function classScores({ db, req, url, role, account, cls, body, reply, deny }) {
  const student = role === 'student';
  const teacher = student ? url.searchParams.get('teacher') : account;
  const allowed = student ? approved : teaching;
  const scope = student ? [account, cls, teacher] : [cls, teacher];
  if (
    !(await db
      .prepare('SELECT 1 AS ok WHERE ' + allowed)
      .bind(...scope)
      .first())
  )
    return deny();
  const write = req.method !== 'GET';
  if (write && (!student || !['PUT', 'DELETE'].includes(req.method))) return deny();
  const metric = url.searchParams.get('activity'),
    period = url.searchParams.get('period');
  const through = url.searchParams.get('day'),
    from = currentPeriod(period, through, Date.now());
  if (!scoreActivities.has(metric) || !periods.has(period)) throw 400;
  if (!from && req.method === 'PUT') throw 400;
  const slot = period + '/' + metric;
  const pointer = '$."' + slot + '"';
  const own = student
    ? await db
        .prepare('SELECT alias,revision,scores FROM class_scores WHERE student=? AND class=? AND teacher=?')
        .bind(...scope)
        .first()
    : null;
  const revision = own?.revision ?? 0;
  if (write) {
    const input = await body(req, 1024);
    if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0) throw 400;
    if (input.revision !== revision)
      return reply(409, {
        error: 'Your class board changed on another device. Refresh before posting again.',
      });
    const withdraw = req.method === 'DELETE';
    const alias = withdraw ? null : normalizeLeaderboardAlias(input.alias);
    const value = normalizeScoreValue(metric, input.value);
    if (!withdraw && (alias === null || value === null)) throw 400;
    const scores = withdraw ? {} : JSON.parse(own?.scores ?? '{}');
    if (!withdraw) scores[slot] = { from, through, value };
    const result = await db
      .prepare(
        `INSERT INTO class_scores(student,class,teacher,revision,alias,scores)
      SELECT ?,?,?,?,?,? WHERE ${approved}
      AND COALESCE((SELECT revision FROM class_scores WHERE student=? AND class=? AND teacher=?),0)=?
      ON CONFLICT(student,class,teacher) DO UPDATE SET revision=excluded.revision,alias=excluded.alias,scores=excluded.scores`,
      )
      .bind(...scope, revision + 1, alias, JSON.stringify(scores), ...scope, ...scope, revision)
      .run();
    if (!result.meta.changes)
      return reply(409, { error: 'Your class board changed. Refresh to see its current state.' });
    return reply(200, { revision: revision + 1 });
  }
  const ownership = student ? { own: { alias: own?.alias ?? null, revision } } : {};
  if (!from) return reply(200, { rows: [], clockMismatch: true, ...ownership });
  const { results } = await db
    .prepare(
      `SELECT s.alias, json_extract(s.scores,?||'.value') AS value,
      json_extract(s.scores,?||'.through') AS through
      FROM class_scores s JOIN memberships m ON m.student=s.student AND m.class=s.class AND m.approved=1
      JOIN classes c ON c.id=s.class AND c.teacher=s.teacher
      WHERE s.class=? AND s.teacher=? AND s.alias IS NOT NULL AND
      json_extract(s.scores,?||'.from')=? AND json_extract(s.scores,?||'.through')<=?
      AND ${allowed}`,
    )
    .bind(pointer, pointer, cls, teacher, pointer, from, pointer, through, ...scope)
    .all();
  return reply(200, { rows: results, ...ownership });
}
