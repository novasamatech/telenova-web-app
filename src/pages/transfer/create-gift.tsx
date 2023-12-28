'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Player } from '@lottiefiles/react-lottie-player';
import { Button } from '@nextui-org/react';
import { WebApp } from '@twa-dev/types';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { BodyText, HeadlineText, Layout } from '@/components';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { handleSend } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';
import { createGiftWallet } from '@/common/wallet';
import { createTgLink, navigateTranferById } from '@/common/telegram';
import { TgLink } from '@/common/telegram/types';

export default function CreateGiftPage() {
  const router = useRouter();
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
      router.push(Paths.DASHBOARD);
    };
    MainButton?.onClick(mainCallback);

    const wallet = createGiftWallet(selectedAsset.addressPrefix as number);
    (async function () {
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset, wallet.address).then(() => {
        setLink(createTgLink(wallet.secret, selectedAsset.symbol as string));
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
        <>
          <Button fullWidth={false} color="primary" onClick={() => navigator.clipboard.writeText(link.url)}>
            Copy link
          </Button>
          <BodyText className="text-text-hint" align="center">
            Now you can send this link anyone who you needed to claim funds. When they will open it, the gift will
            marked as claimed
          </BodyText>
          <Button color="primary" onClick={() => navigateTranferById(webApp as WebApp, link)}>
            Share with your contact
          </Button>
        </>
      )}
    </div>
  );
}

CreateGiftPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
