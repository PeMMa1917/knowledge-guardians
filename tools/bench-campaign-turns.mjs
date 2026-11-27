import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
// Compare two otherwise identical checkouts, each with the project dependencies installed.
// Usage: node tools/bench-campaign-turns.mjs ../baseline ../candidate
const roots = process.argv.slice(2).map((p) => resolve(p));
assert.equal(roots.length, 2, 'Pass a baseline checkout and a candidate checkout.');
const req = createRequire(resolve(roots[0], 'package.json'));
const { createServer } = await import(
  pathToFileURL(req.resolve('vite/package.json').replace(/package.json$/, 'dist/node/index.js'))
);
const servers = [];
const modules = [];
for (const root of roots) {
  const server = await createServer({
    root,
    configFile: false,
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  servers.push(server);
  modules.push(await server.ssrLoadModule('/tests/driver.ts'));
}
try {
  for (const n of [0, 600, 1800, 3000]) {
    const a = new modules[0].Driver(),
      b = new modules[1].Driver();
    const s = {
      ...a.s,
      objectivesDone: a.e.pack.missions.flatMap((m) => m.objectives.map((o) => o.id)).slice(0, n),
    };
    const cmds = Array.from({ length: 65 }, (_, i) =>
      i % 3 === 0
        ? { type: 'InspectExhibit', exhibit: 'OBJ-001-A' }
        : { type: 'EnterNode', node: a.e.pack.dialogue[i % 10].id },
    );
    const all = [[], []];
    for (let rep = -2; rep < 5; rep++) {
      const outs = [];
      for (const side of rep % 2 ? [1, 0] : [0, 1]) {
        const model = [a, b][side].e;
        let state = structuredClone(s),
          perm = structuredClone(a.p);
        const events = [];
        const cpu = process.cpuUsage();
        for (const cmd of cmds) {
          let o = model.dispatch(cmd, state, perm, '2026-11-25T00:00:00Z');
          assert.ok(!o.events.some((it) => it.kind === 'error'));
          events.push(o.events);
          perm = o.permanent;
          state = o.state;
          model.currentObjective(state);
        }
        const after = process.cpuUsage(cpu);
        outs[side] = { state, perm, events };
        if (rep >= 0) all[side].push((after.system + after.user) / 1000 / cmds.length);
      }
      assert.deepStrictEqual(outs[1], outs[0]);
    }
    const med = all.map((g) => g.slice().sort((a, b) => a - b)[2]);
    console.log(
      n,
      JSON.stringify({
        baseline: all[0],
        candidate: all[1],
        medianCPUms: med,
        ratio: med[1] / med[0],
        identicalOutcomes: true,
      }),
    );
  }
} finally {
  await Promise.all(servers.map((s) => s.close()));
}
