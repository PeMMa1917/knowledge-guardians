import { defineConfig } from 'vite';

// base './' lets the build run from any folder or a GitHub Pages sub-path.
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 2000, rollupOptions: { input: { main: 'index.html', teacher: 'teacher.html' } } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
