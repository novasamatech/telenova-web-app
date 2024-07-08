import { createRequestHandler } from '@remix-run/express';

/**
 * @param {import('express').Application} app
 * @param {boolean} production
 */
export const setupStaticController = async (app, production) => {
  const viteDevServer = production
    ? undefined
    : await import('vite').then(vite => vite.createServer({ server: { middlewareMode: true } }));

  // handle asset requests
  if (viteDevServer) {
    console.info('Development mode');
    app.use(viteDevServer.middlewares);
  } else {
    console.info('Production mode');
    const { default: sirv } = await import('sirv');
    const assets = sirv('build/client', {
      gzip: true,
      brotli: true,
      single: true,
      immutable: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    app.use(assets);
  }

  const remixHandler = createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : // eslint-disable-next-line import/no-unresolved
        await import('../build/server/index.js'),
  });

  // Handle SSR requests
  app.all('*', remixHandler);
};
