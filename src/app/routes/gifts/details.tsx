import type { WebApp } from '@twa-dev/types';

import { type FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { type TgLink } from '@/common/telegram/types.ts';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { GiftDetails, Icon } from '@/components';

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

const Page: FC = () => {
  const { botUrl, appName } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { webApp } = useTelegram();
  const { mainButton } = useMainButton();

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    mainButton.show();

    setLink(
      createTgLink({
        secret: searchParams.get('seed') as string,
        symbol: searchParams.get('symbol') as string,
        amount: searchParams.get('balance') as string,
        botUrl,
        appName,
      }),
    );
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/gifts'))} />
      <div className="grid items-center justify-center h-[93vh]">
        <Icon name="Present" size={250} className="justify-self-center mt-auto" />
        <GiftDetails link={link} webApp={webApp as WebApp} />
      </div>
    </>
  );
};

export default Page;
