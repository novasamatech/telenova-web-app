export const APP_READY_EVENT = 'app:ready';

/**
 * @param {import('express').Application} app
 */
export const setupHealthcheckController = app => {
  let isReady = false;
  app.addListener(APP_READY_EVENT, () => (isReady = true));

  app.get('/startup', (req, res) => {
    res.status(200).send({ status: 'ok' });
  });

  app.get('/liveness', (req, res) => {
    res.status(200).send({ status: 'ok' });
  });

  app.get('/readiness', (req, res) => {
    if (!isReady) {
      return res.status(500).json({
        status: 'error',
        message: `App is not ready.`,
      });
    }

    // TODO use zod schema instead
    const requiredEnvVars = ['PUBLIC_WIDGET_SECRET', 'PUBLIC_BOT_ADDRESS', 'PUBLIC_BOT_API_URL'];
    const unsetEnvVars = requiredEnvVars.filter(envVar => typeof process.env[envVar] === 'undefined');

    if (unsetEnvVars.length > 0) {
      return res.status(500).json({
        status: 'error',
        message: `Missing required environment variables: ${unsetEnvVars.join(', ')}`,
      });
    }

    res.status(200).send({ status: 'ok' });
  });
};
