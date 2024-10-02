import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { groupBy, isEmpty } from 'lodash-es';
import { once, readonly } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { networkModel } from '../network';

import { TelegramApi, balancesFactory, localStorageApi } from '@/shared/api';
import { GIFT_STORE } from '@/shared/helpers';
import type { Asset, Gift, PersistentGift } from '@/types/substrate';

const giftsRequested = createEvent();
// const giftsSaved = createEvent();

const $giftsMap = createStore<Record<ChainId, Gift[]>>({});

const $enrichedGifts = combine(
  {
    giftsMap: $giftsMap,
    chains: networkModel.$chains,
  },
  ({ giftsMap, chains }) => {
    if (isEmpty(chains)) return [];

    const assetsMap = Object.values(chains).reduce<Record<ChainId, Record<AssetId, Asset>>>((acc, chain) => {
      acc[chain.chainId] = {};
      chain.assets.forEach(asset => (acc[chain.chainId][asset.assetId] = asset));

      return acc;
    }, {});

    const result: Gift[] = [];
    for (const gifts of Object.values(giftsMap)) {
      const enrichedGifts = gifts.map(gift => ({ ...gift, asset: assetsMap[gift.chainId][gift.asset.assetId] }));

      result.push(...enrichedGifts);
    }

    return result;
  },
);

const $claimedGifts = $enrichedGifts.map(gifts => {
  return gifts.filter(gift => gift.status === 'Claimed').sort((a, b) => b.timestamp - a.timestamp);
});

const $unclaimedGifts = $enrichedGifts.map(gifts => {
  return gifts.filter(gift => gift.status === 'Unclaimed').sort((a, b) => b.timestamp - a.timestamp);
});

// TODO: request from Tg Cloud Storage
const retrieveLocalGiftsFx = createEffect(() => {
  const giftStore = TelegramApi.getStoreName(GIFT_STORE);
  const gifts = localStorageApi.getItem<PersistentGift[]>(giftStore, []);

  return groupBy(gifts, 'chainId');

  // const giftsMap = new Map<ChainId, Gift[]>();
  // gifts.forEach(gift => {
  //   giftsMap.set(gift.chainId, [...(giftsMap.get(gift.chainId) || []), gift]);
  // });
});

type RequestParams = {
  api: ApiPromise;
  assetsMap: Map<Asset, Address[]>;
};
type RequestResult = {
  [chainId: ChainId]: {
    [assetId: AssetId]: {
      [address: Address]: true;
    };
  };
};
const requestClaimedAssetsFx = createEffect(async (params: RequestParams[]): Promise<RequestResult> => {
  const requests = params.flatMap(({ api, assetsMap }) => {
    return Array.from(assetsMap.entries()).map(([asset, addresses]) => {
      return balancesFactory.createService(api, asset).getFreeBalances(addresses);
    });
  });

  const assetsBalances = await Promise.all(requests);

  const result: RequestResult = params.reduce((acc, { api }) => {
    return { ...acc, [api.genesisHash.toHex()]: {} };
  }, {});
  // const result: RequestResult = { chainId: api.genesisHash.toHex() };

  params.forEach(({ api, assetsMap }) => {
    const chainId = api.genesisHash.toHex();

    Array.from(assetsMap.entries()).forEach(([asset, addresses], idxMap) => {
      result[chainId][asset.assetId] = {};

      addresses.forEach((address, idxAddress) => {
        if (assetsBalances[idxMap][idxAddress].isZero()) return;

        result[chainId][asset.assetId][address] = true;
      });
    });
  });

  return result;
});

// const backupGiftsFx = createEffect(() => {
//   console.log(2);
// });

sample({
  clock: giftsRequested,
  target: retrieveLocalGiftsFx,
});

sample({
  clock: retrieveLocalGiftsFx.doneData,
  fn: giftsMap => {
    const result: Record<ChainId, Gift[]> = {};
    for (const [chainId, gifts] of Object.entries(giftsMap)) {
      // Remaining asset data filled in $enrichedGifts
      result[chainId as ChainId] = gifts.map(({ assetId, ...rest }) => ({
        ...rest,
        status: 'Unclaimed',
        asset: { assetId } as Asset,
      }));
    }

    return result;
  },
  target: $giftsMap,
});

// Connections are ready, gifts come in
sample({
  clock: once($giftsMap.updates),
  source: {
    assets: networkModel.$assets,
    connections: networkModel.$connections,
  },
  fn: ({ assets, connections }, giftsMap) => {
    const result = [];
    for (const [chainId, gifts] of Object.entries(giftsMap)) {
      const typedChainId = chainId as ChainId;
      if (connections[typedChainId]?.status !== 'connected') continue;

      const assetsMap = new Map<Asset, Address[]>();

      for (const gift of gifts) {
        const asset = assets[typedChainId][gift.asset.assetId];
        assetsMap.set(asset, [...(assetsMap.get(asset) || []), gift.address]);
      }

      result.push({ api: connections[typedChainId].api!, assetsMap });
    }

    return result;
  },
  target: requestClaimedAssetsFx,
});

// Gifts ready, new chains connections come in
sample({
  clock: networkModel.output.connectionChanged,
  source: {
    giftsMap: $giftsMap,
    assets: networkModel.$assets,
    connections: networkModel.$connections,
  },
  filter: ({ giftsMap }, { chainId, status }) => {
    return giftsMap[chainId] && status === 'connected';
  },
  fn: ({ giftsMap, assets, connections }, { chainId }) => {
    const assetsMap = new Map<Asset, Address[]>();
    for (const gift of giftsMap[chainId]) {
      // if (gift.status === 'Claimed') continue;

      const asset = assets[chainId][gift.asset.assetId];
      assetsMap.set(asset, [...(assetsMap.get(asset) || []), gift.address]);
    }

    return [{ api: connections[chainId].api!, assetsMap }];
  },
  target: requestClaimedAssetsFx,
});

sample({
  clock: requestClaimedAssetsFx.doneData,
  source: $giftsMap,
  fn: (giftsMap, claimed) => {
    const claimedGifts: Record<ChainId, Gift[]> = {};

    Object.entries(claimed).forEach(([chainId, assets]) => {
      const typedChainId = chainId as ChainId;

      claimedGifts[typedChainId] = giftsMap[typedChainId].map(gift =>
        assets[gift.asset.assetId][gift.address] ? { ...gift, status: 'Claimed' } : gift,
      );
    });

    return Object.assign(giftsMap, claimedGifts);
  },
  target: $giftsMap,
});

export const giftsModel = {
  $claimedGifts: readonly($claimedGifts),
  $unclaimedGifts: readonly($unclaimedGifts),

  input: {
    giftsRequested,
  },

  _internal: {
    $giftsMap,
  },
};
