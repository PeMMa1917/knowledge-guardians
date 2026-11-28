/** Visit each field station through its map target at a selected viewport and game text scale.
 * Only the story gate and adjacent position are staged. Do not infer a complete campaign walk from this sweep. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { coexist } from './choice-rehearsal.mjs';

const [
  engine = 'chromium',
  address = 'http://localhost:4173',
  size = '320x568',
  scaleText = '1.75',
  startText = '0',
  countText = '12000',
] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number),
  scale = Number(scaleText),
  start = Number(startText),
  count = Number(countText);
assert.ok(
  [width, height, start, count].every(Number.isSafeInteger) &&
    width >= 240 &&
    height >= 240 &&
    scale >= 1 &&
    scale <= 2 &&
    start >= 0 &&
    count > 0,
);
const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
let stations;
try {
  const [{ MAPS }, { buildPack }, { check }, { newCampaign }] = await Promise.all(
    ['maps/index', 'content/index', 'domain/rules', 'domain/engine'].map((path) =>
      vite.ssrLoadModule('/src/' + path + '.ts'),
    ),
  );
  const base = newCampaign(buildPack(), 'Robin at the Ferry', 'fictional-guardian', 47);
  stations = Object.values(MAPS).flatMap((room) =>
    room.interactables
      .filter((prop) => prop.kind === 'fieldgame' && prop.game)
      .map((prop) => {
        const fixture = coexist(base, prop.visibleIf, undefined, check);
        const gate =
          fixture &&
          Object.fromEntries(
            ['flags', 'cards', 'objectivesDone', 'inventory', 'relations', 'marks', 'player']
              .filter((k) => fixture[k] !== base[k])
              .map((k) => [k, fixture[k]]),
          );
        return { room: room.id, spawn: room.spawn, id: prop.id, game: prop.game, label: prop.label, gate };
      }),
  );
} finally {
  await vite.close();
}

const pw = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url)('playwright');
const browser = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : {},
);
try {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.setDefaultTimeout(30000);
  await page.addInitScript(
    ({ scale }) => {
      localStorage.setItem(
        'kg.settings',
        JSON.stringify({
          textScale: scale,
          musicVolume: 0,
          sfxVolume: 0,
          zenMode: true,
          calmMode: true,
          reducedMotion: true,
          reducedEffects: true,
          captions: true,
        }),
      );
    },
    { scale },
  );
  await page.goto(address, { waitUntil: 'domcontentloaded' });
  const press = async (b) => {
    await b.focus();
    await b.press('Enter');
  };
  await press(page.getByRole('button', { name: /New game/ }).first());
  await press(page.getByRole('button', { name: 'Begin', exact: true }));
  const dialog = page.getByRole('dialog');
  await dialog
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => kg.world?.map && !kg.world.transitioning);
  const clean = await page.evaluate(() =>
    Object.fromEntries(
      ['flags', 'cards', 'objectivesDone', 'inventory', 'relations', 'marks', 'player'].map((k) => [
        k,
        kg.controller.state[k],
      ]),
    ),
  );
  // Keep the recorded fictional sign-in and world; replace only the fields used by a placement condition.
  let roomNow = '',
    passed = 0;
  const families = (process.env.KG_STATION_GAMES || '').split(',').filter(Boolean);
  const selected = stations
    .slice(start, start + count)
    .map((site, i) => [i, site])
    .filter(
      ([, site]) =>
        !families.length ||
        families.some((family) => site.game === family || site.game.startsWith(family + ':')),
    );
  for (const [i, site] of selected) {
    const entry = {
      index: start + i,
      engine,
      size,
      scale,
      room: site.room,
      station: site.id,
      game: site.game,
    };
    const before = pageErrors.length;
    try {
      assert.ok(site.gate, 'No supported witness for this placement condition');
      if (await dialog.isVisible()) {
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden', timeout: 12000 });
      }
      if (roomNow !== site.room) {
        await page.evaluate(({ room, spawn }) => kg.world.changeMap(room, spawn.x, spawn.y), site);
        await page.waitForFunction((id) => kg.world.map.id === id && !kg.world.transitioning, site.room);
        roomNow = site.room;
        if (await dialog.isVisible()) {
          const entryChoice = dialog.getByRole('button', { name: 'Go in', exact: true });
          if (await entryChoice.isVisible()) await press(entryChoice);
          else await page.keyboard.press('Escape');
          await dialog.waitFor({ state: 'hidden', timeout: 12000 });
        }
      }
      const approach = await page.evaluate(
        ({ site, clean }) => {
          const w = kg.world,
            c = kg.controller;
          for (const [key, val] of Object.entries(clean))
            c.state[key] = structuredClone(site.gate[key] ?? val);
          w.refreshWorld();
          const p = w.map.interactables.find((obj) => obj.id === site.id);
          if (!p || !c.check(p.visibleIf)) return { reason: 'placement hidden in ' + w.map.id };
          const origin = w.map.spawn;
          const sides = [];
          for (let x = p.x; x < p.x + (p.w ?? 1); x++)
            sides.push([x, p.y + (p.h ?? 1), 'up'], [x, p.y - 1, 'down']);
          for (let y = p.y; y < p.y + (p.h ?? 1); y++)
            sides.push([p.x - 1, y, 'right'], [p.x + (p.w ?? 1), y, 'left']);
          const obstacles = [];
          for (const [x, y, facing] of sides) {
            if (w.collides(x * 16 + 8, y * 16 + 12)) {
              obstacles.push('solid');
              continue;
            }
            if (w.bfs(origin.x, origin.y, x, y) === null) {
              obstacles.push('no path from room spawn');
              continue;
            }
            w.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
            w.player.facing = facing;
            w.updateTarget();
            if (w.target?.obj?.id === site.id) return { x, y, facing };
            obstacles.push('target ' + (w.target?.obj?.id ?? w.target?.actor?.id ?? 'none'));
          }
          return { reason: obstacles.join(' / ') };
        },
        { site, clean },
      );
      assert.ok(approach.facing, approach.reason);
      entry.approach = approach;
      await page.keyboard.press('e');
      await dialog.waitFor({ timeout: 12000 });
      const result = await dialog.evaluate((d) => {
        const box = d.getBoundingClientRect();
        const visible = (el) => {
          if (
            !el.getClientRects().length ||
            getComputedStyle(el).visibility === 'hidden' ||
            el.closest('[hidden],[inert]')
          )
            return false;
          for (
            let fold = el.closest('details:not([open])');
            fold;
            fold = fold.parentElement?.closest('details:not([open])')
          ) {
            if (!fold.querySelector(':scope > summary')?.contains(el)) return false;
          }
          return true;
        };
        const active = [
          ...d.querySelectorAll(
            'button,input:not([type=hidden]),select,textarea,summary,a[href],[tabindex="0"]',
          ),
        ].filter((el) => !el.disabled && visible(el));
        const unlabeled = active.filter(
          (el) =>
            !(
              el.getAttribute('aria-label') ||
              el.getAttribute('aria-labelledby') ||
              el.labels?.length ||
              el.innerText?.trim() ||
              el.getAttribute('title') ||
              el.querySelector('img[alt]')?.alt
            ),
        );
        const width = Math.max(0, Math.round(d.scrollWidth - d.clientWidth));
        const overflowElements =
          width > 2
            ? [...d.querySelectorAll('*')]
                .filter((el) => visible(el) && el.getBoundingClientRect().right > box.right + 1)
                .slice(0, 8)
                .map((el) => ({
                  tag: el.localName,
                  type: el.getAttribute('type'),
                  class: el.className.baseVal ?? el.className,
                  width: Math.round(el.getBoundingClientRect().width),
                }))
            : undefined;
        return {
          title: d.getAttribute('aria-label') ?? d.querySelector('h1,h2')?.textContent,
          overflow: width,
          overflowElements,
          offscreen: box.left < -2 || box.right > innerWidth + 2,
          controls: active.length,
          unlabelled: unlabeled.map((el) => el.tagName + ':' + (el.name || el.className)).slice(0, 5),
        };
      });
      Object.assign(entry, result);
      assert.ok(result.title && result.controls, 'No accessible title or active control');
      assert.ok(result.overflow <= 2 && !result.offscreen, 'Station extends beyond the viewing area');
      assert.equal(result.unlabelled.length, 0, 'Visible control has no accessible name');
      await page.keyboard.press('Tab');
      assert.ok(await dialog.evaluate((d) => d.contains(document.activeElement)), 'Tab left the open panel');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden', timeout: 12000 });
      assert.deepEqual(pageErrors.slice(before), []);
      entry.result = 'passed';
      passed++;
    } catch (error) {
      entry.result = 'review';
      entry.reason = error.message.split('\n').slice(0, 3).join(' ');
      entry.pageErrors = pageErrors.slice(before);
      // Dismiss any nested help or stray scene before testing a separate placement.
      if (await dialog.isVisible()) await page.evaluate(() => kg.ui.closeModal());
    }
    console.log(JSON.stringify(entry));
  }
  const attempted = selected.length;
  assert.ok(attempted, 'No stations matched this selection');
  console.log(
    JSON.stringify({
      summary: true,
      engine,
      size,
      scale,
      start,
      available: stations.length,
      attempted,
      passed,
      review: attempted - passed,
    }),
  );
  if (attempted !== passed) process.exitCode = 1;
} finally {
  await browser.close();
}
