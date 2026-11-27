import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const req = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const pw = req('playwright');
const engine = process.argv[2] || 'chromium';
const browser = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true, timeout: 50000 },
);
const page = await browser.newPage({
  viewport:
    engine === 'webkit'
      ? { width: 390, height: 844 }
      : engine === 'firefox'
        ? { width: 820, height: 1080 }
        : { width: 1280, height: 800 },
});
page.setDefaultTimeout(22000);
const faults = [];
page.on('pageerror', (e) => faults.push(String(e)));
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) faults.push(r.status() + ' ' + r.url());
});
const button = (s) => page.getByRole('button', { name: s, exact: false }).first().click();
const close = async () => {
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
};
const waitMap = (id) =>
  page.waitForFunction((id) => window.kg?.world?.map.id === id && !kg.world.transitioning, id);
async function use(id) {
  const found = await page.evaluate((id) => {
    const w = kg.world,
      c = kg.controller;
    const p = w.map.interactables.find((p) => p.id === id) || w.map.npcs.find((p) => p.id === id);
    if (!p || (p.visibleIf && !c.check(p.visibleIf))) return;
    const sx = Math.floor(w.player.sprite.x / 16),
      sy = Math.floor(w.player.sprite.y / 16);
    for (const [x, y, facing] of [
      [p.x, p.y + 1, 'up'],
      [p.x - 1, p.y, 'right'],
      [p.x + 1, p.y, 'left'],
      [p.x, p.y - 1, 'down'],
    ]) {
      if (w.collides(x * 16 + 8, y * 16 + 12) || w.bfs(sx, sy, x, y) === null) continue;
      w.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
      w.player.facing = facing;
      w.updateTarget();
      if (w.target?.obj?.id === id || w.target?.actor?.id === id) return [x, y, facing];
    }
    return { failed: true, target: w.target?.obj?.id || w.target?.actor?.id, map: w.map.id };
  }, id);
  assert.ok(Array.isArray(found), JSON.stringify({ id, found }));
  await page.keyboard.press('e');
  console.log('interact', id, found);
}

const load = (n) => JSON.parse(fs.readFileSync(new URL('../src/content/' + n, import.meta.url), 'utf8'));
const sites = load('lamplight-stations.json'),
  posts = load('ink-post-stations.json');
const people = [...load('ink-post-letters.json'), ...load('lamplight-voices.json')];
const split = ['chromium', 'firefox', 'webkit'].indexOf(engine);
try {
  await page.goto(process.argv[3], { timeout: 90000, waitUntil: 'domcontentloaded' });
  await button('New game');
  await button('Begin');
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await close();
  await waitMap('nexus.archive');
  for (const [i, site] of sites.entries())
    if (i % 3 === split) {
      const post = posts.find((p) => p.id === site.id);
      if ((await page.evaluate(() => kg.world.map.id)) !== post.map) {
        await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
        await waitMap(post.map);
      }
      for (const [j, id] of site.pair.guests.entries()) {
        const guest = people.find((p) => p.id === id);
        await use('ink-post.' + site.id);
        await button('call a guest to the lantern');
        await page.getByRole('searchbox').fill(guest.name);
        await button(guest.name + ' ·');
        await page.locator('[data-lantern-piece="' + j + '"]').click();
        await page.locator('[data-lantern-piece="2"]').click();
        await button(guest.folds[j].action);
        await close();
        await use('lamplight.' + site.id + '.bench');
        await button(guest.name + ' ·');
        await button(site.uses[j].action);
        await close();
      }
      await use('lamplight.' + site.id + '.bench');
      await button(people.find((p) => p.id === site.pair.guests[0]).name + '’s sheet');
      await button('Both sheets');
      await button(people.find((p) => p.id === site.pair.guests[1]).name + '’s sheet');
      for (const option of site.pair.choices) {
        await button(option.action);
        await page.getByText(option.reply, { exact: true }).first().waitFor();
      }
      if (site.id === 'gate' || site.id === 'dispatch') {
        const gate = site.id === 'gate';
        await page
          .locator('summary')
          .filter({ hasText: gate ? 'A bell for the empty cradle' : 'The four windows that answered' })
          .click();
        for (const choice of gate
          ? ['Clip at 2 marks', 'Clip at 5 marks', 'Leave the high clip']
          : [
              'Stretch the cord over replies',
              'Stretch the cord over the whole rota',
              'Send the runner to the dark windows now',
            ])
          await button(choice);
      }
      await close();
      console.log('PASS', engine, site.id, site.pair.title);
    }
  assert.deepEqual(
    faults.filter((s) => !s.includes('favicon')),
    [],
  );
  console.log(engine, browser.version(), 'passed both endings at each of five physical stations');
} finally {
  await browser.close();
}
