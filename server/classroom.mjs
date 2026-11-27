const enc = new TextEncoder();
const hex = (buf) => Array.from(new Uint8Array(buf), (n) => n.toString(16).padStart(2, '0')).join('');
export async function verifier(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: enc.encode(salt) },
      key,
      256,
    ),
  );
}
const digest = async (value) => hex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
const token = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const reply = (status, data, headers = {}) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store, private', Vary: 'Cookie', ...headers },
  });
const deny = () => reply(403, { error: 'This class is unavailable for this account.' });
function cookie(role, value, age) {
  return `kg_${role}=${value}; Path=/api/classroom; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
}
async function body(req, limit) {
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) throw 415;
  if (Number(req.headers.get('content-length')) > limit) throw 413;
  const reader = req.body?.getReader();
  if (!reader) throw 400;
  let n = 0,
    text = '';
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > limit) {
      await reader.cancel();
      throw 413;
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    return JSON.parse(text + decoder.decode());
  } catch {
    throw 400;
  }
}
async function underLimit(db, bucket, now, max) {
  const row = await db
    .prepare(
      `INSERT INTO login_limits VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET
    attempts=CASE WHEN until_time<=? THEN 1 ELSE attempts+1 END, until_time=CASE WHEN until_time<=? THEN excluded.until_time ELSE until_time END RETURNING attempts`,
    )
    .bind(bucket, now + 600, now, now)
    .first();
  return row.attempts <= max;
}
const membership = `SELECT a.id, a.display, c.id AS classId, c.title AS className, t.id AS teacherId, t.display AS teacherName
  FROM accounts a JOIN memberships m ON m.student=a.id AND m.approved=1 JOIN classes c ON c.id=m.class
  JOIN accounts t ON t.id=c.teacher AND t.role='teacher' WHERE a.role='student' AND a.id=?`;
function cleanWriting(rows) {
  if (!Array.isArray(rows) || rows.length > 20000) throw 400;
  return rows.map((row) => {
    if (
      !row ||
      !['note', 'question', 'reflection', 'draft-note', 'draft-question', 'draft-reflection'].includes(
        row.kind,
      ) ||
      typeof row.text !== 'string' ||
      typeof row.title !== 'string' ||
      row.title.length > 500 ||
      row.text.length > 64000
    )
      throw 400;
    return { kind: row.kind, title: row.title, text: row.text };
  });
}
async function route(req, db, url) {
  const [, , , role, action] = url.pathname.split('/');
  if (!['student', 'teacher'].includes(role)) return deny();
  const read = req.method === 'GET',
    now = Math.floor(Date.now() / 1000);
  if (!read && req.headers.get('Origin') !== url.origin) return deny();
  if (req.method === 'POST' && action === 'login') {
    const b = await body(req, 2048);
    if (
      typeof b?.login !== 'string' ||
      typeof b?.password !== 'string' ||
      !b.login.trim() ||
      b.login.length > 200 ||
      b.password.length > 256
    )
      throw 400;
    const name = b.login.trim().toLowerCase();
    const ip = req.headers.get('CF-Connecting-IP') || 'preview';
    await db.prepare('DELETE FROM login_limits WHERE until_time<=?').bind(now).run();
    if (
      !(await underLimit(db, await digest('ip:' + ip), now, 250)) ||
      !(await underLimit(db, await digest(role + ':' + name), now, 20))
    )
      return reply(429, { error: 'Please wait before signing in again.' });
    const user = await db.prepare('SELECT * FROM accounts WHERE role=? AND login=?').bind(role, name).first();
    const candidate = await verifier(b.password, user?.salt || 'unknown-classroom-account');
    if (!user || user.verifier !== candidate) return reply(401, { error: 'Check your sign-in details.' });
    let identity = { id: user.id, display: user.display };
    if (role === 'student') {
      identity = await db.prepare(membership).bind(user.id).first();
      if (!identity) return deny();
    }
    const key = token();
    const old = (req.headers.get('Cookie') || '').match(
      new RegExp('(?:^|; *)kg_' + role + '=([a-f0-9]{64})(?:;|$)'),
    )?.[1];
    if (old)
      await db
        .prepare('DELETE FROM sessions WHERE digest=?')
        .bind(await digest(old))
        .run();
    await db.prepare('DELETE FROM sessions WHERE expires<=?').bind(now).run();
    await db
      .prepare('INSERT INTO sessions VALUES (?,?,?)')
      .bind(await digest(key), user.id, now + 28800)
      .run();
    return reply(200, identity, { 'Set-Cookie': cookie(role, key, 28800) });
  }
  const key = (req.headers.get('Cookie') || '').match(
    new RegExp('(?:^|; *)kg_' + role + '=([a-f0-9]{64})(?:;|$)'),
  )?.[1];
  if (!key) return reply(401, { error: 'Sign in to your class.' });
  const hash = await digest(key);
  const user = await db
    .prepare(
      'SELECT a.id FROM sessions s JOIN accounts a ON s.account=a.id WHERE s.digest=? AND s.expires>? AND a.role=?',
    )
    .bind(hash, now, role)
    .first();
  if (!user) return reply(401, { error: 'Sign in again. Your work is saved on this device.' });
  if (action === 'logout' && req.method === 'POST') {
    await db.prepare('DELETE FROM sessions WHERE digest=?').bind(hash).run();
    return reply(200, {}, { 'Set-Cookie': cookie(role, '', 0) });
  }
  if (user.id !== url.searchParams.get('account')) return deny();
  const cls = url.searchParams.get('class');
  if (role === 'teacher' && read && action === 'classes') {
    const result = await db
      .prepare('SELECT id,title FROM classes WHERE teacher=? ORDER BY title')
      .bind(user.id)
      .all();
    return reply(200, result.results);
  }
  if (role === 'teacher' && read && action === 'writing') {
    if (!(await db.prepare('SELECT id FROM classes WHERE teacher=? AND id=?').bind(user.id, cls).first()))
      return deny();
    const rows = await db
      .prepare(
        `SELECT a.display, v.writing, v.updated FROM classes c JOIN memberships m ON m.class=c.id AND m.approved=1
      JOIN accounts a ON a.id=m.student LEFT JOIN versions v ON v.student=a.id AND v.class=c.id AND v.teacher=c.teacher
      AND v.revision=(SELECT MAX(revision) FROM versions WHERE student=a.id AND class=c.id AND teacher=c.teacher)
      WHERE c.teacher=? AND c.id=? ORDER BY a.display`,
      )
      .bind(user.id, cls)
      .all();
    return reply(
      200,
      rows.results.map((r) => ({
        student: r.display,
        updated: r.updated,
        entries: JSON.parse(r.writing || '[]'),
      })),
    );
  }
  if (role !== 'student' || action !== 'save') return deny();
  const pupil = await db.prepare(membership).bind(user.id).first();
  const teacher = url.searchParams.get('teacher');
  if (!pupil || pupil.classId !== cls || pupil.teacherId !== teacher) return deny();
  const args = [user.id, cls, teacher];
  const latest = () =>
    db
      .prepare(
        'SELECT revision,package,updated FROM versions WHERE student=? AND class=? AND teacher=? ORDER BY revision DESC LIMIT 1',
      )
      .bind(...args)
      .first();
  if (read) return reply(200, (await latest()) || { revision: 0, package: null, updated: null });
  if (req.method !== 'PUT') return deny();
  const data = await body(req, 1700000);
  if (
    !data ||
    !Number.isSafeInteger(data.revision) ||
    data.revision < 0 ||
    typeof data.package !== 'string' ||
    !data.package.length
  )
    throw 400;
  const writing = JSON.stringify(cleanWriting(data.writing));
  const updated = new Date().toISOString();
  const result = await db
    .prepare(
      `INSERT INTO versions SELECT ?,?,?,?, ?,?,?
    WHERE EXISTS(SELECT 1 FROM memberships m JOIN classes c ON c.id=m.class WHERE m.student=? AND m.class=? AND c.teacher=? AND m.approved=1)
    AND COALESCE((SELECT MAX(revision) FROM versions WHERE student=? AND class=? AND teacher=?),0)=?`,
    )
    .bind(...args, data.revision + 1, data.package, writing, updated, ...args, ...args, data.revision)
    .run();
  if (!result.meta.changes) {
    const row = await latest();
    if (row && row.package === data.package && row.revision === data.revision + 1)
      return reply(200, { revision: row.revision });
    return reply(409, { error: 'Another device saved a different version.' });
  }
  return reply(200, { revision: data.revision + 1 });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/classroom/')) return env.ASSETS.fetch(request);
    try {
      return await route(request, env.DB, url);
    } catch (error) {
      const status = typeof error === 'number' ? error : 500;
      return reply(status, {
        error:
          status === 413
            ? 'This save is too large to sync. Your local copy is available.'
            : status >= 500
              ? 'The class service is temporarily unavailable.'
              : 'The class service could not accept this request.',
      });
    }
  },
};
