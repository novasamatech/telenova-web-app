import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WebApp } from '@twa-dev/types';

import { useTelegram } from '@common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { Paths } from '@/common/routing';
import { createTgLink } from '@/common/telegram';
import GiftDetails from '@/components/GiftDetails/GiftDetails';
import { TgLink } from '@/common/telegram/types';
import Icon from '@/components/Icon/Icon';

export default function GiftDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { BackButton, webApp } = useTelegram();
  const { hideMainButton } = useMainButton();

  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    BackButton?.show();
    hideMainButton();

    const callback = async () => {
      navigate(Paths.GIFTS);
    };
    BackButton?.onClick(callback);
    setLink(createTgLink(searchParams.get('seed') as string, searchParams.get('symbol') as string));

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 h-[95vh]">
      <Icon name="Present" size={250} className="mb-3" />
      <GiftDetails link={link} webApp={webApp as WebApp} />
    </div>
  );
}
