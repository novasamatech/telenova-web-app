import { type FC } from 'react';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { CreateWalletPage } from '@/screens/onboarding';

export const loader = () => {
  return json({
    botApiUrl: process.env.PUBLIC_BOT_API_URL,
  });
};

const Page: FC = () => {
  const data = useLoaderData<typeof loader>();

  return <CreateWalletPage botApiUrl={data.botApiUrl} />;
};

export default Page;
