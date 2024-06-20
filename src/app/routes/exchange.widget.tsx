import { type FC } from 'react';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { MercuryoWidgetPage } from '@/screens/exchange';

export const loader = () => {
  return json({
    mercuryoSecret: process.env.PUBLIC_WIDGET_SECRET,
  });
};

const Page: FC = () => {
  const data = useLoaderData<typeof loader>();

  return <MercuryoWidgetPage mercuryoSecret={data.mercuryoSecret} />;
};

export default Page;
