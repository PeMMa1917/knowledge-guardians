// Prints every mission in one chapter with its knowledge question, stake and step titles (for the audit).
// Usage: node tools/chapter-dump.mjs <chapter number>
import { createServer } from 'vite';
const server = await createServer({configFile:false, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, watch:null, hmr:false}});
const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
const { WORLD_CHAPTER, measureMission } = await import('./audit-personas.mjs');
const pack = buildPack();
const ch = Number(process.argv[2]);
for (const m of pack.missions.filter(m => WORLD_CHAPTER[m.world] === ch)) {
  const r = measureMission(m);
  console.log(`## ${m.id} | ${m.title} | ${m.world} | loop=${r.standardLoop} | long=${r.longShare} abs=${r.abstractShare}\n KQ: ${m.knowledgeQuestion}\n stake: ${m.stake ?? '-'}`);
  for (const o of m.objectives) console.log(`  - ${o.id} | ${o.title}`);
}
await server.close();
