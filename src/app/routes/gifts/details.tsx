import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { GiftDetailsPage } from '@/screens/gifts';

export const loader = () => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
    appName: process.env.PUBLIC_WEB_APP_ADDRESS,
  });
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  return <GiftDetailsPage botUrl={data.botUrl} appName={data.appName} />;
};

export default Page;
