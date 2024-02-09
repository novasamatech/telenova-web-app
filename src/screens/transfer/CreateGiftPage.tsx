import { useEffect, useState } from 'react';
import { Player, PlayerEvent } from '@lottiefiles/react-lottie-player';
import { WebApp } from '@twa-dev/types';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { HeadlineText, GiftDetails } from '@/components';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { ChainId, TrasferAsset } from '@/common/types';
import { createGiftWallet } from '@/common/wallet';
import { createTgLink } from '@/common/telegram';
import { TgLink } from '@/common/telegram/types';
import { backupGifts } from '@/common/utils/gift';
import { handleSend } from '@/common/utils/extrinsics';

export default function CreateGiftPage() {
  const { submitExtrinsic } = useExtrinsicProvider();
  const { BackButton, MainButton, webApp } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  useEffect(() => {
    if (!selectedAsset) return;

    BackButton?.hide();
    MainButton?.hide();

    const wallet = createGiftWallet(selectedAsset.addressPrefix as number);
    (async function () {
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset, wallet.address).then(() => {
        backupGifts(wallet.address, wallet.secret, selectedAsset.chainId as ChainId, selectedAsset.amount as string);
        setLink(createTgLink(wallet.secret, selectedAsset?.asset?.symbol as string));
      });
    })();

    return () => {
      setSelectedAsset(null);
    };
  }, []);

  const handleOnEvent = (event: PlayerEvent) => {
    if (event === 'complete') {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Player
        src="/gifs/present.json"
        keepLastFrame
        autoplay
        className="player mb-3 w-[256px] h-[256px]"
        onEvent={(event) => handleOnEvent(event)}
      />
      {loading || !link ? (
        <>
          <div className="h-[100px]">
            <div className="opacity-0 animate-text mt-3">
              <HeadlineText className="text-text-hint" align="center">
                Adding tokens...
              </HeadlineText>
            </div>
            <div className="mt-5 opacity-0 delay-1">
              <HeadlineText className="text-text-hint delay-1" align="center">
                Sprinkling confetti
              </HeadlineText>
            </div>
            <div className="opacity-0 delay-2 m-[-10px]">
              <HeadlineText className="text-text-hint delay-2" align="center">
                Wrapping up the gift box
              </HeadlineText>
            </div>
          </div>
        </>
      ) : (
        <GiftDetails link={link} webApp={webApp as WebApp} />
      )}
    </div>
  );
}
