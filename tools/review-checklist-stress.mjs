// Fictitious reviewer records in temporary browser contexts. Nothing is written to the game or a shared class.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const levels = ['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create'];
const base = [
  'story:11',
  'game:22',
  'concept:evidence',
  'framework:ethics',
  'theme:knower',
];
const ready = (page) => page.locator('html[data-review-ready="true"]').waitFor();
const idle = (page) =>
  page.locator('#storageNotice').waitFor({ state: 'hidden', timeout: 180000 });
async function downloadLedger(page) {
  const file = page.waitForEvent('download');
  await page.locator('#json').click();
  return JSON.parse(await readFile(await (await file).path(), 'utf8'));
}
export async function exerciseReviewScale(browser, engine, url) {
  const ctx = await browser.newContext(),
    page = await ctx.newPage();
  await page.goto(url);
  await ready(page);
  const catalog = await page
    .locator('#atlasData')
    .evaluate((el) => JSON.parse(el.textContent).members);
  const focus = catalog.filter((m) => m.kind === 'micro');
  assert.equal(focus.length, 1200);
  let positions = 0;
  for (let chapter = 1; chapter <= 15; chapter++) {
    positions += await page.evaluate(
      ({ chapter, base }) => {
        let count = 0;
        for (const member of atlas.members) {
          const b = boardFor(atlas.members, { chapter, ids: [...base, member.id] });
          const ref = readReviewReference(atlas.members, reviewReference(b));
          if (boardKey(ref.board) !== boardKey(b))
            throw Error('Reference drift for ' + member.id);
          const keys = new Set();
          for (const l of levels) for (const d of depths) keys.add(cellKey(b, l, d));
          if (keys.size !== 24) throw Error('Shared cognitive cell at ' + member.id);
          count += keys.size;
        }
        return count;
      },
      { chapter, base },
    );
  }
  assert.equal(positions, catalog.length * 15 * 24);
  const records = [];
  for (const [i, m] of focus.entries()) {
    const board = { chapter: (i % 15) + 1, ids: [...base, m.id].sort() };
    for (const bloom of levels)
      for (let dok = 1; dok <= 4; dok++)
        records.push({
          board,
          bloom,
          dok,
          checked: true,
          updated: '2025-01-01T00:00:00.000Z',
          evidence: 'Fictional reviewer · ' + m.id + ' · ' + bloom + ' · ' + dok,
          actions: ['fictional/' + m.id + '/' + bloom + '/' + dok],
        });
  }
  const bytes = Buffer.from(JSON.stringify({ version: 1, records }));
  assert(bytes.length > 5 * 1024 * 1024);
  await page
    .locator('#load')
    .setInputFiles({
      name: 'fictional-review.json',
      mimeType: 'application/json',
      buffer: bytes,
    });
  await page
    .getByText('Checklist imported. ' + records.length + ' saved cells.')
    .waitFor({ timeout: 180000 });
  await idle(page);
  await page.reload();
  await ready(page);
  await idle(page);
  assert((await page.locator('#savedRange').innerText()).includes('1–100 of 1200'));
  await page.locator('#moreSaved').click();
  assert(
    (await page.locator('#savedRange').innerText()).includes('101–200 of 1200'),
  );
  await page.locator('#priorSaved').click();
  const exp = await downloadLedger(page);
  assert.equal(exp.records.length, records.length);
  const exact = (r) =>
    JSON.stringify([r.board.chapter, r.board.ids, r.bloom, r.dok]);
  const original = new Map(records.map((r) => [exact(r), r]));
  for (const r of exp.records) {
    const o = original.get(exact(r));
    assert.equal(r.checked, true);
    assert.equal(r.evidence, o.evidence);
    assert.deepEqual(r.actions, o.actions);
  }
  const first = records[0].board,
    ref = await page.evaluate((b) => reviewReference(b), first);
  await page.goto(url + ref);
  const second = await ctx.newPage();
  await second.goto(url + ref);
  await ready(second);
  const check = second.getByRole('checkbox', {
    name: 'Reviewed create DOK 4',
    exact: true,
  });
  assert(await check.isChecked());
  await page
    .getByRole('button', { name: 'Edit evidence for create DOK 4', exact: true })
    .click();
  await page.locator('#note').fill('Fictional team note · preserved across tabs.');
  await page.locator('#saveNote').click();
  await idle(page);
  await check.uncheck();
  await idle(second);
  await second.reload();
  await ready(second);
  await idle(second);
  assert(!(await check.isChecked()));
  await second
    .getByRole('button', { name: 'Edit evidence for create DOK 4', exact: true })
    .click();
  assert.equal(
    await second.locator('#note').inputValue(),
    'Fictional team note · preserved across tabs.',
  );
  await ctx.close();
  const denied = await browser.newContext();
  await denied.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      get() {
        throw new Error('Simulated unavailable database');
      },
    });
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('Simulated unavailable local storage');
      },
    });
  });
  const local = await denied.newPage();
  await local.goto(url);
  await ready(local);
  await local
    .getByRole('checkbox', { name: 'Reviewed understand DOK 2', exact: true })
    .check();
  assert(await local.locator('#storageNotice').isVisible());
  assert((await local.locator('#storageNotice').innerText()).includes('JSON'));
  assert.equal((await downloadLedger(local)).records.length, 1);
  await denied.close();
  console.log(
    JSON.stringify({
      engine,
      worksheetPositions: positions,
      reviewCellsRecovered: records.length,
      fictionalLedgerBytes: bytes.length,
      parallelEditors: true,
      unavailableStorageExport: true,
    }),
  );
}
