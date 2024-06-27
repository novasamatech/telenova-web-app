import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { SettingsPage } from '@/screens/settings';

export const loader = () => {
  return json({
    version: process.env.PUBLIC_APP_VERSION,
  });
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  return <SettingsPage version={data.version} />;
};

export default Page;
