import type { NextApiRequest, NextApiResponse } from 'next';

export default function startupHandler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok' });
}
