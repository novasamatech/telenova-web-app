import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { createTgLink } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton';
import { type TgLink } from '@/common/telegram/types';
import { GiftDetails, Icon } from '@/components';
import { telegramModel } from '@/models';

export type SearchParams = {
  seed: string;
  chainIndex: string;
  symbol: string;
  balance: string;
};

export const loader = () => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
    appName: process.env.PUBLIC_WEB_APP_ADDRESS,
  });
};

export const clientLoader = (async ({ request, serverLoader }) => {
  const serverData = await serverLoader<typeof loader>();

  const url = new URL(request.url);
  const data = {
    secret: url.searchParams.get('seed') || '',
    chainIndex: url.searchParams.get('chainIndex') || '',
    symbol: url.searchParams.get('symbol') || '',
    amount: url.searchParams.get('balance') || '',
  };

  return { ...data, ...serverData };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const params = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    setLink(createTgLink(params));
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/gifts'))} />
      <div className="grid h-[93vh] items-center justify-center">
        <Icon name="Present" size={250} className="mt-auto justify-self-center" />
        {link && webApp && <GiftDetails link={link} webApp={webApp} />}
      </div>
    </>
  );
};

export default Page;
