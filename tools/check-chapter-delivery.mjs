import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'vite';
import { ModuleRunner, createNodeImportMeta } from 'vite/module-runner';

const dir = new URL('../dist/assets/', import.meta.url);
const files = readdirSync(dir);
const read = (name) => JSON.parse(gunzipSync(readFileSync(new URL(name, dir))));
const loader = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, watch: null, hmr: false, ws: false },
});
const runner = new ModuleRunner({
  hmr: false,
  createImportMeta: createNodeImportMeta,
  transport: {
    invoke: (payload) => loader.environments.ssr.hot.handleInvoke(payload),
  },
});
try {
  const { MAPS } = await runner.import('/src/maps/index.ts');
  const { buildPack } = await runner.import('/src/content/index.ts');
  const pack = buildPack();
  const json = (value) => JSON.parse(JSON.stringify(value));
  const rooms = files.filter((name) => name.startsWith('room-'));
  assert.equal(rooms.length, Object.keys(MAPS).length);
  let tilesChecked = 0;
  const visited = new Set();
  for (const file of rooms) {
    const { tiles, ...published } = read(file);
    assert(!visited.has(published.id));
    visited.add(published.id);
    const { floor, ...original } = MAPS[published.id];
    assert.deepEqual(published, json(original), published.id);
    assert.equal(tiles.length, published.height);
    for (let y = 0; y < published.height; y++) {
      assert.equal(tiles[y].length, published.width);
      for (let x = 0; x < published.width; x++) {
        assert.equal(tiles[y][x], floor(x, y) ?? null);
        tilesChecked++;
      }
    }
  }
  const { directory, guideIndex } = read(
    files.find((name) => name.startsWith('story-index-')),
  );
  const expected = new Map(pack.dialogue.map((node) => [node.id, json(node)]));
  assert.equal(Object.keys(directory).length, expected.size);
  const stories = files.filter(
    (name) => name.startsWith('story-') && !name.startsWith('story-index-'),
  );
  for (const file of stories) {
    for (const node of read(file)) {
      assert(file.startsWith('story-' + directory[node.id] + '-'), node.id);
      assert.deepEqual(node, expected.get(node.id), node.id);
      expected.delete(node.id);
    }
  }
  assert.equal(expected.size, 0);
  const hints = new Map(pack.hints.map((hint) => [hint.id, hint]));
  const emittedHints = new Set();
  for (const file of files.filter((name) => name.startsWith('guide-'))) {
    for (const [id, text] of Object.entries(read(file))) {
      const original = hints.get(id);
      assert(
        original &&
          original.text === text &&
          file.startsWith('guide-' + guideIndex[original.objective] + '-'),
        id,
      );
      assert(!emittedHints.has(id));
      emittedHints.add(id);
    }
  }
  const content = new URL('../src/content/', import.meta.url);
  const authoredHints = readdirSync(content)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(new URL(f, content))).hints ?? []);
  for (const hint of authoredHints)
    if (hints.has(hint.id)) assert(emittedHints.has(hint.id), hint.id);
  console.log(
    rooms.length,
    'rooms;',
    tilesChecked,
    'tiles;',
    stories.length,
    'story sections;',
    pack.dialogue.length,
    'complete dialogue nodes;',
    emittedHints.size,
    'authored hints match the authoring campaign.',
  );
} finally {
  try {
    await runner.close();
  } finally {
    await loader.close();
  }
}
