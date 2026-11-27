import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const [engine = 'chromium', address, mode, start = '0', count] = process.argv.slice(2);
const vite = await createServer({
  configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
let rooms, keys;
try {
  const { MAPS } = await vite.ssrLoadModule('/src/maps/index.ts');
  const { artKeys } = await vite.ssrLoadModule('/src/ui/illustrations.ts');
  keys = artKeys();
  const selected = mode === 'tour' ? Object.keys(MAPS).slice(Number(start), count ? Number(start) + Number(count) : undefined)
    : ['nexus.archive', 'aethelgard.emberford', 'stage.foyer', 'market.square', 'nexus.specimen-vault'];
  rooms = selected.map((id) => ({ id, ...MAPS[id].spawn }));
} finally { await vite.close(); }
const require = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const browser = await require('playwright')[engine].launch(engine === 'chromium' ? {
  executablePath: process.env.KG_CHROMIUM || undefined,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
} : {});
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 900 } });
  page.setDefaultTimeout(90000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(address, { waitUntil: 'domcontentloaded' });
  const startButton = page.getByRole('button', { name: /New game/ }).first();
  await startButton.focus();
  await startButton.press('Enter');
  const begin = page.getByRole('button', { name: 'Begin', exact: true });
  await begin.focus();
  const began = Date.now();
  await begin.press('Enter');
  await page.getByRole('dialog').getByText(/brass fish/).first().waitFor();
  const boot = Date.now() - began;
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'hidden'});
  const initial = await page.evaluate(keys => keys.filter(key => kg.world.textures.exists(key)).length, keys);
  if (mode !== 'baseline') assert.ok(initial < keys.length / 2, 'Opening room loaded ' + initial + ' of ' + keys.length);
  console.log('OPEN', engine, browser.version(), 'begin-to-dialog-ms', boot, 'field-art', initial, '/', keys.length);
  let props = 0;
  for (const room of rooms) {
    const started = Date.now();
    await page.evaluate(({id, x, y}) => {
      if (kg.world.map.id !== id) kg.world.changeMap(id, x, y);
    }, room);
    await page.waitForFunction(id => kg.world?.map.id === id && !kg.world.transitioning, room.id);
    const result = await page.evaluate(async ({ digest }) => {
      const w = kg.world;
      const missing = [];
      const field = w.map.interactables.filter(it => it.art || it.kind === 'loreling');
      for (const it of field) {
        const image = w.objArt.get(it.id);
        if (!image || image.texture?.key === '__MISSING') missing.push(it.id);
      }
      for (const image of [w.player.sprite, w.player.shadow, w.lumen, ...w.npcs.map(n => n.sprite)]) {
        if (!image.texture || image.texture.key === '__MISSING') missing.push('actor-or-guide');
      }
      let floor;
      if (digest) {
        const rt = w.children.list.find(object => object.type === 'RenderTexture');
        const image = await new Promise(resolve => rt.snapshot(resolve));
        const canvas = document.createElement('canvas');
        canvas.width = rt.width; canvas.height = rt.height;
        const g = canvas.getContext('2d');
        g.drawImage(image, 0, 0);
        const pixels = g.getImageData(0, 0, canvas.width, canvas.height).data;
        let opaque = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) opaque++;
        const hash = await crypto.subtle.digest('SHA-256', pixels);
        floor = { opaque, sha256: Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('') };
      }
      return { room: w.map.id, field: field.length, missing, floor };
    }, {digest: mode !== 'tour'});
    assert.deepEqual(result.missing, [], room.id);
    if (result.floor) assert.ok(result.floor.opaque > 256, 'empty room floor ' + room.id);
    props += result.field;
    console.log('ROOM', JSON.stringify({...result, milliseconds:Date.now()-started}));
  }
  if (mode !== 'tour') {
    await page.evaluate(() => kg.world.changeMap('nexus.archive', 12, 12));
    await page.waitForFunction(() => kg.world.map.id === 'nexus.archive' && !kg.world.transitioning);
    const swapped = await page.evaluate(() => {
      const w = kg.world, s = kg.controller.state;
      const timeline = w.map.interactables.find(p => p.artOpen?.key === 'timeline-door.open');
      const packing = w.map.interactables.find(p => p.artBy?.flag === 'nexus.pack.layout');
      const actual = p => w.objArt.get(p.id).texture.key;
      const old = [actual(timeline), actual(packing)];
      s.flags['puzzle.timeline-door.done'] = true;
      s.flags['nexus.pack.layout'] = 'outer';
      w.refreshWorld();
      const next = [actual(timeline), actual(packing)];
      delete s.flags['puzzle.timeline-door.done']; delete s.flags['nexus.pack.layout'];
      w.refreshWorld();
      return { old, next, restored:[actual(timeline),actual(packing)] };
    });
    assert.deepEqual(swapped.next, ['timeline-door.open','nexus.pack-outer-route']);
    assert.deepEqual(swapped.restored, swapped.old);
  }
  const forms = await page.evaluate(() => {
    const w = kg.world;
    return ['moth','star','wisp','firefly','fairy'].map(form => {
      kg.settings.lumenForm = form;
      w.refreshLumen();
      return w.lumen.texture.key;
    });
  });
  assert.deepEqual(forms, ['lumen.moth','lumen.star','lumen.wisp','lumen.firefly','lumen']);
  assert.deepEqual(errors, []);
  console.log('FIELD-ART', engine, rooms.length, 'rooms', props, 'object pictures and all five guide forms');
} finally { await browser.close(); }
