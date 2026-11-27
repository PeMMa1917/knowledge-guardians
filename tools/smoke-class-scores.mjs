import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { preview } from './classroom-preview.mjs';
import { scoreActivities } from '../server/classScores.mjs';

const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const engine = process.argv[2] ?? 'chromium';
const pw = require('playwright');
const service = await preview(0, true);
const browser = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : {},
);
const errors = [];
async function device(path = '') {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: engine === 'webkit' ? { width: 390, height: 844 } : { width: 1200, height: 880 },
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(service.url + '/' + path, { waitUntil: 'domcontentloaded', timeout: 90000 });
  return page;
}
async function press(page, name) {
  const button = page.getByRole('button', { name, exact: true });
  await button.focus();
  await button.press('Enter');
}
async function sign(page, role, name) {
  if (role === 'student') await press(page, 'Class sign-in');
  await page.getByLabel(role === 'student' ? 'Guardian username' : 'Teacher email').fill(name);
  await page.getByLabel('Password', { exact: true }).fill('Lantern-Fiction-42');
  await press(page, 'Sign in');
}
async function begin(page) {
  await sign(page, 'student', 'ash-moth');
  await press(page, 'Open my class adventure');
  await page.getByRole('dialog', { name: 'Class adventure' }).waitFor({ state: 'hidden' });
  await page
    .getByRole('button', { name: /^New game/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: /^Begin/ })
    .first()
    .click();
  await page.waitForFunction(() => !!window.kg?.world?.map);
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Menu' }).waitFor();
  await press(page, 'Leaderboard');
  const panel = page.getByRole('dialog', { name: 'Leaderboard' });
  await panel.waitFor();
  return panel;
}
async function board(page, scope, title) {
  await scope.locator('.class-score-board summary', { hasText: title }).click();
  return scope.locator('.class-score-board');
}
try {
  const guardian = await device();
  const dialog = await begin(guardian);
  await dialog.getByLabel('Activity', { exact: true }).waitFor();
  const list = await dialog
    .getByLabel('Activity', { exact: true })
    .locator('option')
    .evaluateAll((nodes) => nodes.map((n) => n.value));
  assert.deepEqual(list.sort(), [...scoreActivities].sort());
  const own = await board(guardian, dialog, 'North Lanterns');
  await own.getByRole('status').filter({ hasText: 'Nobody has posted' }).waitFor();
  const outgoing = [];
  guardian.on('request', (r) => {
    if (r.method() === 'PUT' && r.url().includes('/student/scores?')) outgoing.push(r.postDataJSON());
  });
  await own.getByLabel('Nickname for this class board').fill('Lantern Fox');
  await press(own, 'Post this score to my class');
  await own.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  assert.deepEqual(Object.keys(outgoing[0]).sort(), ['alias', 'revision', 'value']);
  await dialog.getByLabel('Period', { exact: true }).selectOption('weekly');
  await dialog.getByLabel('Activity', { exact: true }).selectOption('concept:evidence');
  await own.getByRole('status').filter({ hasText: 'Nobody has posted' }).waitFor();
  await press(own, 'Post this score to my class');
  await own.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  const teacher = await device('teacher.html');
  await sign(teacher, 'teacher', 'north@example.invalid');
  const seen = await board(teacher, teacher, 'North Lanterns');
  await seen.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  assert.equal(await seen.getByText('Ash Moth', { exact: true }).count(), 0);
  assert.equal(await seen.getByRole('button', { name: 'Post this score to my class' }).count(), 0);
  await seen.getByLabel('Period', { exact: true }).selectOption('weekly');
  await seen.getByLabel('Activity', { exact: true }).selectOption('concept:evidence');
  await seen.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  await guardian.bringToFront();
  await press(own, 'Remove all my class scores');
  await own.getByRole('status').filter({ hasText: 'All your posted scores have been removed' }).waitFor();
  await teacher.bringToFront();
  await press(seen, 'Refresh class scores');
  await seen.getByRole('status').filter({ hasText: 'Nobody has posted' }).waitFor();
  await seen.getByLabel('Period', { exact: true }).selectOption('daily');
  await seen.getByLabel('Activity', { exact: true }).selectOption('xp');
  await seen.getByRole('status').filter({ hasText: 'Nobody has posted' }).waitFor();
  await teacher.context().close();
  const south = await device('teacher.html');
  await sign(south, 'teacher', 'south@example.invalid');
  const other = await board(south, south, 'South Lanterns');
  await other.getByRole('status').filter({ hasText: 'Nobody has posted' }).waitFor();
  assert.equal(await south.locator('option[value="north"]').count(), 0);
  assert.equal(await south.locator('.class-score-board').getByText('Lantern Fox').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    engine,
    'class board passed',
    list.length,
    'activity selectors, two posted periods, teacher read, withdrawal, different class',
  );
} finally {
  await browser.close();
  await service.close();
}
