import { useEffect, useState } from 'react';

import { type PlayerEvent } from '@lottiefiles/react-lottie-player';
import { type WebApp } from '@twa-dev/types';

import { useExtrinsic } from '@/common/extrinsicService/useExtrinsic';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types';
import { useMainButton } from '@/common/telegram/useMainButton';
import { type TrasferAsset } from '@/common/types';
import { backupGifts } from '@/common/utils/gift';
import { createGiftWallet } from '@/common/wallet';
import { GiftDetails, HeadlineText, LottiePlayer } from '@/components';

type Props = {
  botUrl: string;
  appName: string;
};

export default function CreateGiftPage({ botUrl, appName }: Props) {
  const { BackButton, webApp } = useTelegram();
  const { hideMainButton } = useMainButton();
  const { handleSendGift } = useExtrinsic();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  // TODO: refactor
  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    BackButton?.hide();
    hideMainButton();

    const wallet = createGiftWallet(selectedAsset.addressPrefix as number);

    handleSendGift(selectedAsset as TrasferAsset, wallet.address)
      .then(() => {
        backupGifts(wallet.address, wallet.secret, selectedAsset as TrasferAsset);
        const tgLink = createTgLink({
          botUrl,
          appName,
          secret: wallet.secret,
          symbol: selectedAsset?.asset?.symbol as string,
          amount: selectedAsset?.amount as string,
        });

        setLink(tgLink);
      })
      .catch(error => alert(`Error: ${error.message}\nTry to relaod`));

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
    <div className="grid items-end justify-center h-[93vh]">
      <LottiePlayer
        src={`/gifs/Gift_Packing_${selectedAsset?.asset?.symbol}.json`}
        keepLastFrame
        autoplay
        className="mb-3 w-[256px] h-[256px]"
        onEvent={handleOnEvent}
      />
      {loading || !link ? (
        <>
          <div className="h-[100px] mb-auto">
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
