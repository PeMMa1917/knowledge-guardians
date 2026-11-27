import { createServer } from 'vite';
const server = await createServer({configFile:false, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, watch:null, hmr:false}});
const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
const m = MAPS[process.argv[2]];
const occ = new Set();
for (const [x,y,w,h] of m.blocks) for (let i=x;i<x+w;i++) for (let j=y;j<y+h;j++) occ.add(i+','+j);
for (const it of m.interactables) for (let i=it.x;i<it.x+(it.w??1);i++) for (let j=it.y;j<it.y+(it.h??1);j++) occ.add(i+','+j);
for (const n of m.npcs) occ.add(n.x+','+n.y);
for (const s of m.stamps) occ.add(s.x+','+s.y);
const free=(x,y)=>m.floor(x,y)!==null && !occ.has(x+','+y);
const out=[];
for (let y=1;y<m.height-1;y++) for (let x=1;x<m.width-1;x++) {
  if (!free(x,y)) continue;
  let ok=true; for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) if(!free(x+dx,y+dy)) ok=false;
  if (ok) out.push([x,y]);
}
console.log(m.id, m.width, m.height, 'spawn', m.spawn, 'free3x3', out.length, JSON.stringify(out.filter((_,i)=>i%25==0).slice(0,30)));
console.log('well', JSON.stringify(m.interactables.filter(i=>/rope|well|slate|doors|lantern/.test(i.id)).map(i=>[i.id,i.x,i.y])));
await server.close();
