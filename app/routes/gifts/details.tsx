import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton';
import { type TgLink } from '@/common/telegram/types';
import { GiftDetails, Icon } from '@/components';

// Query params for /gifts/details?seed=__value__&symbol=__value&balance=__value__
export type SearchParams = {
  seed: string;
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
    symbol: url.searchParams.get('symbol') || '',
    amount: url.searchParams.get('balance') || '',
  };

  return { ...data, ...serverData };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { botUrl, appName, secret, symbol, amount } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { webApp } = useTelegram();

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    const tgLink = createTgLink({ symbol, secret, amount, botUrl, appName });

    setLink(tgLink);
  }, []);

  const canShowGifDetails = Boolean(link) && Boolean(webApp);

  return (
    <>
      <BackButton onClick={() => navigate($path('/gifts'))} />
      <div className="grid items-center justify-center h-[93vh]">
        <Icon name="Present" size={250} className="justify-self-center mt-auto" />
        {canShowGifDetails && <GiftDetails link={link!} webApp={webApp!} />}
      </div>
    </>
  );
};

export default Page;
