import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const [engine = 'chromium', url = 'http://127.0.0.1:4173'] = process.argv.slice(2);
const browser = await require('playwright')[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true },
);
const viewport =
  engine === 'webkit'
    ? { width: 390, height: 844 }
    : engine === 'firefox'
      ? { width: 820, height: 1080 }
      : { width: 1280, height: 800 };
try {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(45000);
  const fatal = [];
  page.on('pageerror', (e) => fatal.push(String(e)));
  // Check the first HTML frame and its error recovery independently of the renderer.
  let hold,
    first = true;
  const held = new Promise((resolve) => {
    hold = resolve;
  });
  await page.route('**/*.js', async (route) => {
    if (first && route.request().resourceType() === 'script') {
      first = false;
      await held;
    }
    await route.continue();
  });
  await page.goto(url, { waitUntil: 'commit' });
  await page.locator('.arrival h1').waitFor();
  assert.equal(await page.locator('#arrival-status').innerText(), 'Opening the game menu…');
  hold();
  const menu = page.getByRole('button', { name: /New game/ });
  await menu.waitFor();
  assert.equal(await page.locator('#game canvas').count(), 0);
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#game canvas').count(), 0);
  // The first missing map sheet is a recoverable download failure. Existing local progress is untouched.
  await page.route('**/assets/art/armm1998/Overworld.png', (route) => route.abort());
  await menu.click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Fictional Rain');
  await page.getByRole('button', { name: 'Begin', exact: true }).click();
  const retry = page.getByRole('button', { name: 'Try again', exact: true });
  await retry.waitFor();
  assert.equal(await page.evaluate(() => kg.controller.pair.continue), null);
  await page.getByRole('button', { name: 'Back', exact: true }).last().click();
  assert.equal(await page.getByRole('textbox', { name: 'Name', exact: true }).inputValue(), 'Fictional Rain');
  await page.getByRole('button', { name: 'Begin', exact: true }).click();
  await retry.waitFor();
  await page.unroute('**/assets/art/armm1998/Overworld.png');
  await retry.click();
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => kg.controller.state.player.name), 'Fictional Rain');
  assert.equal(await page.locator('#game canvas').count(), 1);
  await page.evaluate(() => window.kgToTitle());
  await page.getByRole('button', { name: /^Continue / }).click();
  await page.getByRole('dialog', { name: 'Recap' }).waitFor();
  assert.equal(await page.locator('#game canvas').count(), 1);
  assert.deepEqual(fatal, []);
  const entry = await page.locator('script[type="module"][src]').first().evaluate(el=>el.src);
  await page.close();
  for(const kind of ['entry','application','shared']){
    const failed = await browser.newPage({ viewport });
    const blocked = '**/assets/' + (kind==='shared'?'skills-*.js':'main-*.js');
    let attempted=false;
    await failed.route(blocked,route=>{
      const isEntry=route.request().url()===entry;
      if(kind==='shared' || (kind==='entry')===isEntry){
        attempted=true;
        return route.abort();
      }
      return route.continue();
    });
    await failed.goto(url);
    const reopen=failed.getByRole('button',{name:'Reload the game'});
    await reopen.waitFor();
    assert.equal(attempted,true);
    await failed.unroute(blocked);
    await reopen.click();
    await failed.getByRole('button',{name:/New game/}).click();
    await failed.getByRole('textbox',{name:'Name',exact:true}).fill('Fictional '+kind);
    await failed.getByRole('button',{name:'Begin',exact:true}).click();
    await failed.getByRole('dialog').getByText(/brass fish/).first().waitFor();
    assert.equal(await failed.locator('#game canvas').count(),1);
    assert.equal(await failed.evaluate(()=>kg.controller.state.player.name),'Fictional '+kind);
    await failed.close();
  }
  console.log(
    engine,
    browser.version(),
    'showed a title during download, opened settings before renderer load, restored a chosen name after a failed map, retried and resumed with one world canvas. Recovered into play after separate entry, application and shared module failures.',
  );
} finally {
  await browser.close();
}
