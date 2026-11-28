import { boardNameKey, studentName } from '../shared/studentNames.mjs';
import { rankedActivities, RANKED_STITCH } from '../shared/rankedStitch.mjs';
import { approved, teaching, flagAlias } from './classNames.mjs';

export const scoreActivities = new Set(rankedActivities);
const metrics = {
  'game:stitch-moves': { column: 'moves', min: RANKED_STITCH.pairs, max: RANKED_STITCH.maxMoves },
  'game:stitch-seconds': { column: 'seconds', min: 1, max: RANKED_STITCH.maxSeconds },
};
function range(period) {
  const today = new Date();
  const through = today.toISOString().slice(0, 10);
  if (period === 'weekly') today.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  if (period === 'monthly' || period === 'ytd') today.setUTCDate(1);
  if (period === 'ytd') today.setUTCMonth(0);
  return { from: today.toISOString().slice(0, 10), through };
}
export async function classScores({ db, req, url, role, account, cls, body, reply, deny }) {
  const student = role === 'student',
    teacher = student ? url.searchParams.get('teacher') : account;
  const scope = student ? [account, cls, teacher] : [cls, teacher],
    allowed = student ? approved : teaching;
  if (
    !(await db
      .prepare('SELECT 1 WHERE ' + allowed)
      .bind(...scope)
      .first())
  )
    return deny();
  const metric = url.searchParams.get('activity'),
    period = url.searchParams.get('period');
  if (!scoreActivities.has(metric) || !['daily', 'weekly', 'monthly', 'ytd'].includes(period)) throw 400;
  const { from, through } = range(period),
    { column, min, max } = metrics[metric],
    pointer = '$."' + period + '/' + metric + '"';
  const own = student
    ? await db
        .prepare(
          `SELECT revision,alias,name_rule FROM class_scores WHERE student=? AND class=? AND teacher=? AND ${approved}`,
        )
        .bind(...scope, ...scope)
        .first()
    : null;
  const revision = own?.revision ?? 0;
  const conflict = () =>
    reply(409, {
      error: 'The board changed or a classmate uses a similar nickname. Refresh and check the nickname.',
    });
  // The column comes from the server allowlist. The only source of values is the database trigger on a finished game.
  const earned = student
    ? await db
        .prepare(
          `SELECT ${column} AS value,day FROM stitch_bests
    WHERE student=? AND class=? AND teacher=? AND day BETWEEN ? AND ? AND ${column} BETWEEN ? AND ? AND ${approved}
    ORDER BY ${column},day LIMIT 1`,
        )
        .bind(...scope, from, through, min, max, ...scope)
        .first()
    : null;
  if (req.method === 'GET') {
    const { results } = await db
      .prepare(
        `SELECT s.alias,json_extract(s.scores,?) AS score FROM class_scores s
      JOIN memberships m ON m.student=s.student AND m.class=s.class AND m.approved=1
      JOIN classes c ON c.id=s.class AND c.teacher=s.teacher
      WHERE s.class=? AND s.teacher=? AND s.alias IS NOT NULL AND ${allowed}`,
      )
      .bind(pointer, cls, teacher, ...scope)
      .all();
    const rows = [];
    for (const row of results) {
      const e = JSON.parse(row.score),
        alias = studentName(row.alias);
      if (
        alias &&
        e?.source === 'stitch-round' &&
        e.from === from &&
        e.through <= through &&
        e.through >= from &&
        Number.isInteger(e.value) &&
        e.value >= min &&
        e.value <= max
      )
        rows.push({ alias, value: e.value, through: e.through });
    }
    return reply(200, {
      rows,
      ...(student
        ? {
            own: {
              revision,
              rule: own?.name_rule ?? null,
              alias: studentName(own?.alias),
              canWithdraw: !!own?.alias,
              value: earned?.value ?? null,
            },
          }
        : {}),
    });
  }
  if (!student || !['PUT', 'DELETE'].includes(req.method)) return deny();
  const input = await body(req, 768),
    withdraw = req.method === 'DELETE';
  if (
    !Number.isSafeInteger(input?.revision) ||
    input.revision < 0 ||
    Object.keys(input).some((key) => key !== 'revision' && (withdraw || key !== 'alias'))
  )
    throw 400;
  if (input.revision !== revision) return conflict();
  const alias = withdraw ? null : studentName(input.alias);
  if (!withdraw) {
    if (!alias) {
      await flagAlias(db, scope, input.alias);
      return reply(422, {
        error: 'Choose another school-appropriate nickname. Your assigned teacher can review this name.',
      });
    }
    if (own?.name_rule != null && own.name_rule !== alias)
      return reply(403, { error: 'Your teacher manages your class nickname.' });
    if (!earned) return reply(422, { error: 'Finish an online stitching round to share a result.' });
  }
  // The same scoped write checks both initial publication and a change to an existing row
  // from a conflicting nickname, including when two classmates publish at the same time.
  const key = alias && boardNameKey(alias);
  const value = withdraw
    ? null
    : JSON.stringify({ from, through: earned.day, value: earned.value, source: 'stitch-round' });
  const result = await db
    .prepare(
      `INSERT INTO class_scores(student,class,teacher,revision,alias,alias_key,scores)
    SELECT ?,?,?,?,?,?,CASE WHEN ? IS NULL THEN '{}' ELSE json_set('{}',?,json(?)) END
    WHERE ${approved} AND COALESCE((SELECT revision FROM class_scores WHERE student=? AND class=? AND teacher=?),0)=?
    AND (? IS NULL OR EXISTS(SELECT 1 FROM stitch_bests WHERE student=? AND class=? AND teacher=? AND day=? AND ${column}=?))
    AND NOT EXISTS(SELECT 1 FROM class_scores WHERE class=? AND teacher=? AND alias_key=? AND student<>? AND alias IS NOT NULL AND scores<>'{}')
    ON CONFLICT(student,class,teacher) DO UPDATE SET revision=excluded.revision,alias=excluded.alias,alias_key=excluded.alias_key,
      scores=CASE WHEN excluded.alias IS NULL THEN '{}' ELSE json_set(class_scores.scores,?,json(?)) END`,
    )
    .bind(
      ...scope,
      revision + 1,
      alias,
      key,
      alias,
      pointer,
      value,
      ...scope,
      ...scope,
      revision,
      alias,
      ...scope,
      earned?.day ?? null,
      earned?.value ?? null,
      cls,
      teacher,
      key,
      account,
      pointer,
      value,
    )
    .run();
  return result.meta.changes ? reply(200, { revision: revision + 1 }) : conflict();
}
