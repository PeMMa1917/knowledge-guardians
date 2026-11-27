import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const [
  engine = 'chromium',
  base = 'http://127.0.0.1:4173',
  caseId = 'bank',
  durationText = '3600',
] = process.argv.slice(2);
const seconds = Number(durationText);
assert.ok(
  Number.isFinite(seconds) && seconds > 0 && seconds <= 86400,
  'Pass the hold duration in real seconds.',
);
const scenes = {
  bank: {
    map: 'water.gatehouse',
    spawn: [13, 12],
    zone: [18, 11, 20, 12],
    floor: 'water',
    diagonal: false,
  },
  house: {
    map: 'aethelgard.emberford',
    spawn: [10, 8],
    zone: [2, 2, 6, 5],
    diagonal: false,
  },
  corner: { map: 'stage.plum-loft', spawn: [10, 13], diagonal: true },
  shore: {
    map: 'water.gatehouse',
    spawn: [13, 12],
    zone: [18, 15, 20, 18],
    floor: 'water',
    diagonal: false,
  },
};
const test = scenes[caseId];
assert.ok(test, 'Choose bank, house, shore or corner.');
const pw = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url)(
  'playwright',
);
const b = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true },
);
const page = await b.newPage({
  viewport:
    engine === 'webkit'
      ? { width: 390, height: 844 }
      : { width: 820, height: 720 },
  reducedMotion: 'reduce',
});
page.setDefaultTimeout(90000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() =>
  localStorage.setItem(
    'kg.settings',
    JSON.stringify({
      reducedMotion: true,
      reducedEffects: true,
      zenMode: true,
      musicVolume: 0,
      sfxVolume: 0,
    }),
  ),
);
try {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^New game/ }).click();
  const begin = page.getByRole('button', { name: 'Begin', exact: true });
  await begin.focus();
  await begin.press('Enter', { timeout: 180000 });
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  // The opening can still have a queued scene transition when its dialogue closes.
  // Stage the location only after it settles. No position is touched during a hold.
  await page.waitForFunction(
    () => window.kg?.world?.map && !kg.world.transitioning,
  );
  console.log(
    'STAGING',
    engine,
    caseId,
    await page.evaluate(() => kg.world.map.id),
  );
  await page.evaluate((st) => kg.world.changeMap(st.map, ...st.spawn), test);
  try {
    await page.waitForFunction(
      (map) => kg.world.map.id === map && !kg.world.transitioning,
      test.map,
      { timeout: 90000 },
    );
  } catch (error) {
    console.log(
      'Arrival state',
      await page.evaluate(() => ({
        map: kg.world.map?.id,
        saved: kg.controller.state.mapId,
        transitioning: kg.world.transitioning,
        modal: document
          .querySelector('[role=dialog]')
          ?.textContent?.slice(0, 90),
      })),
    );
    console.log('Runtime messages', errors);
    throw error;
  }
  if (await page.getByRole('dialog').isVisible())
    await page.keyboard.press('Escape');
  const setup = await page.evaluate((st) => {
    const w = kg.world,
      m = w.map;
    const dirs = [
      ['ArrowUp', 0, -1, 'UP'],
      ['ArrowRight', 1, 0, 'RIGHT'],
      ['ArrowDown', 0, 1, 'DOWN'],
      ['ArrowLeft', -1, 0, 'LEFT'],
    ];
    const open = (x, y) => w.blocked[y]?.[x] === false;
    const within = (x, y) =>
      !st.zone ||
      (x >= st.zone[0] &&
        x <= st.zone[2] &&
        y >= st.zone[1] &&
        y <= st.zone[3]);
    const insidePortal = (x, y) =>
      m.zones.some(
        (z) => z.to && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h,
      );
    const fromX = Math.floor(w.player.sprite.x / 16),
      fromY = Math.floor(w.player.sprite.y / 16);
    for (let y = 1; y < m.height - 1; y++)
      for (let x = 1; x < m.width - 1; x++) {
        if (!open(x, y) || insidePortal(x, y)) continue;
        for (let i = 0; i < 4; i++) {
          const a = dirs[i],
            other = dirs[(i + 1) % 4],
            keys = st.diagonal ? [a, other] : [a],
            away = dirs[(i + 2) % 4];
          const wallX = x + a[1],
            wallY = y + a[2];
          if (
            !within(wallX, wallY) ||
            (st.floor && !m.floor(wallX, wallY)?.includes(st.floor))
          )
            continue;
          if (!keys.every(([, dx, dy]) => !open(x + dx, y + dy))) continue;
          if (
            !open(x + away[1], y + away[2]) ||
            insidePortal(x + away[1], y + away[2])
          )
            continue;
          if (st.diagonal && open(x + a[1] + other[1], y + a[2] + other[2]))
            continue;
          if (w.bfs(fromX, fromY, x, y) === null) continue;
          // Stage the approach once. From here on, only genuine keyboard events move the player.
          w.player.sprite.setPosition(x * 16 + 8, y * 16 + 8);
          w.updateTarget();
          return { x, y, wallX, wallY, keys, away };
        }
      }
    return null;
  }, test);
  assert.ok(
    setup,
    'A reachable free tile with a passable retreat must meet the named solid surface.',
  );
  for (const [key] of setup.keys) await page.keyboard.down(key);
  const snapshot = () =>
    page.evaluate((keys) => {
      const w = kg.world,
        p = w.player.sprite;
      return {
        x: p.x,
        y: p.y,
        frame: w.game.loop.frame,
        held: keys.every((k) => w.keys[k[3]].isDown),
        scene: w.map.id,
        blocked: w.collides(p.x, p.y),
        paused: w.paused || !!document.querySelector('[role="dialog"]'),
        active: w.player.sprite.active,
        dialog:
          document.querySelector('[role=dialog]')?.getAttribute('aria-label') ??
          null,
      };
    }, setup.keys);
  const started = performance.now();
  await page.waitForFunction(
    (keys) => keys.every((k) => kg.world.keys[k[3]].isDown),
    setup.keys,
  );
  await delay(1400);
  let last = await snapshot();
  const check = (s) => {
    assert.equal(s.scene, test.map);
    assert.equal(s.paused, false, JSON.stringify(s));
    assert.equal(s.held, true);
    assert.equal(s.blocked, false, 'the foot rectangle overlaps a solid');
    assert.equal(s.active, true);
    assert.equal(Math.floor(s.x / 16), setup.x);
    assert.equal(Math.floor(s.y / 16), setup.y);
  };
  check(last);
  console.log(
    'BOUNDARY',
    engine,
    b.version(),
    caseId,
    test.map,
    JSON.stringify(setup),
  );
  let nextNote = 300;
  while ((performance.now() - started) / 1000 < seconds) {
    const remaining = seconds - (performance.now() - started) / 1000;
    await delay(Math.min(30000, Math.max(30, remaining * 1000)));
    const now = await snapshot();
    check(now);
    if (remaining > 2)
      assert.ok(now.frame > last.frame, 'the game must continue rendering');
    // A larger frame can advance the last fraction of a pixel until contact. It cannot enter the next tile.
    last = now;
    const elapsed = (performance.now() - started) / 1000;
    if (elapsed >= nextNote) {
      console.log('HOLD', engine, caseId, Math.round(elapsed), now.frame);
      nextNote += 300;
    }
  }
  for (const [key] of setup.keys) await page.keyboard.up(key);
  await page.keyboard.down(setup.away[0]);
  await page.waitForFunction((s) => {
    const p = kg.world.player.sprite;
    return (
      Math.floor(p.x / 16) === s.x + s.away[1] &&
      Math.floor(p.y / 16) === s.y + s.away[2]
    );
  }, setup);
  await page.keyboard.up(setup.away[0]);
  assert.deepEqual(errors, []);
  console.log(
    'RELEASED',
    engine,
    caseId,
    Math.round((performance.now() - started) / 1000),
    'real seconds, safe retreat',
  );
} finally {
  await b.close();
}
