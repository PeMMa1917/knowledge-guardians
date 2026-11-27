import { createServer } from 'vite';
const server = await createServer({configFile:false, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, watch:null, hmr:false}});
const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
const pack = buildPack();
for (const o of pack.missions.flatMap(m=>m.objectives).filter(o=>o.id.startsWith(process.argv[2]))) console.log(o.id,'|',o.title);
await server.close();
