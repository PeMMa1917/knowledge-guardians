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
      for (const stmt of ddl.trim().split(/;\s*(?=CREATE|PRAGMA)/)) await DB.prepare(stmt).run();
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

test('class score snapshots use fictional aliases, explicit publication and current membership', async () => {
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
  const board = (role, account, cls, teacher, activity = 'xp', period = 'daily', date = day) =>
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
    assert.deepEqual((await call(own, ash)).data, { rows: [], own: { alias: null, revision: 0 } });
    assert.equal(
      (await call(own, ash, 'PUT', { alias: '  Tern  Kite  ', value: 0, revision: 0 })).status,
      200,
    );
    const visible = [{ alias: 'Tern Kite', value: 0, through: day }];
    assert.deepEqual((await call(peer, rook)).data.rows, visible);
    assert.deepEqual((await call(watched, north)).data, { rows: visible });
    assert.equal((await call(watched, north, 'PUT', { alias: 'Horn', value: 10, revision: 0 })).status, 403);
    assert.equal((await call(board('student', 'b', 'north', 'ta'), moss)).status, 403);
    assert.equal((await call(board('teacher', 'tb', 'north', 'tb'), south)).status, 403);
    assert.equal((await call(peer, ash)).status, 403);
    assert.deepEqual((await call(board('student', 'b', 'south', 'tb'), moss)).data.rows, []);
    assert.equal((await call(own)).status, 401);
    assert.equal((await call(board('student', 'a', 'north', 'ta', 'journal'), ash)).status, 400);
    const offClock = board('student', 'a', 'north', 'ta', 'xp', 'daily', '1900-01-01');
    assert.deepEqual((await call(offClock, ash)).data, {
      rows: [],
      clockMismatch: true,
      own: { alias: 'Tern Kite', revision: 1 },
    });
    assert.equal(
      (await call(offClock, ash, 'PUT', { alias: 'Yesterday', value: 10, revision: 1 })).status,
      400,
    );
    for (const bad of [
      { alias: '××', value: 1 },
      { alias: 'Otter', value: -1 },
      { alias: 'Otter', value: '5' },
    ])
      assert.equal((await call(own, ash, 'PUT', { revision: 1, ...bad })).status, 400);
    assert.equal(
      (
        await call(board('student', 'a', 'north', 'ta', 'map-discovery'), ash, 'PUT', {
          revision: 1,
          alias: 'Tern Kite',
          value: 101,
        })
      ).status,
      400,
    );
    const second = await sign('student', 'ash-moth');
    assert.deepEqual((await call(own, second)).data.own, { alias: 'Tern Kite', revision: 1 });
    let revision = 1;
    for (const activity of scoreActivities)
      for (const period of ['daily', 'weekly', 'monthly', 'ytd']) {
        const path = board('student', 'a', 'north', 'ta', activity, period);
        const value = activity === 'game:forecast-brier' ? 0.25 : 2;
        assert.equal(
          (await call(path, ash, 'PUT', { alias: 'Lake Finch', value, revision: revision++ })).status,
          200,
        );
        assert.deepEqual(
          (await call(board('student', 'p', 'north', 'ta', activity, period), rook)).data.rows,
          [{ alias: 'Lake Finch', value, through: day }],
        );
      }
    assert.equal((await call(offClock, second, 'DELETE', { revision })).status, 200);
    assert.equal((await call(own, ash, 'PUT', { alias: 'Stale Tab', value: 15, revision })).status, 409);
    assert.deepEqual((await call(watched, north)).data.rows, []);
    assert.deepEqual(
      (await call(board('student', 'p', 'north', 'ta', 'concept:evidence', 'monthly'), rook)).data.rows,
      [],
    );
    assert.equal(
      (await call(own, ash, 'PUT', { revision: ++revision, alias: 'Night Finch', value: 15 })).status,
      200,
    );
    await DB.prepare("UPDATE memberships SET class='south' WHERE student='a'").bind().run();
    assert.equal((await call(own, ash)).status, 403);
    assert.deepEqual((await call(watched, north)).data.rows, []);
    assert.deepEqual((await call(board('student', 'a', 'south', 'tb'), ash)).data, {
      rows: [],
      own: { alias: null, revision: 0 },
    });
    await DB.prepare("UPDATE memberships SET class='north' WHERE student='a'").bind().run();
    assert.deepEqual((await call(peer, rook)).data.rows, []);
    let mine = (await call(own, ash)).data.own;
    assert.equal(
      (await call(own, ash, 'PUT', { revision: mine.revision, alias: 'Finch', value: 7 })).status,
      200,
    );
    await DB.prepare("UPDATE classes SET teacher='tb' WHERE id='north'").bind().run();
    assert.equal((await call(own, ash)).status, 403);
    assert.deepEqual((await call(board('teacher', 'tb', 'north', 'tb'), south)).data.rows, []);
    await DB.prepare("UPDATE classes SET teacher='ta' WHERE id='north'").bind().run();
    assert.deepEqual((await call(peer, rook)).data.rows, []);
  } finally {
    await close();
  }
});
