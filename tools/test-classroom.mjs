import { DatabaseSync } from 'node:sqlite';
import { provisionStudent } from '../server/provisionStudent.mjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import worker from '../server/classroom.mjs';
import { scoreActivities } from '../server/classScores.mjs';
import { fixture } from './classroom-preview.mjs';

async function harness() {
  const { DB: local, sql, password } = await fixture();
  if (!process.env.KG_MINIFLARE_PACKAGE)
    return {
      dispatch: (req) => worker.fetch(req, { DB: local }),
      DB: local,
      password,
      close: async () => sql.close(),
    };
  const { Miniflare } = createRequire(process.env.KG_MINIFLARE_PACKAGE)('miniflare');
  const edge = new Miniflare({
    modules: true,
    scriptPath: fileURLToPath(new URL('../server/classroom.mjs', import.meta.url)),
    modulesRoot: fileURLToPath(new URL('../', import.meta.url)),
    modulesRules: [{ type: 'ESModule', include: ['**/*.mjs'] }],
    compatibilityDate: '2026-01-01',
    d1Databases: ['DB'],
    cf: false,
  });
  try {
    const DB = await edge.getD1Database('DB');
    const migrations = new URL('../server/migrations/', import.meta.url);
    for (const name of (await readdir(migrations)).filter((n) => n.endsWith('.sql')).sort()) {
      const ddl = await readFile(new URL(name, migrations), 'utf8');
      for (const stmt of ddl
        .replace(/^--.*$/gm, '')
        .trim()
        .split(/;[ \t]*\n+(?=(?:CREATE|ALTER|UPDATE|PRAGMA)\b)/))
        await DB.prepare(stmt).run();
    }
    for (const table of ['accounts', 'classes', 'memberships']) {
      for (const row of sql.prepare('SELECT * FROM ' + table).all()) {
        const values = Object.values(row);
        await DB.prepare('INSERT INTO ' + table + ' VALUES (' + values.map(() => '?').join(',') + ')')
          .bind(...values)
          .run();
      }
    }
    return {
      DB,
      password,
      dispatch: (req) =>
        edge.dispatchFetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
          duplex: 'half',
          redirect: 'manual',
        }),
      close: () => edge.dispose(),
    };
  } catch (error) {
    await edge.dispose();
    throw error;
  } finally {
    sql.close();
  }
}

test('fictional classroom recovery, revision history, current membership and teacher scope', async () => {
  const { DB, dispatch, password, close } = await harness();
  try {
    const origin = 'https://school.example';
    const call = (path, { cookie = '', method = 'GET', value } = {}) =>
      dispatch(
        new Request(origin + '/api/classroom/' + path, {
          method,
          headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' },
          body: value === undefined ? undefined : JSON.stringify(value),
        }),
      );
    async function sign(role, login) {
      const response = await call(role + '/login', { method: 'POST', value: { login, password } });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
      return response.headers.get('set-cookie').split(';')[0];
    }
    const a = await sign('student', 'ash-moth'),
      b = await sign('student', 'moss-wren'),
      ta = await sign('teacher', 'north@example.invalid'),
      tb = await sign('teacher', 'south@example.invalid');
    const save = 'student/save?account=a&class=north&teacher=ta';
    const dashboard = 'teacher/writing?account=ta&class=north';
    const writing = [
      { kind: 'note', title: '', text: 'The bell rang twice.' },
      { kind: 'draft-question', title: '', text: 'Who heard the first bell?' },
    ];
    const put = (revision, content = 'sealed student copy') =>
      call(save, { cookie: a, method: 'PUT', value: { revision, package: content, writing } });
    assert.equal((await put(0)).status, 200);
    assert.equal((await put(0)).status, 200); // Lost acknowledgement and retry.
    assert.equal((await put(0, 'another version')).status, 409);
    const deviceB = await sign('student', 'ash-moth');
    assert.equal((await (await call(save, { cookie: deviceB })).json()).package, 'sealed student copy');
    const seen = await (await call(dashboard, { cookie: ta })).json();
    assert.deepEqual(seen[0].entries, writing);
    assert.ok(!('package' in seen[0]));
    assert.equal((await call(dashboard, { cookie: tb })).status, 403);
    assert.equal((await call('teacher/writing?account=tb&class=north', { cookie: tb })).status, 403);
    assert.deepEqual(
      (await (await call('teacher/writing?account=tb&class=south', { cookie: tb })).json())[0].entries,
      [],
    );
    assert.equal((await call(save, { cookie: b })).status, 403);
    assert.equal((await call(dashboard, { cookie: a })).status, 401);
    assert.equal((await call(save, { cookie: ta })).status, 401);
    assert.equal((await call(dashboard)).status, 401);
    assert.equal(
      (await call('student/login', { method: 'POST', value: { login: 'pending-rook', password } })).status,
      403,
    );
    for (let i = 1; i < 8; i++) assert.equal((await put(i, 'revision-' + i)).status, 200);
    assert.equal((await DB.prepare('SELECT count(*) AS n FROM versions').bind().first()).n, 5);
    await DB.prepare("UPDATE memberships SET approved=0 WHERE student='a'").bind().run();
    assert.equal((await call(save, { cookie: a })).status, 403);
    assert.equal((await put(8)).status, 403);
    assert.deepEqual(await (await call(dashboard, { cookie: ta })).json(), []);
    assert.equal((await call('teacher/logout', { cookie: ta, method: 'POST' })).status, 200);
    assert.equal((await call(dashboard, { cookie: ta })).status, 401);
  } finally {
    await close();
  }
});

test('fictional class ranks use server-played rounds, scoped nicknames and explicit publication', async () => {
  const { DB, dispatch, password, close } = await harness();
  const origin = 'https://school.example',
    day = new Date().toISOString().slice(0, 10);
  async function call(path, cookie = '', method = 'GET', value) {
    const response = await dispatch(
      new Request(origin + '/api/classroom/' + path, {
        method,
        headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' },
        body: value === undefined ? undefined : JSON.stringify(value),
      }),
    );
    return {
      status: response.status,
      data: await response.json(),
      cookie: response.headers.get('set-cookie')?.split(';')[0],
    };
  }
  async function sign(role, login) {
    const { status, cookie } = await call(role + '/login', '', 'POST', { login, password });
    assert.equal(status, 200);
    return cookie;
  }
  const board = (role, account, cls, teacher, activity = 'game:stitch-moves', period = 'daily', date = day) =>
    role + '/scores?' + new URLSearchParams({ account, class: cls, teacher, activity, period, day: date });
  try {
    await DB.prepare("UPDATE memberships SET approved=1 WHERE student='p'").bind().run();
    const [ash, rook, moss, north, south] = await Promise.all([
      sign('student', 'ash-moth'),
      sign('student', 'pending-rook'),
      sign('student', 'moss-wren'),
      sign('teacher', 'north@example.invalid'),
      sign('teacher', 'south@example.invalid'),
    ]);
    const own = board('student', 'a', 'north', 'ta'),
      peer = board('student', 'p', 'north', 'ta'),
      watched = board('teacher', 'ta', 'north', 'ta');
    const send = (alias, revision, path = own) => call(path, ash, 'PUT', { alias, revision });
    const names = 'teacher/names?account=ta&class=north';
    const manage = (change) => call(names, north, 'PUT', { student: 'a', ...change });
    const stitch = 'student/stitch?account=a&class=north&teacher=ta';
    const action = (input) => call(stitch, ash, 'POST', input);
    assert.deepEqual([...scoreActivities], ['game:stitch-moves', 'game:stitch-seconds']);
    assert.equal((await call(board('student', 'a', 'north', 'ta', 'xp'), ash)).status, 400);
    assert.equal((await call(own, ash, 'PUT', { alias: 'River Finch', revision: 0, value: 6 })).status, 400);
    assert.equal((await call(watched, north, 'POST', { decision: 'verify', observed: 6 })).status, 403);
    assert.equal((await send('River Finch', 0)).status, 422);
    assert.equal((await call(stitch, moss)).status, 403);
    assert.equal((await call('teacher/names?account=tb&class=north', south)).status, 403);
    assert.equal(
      (await manage({ student: 'b', field: 'display', action: 'remove', previous: 'Moss Wren' })).status,
      403,
    );
    assert.equal((await send('ѕh1thead', 0)).status, 422);
    let person = (await call(names, north)).data.find((row) => row.id === 'a');
    assert.deepEqual(person.flags, ['alias']);
    assert.equal(person.flagged, 'ѕh1thead');
    assert.equal(
      (await manage({ field: 'alias', action: 'dismiss', flagged: 'earlier', revision: 0 })).status,
      409,
    );
    assert.equal(
      (await manage({ field: 'alias', action: 'dismiss', flagged: 'ѕh1thead', revision: 0 })).status,
      200,
    );
    assert.equal((await action({ action: 'start', score: 6 })).status, 400);
    const start = await action({ action: 'start' });
    assert.equal(start.status, 200);
    let round = start.data.round;
    assert.ok(round.tiles.every((tile) => tile.value === null));
    assert.equal('deck' in round, false);
    assert.equal((await action({ action: 'start' })).data.round.id, round.id);
    // A known layout in the fictional database makes the legal sequence reproducible.
    await DB.prepare("UPDATE stitch_rounds SET deck='[0,0,1,1,2,2,3,3,4,4,5,5]' WHERE student='a'")
      .bind()
      .run();
    const flip = (tile, turns = round.turns) => action({ action: 'flip', id: round.id, turns, tile });
    assert.equal((await flip(12)).status, 400);
    const otherDevice = await sign('student', 'ash-moth');
    assert.equal((await call(stitch, otherDevice)).data.round.id, round.id);
    assert.equal((await call('student/stitch?account=p&class=north&teacher=ta', rook)).data.round, null);

    for (const tile of [0, 2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      // Advance the fixture's last-flip time without supplying any clock or score to the service.
      await DB.prepare("UPDATE stitch_rounds SET updated=updated-1000 WHERE student='a'").bind().run();
      const before = round.turns;
      const responses =
        before === 0
          ? await Promise.all([
              flip(tile),
              call(stitch, otherDevice, 'POST', { action: 'flip', id: round.id, turns: before, tile }),
            ])
          : [await flip(tile)];
      if (before === 0) assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
      const turn = responses.find((r) => r.status === 200);
      assert.ok(turn);
      assert.equal(turn.status, 200);
      round = turn.data.round;
      assert.equal((await flip(tile, before)).status, 409);
      if (round.turns === 1) {
        assert.equal((await flip(tile)).status, 422);
        assert.equal(round.tiles.filter((t) => t.value !== null).length, 1);
        assert.equal((await call(stitch, ash)).data.round.first, tile);
        const prior = await DB.prepare("SELECT updated FROM stitch_rounds WHERE student='a'").bind().first();
        await DB.prepare("UPDATE stitch_rounds SET updated=? WHERE student='a'")
          .bind(prior.updated + 60000)
          .run();
        assert.equal((await flip(2)).status, 429);
        await DB.prepare("UPDATE stitch_rounds SET updated=? WHERE student='a'").bind(prior.updated).run();
      }
    }
    assert.ok(round.finished);
    assert.equal(round.moves, 7);
    assert.ok(round.seconds >= 1);
    assert.equal((await flip(0)).status, 409);
    assert.equal((await call(own, ash)).data.own.value, 7);
    assert.deepEqual((await call(peer, rook)).data.rows, []);
    let revision = 0;
    for (const activity of scoreActivities)
      for (const period of ['daily', 'weekly', 'monthly', 'ytd']) {
        const path = board('student', 'a', 'north', 'ta', activity, period);
        assert.equal((await send('River Finch', revision++, path)).status, 200, activity);
        const rows = (await call(board('student', 'p', 'north', 'ta', activity, period), rook)).data.rows;
        assert.deepEqual(rows, [
          { alias: 'River Finch', through: day, value: activity.endsWith('moves') ? 7 : round.seconds },
        ]);
      }
    assert.equal((await send('River Finch', 0)).status, 409);
    assert.equal(
      (await manage({ field: 'alias', action: 'replace', value: 'Север', revision: revision++ })).status,
      200,
    );
    assert.equal((await send('Elsewhere', revision)).status, 403);
    assert.equal((await call(peer, rook)).data.rows[0].alias, 'Север');
    // A second fictional student's server record cannot rank under a lookalike of that nickname.
    await DB.prepare("INSERT INTO stitch_bests VALUES ('p','north','ta',?,8,30)").bind(day).run();
    assert.equal((await call(peer, rook, 'PUT', { revision: 0, alias: 'Cевер' })).status, 409);
    assert.equal((await call(peer, rook, 'PUT', { revision: 0, alias: 'Birch Bat' })).status, 200);
    assert.equal(
      (await manage({ student: 'p', field: 'alias', action: 'replace', revision: 1, value: 'Cевер' })).status,
      409,
    );
    assert.equal((await call(peer, rook, 'DELETE', { revision: 1 })).status, 200);
    assert.equal((await manage({ field: 'alias', action: 'remove', revision: revision++ })).status, 200);
    assert.deepEqual((await call(peer, rook)).data.rows, []);
    assert.equal((await send('Север', revision)).status, 403);
    assert.equal((await manage({ field: 'alias', action: 'release', revision: revision++ })).status, 200);
    assert.equal((await send('River Finch', revision++)).status, 200);
    assert.equal((await call(own, ash, 'DELETE', { revision: revision++ })).status, 200);
    assert.deepEqual((await call(peer, rook)).data.rows, []);
    assert.equal(
      (await manage({ field: 'login', action: 'replace', value: 'Moss-Wren', previous: 'ash-moth' })).status,
      409,
    );
    assert.equal(
      (await manage({ field: 'login', action: 'replace', value: 'ѕh1thead', previous: 'ash-moth' })).status,
      422,
    );
    assert.equal(
      (await manage({ field: 'login', action: 'replace', value: 'Сокол', previous: 'ash-moth' })).status,
      200,
    );
    await sign('student', 'СОКОЛ');
    const reset = await manage({ field: 'login', action: 'remove', previous: 'сокол' });
    await sign('student', reset.data.value);
    assert.equal((await call('student/login', '', 'POST', { password, login: 'сокол' })).status, 401);
    assert.equal(
      (await manage({ field: 'display', action: 'replace', previous: 'Ash Moth', value: 'Лена' })).status,
      200,
    );
    assert.equal(
      (await call('teacher/writing?account=ta&class=north', north)).data.some((r) => r.student === 'Лена'),
      true,
    );
    assert.equal((await manage({ field: 'display', action: 'remove', previous: 'Лена' })).status, 200);
    await action({ action: 'start' });
    await DB.prepare(
      "UPDATE stitch_rounds SET turns=239,first_tile=0,deck='[0,0,1,1,2,2,3,3,4,4,5,5]' WHERE student='a'",
    )
      .bind()
      .run();
    round = (await call(stitch, ash)).data.round;
    await DB.prepare("UPDATE stitch_rounds SET updated=updated-1000 WHERE student='a'").bind().run();
    assert.equal((await flip(2)).data.round.expired, true);
    round = (await action({ action: 'start' })).data.round;
    await DB.prepare("UPDATE stitch_rounds SET started=started-86400000 WHERE student='a'").bind().run();
    assert.equal((await flip(0)).status, 409);
    await DB.prepare("UPDATE memberships SET class='south' WHERE student='a'").bind().run();
    assert.equal((await call(own, ash)).status, 403);
    assert.equal((await call(stitch, ash)).status, 403);
    await DB.prepare("UPDATE memberships SET class='north' WHERE student='a'").bind().run();
    assert.equal((await call(own, ash)).data.own.value, null);
    assert.equal((await call(stitch, ash)).data.round, null);
    round = (await action({ action: 'start' })).data.round;
    await DB.prepare("UPDATE classes SET teacher='tb' WHERE id='north'").bind().run();
    assert.equal((await call(stitch, ash)).status, 403);
    assert.equal((await call('student/stitch?account=a&class=north&teacher=tb', ash)).data.round, null);
    await DB.prepare("UPDATE accounts SET login='ѕh1thead',display='ѕh1thead' WHERE id='b'").bind().run();
    assert.equal((await call('student/login', '', 'POST', { password, login: 'ѕh1thead' })).status, 403);
    person = (await call('teacher/names?account=tb&class=south', south)).data.find((row) => row.id === 'b');
    assert.deepEqual(person.flags, ['login', 'display']);
  } finally {
    await close();
  }
});

test('migration removes earlier device-reported class scores from ranking', async () => {
  const sql = new DatabaseSync(':memory:');
  try {
    const migrate = async (file) =>
      sql.exec(await readFile(new URL('../server/migrations/' + file, import.meta.url), 'utf8'));
    await migrate('0001_class_writing.sql');
    await migrate('0002_class_scores.sql');
    sql.exec(`INSERT INTO accounts VALUES ('a','ash','Ash','student','salt','test'),('t','north','Keeper','teacher','salt','test');
      INSERT INTO classes VALUES ('c','Lanterns','t');
      INSERT INTO memberships VALUES ('a','c',1);`);
    const snapshot = JSON.stringify({ 'daily/xp': { from: '2026-02-03', through: '2026-02-03', value: 13 } });
    sql.prepare("INSERT INTO class_scores VALUES ('a','c','t',4,'Lake Finch',?)").run(snapshot);
    await migrate('0003_board_moderation.sql');
    const row = sql.prepare('SELECT * FROM class_scores').get();
    assert.equal(row.revision, 5);
    assert.equal(row.scores, '{}');
    assert.equal(row.alias, null);
    assert.equal(sql.prepare('SELECT count(*) AS n FROM stitch_bests').get().n, 0);
  } finally {
    sql.close();
  }
});

test('school provisioning refuses a flagged username or display before creating an account', async () => {
  const { DB, sql, password } = await fixture();
  try {
    for (const [login, display] of [
      ['ѕh1thead', 'Ash'],
      ['snow-swift', 'ＦＵＣＫ'],
    ]) {
      await assert.rejects(
        provisionStudent(DB, { id: 'new', password, login, display }),
        /school-appropriate/,
      );
      assert.equal(sql.prepare("SELECT COUNT(*) AS count FROM accounts WHERE id='new'").get().count, 0);
    }
  } finally {
    sql.close();
  }
});

test('teacher resets issue a username that the student can sign in with, even after a flagged draw', async (t) => {
  const { DB, sql, password } = await fixture();
  const origin = 'https://school.example';
  const send = (path, method, input, cookie = '') => worker.fetch(new Request(origin + '/api/classroom/' + path, {
    method, headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }), { DB });
  try {
    const teacher = await send('teacher/login', 'POST', { login: 'north@example.invalid', password });
    assert.equal(teacher.status, 200);
    const cookie = teacher.headers.get('set-cookie').split(';')[0];
    const reset = () => send('teacher/names?account=ta&class=north', 'PUT', {
      student: 'a', field: 'login', action: 'remove', previous: 'ash-moth',
    }, cookie);
    const flagged = 'eca95ea8-4555-4000-8000-000000000000';
    const uuid = t.mock.method(crypto, 'randomUUID', () => flagged);
    assert.equal((await reset()).status, 503);
    assert.equal(sql.prepare("SELECT login FROM accounts WHERE id='a'").get().login, 'ash-moth');

    uuid.mock.mockImplementation(() => '01234567-89ab-4000-8000-000000000000');
    uuid.mock.mockImplementationOnce(() => flagged);
    const result = await reset();
    assert.equal(result.status, 200);
    const { value } = await result.json();
    assert.equal(value, 'guardian-01234567-89ab');
    const signIn = await send('student/login', 'POST', { login: value, password });
    assert.equal(signIn.status, 200);
    assert.equal((await signIn.json()).id, 'a');
  } finally {
    sql.close();
  }
});
