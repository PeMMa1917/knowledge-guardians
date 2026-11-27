import { createServer, defineConfig, type Plugin } from 'vite';

function teacherContent(): Plugin {
  const id = 'virtual:kg-teacher-content';
  const virtual = '\0' + id;
  const projection = '/src/teacher/content.ts';
  const campaign = '/src/content/index.ts';
  let root = '';
  let production = false;
  return {
    name: 'knowledge-guardians-teacher-content',
    configResolved(config) {
      root = config.root;
      production = config.command === 'build';
    },
    resolveId(source) {
      if (source === id) return virtual;
    },
    async load(source) {
      if (source !== virtual) return;
      if (!production) {
        // Development keeps HMR connected to the same campaign records as the game.
        return `import { buildPack } from '${campaign}';
          import { teacherContentFrom } from '${projection}';
          export const teacherContent = teacherContentFrom(buildPack());`;
      }
      // Evaluate the two pure modules at build time. The teacher page then needs
      // only the reporting data, and Vite can omit the full campaign download there.
      const loader = await createServer({ root, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false } });
      try {
        const { buildPack } = await loader.ssrLoadModule(campaign);
        const { teacherContentFrom } = await loader.ssrLoadModule(projection);
        const { validateContent } = await loader.ssrLoadModule('/src/domain/validate.ts');
        const pack = buildPack();
        const problems = validateContent(pack);
        if (problems.length) this.error('The assembled campaign failed validation.\n' + problems.join('\n'));
        for (const file of loader.environments.ssr.moduleGraph.fileToModulesMap.keys()) this.addWatchFile(file);
        return `export const teacherContent = ${JSON.stringify(teacherContentFrom(pack))};`;
      } finally {
        await loader.close();
      }
    },
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
  plugins: [teacherContent(), recoverDownloads()],
  build: { target: 'es2022', chunkSizeWarningLimit: 2000, rollupOptions: { input: { main: 'index.html', teacher: 'teacher.html' } } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
