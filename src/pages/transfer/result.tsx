'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, TitleText } from '@/components';

export default function ResultPage() {
  const router = useRouter();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    MainButton?.setText('Done');
    BackButton?.hide();
    MainButton?.show();
    const callback = () => {
      router.replace(Paths.DASHBOARD);
    };
    MainButton?.onClick(callback);

    return () => {
      MainButton?.hide();
      MainButton?.setText('Continue');
      MainButton?.offClick(callback);
      setSelectedAsset(null);
    };
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center ">
      <TitleText>
        {selectedAsset?.amount} {selectedAsset?.symbol} Sent to
      </TitleText>
      <HeadlineText className="text-text-hint m-3 break-all" align="center">
        {selectedAsset?.destination}
      </HeadlineText>
      <HeadlineText className="text-text-hint" align="center">
        Your transaction has been sent to the network and will be processed in a few seconds.
      </HeadlineText>
    </div>
  );
}
