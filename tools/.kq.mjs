import { createServer } from 'vite';
const server = await createServer({configFile:false, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, watch:null, hmr:false}});
const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
const pack = buildPack();
const bad = pack.missions.filter(m => m.knowledgeQuestion && !m.knowledgeQuestion.trim().endsWith('?'));
console.log(bad.length);
for (const m of bad) console.log(m.id, '|', m.world, '|', m.knowledgeQuestion);
await server.close();
