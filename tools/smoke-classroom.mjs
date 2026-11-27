import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { setTimeout as delay } from 'node:timers/promises';
import { preview } from './classroom-preview.mjs';
const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const pw = require('playwright'),
  engine = process.argv[2] || 'chromium';
const service = await preview(0, true),
  browser = await pw[engine].launch(
    engine === 'chromium'
      ? {
          executablePath: process.env.KG_CHROMIUM || undefined,
          args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        }
      : {},
  );
const pass = 'Lantern-Fiction-42',
  errors = [];
async function device(path = '') {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: engine === 'webkit' ? { width: 390, height: 844 } : { width: 1220, height: 890 },
  });
  const p = await ctx.newPage();
  p.setDefaultTimeout(40000);
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(service.url + '/' + path, { waitUntil: 'domcontentloaded', timeout: 90000 });
  return p;
}
const button = (p, label) => p.getByRole('button', { name: label, exact: false }).first().click();
async function login(p, name, role = 'student') {
  if (role === 'student') await button(p, 'Class sign-in');
  await p.getByLabel(role === 'student' ? 'Guardian username' : 'Teacher email').fill(name);
  await p.getByLabel('Password', { exact: true }).fill(pass);
  await button(p, 'Sign in');
}
async function open(p) {
  await login(p, 'ash-moth');
  await p.getByText(/You and Keeper North, the assigned teacher for North Lanterns/).waitFor();
  await button(p, 'Open my class adventure');
  await p.getByRole('dialog', { name: 'Class adventure' }).waitFor({ state: 'hidden' });
}
async function resume(p) {
  await button(p, 'Continue');
  const recap = p.getByRole('dialog', { name: 'Recap' });
  try {
    await recap.waitFor({ timeout: 90000 });
  } catch (cause) {
    const screen = await p.evaluate(() => ({
      dialog: document.querySelector('[role="dialog"]')?.getAttribute('aria-label'),
      map: window.kg?.world?.map?.id,
      retriable: !!document.querySelector('.map-loading button:not([disabled])'),
      title: !!document.querySelector('.title-screen'),
    }));
    throw new Error('Class recovery did not reach the recap: ' + JSON.stringify(screen), { cause });
  }
  await recap.getByRole('button', {name:'Continue playing', exact:true}).click();
}
async function journal(p) {
  await p.evaluate(() => kg.ui.openJournal('notes'));
  await p.locator('#diary-note-text').waitFor();
}
const remote = (p) =>
  p.evaluate(async () => {
    const r = await fetch('/api/classroom/student/save?account=a&class=north&teacher=ta');
    return await r.json();
  });
async function waitForDraft(page, expected) {
  const until = Date.now() + 45000;
  let last;
  while (Date.now() < until) {
    const online = await remote(page);
    if (online.package) {
      const { slots } = JSON.parse(inflateSync(Buffer.from(online.package, 'base64')));
      last = JSON.parse(JSON.parse(slots).body).continue?.state?.adventureDiary?.noteDraft?.text;
      if (last === expected) return;
    }
    await delay(150);
  }
  throw new Error(
    'Expected a synced fictional draft ' +
      expected +
      '; last received ' +
      last +
      '; ' +
      (await page.locator('[data-class-status]').first().textContent()),
  );
}
try {
  const local = await device();
  let calls = 0;
  local.on('request', (r) => {
    if (r.url().includes('/api/classroom/')) calls++;
  });
  await button(local, 'New game');
  await button(local, 'Begin');
  await local.waitForFunction(() => !!window.kg?.controller?.state);
  await local.evaluate(() => {
    kg.controller.dispatch({ type: 'AddNote', text: 'Old local-only note' });
    kg.controller.suspend();
  });
  assert.equal(calls, 0);
  // The same device can later sign in without importing the local diary.
  await local.reload();
  const a = local;
  await a.route('**/api/classroom/capabilities', (route) =>
    route.fulfill({ status: 404, contentType: 'text/html', body: 'Static preview' }),
  );
  let passwordsPosted = 0;
  const countLogins = (r) => {
    if (r.url().endsWith('/student/login')) passwordsPosted++;
  };
  a.on('request', countLogins);
  await login(a, 'ash-moth');
  await a.getByText(/Class sign-in requires a school server/).waitFor();
  assert.equal(passwordsPosted, 0);
  await a.unroute('**/api/classroom/capabilities');
  a.off('request', countLogins);
  await a.keyboard.press('Escape');
  await open(a);
  await button(a, 'New game');
  await button(a, 'Begin');
  await a.waitForFunction(() => !!window.kg?.world);
  await a
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await a.keyboard.press('Escape');
  await a.evaluate(() => kg.ui.showNode('sefa.free'));
  await a
    .getByText(/You and Keeper North/)
    .first()
    .waitFor();
  await a.getByLabel('Your question', { exact: true }).fill('Could the lamp mark belong to a reader?');
  await a.keyboard.press('Escape');
  await journal(a);
  console.log('opened student diary');
  await a
    .getByText(/You and Keeper North/)
    .first()
    .waitFor();
  const n = a.locator('#diary-note-text');
  await n.fill('The bell cast two shadows.');
  await button(a, 'Save note');
  const reflection = a.locator('.diary-notes .diary-reflections').first();
  await reflection.locator('summary').click();
  await reflection.locator('textarea').first().fill('I heard only the second witness.');
  await n.focus();
  await n.fill('Who stood behind the lamp');
  await a.waitForTimeout(1450);
  await a.evaluate(() => {
    const c = kg.controller;
    c.permanent.portfolio.push({
      id: 'fixture-private',
      title: 'Personal sketch',
      reflection: 'private portfolio canary',
      text: 'private page',
      kind: 'ledger',
      at: new Date().toISOString(),
      world: 'nexus',
      shared: false,
      weave: {},
    });
    c.permanent.portfolio.push({
      ...c.permanent.portfolio.at(-1),
      id: 'fixture-selected',
      title: 'Selected for file export',
      shared: true,
      text: 'progress file only canary',
    });
    c.saves.savePermanent(c.permanent);
    localStorage.setItem('kg.class.v1.a/north/ta.album', JSON.stringify([{ thumb: 'photo-only-canary' }]));
  });
  await waitForDraft(a, 'Who stood behind the lamp');
  assert.ok((await remote(a)).revision >= 1);
  await a.keyboard.press('Escape');
  await a.keyboard.press('Escape');
  await button(a, 'Save and leave');
  await a.locator('.title-screen').waitFor();
  await a.waitForFunction(() => JSON.parse(localStorage.getItem('kg.class.v1.a/north/ta') || '{}').dirty === false);
  await a.context().close();
  console.log('device A synced and closed');
  const b = await device();
  await open(b);
  await resume(b);
  await journal(b);
  assert.equal(await b.locator('#diary-note-text').inputValue(), 'Who stood behind the lamp');
  await b.getByText('The bell cast two shadows.', { exact: true }).first().waitFor();
  assert.equal(
    await b.evaluate(
      () => kg.controller.permanent.portfolio.find((x) => x.id === 'fixture-private').reflection,
    ),
    'private portfolio canary',
  );
  assert.equal(await b.evaluate(() => Object.keys(localStorage).some((k) => k.endsWith('album'))), false);
  const road = b
    .locator('details')
    .filter({ has: b.locator('summary').filter({ hasText: 'Draft · Question for Sefa' }) })
    .last();
  await road.locator('summary').first().click();
  assert.equal(await road.locator('textarea').inputValue(), 'Could the lamp mark belong to a reader?');
  await b.locator('.diary-notes .diary-reflections summary').first().click();
  await b.getByText('I heard only the second witness.', { exact: true }).first().waitFor();
  await b.getByRole('tab', { name: 'Diary', exact: true }).click();
  const file = b.waitForEvent('download');
  await button(b, 'Download journal (.docx)');
  const archive = unzipSync(await readFile(await (await file).path()));
  const xml = strFromU8(archive['word/document.xml']);
  for (const part of [
    'The bell cast two shadows.',
    'Who stood behind the lamp',
    'I heard only the second witness.',
    'Could the lamp mark belong to a reader?',
  ])
    assert.ok(xml.includes(part), part);
  await b.getByRole('tab', { name: 'My notes', exact: true }).click();
  console.log('device B recovered and exported the saved note, draft, reflection and scene writing');
  const t = await device('teacher.html');
  await login(t, 'north@example.invalid', 'teacher');
  await t.getByText('Draft · note', { exact: true }).first().waitFor();
  await t.getByText('Who stood behind the lamp', { exact: true }).waitFor();
  await t.getByText('Saved note', { exact: true }).waitFor();
  await t.getByText('Draft · reflection', { exact: true }).waitFor();
  await t.getByText('I heard only the second witness.', { exact: true }).waitFor();
  await t.emulateMedia({ media: 'print' });
  assert.equal(await t.locator('.class-writing').isVisible(), false);
  await t.emulateMedia({ media: 'screen' });
  await t.getByText('Could the lamp mark belong to a reader?', { exact: true }).waitFor();
  const teacherText = await t.locator('body').innerText();
  for (const s of [
    'private portfolio canary',
    'photo-only-canary',
    'Old local-only note',
    'progress file only canary',
  ])
    assert.ok(!teacherText.includes(s));
  const t2 = await device('teacher.html');
  await login(t2, 'south@example.invalid', 'teacher');
  await t2.getByText('Moss Wren', { exact: true }).waitFor();
  assert.ok(!(await t2.locator('body').innerText()).includes('Who stood behind'));
  assert.equal(
    await t2.evaluate(
      async () => (await fetch('/api/classroom/teacher/writing?account=tb&class=north')).status,
    ),
    403,
  );
  // The recovery device first finishes its online play. A fresh online device then shares its latest revision.
  await b.waitForFunction(() => JSON.parse(localStorage.getItem('kg.class.v1.a/north/ta') || '{}').dirty === false);
  await b.context().setOffline(true);
  await b.locator('#diary-note-text').fill('Offline continuation');
  await b.waitForTimeout(1350);
  const alternate = await device();
  await open(alternate);
  await resume(alternate);
  await journal(alternate);
  await alternate.locator('#diary-note-text').fill('Alternate device continuation');
  await waitForDraft(alternate, 'Alternate device continuation');
  await b.context().setOffline(false);
  await b
    .getByText(/Two devices have changes/)
    .first()
    .waitFor();
  await button(t, 'Refresh writing');
  await t.getByText('Alternate device continuation', { exact: true }).waitFor();
  await b.keyboard.press('Escape');
  await b.keyboard.press('Escape');
  await button(b, 'Save and leave');
  await button(b, 'Manage class adventure');
  await button(b, 'Leave class adventure');
  await login(b, 'ash-moth');
  await button(b, 'Open my class adventure');
  await button(b, 'Use this device');
  await resume(b);
  await journal(b);
  assert.equal(await b.locator('#diary-note-text').inputValue(), 'Offline continuation');
  await waitForDraft(b, 'Offline continuation');
  await button(t, 'Refresh writing');
  await t.getByText('Offline continuation', { exact: true }).waitFor();
  await button(t, 'Sign out');
  assert.equal(
    await t.evaluate(
      async () => (await fetch('/api/classroom/teacher/writing?account=ta&class=north')).status,
    ),
    401,
  );
  assert.deepEqual(errors, []);
  console.log(
    engine,
    browser.version(),
    'PASS local play, class disclosure, cross-device note/draft and private portfolio recovery, device-only photo, assigned and unrelated teachers, offline edit conflict, sign-out',
  );
} finally {
  await browser.close();
  await service.close();
}
