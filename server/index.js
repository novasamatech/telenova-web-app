import { createRequestHandler } from '@remix-run/express';

import express from 'express';
import { SELF, expressCspHeader } from 'express-csp-header';

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then(vite => vite.createServer({ server: { middlewareMode: true } }));

const app = express();

app.disable('x-powered-by');

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

// Special permission for mercuryo widget
app.use(
  expressCspHeader({
    directives: {
      'frame-src': [SELF, 'https://widget.mercuryo.io'],
    },
  }),
);

// Handle SSR requests
app.all('*', remixHandler);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Express server listening at http://0.0.0.0:${port}`));
