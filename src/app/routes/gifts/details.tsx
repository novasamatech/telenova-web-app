import type { WebApp } from '@twa-dev/types';

import { type FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import type { TgLink } from '@/common/telegram/types.ts';
import { useBackButton } from '@/common/telegram/useBackButton.ts';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { GiftDetails, Icon } from '@/components';

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
  const { addBackButton } = useBackButton();
  const { mainButton } = useMainButton();

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    mainButton.show();
    addBackButton(() => {
      navigate($path('/gifts'));
    });

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
    <div className="grid items-center justify-center h-[93vh]">
      <Icon name="Present" size={250} className="justify-self-center mt-auto" />
      <GiftDetails link={link} webApp={webApp as WebApp} />
    </div>
  );
};

export default Page;
