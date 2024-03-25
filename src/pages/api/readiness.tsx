import type { NextApiRequest, NextApiResponse } from 'next';
import nextConfig from '../../../next.config';

export default function readinessHandler(req: NextApiRequest, res: NextApiResponse) {
  const requiredEnvVars = Object.keys(nextConfig.env || {});
  const unsetEnvVars = requiredEnvVars.filter((envVar) => typeof process.env[envVar] === 'undefined');

  if (unsetEnvVars.length > 0) {
    return res.status(500).json({
      status: 'error',
      message: `Missing required environment variables: ${unsetEnvVars.join(', ')}`,
    });
  }

  res.status(200).json({ status: 'ok' });
}
