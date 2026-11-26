/**
 * Browser smoke for a built Knowledge Guardians checkout.
 *
 * Serve that checkout's dist directory, then run with Node 22 or newer and Chromium:
 *   node tools/smoke-worlds.mjs http://127.0.0.1:4173 /path/to/checkout
 * The second argument defaults to the working directory. A third argument of "maps" or
 * "access" runs just that check. CHROMIUM can name a different binary.
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

const [url, directory = '.', mode = 'all'] = process.argv.slice(2);
if (!url || !['all', 'maps', 'access'].includes(mode)) {
  throw new Error('Usage: node tools/smoke-worlds.mjs URL [built checkout] [all|maps|access]');
}
const root = resolve(directory);

async function readRegistry() {
  const require = createRequire(join(root, 'package.json'));
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
  const server = await createServer({ root, server: { middlewareMode: true, watch: null } });
  try {
    const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
    return Object.values(MAPS).map(({ id, spawn, width, height }) => ({ id, spawn, width, height }));
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

async function button(browser, label) {
  await until(() => browser.evaluate((name) => {
    const control = [...document.querySelectorAll('button')].find((entry) =>
      !entry.disabled && (entry.textContent.trim() === name || entry.querySelector('strong')?.textContent === name));
    if (!control) return false;
    control.click();
    return true;
  }, label), 'button ' + label);
}

function sendKey(browser, key, release, shift = false) {
  const nativeCodes = { Escape: 27, Tab: 9, Enter: 13, End: 35, ' ': 32,
    ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
  const keyCode = nativeCodes[key];
  const text = !release && key === 'Enter' ? '\r' : undefined;
  const data = { key, code: key === ' ' ? 'Space' : key, modifiers: shift ? 8 : 0,
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

const maps = await readRegistry();
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
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 960, height: 640, deviceScaleFactor: 1, mobile: false });
  await browser.send('Page.navigate', { url });
  await button(browser, 'New game');
  await button(browser, 'Begin');
  await until(() => browser.evaluate(() => window.kg?.world?.map?.id === 'nexus.archive'), 'new Guardian in the Nexus');
  await until(() => browser.evaluate(() => !!document.querySelector('[role="dialog"].dialogue')), 'cold-opening dialogue');
  await browser.evaluate(() => {
    window.kg.settings.reducedMotion = true;
    window.kg.settings.reducedEffects = true;
    window.kg.ui.closeModal();
  });

  let passed = 0;
  for (const map of mode === 'access' ? [] : maps) {
    try {
      const detail = await smokeMap(browser, map);
      console.log('PASS', map.id, detail.steps + '-tile walk,', detail.colours + ' sampled colours');
      passed++;
    } catch (error) {
      console.log('FAIL', map.id, error.message);
    }
  }
  if (mode !== 'access') {
    console.log('Maps passed:', passed + '/' + maps.length);
    if (passed !== maps.length) process.exitCode = 1;
  }
  if (mode !== 'maps') {
    try {
      await smokeAccess(browser, maps.find(({ id }) => id === 'nexus.archive'));
    } catch (error) {
      console.log('FAIL', 'accessibility', error.message);
      process.exitCode = 1;
    }
  }
  for (const error of browser.faults) console.log('BROWSER', error);
  if (browser.faults.length) process.exitCode = 1;
} finally {
  browser?.close();
  chromium.kill();
  await stopped;
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
