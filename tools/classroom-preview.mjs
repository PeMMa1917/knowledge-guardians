// Loopback-only preview of the Worker routes with disposable fictional accounts.
import {DatabaseSync} from 'node:sqlite';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createServer as createSecureServer} from 'node:https';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import worker,{verifier} from '../server/classroom.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function fixture() {
  const sql=new DatabaseSync(':memory:');
  sql.exec(await readFile(resolve(root,'server/migrations/0001_class_writing.sql'),'utf8'));
  const insert=sql.prepare('INSERT INTO accounts VALUES (?,?,?,?,?,?)');
  const password='Lantern-Fiction-42';
  for(const [id,login,label,role] of [
    ['a','ash-moth','Ash Moth','student'],['b','moss-wren','Moss Wren','student'],['p','pending-rook','Pending Rook','student'],
    ['ta','north@example.invalid','Keeper North','teacher'],['tb','south@example.invalid','Keeper South','teacher']]) {
    const salt=crypto.randomUUID();
    insert.run(id,login,label,role,salt,await verifier(password,salt));
  }
  sql.exec("INSERT INTO classes VALUES ('north','North Lanterns','ta'),('south','South Lanterns','tb'); INSERT INTO memberships VALUES ('a','north',1),('b','south',1),('p','north',0)");
  const DB={prepare(query) {
    const stmt=sql.prepare(query);
    return {bind(...args){return {first:async()=>stmt.get(...args)??null,all:async()=>({results:stmt.all(...args)}),
      run:async()=>({meta:{changes:stmt.run(...args).changes}})};}};
  }};
  return {DB,sql,password};
}
async function previewCertificate() {
  const directory=await mkdtemp(resolve(tmpdir(),'kg-class-cert-'));
  try {
    const key=resolve(directory,'key.pem'), cert=resolve(directory,'cert.pem');
    execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1,DNS:localhost'],{stdio:'ignore'});
    return {key:await readFile(key),cert:await readFile(cert)};
  } finally {await rm(directory,{recursive:true,force:true});}
}
export async function preview(port=0, secure=false) {
  const {DB,sql}=await fixture();
  const base=resolve(root,'dist');
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml','.ogg':'audio/ogg','.wav':'audio/wav'};
  const protocol=secure?'https:':'http:';
  const server=secure?createSecureServer(await previewCertificate()):createServer();
  server.on('request',async(req,res)=>{
    try{
      const url=new URL(req.url,protocol+'//127.0.0.1:'+server.address().port);
      const input=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})});
      const response=await worker.fetch(input,{DB,ASSETS:{async fetch() {
        const path=resolve(base,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
        if(!path.startsWith(base+sep)) return new Response(null,{status:404});
        try{return new Response(await readFile(path),{headers:{'Content-Type':mime[extname(path)]||'application/octet-stream'}});}
        catch{return new Response('Missing',{status:404});}
      }}});
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    }catch{res.writeHead(500);res.end();}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  return {url:protocol+'//127.0.0.1:'+server.address().port,close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));sql.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const app=await preview(Number(process.argv.slice(2).find(arg=>/^\d+$/.test(arg))||8787),process.argv.includes('--https'));
  console.log('Disposable fictional classroom preview at '+app.url);
}
