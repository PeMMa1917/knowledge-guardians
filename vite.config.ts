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
        for (const file of loader.environments.ssr.moduleGraph.fileToModulesMap.keys()) this.addWatchFile(file);
        return `export const teacherContent = ${JSON.stringify(teacherContentFrom(buildPack()))};`;
      } finally {
        await loader.close();
      }
    },
  };
}

// This self-contained function runs in the browser, before modulepreload or import.
function installRecoveryMap(files: string[]): void {
  const page = new URL(location.href);
  const revision = page.searchParams.get('kg_reopen');
  if (!revision || !/^\d{1,16}$/.test(revision)) return;
  const imports: Record<string, string> = {};
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

// Install the recovery map before any module loads. Imported chunks and their
// importers must share the same fresh URL or a second controller could start.
function recoverDownloads(): Plugin {
  return {
    name: 'knowledge-guardians-recover-downloads',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_, { bundle, path }) {
        if (!bundle || !path.endsWith('/index.html')) return;
        const files = Object.values(bundle).flatMap(chunk =>
          chunk.type === 'chunk' && !chunk.isEntry && !chunk.name.includes('modulepreload')
            ? ['./' + chunk.fileName] : []);
        return [{tag: 'script', injectTo: 'head-prepend',
          children: '(' + installRecoveryMap.toString() + ')(' + JSON.stringify(files) + ')'}];
      },
    },
  };
}

// base './' lets the build run from any folder or a GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [teacherContent(), recoverDownloads()],
  build: { target: 'es2022', chunkSizeWarningLimit: 2000, rollupOptions: { input: { main: 'index.html', teacher: 'teacher.html' } } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
