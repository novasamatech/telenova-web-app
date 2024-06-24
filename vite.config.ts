/// <reference types="vitest" />

import { vitePlugin as remix } from '@remix-run/dev';
import { createRoutesFromFolders } from '@remix-run/v1-route-convention';

import react from '@vitejs/plugin-react';
import { remixRoutes } from 'remix-routes/vite';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
  envPrefix: 'PUBLIC_',
  plugins: [
    tsconfigPaths(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      },
    }),
    // remix v2 doesn't disable hmr in test mode, so we simply replace it with react plugin
    mode === 'test'
      ? react()
      : remix({ appDirectory: './src/app', routes: x => createRoutesFromFolders(x, { appDirectory: './src/app' }) }),
    remixRoutes({ strict: true }),
    mode === 'production' && compression({ algorithm: 'gzip', compressionOptions: { level: 9 } }),
    mode === 'production' && compression({ algorithm: 'brotliCompress' }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'json'],
      reportOnFailure: true,
    },
  },
}));
