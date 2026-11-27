import { createServer } from 'vite';
const server = await createServer({configFile:false, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, watch:null, hmr:false}});
const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
const pack = buildPack();
const re = new RegExp(process.argv[2], 'i');
console.log(pack.characters.filter(c => re.test(c.id + ' ' + c.name)).map(c => c.id + ':' + c.name + ' (' + c.role + ')').join('\n'));
if (process.argv[3]) for (const n of pack.dialogue.filter(d => d.id.startsWith(process.argv[3]))) console.log('>>', n.id, n.speaker, '|', n.text.slice(0, 260), '\n   opts:', (n.options ?? []).map(o => o.text + (o.effects ? ' ' + JSON.stringify(o.effects) : '')).join(' || ').slice(0, 500));
await server.close();
