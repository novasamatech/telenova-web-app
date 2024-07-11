import type { PlayerEvent } from '@lottiefiles/react-lottie-player';
import type { WebApp } from '@twa-dev/types';

import { useEffect, useState } from 'react';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params } from 'remix-routes';

import { useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types';
import { backupGifts, pickAsset } from '@/common/utils';
import { createGiftWallet } from '@/common/wallet';
import { GiftDetails, HeadlineText, LottiePlayer } from '@/components';

// Query params for /transfer/gift/:chainId/:assetId/create?amount=__value__&fee=__value__
export type SearchParams = {
  amount: string;
  fee: string;
};

export const loader = () => {
  return json({
    botUrl: process.env.PUBLIC_BOT_ADDRESS,
    appName: process.env.PUBLIC_WEB_APP_ADDRESS,
  });
};

export const clientLoader = (async ({ request, params, serverLoader }) => {
  const serverData = await serverLoader<typeof loader>();

  const url = new URL(request.url);
  const data = {
    ...$params('/transfer/gift/:chainId/:assetId/create', params),
    amount: url.searchParams.get('amount') || '',
    fee: Number(url.searchParams.get('fee') || 0),
  };

  return { ...serverData, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { botUrl, appName, chainId, assetId, amount, fee } = useLoaderData<typeof clientLoader>();

  const { webApp } = useTelegram();
  const { sendGift } = useExtrinsic();
  const { assets } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  const selectedAsset = pickAsset(chainId, assetId, assets);

  // TODO: refactor
  useEffect(() => {
    if (!selectedAsset) return;

    const giftWallet = createGiftWallet(selectedAsset.addressPrefix);

    sendGift({ ...selectedAsset, amount, fee }, giftWallet.address)
      .then(() => {
        backupGifts({
          chainId: selectedAsset.chainId,
          assetId: selectedAsset.asset.assetId,
          address: giftWallet.address,
          secret: giftWallet.secret,
          balance: amount,
        });
        const tgLink = createTgLink({
          botUrl,
          appName,
          amount,
          secret: giftWallet.secret,
          symbol: selectedAsset.asset.symbol,
        });

        setLink(tgLink);
      })
      .catch(error => alert(`Error: ${error.message}\nTry to reload`));
  }, [selectedAsset]);

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
