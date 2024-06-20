import { type FC } from 'react';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { GiftDetailsPage } from '@/screens/gifts';

export const loader = () => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
  });
};

const Page: FC = () => {
  const data = useLoaderData<typeof loader>();

  return <GiftDetailsPage botUrl={data.botUrl} />;
};

export default Page;
