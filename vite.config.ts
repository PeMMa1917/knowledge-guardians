import { chapterDelivery } from './tools/chapterDelivery';
import { createServer, defineConfig, type Plugin } from 'vite';
import { ModuleRunner, createNodeImportMeta } from 'vite/module-runner';

// Share one validated authoring snapshot between the teacher and student publications.
async function assembleCampaign() {
  const loader = await createServer({configFile:false, optimizeDeps:{noDiscovery:true,include:[]}, server:{middlewareMode:true,watch:null,hmr:false,ws:false}});
  const environment = loader.environments.ssr;
  const runner = new ModuleRunner({hmr:false,createImportMeta:createNodeImportMeta,transport:{invoke:payload=>environment.hot.handleInvoke(payload)}});
  try {
    const {buildPack} = await runner.import('/src/content/index.ts');
    const {MAPS:maps} = await runner.import('/src/maps/index.ts');
    const {validateContent} = await runner.import('/src/domain/validate.ts');
    const {teacherContentFrom} = await runner.import('/src/teacher/content.ts');
    const pack = buildPack();
    const problems = validateContent(pack);
    if (problems.length) throw new Error(problems.join('\n'));
    return {pack,maps,teacher:teacherContentFrom(pack),files:[...environment.moduleGraph.fileToModulesMap.keys()]};
  } finally { try {await runner.close();} finally {await loader.close();} }
}
let snapshot: ReturnType<typeof assembleCampaign> | undefined;
const publication = () => snapshot ??= assembleCampaign();
function teacherContent(): Plugin {
  const id = 'virtual:kg-teacher-content';
  let production = false;
  return {
    name:'knowledge-guardians-teacher-content',
    configResolved(config) {production = config.command === 'build';},
    buildStart() {snapshot=undefined;},
    resolveId(source) {if(source===id) return '\0'+id;},
    async load(source) {
      if(source!=='\0'+id) return;
      if(!production) return `import {buildPack} from '/src/content/index.ts'; import {teacherContentFrom} from '/src/teacher/content.ts'; export const teacherContent=teacherContentFrom(buildPack());`;
      const result=await publication();
      for(const file of result.files) this.addWatchFile(file);
      return 'export const teacherContent='+JSON.stringify(result.teacher)+';';
    }
  };
}

// Runs in the first HTML response. It must be able to recover even when the
// first JavaScript file and its error handler have never reached the browser.
function startPublishedGame(entry: string, files: string[]): void {
  const page = new URL(location.href);
  const requested = page.searchParams.get('kg_reopen') ?? '';
  const revision = /^\d{1,16}$/.test(requested) ? requested : '';
  if (revision) {
    const imports: Record<string,string> = {};
    for (const path of files) {
      const from = new URL(path, document.baseURI);
      const retry = new URL(from);
      retry.searchParams.set('kg_reopen', revision);
      imports[from.href] = retry.href;
    }
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({imports});
    document.head.append(map);
    page.searchParams.delete('kg_reopen');
    history.replaceState(history.state, '', page);
  }
  const boot = document.createElement('script');
  boot.type = 'module';
  const src = new URL(entry,document.baseURI);
  if (revision) src.searchParams.set('kg_reopen', revision);
  boot.src = src.href;
  boot.addEventListener('error', () => {
    const retry = document.getElementById('arrival-retry');
    const status = document.getElementById('arrival-status');
    if (status) status.textContent = 'The first download was interrupted. Check your connection and reload.';
    if (retry) {
      retry.hidden = false;
      retry.addEventListener('click', () => {
        page.searchParams.set('kg_reopen', Date.now().toString());
        location.replace(page);
      }, {once:true});
    }
  });
  // Cached modules can execute before the body exists when inserted dynamically.
  const load = () => document.head.append(boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true});
  else load();
}

function recoverDownloads(): Plugin {
  return {
    name:'knowledge-guardians-recover-downloads',
    apply:'build',
    transformIndexHtml:{
      order:'post',
      handler(html, {bundle,path}) {
        if(!bundle || !path.endsWith('/index.html')) return;
        const chunks=Object.values(bundle).filter(chunk => chunk.type === 'chunk');
        const entry=chunks.find(chunk=>chunk.isEntry && chunk.facadeModuleId?.endsWith('/index.html'));
        if(!entry) throw Error('The game menu entry is missing from the build.');
        const files=chunks.filter(chunk=>!chunk.isEntry).map(chunk=>'./'+chunk.fileName);
        const tag=/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/;
        if(!html.match(tag)?.[1]?.endsWith('/'+entry.fileName))
          throw Error('The generated menu script could not be connected to download recovery.');
        return {html:html.replace(tag,''),tags:[{tag:'script',injectTo:'head-prepend',
          children:'(' + startPublishedGame.toString() + ')(' +
            JSON.stringify('./'+entry.fileName) + ',' + JSON.stringify(files) + ')'}]};
      }
    }
  };
}

// base './' lets the build run from any folder or a GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [teacherContent(), chapterDelivery(publication), recoverDownloads()],
  build: { target: 'es2022', chunkSizeWarningLimit: 2000, rollupOptions: { input: { main: 'index.html', teacher: 'teacher.html' } } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
