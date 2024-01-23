'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import { WebApp } from '@twa-dev/types';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Layout } from '@/components';
import GiftDetails from '@/screens/gifts/GiftDetails';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { ChainId, TrasferAsset } from '@/common/types';
import { createGiftWallet } from '@/common/wallet';
import { createTgLink } from '@/common/telegram';
import { TgLink } from '@/common/telegram/types';
import { backupGifts } from '@/common/utils/gift';
import { handleSend } from '@/common/utils/extrinsics';

export default function CreateGiftPage() {
  const navigate = useNavigate();
  const { submitExtrinsic } = useExtrinsicProvider();
  const { BackButton, MainButton, webApp } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    if (!selectedAsset) return;

    BackButton?.hide();
    MainButton?.hide();
    MainButton?.setText('Gift created');
    const mainCallback = async () => {
      navigate(Paths.DASHBOARD);
    };
    MainButton?.onClick(mainCallback);

    const wallet = createGiftWallet(selectedAsset.addressPrefix as number);
    (async function () {
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset, wallet.address).then(() => {
        backupGifts(wallet.address, wallet.secret, selectedAsset.chainId as ChainId, selectedAsset.amount as string);
        setLink(createTgLink(wallet.secret, selectedAsset?.asset?.symbol as string));
        setLoading(false);
        MainButton?.show();
      });
    })();

    return () => {
      setSelectedAsset(null);
      MainButton?.hide();
      MainButton?.offClick(mainCallback);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <Player src="/gifs/create-wallet.json" keepLastFrame autoplay className="player mb-3 h-[300px]" />
      {loading || !link ? (
        <HeadlineText className="text-text-hint" align="center">
          Creating your gift..
        </HeadlineText>
      ) : (
        <GiftDetails link={link} webApp={webApp as WebApp} />
      )}
    </div>
  );
}

CreateGiftPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
