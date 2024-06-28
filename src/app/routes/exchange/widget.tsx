import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { MercuryoWidgetPage } from '@/screens/exchange';

export const loader = () => {
  return json({
    mercuryoSecret: process.env.PUBLIC_WIDGET_SECRET,
    mercuryoWidgetId: process.env.PUBLIC_WIDGET_ID,
  });
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  return <MercuryoWidgetPage mercuryoSecret={data.mercuryoSecret} mercuryoWidgetId={data.mercuryoWidgetId} />;
};

export default Page;
