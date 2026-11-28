import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const [engine = 'chromium', base = 'http://127.0.0.1:4173/'] = process.argv.slice(2);
const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const browser = await require('playwright')[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true },
);
try {
  const page = await browser.newPage({
    viewport: engine === 'webkit' ? { width: 360, height: 740 } : { width: 1280, height: 840 },
  });
  const faults = [],
    requests = [];
  page.on('pageerror', (e) => faults.push(String(e)));
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(new URL('teacher.html?view=chapters', base).href);
  await page.getByRole('heading', { name: 'Chapter map' }).waitFor();
  assert.equal(await page.locator('.plan-visit').count(), 16);
  const select = (label, val) => page.getByRole('combobox', { name: label, exact: true }).selectOption(val);
  await select('Chapter', '7');
  await select('Area or theme', 'HIS');
  await select('TOK concept', 'interpretation');
  await select('DP subject', 'economics');
  await select('Framework', 'methods-and-tools');
  await select('Depth of knowledge', '3');
  await select('Bloom', 'evaluate');
  await select('Fink', 'integration');
  await select('SOLO', 'relational');
  await page
    .getByRole('heading', { name: 'Put two estimates beside a shift missing from the books.' })
    .waitFor();
  await select('Depth of knowledge', '1');
  await page
    .getByRole('status')
    .getByText(/No activity/)
    .waitFor();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  assert.equal(
    await page
      .getByRole('combobox', { name: 'Chapter', exact: true })
      .evaluate((e) => document.activeElement === e),
    true,
  );
  const count = await page.locator('.plan-results li').count();
  await page.getByRole('button', { name: 'Show more activities' }).click();
  assert.equal(await page.locator('.plan-results li').count(), count + 12);
  assert.equal(
    await page.evaluate(() => document.activeElement === document.querySelectorAll('.plan-results li')[12]),
    true,
  );
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.plan-filters').isVisible(), false);
  assert.equal(await page.locator('.plan-visit').first().isVisible(), true);
  await page.emulateMedia({ media: 'screen' });
  assert.ok(!requests.some((url) => new URL(url).pathname.startsWith('/api/')));
  await page.getByRole('link', { name: 'Teacher dashboard' }).click();
  const guide = page.getByRole('link', { name: 'Who can read a student’s writing?' });
  await guide.waitFor();
  const school = await Promise.all([page.waitForEvent('popup'), guide.click()]).then(([p]) => p);
  await school.getByRole('heading', { name: 'Who can read a student’s writing?' }).waitFor();
  assert.match(
    await school.locator('main').innerText(),
    /Classmates and teachers assigned only to other classes/,
  );
  assert.equal(
    await page.getByRole('heading', { name: 'Knowledge Guardians: Teacher view' }).isVisible(),
    true,
  );
  await school.getByRole('link', { name: 'Game title' }).click();
  await school.getByRole('link', { name: 'For schools and families' }).click();
  await school.getByRole('heading', { name: 'Moving to a different device' }).waitFor();
  assert.deepEqual(faults, []);
  console.log(
    engine,
    browser.version(),
    '15 chapters, joined action filters, empty and reset, paging focus, print view, no class API on the planner, family guide from both titles.',
  );
} finally {
  await browser.close();
}
