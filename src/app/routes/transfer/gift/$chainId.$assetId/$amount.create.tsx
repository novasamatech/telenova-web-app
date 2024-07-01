import type { PlayerEvent } from '@lottiefiles/react-lottie-player';
import type { WebApp } from '@twa-dev/types';

import { type FC, useEffect, useState } from 'react';

import { type LoaderFunction, json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params } from 'remix-routes';

import { useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types.ts';
import { type TransferAsset } from '@/common/types';
import { backupGifts, pickAsset } from '@/common/utils';
import { createGiftWallet } from '@/common/wallet';
import { GiftDetails, HeadlineText, LottiePlayer } from '@/components';

export const loader = (() => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
    appName: process.env.PUBLIC_WEB_APP_ADDRESS,
  });
}) satisfies LoaderFunction;

export const clientLoader = (async ({ params, serverLoader }) => {
  const serverData = await serverLoader<typeof loader>();
  const data = $params('/transfer/gift/:chainId/:assetId/:amount/create', params);

  return { ...serverData, ...data };
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { botUrl, appName, chainId, assetId, amount } = useLoaderData<typeof clientLoader>();

  const { webApp } = useTelegram();
  const { sendGift } = useExtrinsic();
  const { assets } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  const selectedAsset = pickAsset(chainId, assetId, assets);

  // TODO refactor
  useEffect(() => {
    if (!selectedAsset) return;

    const giftWallet = createGiftWallet(selectedAsset.addressPrefix as number);

    sendGift(selectedAsset, giftWallet.address)
      .then(() => {
        backupGifts(giftWallet.address, giftWallet.secret, selectedAsset as TransferAsset);
        const tgLink = createTgLink({
          botUrl,
          appName,
          amount,
          secret: giftWallet.secret,
          symbol: selectedAsset?.asset?.symbol as string,
        });

        setLink(tgLink);
      })
      .catch(error => alert(`Error: ${error.message}\nTry to reload`));
  }, []);

  const handleLottieEvent = (event: PlayerEvent) => {
    if (event === 'complete') {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid items-end justify-center h-[93vh]">
        <LottiePlayer
          className="mb-3"
          src={`/gifs/Gift_Packing_${selectedAsset?.asset?.symbol}.json`}
          autoplay
          keepLastFrame
          onEvent={handleLottieEvent}
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
    </>
  );
};

export default Page;
