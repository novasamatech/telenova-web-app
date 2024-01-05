'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { WebApp } from '@twa-dev/types';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { createTgLink } from '@/common/telegram';
import GiftDetails from '@/screens/gifts/GiftDetails';
import { TgLink } from '@/common/telegram/types';
import Image from 'next/image';

export default function GiftPage() {
  const router = useRouter();
  const { BackButton, MainButton, webApp } = useTelegram();
  const [link, setLink] = useState<TgLink | null>(null);
  const searchParams = router.query;

  useEffect(() => {
    BackButton?.show();
    MainButton?.hide();

    const callback = async () => {
      router.push(Paths.GIFTS);
    };
    BackButton?.onClick(callback);
    setLink(createTgLink(searchParams.seed as string, searchParams.symbol as string));

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  // TODO change image
  return (
    <div className="min-h-screen p-4 flex flex-col items-center gap-3">
      <Image src="/images/gift.svg" alt="gift" width={300} height={300} className="mb-3" />
      <GiftDetails link={link} webApp={webApp as WebApp} />
    </div>
  );
}
