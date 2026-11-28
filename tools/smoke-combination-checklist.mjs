// Exercise the actual offline reviewer document, including portable checks across browser contexts.
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
const req = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const { chromium, firefox, webkit } = req('playwright');
const [engine = 'chromium'] = process.argv.slice(2);
const launch =
  engine === 'chromium' && process.env.KG_CHROMIUM
    ? { executablePath: process.env.KG_CHROMIUM, args: ['--no-sandbox'] }
    : {};
const browser = await { chromium, firefox, webkit }[engine].launch({
  headless: true,
  ...launch,
});
const file = new URL(
  '../docs/audit/COMBINATION_CHECKLIST.html',
  import.meta.url,
);
const html = await readFile(file);
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = process.argv.includes('--file')
  ? file.href
  : 'http://127.0.0.1:' + server.address().port + '/checklist';
try {
  const context = await browser.newContext({
    viewport:
      engine === 'webkit'
        ? { width: 390, height: 844 }
        : { width: 1100, height: 800 },
  });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  const cell = page.getByRole('checkbox', {
    name: 'Reviewed analyse DOK 2',
    exact: true,
  });
  assert.equal(await page.getByRole('checkbox').count(), 24);
  await cell.check();
  assert((await page.locator('#boardProgress').textContent()).includes('1 of 24 cells reviewed · 0 of 24'));
  await page
    .getByRole('button', { name: 'Edit evidence for analyse DOK 2' })
    .click();
  await page
    .getByLabel('Review evidence', { exact: true })
    .fill(
      'Test review: guide the visitor by the fringe, then walk to the rear of the hall.',
    );
  await page.getByRole('button', { name: 'Save evidence' }).click();
  await page.reload();
  assert(await cell.isChecked());
  assert.equal(await page.locator('input:checked').count(), 1);
  await page.getByLabel('Chapter', { exact: true }).selectOption('3');
  assert.equal(await cell.isChecked(), false);
  await page.getByRole('button', { name: 'Open board', exact: true }).click();
  assert(await cell.isChecked());
  assert.equal(
    await page.getByLabel('Chapter', { exact: true }).inputValue(),
    '2',
  );
  const dl = page.waitForEvent('download');
  await page.getByText('Export JSON', { exact: true }).click();
  const download = await dl;
  const content = await readFile(await download.path());
  const parsed = JSON.parse(content);
  assert.equal(parsed.records.length, 1);
  assert(parsed.records[0].evidence.includes('fringe'));
  const second = await browser.newContext(),
    p2 = await second.newPage();
  await p2.goto(url);
  await p2.locator('#load').setInputFiles({
    name: 'review.json',
    mimeType: 'application/json',
    buffer: content,
  });
  await p2.getByText(/Checklist imported/).waitFor();
  assert(
    await p2
      .getByRole('checkbox', { name: 'Reviewed analyse DOK 2', exact: true })
      .isChecked(),
  );
  await p2.locator('#load').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await p2.getByText(/Import failed/).waitFor();
  assert(
    await p2
      .getByRole('checkbox', { name: 'Reviewed analyse DOK 2', exact: true })
      .isChecked(),
  );
  const csvEvent = p2.waitForEvent('download');
  await p2.locator('#csv').click();
  const csv = await readFile(await (await csvEvent).path(), 'utf8');
  assert.equal(csv.split('\r\n').length, 25);
  await p2.getByText('Open a worked example').click();
  await p2.getByRole('button', { name: 'Sling, then decision' }).click();
  assert(
    (await p2.locator('#proof').innerText()).includes('Observed settings'),
  );
  await page.locator('#family').selectOption('micro');
  await page.locator('#search').fill('micro:1200');
  assert.equal(await page.locator('#matches').inputValue(), 'micro:1200');
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  await page.locator('#matrix summary').click();
  await page.locator('#matrixSearch').fill('micro:1200');
  const matrixCell = page.getByRole('checkbox', {
    name: 'micro:1200 create DOK 4',
    exact: true,
  });
  await matrixCell.check();
  const familyFile = page.waitForEvent('download');
  await page.locator('#familyCSV').click();
  const familyText = await readFile(await (await familyFile).path(), 'utf8');
  assert(
    familyText.includes('micro:1200') &&
      familyText.includes('"Reviewed"') &&
      familyText.includes('create · DOK 4'),
  );
  assert.equal(familyText.split('\r\n').length, 2);
  await page.locator('#matrixTable button').click();
  assert(
    await page
      .getByRole('checkbox', { name: 'Reviewed create DOK 4', exact: true })
      .isChecked(),
  );
  assert.equal(
    await page
      .getByRole('checkbox', { name: 'Reviewed analyse DOK 2', exact: true })
      .isChecked(),
    false,
  );
  await page.locator('#example1').evaluate((e) => e.click());
  await page.locator('#navigator summary').click();
  await page.locator('#pool').selectOption('micro');
  await page.locator('#combinationNumber').fill('1200');
  await page.locator('#useSet').click();
  assert(
    (await page.locator('#boardDesc').textContent()).includes('micro:1200'),
  );
  assert(
    await page
      .getByRole('checkbox', { name: 'Reviewed create DOK 4', exact: true })
      .isChecked(),
  );
  await page.locator('#previousSet').click();
  assert(
    (await page.locator('#boardDesc').textContent()).includes('micro:1199'),
  );
  assert(
    !(await page
      .getByRole('checkbox', { name: 'Reviewed create DOK 4', exact: true })
      .isChecked()),
  );
  await page.locator('#nextSet').click();
  assert(await page.locator('#nextSet').isDisabled());
  await page.locator('#combinationNumber').fill('1201');
  assert(await page.locator('#useSet').isDisabled());
  await page.locator('#family').selectOption('micro');
  await page.locator('#search').fill('micro:129');
  await page.locator('#findAction').click();
  await page.locator('#knownAction').selectOption('returned-coat.hook.print');
  await page.getByRole('button', { name: 'Review selected action' }).click();
  assert.equal(await page.locator('#chapter').inputValue(), '1');
  assert((await page.locator('#note').inputValue()).includes('pear'));
  assert((await page.locator('#actionIds').inputValue()).length > 0);
  assert.equal(
    await page
      .getByRole('checkbox', { name: 'Reviewed analyse DOK 2', exact: true })
      .isChecked(),
    false,
  );
  await page.locator('#search').fill('micro:129');
  await page.locator('#findAction').click();
  const linkedObjective = page
    .locator('#objectiveLeads option')
    .filter({ hasText: 'returned-coat.hook.print' });
  assert.equal(await linkedObjective.count(), 1);
  await page
    .locator('#objectiveLeads')
    .selectOption(await linkedObjective.getAttribute('value'));
  await page
    .getByRole('button', { name: 'Build a review from this objective' })
    .click();
  assert((await page.locator('#boardDesc').innerText()).includes('micro:129'));
  assert.equal(await page.locator('#grid input:checked').count(), 0);
  await page.locator('#family').selectOption('micro');
  await page.locator('#search').fill('');
  await page.locator('#moreMembers').click();
  assert((await page.locator('#matchCount').textContent()).includes('151'));
  await page.locator('#search').fill('self-monitoring unlikely wording');
  assert(
    (await page.locator('#matchCount').textContent()).includes('No matching'),
  );
  await page.locator('#search').fill('decision is still open');
  assert.equal(await page.locator('#matches').inputValue(), 'micro:20');
  await page.locator('#family').selectOption('exhibition');
  await page.locator('#search').fill('Prompt 35');
  assert.equal(await page.locator('#matches').inputValue(), 'exhibition:35');
  await page.locator('#documented').click();
  assert(
    (await page.locator('#message').textContent()).includes(
      'implementation reviews',
    ),
  );
  await page.locator('#documented').click();
  assert((await page.locator('#message').textContent()).startsWith('Added 0 '));
  await page.locator('#sequence').selectOption('order');
  await page.locator('#stepBox details summary').click();
  await page.locator('#orderNumber').fill('2');
  await page.locator('#openOrder').click();
  assert((await page.locator('#steps').inputValue()).includes(' > '));
  assert(
    (await page.locator('#boardDesc').textContent()).includes(
      'Ordered journey',
    ),
  );
  await page.locator('#family').selectOption('micro');
  await page.locator('#search').fill('micro:1200');
  await page.locator('#focus').click();
  await page.locator('#overviewBloom').selectOption('create');
  const overviewCell = page.getByRole('button', {name:'Inspect chapter 2 create DOK 4 for micro:1200',exact:true});
  assert.equal(await overviewCell.innerText(), '1');
  await overviewCell.click();
  await page.locator('#overviewDetails').getByRole('button', {name:/^Reviewed/}).click();
  assert.equal(await page.locator('#cellTitle').textContent(), 'create · DOK 4');
  await page.locator('#boardAddress summary').click();
  await page.locator('#makeReference').click();
  const reference = await page.locator('#reviewRef').inputValue();
  assert(reference.startsWith('#review?'));
  await p2.goto(url + reference);
  await p2.locator('#editPanel').waitFor();
  assert.equal(await p2.locator('#chapter').inputValue(),'2');
  assert.equal(await p2.locator('#cellTitle').textContent(), 'create · DOK 4');
  assert.equal(await p2.locator('#grid input:checked').count(),0);
  await page.locator('#reviewRef').fill(reference.replace('dok=4','dok=5'));
  await page.locator('#openReference').click();
  assert((await page.locator('#message').textContent()).includes('Could not open'));
  const emptyCell = page.getByRole('button', {name:'Inspect chapter 4 create DOK 4 for micro:1200',exact:true});
  assert.equal(await emptyCell.innerText(),'0');
  await emptyCell.click();
  await page.getByRole('button',{name:'Review with the current selection'}).click();
  assert.equal(await page.locator('#chapter').inputValue(),'4');
  assert.equal(await page.locator('#cellTitle').textContent(),'create · DOK 4');
  assert.equal(await page.locator('#grid input:checked').count(),0);
  assert.deepEqual(errors, []);
  console.log(
    engine,
    await browser.version(),
    'passed all 24 controls, independent chapters, local recovery, ordered evidence, micro-skill lookup, portable notes and CSV.',
  );
} finally {
  await browser.close();
  server.close();
}
