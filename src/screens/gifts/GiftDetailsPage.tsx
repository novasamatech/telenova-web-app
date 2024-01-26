'use client';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WebApp } from '@twa-dev/types';
import Image from 'next/image';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { createTgLink } from '@/common/telegram';
import GiftDetails from '@/components/GiftDetails/GiftDetails';
import { TgLink } from '@/common/telegram/types';

export default function GiftDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { BackButton, MainButton, webApp } = useTelegram();
  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    BackButton?.show();
    MainButton?.hide();

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

  // TODO change image
  return (
    <div className="flex flex-col items-center gap-3">
      <Image src="/images/gift.svg" alt="gift" width={300} height={300} className="mb-3" />
      <GiftDetails link={link} webApp={webApp as WebApp} />
    </div>
  );
}
