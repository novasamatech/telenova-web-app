import { type FC } from 'react';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { CreateGiftPage } from '@/screens/transfer';

export const loader = () => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
  });
};

const Page: FC = () => {
  const data = useLoaderData<typeof loader>();

  return <CreateGiftPage botUrl={data.botUrl} />;
};

export default Page;
