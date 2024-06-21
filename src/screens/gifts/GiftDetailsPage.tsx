import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { type WebApp } from '@twa-dev/types';
import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers/telegramProvider';
import { createTgLink } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types';
import { useMainButton } from '@/common/telegram/useMainButton';
import GiftDetails from '@/components/GiftDetails/GiftDetails';
import Icon from '@/components/Icon/Icon';

type Props = {
  botUrl: string;
  appName: string;
};

export default function GiftDetailsPage({ botUrl, appName }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { BackButton, webApp } = useTelegram();
  const { mainButton } = useMainButton();

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    BackButton?.show();
    mainButton.show();
    const callback = async () => {
      navigate($path('/gifts'));
    };
    BackButton?.onClick(callback);
    setLink(
      createTgLink({
        secret: searchParams.get('seed') as string,
        symbol: searchParams.get('symbol') as string,
        amount: searchParams.get('balance') as string,
        botUrl,
        appName,
      }),
    );

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="grid items-center justify-center h-[93vh]">
      <Icon name="Present" size={250} className="justify-self-center mt-auto" />
      <GiftDetails link={link} webApp={webApp as WebApp} />
    </div>
  );
}
