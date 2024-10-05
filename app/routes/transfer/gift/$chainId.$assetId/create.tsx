import type { PlayerEvent } from '@lottiefiles/react-lottie-player';

import { useEffect, useState } from 'react';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params } from 'remix-routes';

import { BN } from '@polkadot/util';
import { randomAsHex } from '@polkadot/util-crypto';

import { giftsModel } from '@/models/gifts';
import { networkModel } from '@/models/network';
import { Wallet, walletModel } from '@/models/wallet';
import { TelegramApi, botApi, localStorageApi, transferFactory } from '@/shared/api';
import { type TelegramLink } from '@/shared/api/types';
import { MNEMONIC_STORE, toFormattedBalance } from '@/shared/helpers';
import { HeadlineText, LottiePlayer } from '@/ui/atoms';
import { GiftDetails } from '@/ui/molecules';

export type SearchParams = {
  amount: string;
  fee: string;
  all: boolean;
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
    fee: url.searchParams.get('fee') || '0',
    all: url.searchParams.get('all') === 'true',
  };

  return { ...serverData, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { botUrl, appName, chainId, assetId, amount, fee, all } = useLoaderData<typeof clientLoader>();

  const wallet = useUnit(walletModel.$wallet);
  const [chains, assets, connections] = useUnit([
    networkModel.$chains,
    networkModel.$assets,
    networkModel.$connections,
  ]);

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<TelegramLink | null>(null);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  useEffect(() => {
    if (!wallet || !selectedAsset || !chains[typedChainId]) return;

    const selectedChain = chains[typedChainId];
    const giftSeed = randomAsHex(10).slice(2);
    const giftWallet = new Wallet(giftSeed);

    const mnemonicStore = TelegramApi.getStoreName(MNEMONIC_STORE);
    const mnemonic = localStorageApi.secureGetItem(mnemonicStore, '');

    transferFactory
      .createService(connections[typedChainId].api!, selectedAsset)
      .sendTransfer({
        keyringPair: wallet.getKeyringPair(mnemonic, chains[typedChainId]),
        amount: new BN(amount).add(new BN(fee)),
        destination: giftWallet.toAddress(selectedChain),
        transferAll: all,
      })
      .then(hash => {
        console.log('🟢 Transaction hash - ', hash.toHex());

        giftsModel.input.giftSaved({
          chainId: typedChainId,
          assetId: selectedAsset.assetId,
          address: giftWallet.toAddress(selectedChain),
          secret: giftSeed,
          balance: amount,
          chainIndex: selectedChain.chainIndex,
        });

        const tgLink = botApi.createTelegramLink({
          botUrl,
          appName,
          amount: toFormattedBalance(amount, selectedAsset.precision).formatted,
          secret: giftSeed,
          chainIndex: selectedChain.chainIndex,
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
    <div className="grid h-[93vh] items-end justify-center">
      <LottiePlayer
        className="mb-3"
        sources={[`/assets/lottie/${selectedAsset.symbol}_packing.json`, '/assets/lottie/Default_packing.json']}
        autoplay
        keepLastFrame
        onEvent={handleLottieEvent}
      />
      {loading || !link ? (
        <div className="mb-auto h-[100px]">
          <div className="animate-text mt-3 opacity-0">
            <HeadlineText className="text-text-hint" align="center">
              Adding tokens...
            </HeadlineText>
          </div>
          <div className="delay-1 mt-5 opacity-0">
            <HeadlineText className="delay-1 text-text-hint" align="center">
              Sprinkling confetti
            </HeadlineText>
          </div>
          <div className="delay-2 m-[-10px] opacity-0">
            <HeadlineText className="delay-2 text-text-hint" align="center">
              Wrapping up the gift box
            </HeadlineText>
          </div>
        </div>
      ) : (
        <GiftDetails link={link} />
      )}
    </div>
  );
};

export default Page;
