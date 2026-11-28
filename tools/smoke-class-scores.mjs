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
  const own = await board(guardian, dialog, 'North Lanterns');
  const list = await own
    .getByLabel('Activity', { exact: true })
    .locator('option')
    .evaluateAll((nodes) => nodes.map((n) => n.value));
  assert.deepEqual([...list].sort(), [...scoreActivities].sort());
  const outside = dialog.locator('.leaderboard > section').first();
  assert.equal(await outside.getByLabel('Activity', { exact: true }).locator('option').count(), 31);
  const play = own.locator('.ranked-stitch');
  await own.getByRole('status').filter({ hasText: 'No verified scores' }).waitFor();
  assert.ok(await own.getByRole('button', { name: 'Share server result' }).isDisabled());
  const resultBodies = [];
  guardian.on('request', (r) => {
    if (r.method() === 'PUT' && r.url().includes('/student/scores?')) resultBodies.push(r.postDataJSON());
  });
  await press(play, 'Play or resume online stitching');
  // The first tour reads every slip the same way a player does. Match the remaining known pairs.
  const turns = new Map();
  async function flip(index) {
    assert.ok(Number.isInteger(index));
    const button = play.locator('[data-tile="' + index + '"]');
    const response = guardian.waitForResponse(
      (r) =>
        r.url().includes('/student/stitch?') &&
        r.request().method() === 'POST' &&
        r.request().postDataJSON()?.action === 'flip' &&
        r.request().postDataJSON().tile === index,
    );
    await button.click();
    const r = await response;
    assert.equal(r.status(), 200);
    const { round } = await r.json();
    assert.notEqual(round.tiles[index].value, null);
    await button.filter({ hasText: round.tiles[index].matched ? 'Stitched' : /· (?!Face down)/ }).waitFor();
    await guardian.waitForTimeout(round.waitMs + 100);
    return round;
  }
  let round;
  for (let i = 0; i < 12; i++) {
    round = await flip(i);
    const id = round.tiles[i].value;
    turns.set(id, [...(turns.get(id) ?? []), i]);
  }
  for (const pair of turns.values()) {
    if (round.tiles[pair[0]].matched) continue;
    await flip(pair[0]);
    round = await flip(pair[1]);
  }
  await play.getByRole('status').filter({ hasText: 'Six pairs stitched' }).waitFor();
  await own.getByLabel('Nickname for this class board').fill('ѕh1thead');
  await press(own, 'Share server result');
  await own.getByRole('status').filter({ hasText: 'assigned teacher can review' }).waitFor();
  await own.getByLabel('Nickname for this class board').fill('Lantern Fox');
  await press(own, 'Share server result');
  await own.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  assert.deepEqual(Object.keys(resultBodies.at(-1)).sort(), ['alias', 'revision']);
  const teacher = await device('teacher.html');
  await sign(teacher, 'teacher', 'north@example.invalid');
  const names = teacher.locator('.class-names');
  await names.locator('summary').click();
  const member = names.locator('fieldset').filter({ hasText: 'Ash Moth' });
  await member.getByText(/Submitted nickname/).waitFor();
  const seen = await board(teacher, teacher, 'North Lanterns');
  await seen.getByRole('rowheader', { name: 'Lantern Fox' }).waitFor();
  await member.getByLabel('Name to manage').selectOption('alias');
  await member.getByLabel('Replacement name').fill('Север');
  await press(member, 'Set replacement');
  await seen.getByRole('rowheader', { name: 'Север' }).waitFor();
  await guardian.bringToFront();
  await press(own, 'Refresh class scores');
  await own.getByRole('rowheader', { name: 'Север' }).waitFor();
  assert.ok(await own.getByLabel('Nickname for this class board').isDisabled());
  await own.getByLabel('Period', { exact: true }).selectOption('weekly');
  await own.getByLabel('Activity', { exact: true }).selectOption('game:stitch-seconds');
  await own.getByRole('status').filter({ hasText: 'No verified scores' }).waitFor();
  await press(own, 'Share server result');
  await own.getByRole('rowheader', { name: 'Север' }).waitFor();
  await teacher.bringToFront();
  await seen.getByLabel('Period', { exact: true }).selectOption('weekly');
  await seen.getByLabel('Activity', { exact: true }).selectOption('game:stitch-seconds');
  await seen.getByRole('rowheader', { name: 'Север' }).waitFor();
  await member.getByLabel('Name to manage').selectOption('login');
  await press(member, 'Remove selected name');
  await names.getByRole('status').filter({ hasText: 'Give this sign-in username' }).waitFor();
  const username = (await names.getByRole('status').textContent()).match(/guardian-[a-f0-9-]+/)[0];
  const replacement = await device();
  await sign(replacement, 'student', username);
  await replacement.getByRole('button', { name: 'Open my class adventure' }).waitFor();
  await replacement.context().close();
  await guardian.bringToFront();
  await press(own, 'Refresh class scores');
  await press(own, 'Remove all my class scores');
  await own.getByRole('status').filter({ hasText: 'All your posted scores have been removed' }).waitFor();
  await teacher.bringToFront();
  await press(seen, 'Refresh class scores');
  await seen.getByRole('status').filter({ hasText: 'No verified scores' }).waitFor();
  await teacher.context().close();
  const south = await device('teacher.html');
  await sign(south, 'teacher', 'south@example.invalid');
  const other = await board(south, south, 'South Lanterns');
  await other.getByRole('status').filter({ hasText: 'No verified scores' }).waitFor();
  assert.equal(await south.locator('option[value="north"]').count(), 0);
  assert.equal(await south.locator('.class-score-board').getByText('Lantern Fox').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    engine,
    'class board passed',
    list.length,
    'server-scored activities, 31 personal views, online play, flagged nickname, sign-in reset and withdrawal',
  );
} finally {
  await browser.close();
  await service.close();
}
