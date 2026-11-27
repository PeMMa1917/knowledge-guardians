import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import worker from '../server/classroom.mjs';
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
    script: await readFile(new URL('../server/classroom.mjs', import.meta.url), 'utf8'),
    compatibilityDate: '2026-01-01',
    d1Databases: ['DB'],
    cf: false,
  });
  try {
    const DB = await edge.getD1Database('DB');
    const ddl = await readFile(
      new URL('../server/migrations/0001_class_writing.sql', import.meta.url),
      'utf8',
    );
    for (const stmt of ddl.trim().split(/;\s*(?=CREATE|PRAGMA)/)) await DB.prepare(stmt).run();
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
