/** Run against a served production build. Exercises the real Phaser loop and the persistent journal. */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const [engine = 'chromium', address = 'http://127.0.0.1:4173'] = process.argv.slice(2);
const baseline = process.argv.includes('--baseline');
const browser = await require('playwright')[engine].launch(engine === 'chromium' ? {
  executablePath: process.env.KG_CHROMIUM || undefined, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
} : {});
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 900 } });
  page.setDefaultTimeout(90000);
  const faults = [];
  page.on('pageerror', e => faults.push(String(e)));
  await page.goto(address, {waitUntil:'domcontentloaded'});
  await page.getByRole('button', {name:/New game/}).first().click();
  await page.getByRole('button', {name:'Begin',exact:true}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(/brass fish/).first().waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
  const sample = () => page.evaluate(async () => {
    const loop = kg.world.game.loop;
    const begin = performance.now(), start = loop.frame;
    await new Promise(resolve => setTimeout(resolve, 2500));
    return {frames: loop.frame - start, elapsed: Math.round(performance.now() - begin), running: loop.running};
  });
  const walking = await sample();
  assert.equal(walking.running, true);
  await page.evaluate(() => kg.ui.openJournal('notes'));
  const input = page.locator('#diary-note-text');
  await input.fill('Rin left a seat for the quiet drummer.');
  const writing = await sample();
  if (!baseline) {
    assert.equal(writing.running, false);
    assert.ok(writing.frames > 0 && writing.frames <= Math.ceil(writing.elapsed / 95) + 2, JSON.stringify(writing));
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
  assert.equal(await page.evaluate(() => kg.world.game.loop.running), true);
  await page.evaluate(() => kg.ui.openJournal('notes'));
  assert.equal(await input.inputValue(), 'Rin left a seat for the quiet drummer.');
  await page.evaluate(() => kg.world.changeMap('stage.foyer', 12, 12));
  await page.waitForFunction(()=>kg.world?.map.id === 'stage.foyer' && !kg.world.transitioning);
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
  assert.equal(await page.evaluate(() => kg.world.game.loop.running), true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^Continue\b/}).first().click();
  await dialog.getByRole('button',{name:'Continue playing'}).click();
  await dialog.waitFor({state:'hidden'});
  await page.evaluate(() => kg.ui.openJournal('notes'));
  assert.equal(await input.inputValue(), 'Rin left a seat for the quiet drummer.');
  assert.deepEqual(faults, []);
  console.log('READING', JSON.stringify({engine,version:browser.version(),walking,writing,baseline, recovered:true}));
} finally { await browser.close(); }
