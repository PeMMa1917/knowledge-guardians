import { boardNameKey, studentName } from '../shared/studentNames.mjs';

export const approved = `EXISTS (SELECT 1 FROM memberships m JOIN classes c ON c.id=m.class
  WHERE m.student=? AND m.class=? AND c.teacher=? AND m.approved=1)`;
export const teaching = 'EXISTS (SELECT 1 FROM classes WHERE id=? AND teacher=?)';

function replacementLogin(previous) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = studentName('guardian-' + crypto.randomUUID().slice(0, 13), 'login');
    if (candidate && candidate !== previous) return candidate;
  }
  return null;
}

export async function flagAlias(db, scope, value) {
  const sample = typeof value === 'string' ? Array.from(value).slice(0, 80).join('') : '(invalid nickname)';
  await db
    .prepare(
      `INSERT INTO class_scores(student,class,teacher,revision,flagged_alias)
    SELECT ?,?,?,0,? WHERE ${approved}
    ON CONFLICT(student,class,teacher) DO UPDATE SET flagged_alias=excluded.flagged_alias`,
    )
    .bind(...scope, sample, ...scope)
    .run();
}
export async function classNames({ db, req, role, account, cls, body, reply, deny }) {
  if (
    role !== 'teacher' ||
    !(await db
      .prepare('SELECT 1 WHERE ' + teaching)
      .bind(cls, account)
      .first())
  )
    return deny();
  if (req.method === 'GET') {
    const { results } = await db
      .prepare(
        `SELECT a.id,a.login,a.display,s.alias,s.name_rule AS rule,
      s.flagged_alias AS flagged,COALESCE(s.revision,0) AS revision
      FROM classes c JOIN memberships m ON m.class=c.id AND m.approved=1
      JOIN accounts a ON a.id=m.student AND a.role='student'
      LEFT JOIN class_scores s ON s.class=c.id AND s.teacher=c.teacher AND s.student=a.id
      WHERE c.id=? AND c.teacher=? ORDER BY a.display,a.id`,
      )
      .bind(cls, account)
      .all();
    return reply(
      200,
      results.map((row) => ({
        ...row,
        flags: [
          ...(!studentName(row.login, 'login') ? ['login'] : []),
          ...(!studentName(row.display, 'display') ? ['display'] : []),
          ...(row.flagged !== null || (row.alias && !studentName(row.alias)) ? ['alias'] : []),
        ],
      })),
    );
  }
  if (req.method !== 'PUT') return deny();
  const input = await body(req, 2048);
  if (typeof input?.student !== 'string') throw 400;
  const scope = [input.student, cls, account];
  if (
    !(await db
      .prepare('SELECT 1 WHERE ' + approved)
      .bind(...scope)
      .first())
  )
    return deny();
  const { field, value } = input;
  if (!['login', 'display', 'alias'].includes(field)) throw 400;
  const conflict = () => reply(409, { error: 'This entry has changed. Refresh the class list.' });
  if (field !== 'alias') {
    if (typeof input.previous !== 'string' || !['replace', 'remove'].includes(input.action)) throw 400;
    const next =
      input.action === 'remove'
        ? field === 'login'
          ? replacementLogin(input.previous)
          : 'Guardian'
        : studentName(value, field);
    if (!next && input.action === 'remove')
      return reply(503, { error: 'Could not generate a replacement username. Please try the reset again.' });
    if (!next) return reply(422, { error: 'Choose another school-appropriate name.' });
    const column = field === 'login' ? 'login' : 'display';
    const result = await db
      .prepare(
        `UPDATE OR IGNORE accounts SET ${column}=? WHERE id=? AND role='student'
      AND ${column}=? AND ${approved}`,
      )
      .bind(next, input.student, input.previous, ...scope)
      .run();
    if (!result.meta.changes)
      return reply(409, {
        error: 'The name changed or the username is already in use. Refresh and try another name.',
      });
    return reply(200, { value: next });
  }
  if (
    !Number.isSafeInteger(input.revision) ||
    input.revision < 0 ||
    !['replace', 'remove', 'release', 'dismiss'].includes(input.action)
  )
    throw 400;
  if (input.action === 'dismiss') {
    if (typeof input.flagged !== 'string') throw 400;
    const cleared = await db
      .prepare(
        `UPDATE class_scores SET flagged_alias=NULL WHERE student=? AND class=? AND teacher=?
      AND revision=? AND flagged_alias=? AND ${approved}`,
      )
      .bind(...scope, input.revision, input.flagged, ...scope)
      .run();
    return cleared.meta.changes ? reply(200, {}) : conflict();
  }
  const alias = input.action === 'replace' ? studentName(value) : null;
  if (input.action === 'replace' && !alias)
    return reply(422, { error: 'Choose another school-appropriate nickname.' });
  const rule = input.action === 'remove' ? '' : alias;
  // The signed-in teacher may publish a replacement only for an already visible nickname.
  const updates = {
    release: 'name_rule=NULL',
    remove: "name_rule='',alias=NULL,alias_key=NULL,scores='{}'",
    replace: `name_rule=excluded.name_rule,alias_key=?,
      alias=CASE WHEN alias IS NOT NULL THEN excluded.name_rule ELSE NULL END
      WHERE class_scores.scores='{}' OR NOT EXISTS (
        SELECT 1 FROM class_scores other WHERE other.class=excluded.class AND other.teacher=excluded.teacher
        AND other.student<>excluded.student AND other.scores<>'{}' AND other.alias IS NOT NULL AND other.alias_key=?
      )`,
  };
  const key = alias && boardNameKey(alias);
  const result = await db
    .prepare(
      `INSERT INTO class_scores(student,class,teacher,revision,name_rule)
    SELECT ?,?,?,?,? WHERE ${approved} AND
      COALESCE((SELECT revision FROM class_scores WHERE student=? AND class=? AND teacher=?),0)=?
    ON CONFLICT(student,class,teacher) DO UPDATE SET revision=excluded.revision,
      flagged_alias=NULL,${updates[input.action]}`,
    )
    .bind(
      ...scope,
      input.revision + 1,
      rule,
      ...scope,
      ...scope,
      input.revision,
      ...(alias ? [key, key] : []),
    )
    .run();
  return result.meta.changes
    ? reply(200, {})
    : reply(409, {
        error:
          'The entry changed or another ranked nickname looks the same. Refresh and choose a different nickname.',
      });
}
