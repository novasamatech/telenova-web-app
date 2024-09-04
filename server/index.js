import express from 'express';

import { APP_READY_EVENT, setupHealthcheckController } from './healthcheck.js';
import { setupStaticController } from './static.js';

const app = express();

const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');

setupHealthcheckController(app);
await setupStaticController(app, isProd);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  app.emit(APP_READY_EVENT);
  console.log(`Express server listening at http://0.0.0.0:${port}`);
});
