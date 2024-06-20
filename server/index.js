import express from 'express';
import { SELF, expressCspHeader } from 'express-csp-header';

import { APP_READY_EVENT, setupHealthcheckController } from './healthcheck.js';
import { setupStaticController } from './static.js';

const app = express();

// Special permission for mercuryo widget
app.use(
  expressCspHeader({
    directives: {
      'frame-src': [SELF, 'https://widget.mercuryo.io'],
    },
  }),
);

app.disable('x-powered-by');

setupHealthcheckController(app);
await setupStaticController(app, process.env.NODE_ENV === 'production');

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  app.emit(APP_READY_EVENT);
  console.log(`Express server listening at http://0.0.0.0:${port}`);
});
