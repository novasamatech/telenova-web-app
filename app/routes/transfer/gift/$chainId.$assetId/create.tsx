import type { PlayerEvent } from '@lottiefiles/react-lottie-player';
import type { WebApp } from '@twa-dev/types';

import { useEffect, useState } from 'react';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params } from 'remix-routes';

import { useExtrinsic } from '@/common/extrinsicService';
import { useTelegram } from '@/common/providers';
import { createTgLink } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types';
import { backupGifts } from '@/common/utils';
import { createGiftWallet } from '@/common/wallet';
import { GiftDetails, HeadlineText, LottiePlayer } from '@/components';
import { networkModel } from '@/models';

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

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TgLink | null>(null);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  // TODO: refactor
  useEffect(() => {
    if (!selectedAsset || !chains[typedChainId]) return;

    const giftWallet = createGiftWallet(chains[typedChainId].addressPrefix);

    sendGift(giftWallet.address, { chainId: typedChainId, asset: selectedAsset, amount, fee })
      .then(() => {
        backupGifts({
          chainId: typedChainId,
          assetId: selectedAsset.assetId,
          address: giftWallet.address,
          secret: giftWallet.secret,
          balance: amount,
        });
        const tgLink = createTgLink({
          botUrl,
          appName,
          amount,
          secret: giftWallet.secret,
          symbol: selectedAsset.symbol,
        });

        setLink(tgLink);
      })
      .catch(error => alert(`Error: ${error.message}\nTry to reload`));
  }, [selectedAsset, chains]);

  const handleLottieEvent = (event: PlayerEvent) => {
    if (event === 'complete') {
      setLoading(false);
    }
  };

  if (!selectedAsset) return null;

  return (
    <>
      <div className="grid items-end justify-center h-[93vh]">
        <LottiePlayer
          className="mb-3"
          src={`/gifs/Gift_Packing_${selectedAsset.symbol}.json`}
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
