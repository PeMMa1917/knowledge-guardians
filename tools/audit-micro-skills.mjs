import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { MICRO_SKILLS } = await server.ssrLoadModule('/src/content/microSkillEvidence.ts');
  const { measureAxisGroups, microSkillRows, SUPPLIED_SKILL_IDS } = await server.ssrLoadModule('/src/domain/microSkillAudit.ts');
  const rows = microSkillRows(buildPack(), MICRO_SKILLS);
  const groups = measureAxisGroups(rows);
  const scopes = new Map();
  for (const { skill, world } of rows) {
    const found = scopes.get(skill) ?? new Set();
    found.add(world);
    scopes.set(skill, found);
  }
  const missing = SUPPLIED_SKILL_IDS.filter((id) => !scopes.has(id));
  const supplied = new Set(SUPPLIED_SKILL_IDS);
  const absent = Array.from({ length: 1000 }, (_, i) => i + 1).filter((id) => !supplied.has(id));
  const levels = Object.fromEntries(['dok', 'fink', 'solo', 'bloom'].map((axis) =>
    [axis, [...new Set(rows.flatMap((row) => row.thinking ? [row.thinking[axis]] : []))].sort()]));
  const report = {
    supplied: SUPPLIED_SKILL_IDS.length,
    evidenced: scopes.size,
    multipleWorlds: [...scopes.values()].filter((worlds) => worlds.size > 1).length,
    uses: rows.length,
    chapters: [...new Set(rows.map((row) => row.chapter))].sort((a, b) => a - b),
    levels, missing, absent, groups,
  };
  if (process.argv.includes('--json')) console.log(JSON.stringify({ ...report, rows }, null, 2));
  else {
    console.log(`${report.evidenced} of ${report.supplied} supplied skills have an authored play link (${report.uses} links).`);
    console.log(`${report.multipleWorlds} appear in more than one world. ${absent.length} numbered rows were absent from the supplied files.`);
    console.log(`${groups.length} axis groups audited. ${groups.at(-1).uses} links have fields on all eight axes.`);
    console.log(`Thinking levels in the linked objectives: ${JSON.stringify(levels)}`);
  }
} finally {
  await server.close();
}
