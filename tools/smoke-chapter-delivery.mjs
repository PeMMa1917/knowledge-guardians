import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { gzipSync, gunzipSync } from 'node:zlib';
import { readdirSync, readFileSync } from 'node:fs';

const require = createRequire(
  process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url,
);
const [engine = 'chromium', url = 'http://127.0.0.1:4173'] =
  process.argv.slice(2);
const browser = await require('playwright')[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      }
    : { headless: true },
);
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  page.setDefaultTimeout(45000);
  const requests = [];
  const scripts = [];
  const errors = [];
  page.on('request', (r) =>
    requests.push(new URL(r.url()).pathname.split('/').pop()),
  );
  page.on('response', (r) => {
    if (new URL(r.url()).pathname.endsWith('.js') && r.ok()) scripts.push(r);
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  const rooms = () => requests.filter((r) => r.startsWith('room-'));
  const bytes = async () =>
    (
      await Promise.all(
        scripts.map(
          async (r) => gzipSync(await r.body(), { level: 9 }).byteLength,
        ),
      )
    ).reduce((a, b) => a + b, 0);
  const at = (id) =>
    page.waitForFunction(
      (id) => window.kg?.world?.map?.id === id && !kg.world.transitioning,
      id,
    );
  const travel = (id, x, y) =>
    page.evaluate(
      ([room, x, y]) => {
        kg.world.changeMap(room, x, y);
        kg.world.changeMap(room, x, y);
      },
      [id, x, y],
    );
  await page.goto(url);
  const newGame = page.getByRole('button', { name: /New game/ });
  await newGame.waitFor();
  assert(
    !requests.some(
      (r) => r.endsWith('.kgz') || /^(?:content|worldRuntime)-/.test(r),
    ),
  );
  const menuJS = await bytes();
  await newGame.click();
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('Fictional Tide');
  await page.getByRole('button', { name: 'Begin', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await at('nexus.archive');
  assert.equal(rooms().length, 1);
  assert(rooms()[0].startsWith('room-nexus.archive-'));
  assert(!requests.some((r) => /^(story|guide)-WORLD-(?!01)/.test(r)));
  assert(!requests.includes('council_tiles.png'));
  assert(!requests.includes('island_tiles.png'));
  const firstMapJS = await bytes();
  const firstMapData = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((r) => r.name.includes('.kgz'))
      .reduce((total, r) => total + r.encodedBodySize, 0),
  );
  const failedRoom = '**/room-nile.hall-*.kgz';
  await page.route(failedRoom, (route) => route.abort());
  await travel('nile.hall', 12, 10);
  await page
    .getByText(
      'The next map could not finish loading. Try the crossing again.',
      { exact: true },
    )
    .first()
    .waitFor();
  assert.equal(
    await page.evaluate(() => kg.controller.state.mapId),
    'nexus.archive',
  );
  await page.unroute(failedRoom);
  await travel('nile.hall', 12, 10);
  await at('nile.hall');
  assert.equal(
    rooms().filter((r) => r.startsWith('room-nile.hall-')).length,
    2,
  );
  const beforeReturn = rooms().length;
  await travel('nexus.archive', 12, 10);
  await at('nexus.archive');
  await travel('nile.hall', 12, 10);
  await at('nile.hall');
  assert.equal(rooms().length, beforeReturn);
  assert(
    await page.evaluate(() => kg.controller.suspend('Fictional chapter test')),
  );
  requests.length = 0;
  await page.reload();
  await page.getByRole('button', { name: /^Continue / }).click();
  await at('nile.hall');
  assert.equal(rooms().length, 1);
  assert(rooms()[0].startsWith('room-nile.hall-'));
  assert.equal(
    await page.evaluate(() => kg.controller.state.player.name),
    'Fictional Tide',
  );
  await page.getByRole('dialog', { name: 'Recap' }).waitFor();
  await page.keyboard.press('Escape');
  const councilImage = '**/art/generated/council_tiles.png';
  await page.route(councilImage, (route) => route.abort());
  await travel('council.hall', 12, 12);
  await page
    .getByText(
      'The next map could not finish loading. Try the crossing again.',
      { exact: true },
    )
    .first()
    .waitFor();
  assert.equal(
    await page.evaluate(() => kg.controller.state.mapId),
    'nile.hall',
  );
  await page.unroute(councilImage);
  await travel('council.hall', 12, 12);
  await at('council.hall');
  assert(await page.evaluate(() => kg.world.textures.exists('council')));
  assert(rooms().some((r) => r.startsWith('room-council.hall-')));
  if (process.argv.includes('--all-rooms')) {
    const assets = new URL('../dist/assets/', import.meta.url);
    const maps = readdirSync(assets).filter((name) => name.startsWith('room-'));
    await page.evaluate(() => {
      kg.settings.reducedMotion = true;
      kg.settings.reducedEffects = true;
    });
    for (const file of maps) {
      const { id, spawn, stamps } = JSON.parse(
        gunzipSync(readFileSync(new URL(file, assets))),
      );
      if ((await page.evaluate(() => kg.world.map.id)) !== id) {
        await page.evaluate(() => {
          const admission = [
            ...document.querySelectorAll('.content-note button'),
          ].find((button) => button.textContent === 'Go in');
          if (admission) admission.click();
          else if (kg.ui.isModalOpen()) kg.ui.closeModal();
        });
        await travel(id, spawn.x, spawn.y);
        try {
          await at(id);
        } catch (error) {
          const current = await page.evaluate(() => ({
            shown: kg.world?.map?.id,
            saved: kg.controller.state.mapId,
            transitioning: kg.world?.transitioning,
            notice: document.querySelector('[role="alert"]')?.textContent,
          }));
          throw new Error(
            'Failed to enter ' +
              id +
              ': ' +
              JSON.stringify({ current, errors, recent: requests.slice(-6) }),
            { cause: error },
          );
        }
      }
      const missing = await page.evaluate(
        (names) => {
          const manager = kg.world.textures;
          return names.filter(
            (name) =>
              !manager
                .getTextureKeys()
                .some((key) => manager.get(key).has(name)),
          );
        },
        [...new Set(stamps.flatMap((p) => [p.stamp, ...(p.anim ?? [])]))],
      );
      assert.deepEqual(missing, [], id);
    }
    console.log('Rendered', maps.length, 'rooms with their stamped artwork.');
  }
  assert.deepEqual(errors, []);
  console.log(
    engine,
    browser.version(),
    { menuJS, firstMapJS, firstMapData },
    'cold start, interrupted crossing, double input, cached revisits, direct save recovery and council journey passed.',
  );
} finally {
  await browser.close();
}
