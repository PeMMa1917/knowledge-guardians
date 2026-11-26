/**
 * Browser smoke for a built Knowledge Guardians checkout.
 *
 * Serve that checkout's dist directory, then run with Node 22 or newer and Chromium:
 *   node tools/smoke-worlds.mjs http://127.0.0.1:4173 /path/to/checkout
 * The second argument defaults to the working directory. The optional third argument selects
 * "maps", "access", "collections", "stress", "soak", "events" or "guidance".
 * CHROMIUM can name a different binary. KG_SOAK_MINUTES sets the real-time soak length (default 60).
 *
 * The script starts a new game and uses debug entry at each registered spawn. Its traversal
 * check uses the live scene's pathfinder and animation. It does not complete chapter gates.
 */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { smokeCollections } from './smoke-collections.mjs';
import { smokeNavigation, smokeWallRealtime } from './smoke-navigation.mjs';
import { smokeGuidance } from './smoke-guidance.mjs';

const [url, directory = '.', mode = 'all'] = process.argv.slice(2);
if (!url || !['all', 'maps', 'access', 'collections', 'stress', 'soak', 'events', 'guidance'].includes(mode)) {
  throw new Error('Usage: node tools/smoke-worlds.mjs URL [built checkout] [all|maps|access|collections|stress|soak|events|guidance]');
}
const root = resolve(directory);

async function readRegistry() {
  const require = createRequire(join(root, 'package.json'));
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
  const server = await createServer({
    configFile: false, root, optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
  });
  try {
    const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
    const { STAMPS } = await server.ssrLoadModule('/src/scenes/art.ts');
    return Object.values(MAPS).map(({ id, spawn, width, height, blocks, stamps }) => {
      const stampBlocks = stamps.flatMap((stamp) => {
        const blocked = STAMPS[stamp.stamp]?.collide;
        return blocked ? [[stamp.x + blocked[0], stamp.y + blocked[1], blocked[2], blocked[3]]] : [];
      });
      return { id, spawn, width, height, walls: [...blocks, ...stampBlocks] };
    });
  } finally {
    await server.close();
  }
}

async function until(action, description, timeout = 25_000) {
  const stop = Date.now() + timeout;
  while (Date.now() < stop) {
    const value = await action();
    if (value) return value;
    await delay(80);
  }
  throw new Error('Timed out: ' + description);
}

async function connect(profile) {
  const portFile = join(profile, 'DevToolsActivePort');
  const port = await until(async () => (await readFile(portFile, 'utf8').catch(() => '')).split('\n')[0], 'Chromium startup');
  const tabs = await fetch('http://127.0.0.1:' + port + '/json/list').then((response) => response.json());
  const page = tabs.find((entry) => entry.type === 'page');
  if (!page) throw new Error('Chromium did not open a page');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((accept, reject) => {
    socket.addEventListener('open', accept, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  const handlers = new Map();
  const faults = [];
  let command = 0;
  socket.addEventListener('message', ({ data }) => {
    const response = JSON.parse(data);
    const handler = handlers.get(response.id);
    if (handler) {
      handlers.delete(response.id);
      if (response.error) handler.reject(new Error(response.error.message));
      else handler.accept(response.result);
    }
    if (response.method === 'Runtime.exceptionThrown') {
      const details = response.params.exceptionDetails;
      faults.push(details.exception?.description ?? details.text);
    }
    if (response.method === 'Network.responseReceived' && response.params.response.status >= 400) {
      const { status, url } = response.params.response;
      if (!url.endsWith('/favicon.ico')) faults.push('HTTP ' + status + ' ' + url);
    }
  });
  const send = (method, params = {}) => new Promise((accept, reject) => {
    const id = ++command;
    handlers.set(id, { accept, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (fn, data) => {
    const expression = '(' + fn.toString() + ')(' + JSON.stringify(data) + ')';
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) {
      const details = response.exceptionDetails;
      throw new Error(details.exception?.description ?? details.text);
    }
    return response.result.value;
  };
  return { send, evaluate, faults, close: () => socket.close() };
}

async function button(browser, label, timeout) {
  await until(() => browser.evaluate((name) => {
    const control = [...document.querySelectorAll('button')].find((entry) =>
      !entry.disabled && (entry.textContent.trim() === name || entry.querySelector('strong')?.textContent === name));
    if (!control) return false;
    control.click();
    return true;
  }, label), 'button ' + label, timeout);
}

function sendKey(browser, key, release, shift = false) {
  const nativeCodes = { Escape: 27, Tab: 9, Enter: 13, End: 35, ' ': 32,
    ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, e: 69, j: 74, b: 66 };
  const keyCode = nativeCodes[key];
  const text = !release && key === 'Enter' ? '\r' : undefined;
  const data = { key, code: key === ' ' ? 'Space' : /^[a-z]$/.test(key) ? 'Key' + key.toUpperCase() : key, modifiers: shift ? 8 : 0,
    windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, text,
    type: release ? 'keyUp' : text ? 'keyDown' : 'rawKeyDown' };
  return browser.send('Input.dispatchKeyEvent', data);
}

async function press(browser, key, shift = false) {
  await sendKey(browser, key, false, shift);
  await sendKey(browser, key, true, shift);
}

async function tabTo(browser, label) {
  for (let index = 0; index < 35; index++) {
    const found = await browser.evaluate((label) => {
      const active = document.activeElement;
      const name = active?.getAttribute('aria-label') || active?.closest('label')?.textContent || active?.textContent;
      return active?.closest('[role="dialog"]') && name?.trim().startsWith(label);
    }, label);
    if (found) return;
    await press(browser, 'Tab');
  }
  throw new Error('Tab could not reach ' + label);
}

async function smokeAccess(browser, nexus) {
  await browser.evaluate(({ id, spawn }) => window.kg.world.changeMap(id, spawn.x, spawn.y), nexus);
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'nexus.archive' && !window.kg.world.transitioning), 'Nexus for accessibility checks');
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await press(browser, 'Escape');
  await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Menu"]')), 'Escape opens the menu');
  await tabTo(browser, 'Settings');
  await press(browser, 'Enter');
  await until(() => browser.evaluate(() =>
    !!document.querySelector('[role="dialog"][aria-label="Settings"]') && document.activeElement?.getAttribute('aria-label') === 'Close'),
  'Enter opens Settings and moves focus');
  await press(browser, 'Tab', true);
  await until(() => browser.evaluate(() => document.activeElement?.closest('label')?.textContent.includes('Sound effects volume')), 'Shift+Tab wraps to the last setting');
  await press(browser, 'Tab');
  await until(() => browser.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Close'), 'Tab wraps to the first setting');
  await tabTo(browser, 'Text size');
  await press(browser, 'End');
  await until(() => browser.evaluate(() => window.kg.settings.textScale === 1.75), 'End reaches the largest text option');
  await press(browser, 'ArrowUp');
  await until(() => browser.evaluate(() => window.kg.settings.textScale === 1.5), 'ArrowUp changes the native select');
  await press(browser, 'ArrowDown');
  await until(() => browser.evaluate(() => window.kg.settings.textScale === 1.75 &&
    document.documentElement.style.getPropertyValue('--text-scale') === '1.75'), 'keyboard selects 175% text');
  for (const control of ['High-contrast interface', 'Wider letter and line spacing', 'Calm mode:', 'Sound captions:']) {
    await tabTo(browser, control);
    if (!await browser.evaluate(() => document.activeElement.checked)) await press(browser, ' ');
    await until(() => browser.evaluate(() => document.activeElement.checked === true), 'Space enables ' + control);
  }
  const dimensions = await browser.evaluate(() => {
    const panel = document.querySelector('[role="dialog"]');
    return { content: panel.scrollWidth, width: panel.clientWidth, page: document.documentElement.scrollWidth, viewport: window.innerWidth };
  });
  if (dimensions.content > dimensions.width + 1 || dimensions.page > dimensions.viewport) {
    throw new Error('Settings overflows horizontally at 175% text: ' + JSON.stringify(dimensions));
  }
  await press(browser, 'Escape');
  await until(() => browser.evaluate(() =>
    !document.querySelector('[role="dialog"]') && document.activeElement === document.querySelector('#game canvas')), 'Escape returns focus to the canvas');
  const movement = await browser.evaluate(() => {
    const world = window.kg.world;
    const { x, y } = world.player.sprite;
    const tx = Math.floor(x / 16);
    const ty = Math.floor(y / 16);
    const choices = [
      { key: 'ArrowLeft', dx: -1, dy: 0 }, { key: 'ArrowRight', dx: 1, dy: 0 },
      { key: 'ArrowUp', dx: 0, dy: -1 }, { key: 'ArrowDown', dx: 0, dy: 1 },
    ];
    const direction = choices.find(({ dx, dy }) => world.blocked[ty + dy]?.[tx + dx] === false);
    return direction && { ...direction, x, y };
  });
  if (!movement) throw new Error('No path to test keyboard movement after closing Settings');
  try {
    await sendKey(browser, movement.key, false);
    await until(() => browser.evaluate(({ dx, dy, x, y }) => {
      const sprite = window.kg.world.player.sprite;
      return (sprite.x - x) * dx + (sprite.y - y) * dy >= 4;
    }, movement), 'world responds to an arrow key after closing Settings');
  } finally {
    await sendKey(browser, movement.key, true);
  }

  // Stage the clock only. The ordinary event deck, modal and Later action run in the browser.
  const seen = await browser.evaluate(() => {
    const controller = window.kg.controller;
    const count = controller.state.events.seen.length;
    controller.state.events.clock = controller.state.events.next - 1;
    controller.dispatch({ type: 'Explore', seconds: 1 });
    return count;
  });
  await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"].event') &&
    document.activeElement?.textContent === 'Now'), 'Calm shows a focused warning for the due event');
  await tabTo(browser, 'Later');
  await press(browser, 'Enter');
  await until(() => browser.evaluate((count) => {
    const { events } = window.kg.controller.state;
    return !events.pending && events.seen.length === count && !document.querySelector('[role="dialog"]');
  }, seen), 'Later defers the event without consuming it');
  console.log('PASS keyboard focus, 175% text at 390px, settings toggles, and Calm Later with a staged event clock');
}

async function smokeResize(browser) {
  const savedMap = await browser.evaluate(() => {
    const world = window.kg.world;
    window.resizeCameraCalls = 0;
    const fitCamera = world.fitCamera;
    world.fitCamera = function () {
      window.resizeCameraCalls++;
      return fitCamera.call(this);
    };
    return world.map.id;
  });
  const resize = async (width) => {
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await until(() => browser.evaluate((w) => document.querySelector('#game canvas')?.width === w, width), `canvas resizes to ${width}px`);
  };

  await resize(392);
  const calls = await browser.evaluate(() => window.resizeCameraCalls);
  if (calls !== 1) throw new Error(`One resize ran ${calls} world camera callbacks`);

  await press(browser, 'Escape');
  await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Menu"]')), 'menu before leaving');
  await button(browser, 'Save and leave');
  await until(() => browser.evaluate(() => !window.kg.world), 'return to title');
  await resize(390);
  if (await browser.evaluate(() => window.resizeCameraCalls) !== calls) throw new Error('World camera callback ran on the title screen');

  await button(browser, 'Continue');
  await until(() => browser.evaluate((id) => window.kg.world?.map.id === id && !window.kg.world.transitioning, savedMap), 'resume a saved map after resizing');
  console.log('PASS one world camera resize callback, none on the title screen, and Continue after resizing');
}

async function smokeInteractionPrompt(browser) {
  await browser.evaluate(() => {
    const { controller, world } = window.kg;
    controller.state.objectivesDone.push('coast.revise');
    controller.dispatch({ type: 'SetFlag', flag: 'forest.arrived', value: true });
    world.changeMap('forest.trail', 22, 6);
  });
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'forest.trail' && !window.kg.world.transitioning), 'reed hollow approach');
  await browser.evaluate(() => { window.kg.world.player.facing = 'up'; });
  const label = 'Use the raised cloth flap at the reed hollow';
  await until(() => browser.evaluate((text) => document.querySelector('.prompt:not([hidden])')?.textContent.trim().endsWith(text), label), 'raised reed hollow prompt');

  for (const [width, height] of [[390, 844], [320, 568], [844, 390], [320, 568]]) {
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await until(() => browser.evaluate((w) => document.querySelector('#game canvas')?.width === w, width), `prompt viewport ${width}px`);
    const problems = await browser.evaluate((text) => {
      const { settings, ui } = window.kg;
      ui.lumenSay('Look where the lower rail meets the reeds.');
      const prompt = document.querySelector('.prompt:not([hidden])');
      if (!prompt?.textContent.trim().endsWith(text)) return ['Full interaction prompt missing'];
      const tracker = document.querySelector('.tracker').getBoundingClientRect();
      const hint = document.querySelector('.lumen-bubble').getBoundingClientRect();
      const box = prompt.getBoundingClientRect();
      const controls = [...document.querySelectorAll('.hud-buttons button, .compass, .lumen-bubble button')];
      const bad = [];
      if (settings.textScale !== 1.75 || !settings.calmMode || getComputedStyle(prompt).fontSize !== '28px') bad.push('Text scale or Calm changed');
      if (prompt.scrollHeight > prompt.clientHeight || prompt.scrollWidth > prompt.clientWidth) bad.push('Prompt needs to scroll');
      if (box.left < 0 || box.right > innerWidth || box.top < 0 || box.bottom > innerHeight) bad.push('Prompt outside viewport');
      if (tracker.bottom >= hint.top || hint.bottom >= box.top) bad.push('Tracker, hint and prompt overlap');
      if (hint.top - tracker.bottom < 44 || document.elementFromPoint(innerWidth / 2, (tracker.bottom + hint.top) / 2)?.tagName !== 'CANVAS') bad.push('No clear touch path to the world');
      for (const button of [prompt, ...controls]) {
        const r = button.getBoundingClientRect();
        if (r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight || r.width < 44 || r.height < 44) bad.push(`Control outside its touch area: ${button.textContent.trim()}`);
        if (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('button') !== button) bad.push(`Covered control: ${button.textContent.trim()}`);
        if (button !== prompt && r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top) bad.push(`Prompt overlaps control: ${button.textContent.trim()}`);
      }
      return bad;
    }, label);
    if (problems.length) throw new Error(`${width} × ${height}: ${problems.join(', ')}`);
  }

  const tap = async (selector) => {
    const point = await browser.evaluate((query) => {
      const r = document.querySelector(query).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, selector);
    await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await browser.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  try {
    await tap('.hud-buttons button[title="Menu (Esc)"]');
    await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Menu"]')), 'tap opens the menu beside the prompt');
    await press(browser, 'Escape');
    await until(() => browser.evaluate(() => !!document.querySelector('.prompt:not([hidden])')), 'prompt after leaving menu');
    await tap('.prompt');
    await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Watch the reed hollow"]')), 'tap uses the full reed hollow prompt');
    await press(browser, 'Escape');
  } finally {
    await browser.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  console.log('PASS full prompt, hint and touch controls at 320px, 390px and short landscape with 175% text and Calm');
}

async function snapshot(browser) {
  return browser.evaluate(() => {
    const { game } = window.kg.world;
    return new Promise((accept, reject) => {
      const timeout = setTimeout(() => reject(new Error('Renderer did not return a frame')), 12_000);
      game.renderer.snapshot((frame) => {
        const sample = document.createElement('canvas');
        sample.width = 64;
        sample.height = 48;
        const context = sample.getContext('2d');
        context.drawImage(frame, 0, 0, sample.width, sample.height);
        const bytes = context.getImageData(0, 0, sample.width, sample.height).data;
        const colours = new Set();
        for (let i = 0; i < bytes.length; i += 4) colours.add((bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]);
        clearTimeout(timeout);
        accept(colours.size);
      });
    });
  });
}

async function smokeMap(browser, map) {
  await browser.evaluate(({ id, spawn }) => window.kg.world.changeMap(id, spawn.x, spawn.y), map);
  await until(() => browser.evaluate(({ id, width, height, spawn }) => {
    const world = window.kg.world;
    return world.map.id === id && !world.transitioning && world.scene.isActive() &&
      Math.floor(world.player.sprite.x / 16) === spawn.x && Math.floor(world.player.sprite.y / 16) === spawn.y &&
      world.children.list.some((child) => child.type === 'RenderTexture' && child.width === width * 16 && child.height === height * 16);
  }, map), 'world and floor ' + map.id);

  const result = await browser.evaluate(({ x, y }) => {
    const world = window.kg.world;
    const forbidden = (tile) => world.map.zones.some((zone) => zone.to &&
      tile.x >= zone.x && tile.x < zone.x + zone.w && tile.y >= zone.y && tile.y < zone.y + zone.h);
    const reachable = [];
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const target = { x: x + dx, y: y + dy };
        if (world.blocked[target.y]?.[target.x] !== false) continue;
        const route = world.bfs(x, y, target.x, target.y);
        if (route?.length && route.length <= 4 && !route.some(forbidden)) reachable.push({ target, length: route.length });
      }
    }
    reachable.sort((a, b) => Math.abs(a.length - 2) - Math.abs(b.length - 2));
    const next = reachable[0];
    if (next) world.walkTo(next.target.x, next.target.y, null);
    return {
      spawnBlocked: world.blocked[y]?.[x],
      missingArt: world.map.interactables.filter((prop) => prop.art && !world.textures.exists(prop.art)).map(({ id }) => id),
      next,
    };
  }, map.spawn);
  if (result.spawnBlocked !== false) throw new Error('spawn tile is blocked');
  if (result.missingArt.length) throw new Error('unregistered art at ' + result.missingArt.join(', '));
  if (!result.next) throw new Error('no short walk from spawn');
  await until(() => browser.evaluate(({ id, target }) => {
    const world = window.kg.world;
    return world.map.id === id && !world.path.length &&
      Math.floor(world.player.sprite.x / 16) === target.x && Math.floor(world.player.sprite.y / 16) === target.y;
  }, { id: map.id, target: result.next.target }), 'walk from ' + map.id);

  const colours = await snapshot(browser);
  if (colours < 12) throw new Error('frame contains only ' + colours + ' sampled colours');
  return { colours, steps: result.next.length };
}

const maps = ['all', 'maps', 'access', 'stress'].includes(mode) ? await readRegistry() : [];
const profile = await mkdtemp(join(tmpdir(), 'kg-browser-smoke-'));
const chromium = spawn(process.env.CHROMIUM ?? 'chromium', [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--no-proxy-server', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], { stdio: 'ignore' });
const stopped = new Promise((accept) => {
  chromium.once('exit', accept);
  chromium.once('error', accept);
});
let browser;
try {
  browser = await connect(profile);
  await browser.send('Runtime.enable');
  await browser.send('Network.enable');
  const [width, height] = mode === 'stress' || mode === 'soak' ? [640, 400] : [960, 640];
  await browser.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await browser.send('Page.navigate', { url });
  await button(browser, 'New game', 60_000);
  await button(browser, 'Begin');
  await until(() => browser.evaluate(() => window.kg?.world?.map?.id === 'nexus.archive'), 'new Guardian in the Nexus');
  await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"].dialogue')), 'cold-opening dialogue');
  await browser.evaluate(() => {
    window.kg.settings.reducedMotion = true;
    window.kg.settings.reducedEffects = true;
    window.kg.ui.closeModal();
  });

  let passed = 0;
  for (const map of mode === 'all' || mode === 'maps' ? maps : []) {
    try {
      const detail = await smokeMap(browser, map);
      console.log('PASS', map.id, detail.steps + '-tile walk,', detail.colours + ' sampled colours');
      passed++;
    } catch (error) {
      console.log('FAIL', map.id, error.message);
    }
  }
  if (mode === 'all' || mode === 'maps') {
    console.log('Maps passed:', passed + '/' + maps.length);
    if (passed !== maps.length) process.exitCode = 1;
  }
  if (mode === 'all' || mode === 'access') {
    try {
      await smokeAccess(browser, maps.find(({ id }) => id === 'nexus.archive'));
      await smokeInteractionPrompt(browser);
      await smokeResize(browser);
    } catch (error) {
      console.log('FAIL', 'accessibility', error.message);
      process.exitCode = 1;
    }
  }
  if (mode === 'collections') await smokeCollections(browser, { button, press, until });
  if (mode === 'stress') await smokeNavigation(browser, { press, until }, maps);
  if (mode === 'soak') await smokeWallRealtime(browser, { until });
  if (mode === 'guidance') await smokeGuidance(browser, { button, press, until });
  if (mode === 'events') {
    const { smokeEvents } = await import('./smoke-events.mjs');
    await smokeEvents(browser, { button, press, until });
  }
  for (const error of browser.faults) console.log('BROWSER', error);
  if (browser.faults.length) process.exitCode = 1;
} finally {
  browser?.close();
  chromium.kill();
  await stopped;
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
