/** Create a portable, offline, read-only stakeholder review of the current game. */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createServer, build } from 'vite';
import { choiceIndex, readPersonas } from './audit-choice-paths.mjs';
import { loadEntrances } from './choice-entrances.mjs';
const out = process.argv[2];
if (!out || !out.toLowerCase().endsWith('.html')) throw Error('Pass an output .html file.');
const path = (name) => fileURLToPath(new URL(name, import.meta.url));
const server = await createServer({
  root: path('../'),
  configFile: false,
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
let compressed;
try {
  const [{ buildPack }, { MAPS }, entrances] = await Promise.all([
    server.ssrLoadModule('/src/content/index.ts'),
    server.ssrLoadModule('/src/maps/index.ts'),
    loadEntrances(server),
  ]);
  const pack = buildPack(),
    index = choiceIndex(pack, MAPS, entrances);
  const profiles = Array.from(readPersonas(await readFile(path('../docs/audit/PERSONAS.md'), 'utf8')).values());
  const speakers = Object.fromEntries(pack.characters.map((p) => [p.id, p.name]));
  const options = index.options.map(({ option, callbacks, ...row }) => ({
    ...row,
    callbacks: callbacks.slice(0, 4).map(({ map, id, label, detail }) => ({ map, id, label, detail })),
    callbackCount: callbacks.length,
  }));
  const revision = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: path('../'),
    encoding: 'utf8',
  }).trim();
  const data = {
    revision,
    options,
    stations: index.objects,
    profiles,
    speakers,
    rooms: Object.fromEntries(Object.entries(MAPS).map(([id, r]) => [id, r.name])),
  };
  compressed = gzipSync(JSON.stringify(data), { level: 9 }).toString('base64');
} finally {
  await server.close();
}
const bundled = await build({
  configFile: false,
  root: path('../'),
  logLevel: 'error',
  build: {
    write: false,
    minify: true,
    target: 'es2020',
    lib: { entry: path('./choice-review/reader.mjs'), name: 'GuardiansReview', formats: ['iife'] },
  },
});
const script = bundled[0].output.find((item) => item.type === 'chunk').code;
const template = await readFile(path('./choice-review/page.html'), 'utf8');
await writeFile(
  out,
  template
    .replace('<!-- PACK -->', '<script id="pack" type="application/octet-stream">' + compressed + '</script>')
    .replace('<!-- READER -->', () => '<script>' + script.replace(/<\/script/gi, '<\\/script') + '</script>'),
);
console.log(out);
