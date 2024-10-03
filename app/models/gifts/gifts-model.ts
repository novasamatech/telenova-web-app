import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { groupBy, isEmpty } from 'lodash-es';
import { inFlight, readonly, spread } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { networkModel } from '../network';

import { TelegramApi, balancesFactory, localStorageApi } from '@/shared/api';
import { GIFT_STORE } from '@/shared/helpers';
import type { Asset, Gift, PersistentGift } from '@/types/substrate';

const giftsRequested = createEvent();
const giftSaved = createEvent<Omit<PersistentGift, 'timestamp'>>();
const claimsRequested = createEvent<Record<ChainId, Gift[]>>();

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

const saveGiftFx = createEffect((params: Omit<PersistentGift, 'timestamp'>) => {
  const newGift = { ...params, timestamp: Date.now() };

  const giftsStore = TelegramApi.getStoreName(GIFT_STORE);
  const gifts = localStorageApi.getItem<PersistentGift[]>(giftsStore, []);

  localStorageApi.setItem(giftsStore, [...gifts, newGift]);
});

const retrieveLocalGiftsFx = createEffect(() => {
  const giftStore = TelegramApi.getStoreName(GIFT_STORE);
  const persistentGifts = localStorageApi.getItem<PersistentGift[]>(giftStore, []);

  const gifts = persistentGifts.map(({ assetId, ...rest }) => {
    return {
      ...rest,
      status: 'Unclaimed',
      asset: { assetId },
    } as Gift;
  });

  return groupBy(gifts, 'chainId');
});

type RequestParams = {
  api: ApiPromise;
  assetsMap: Map<Asset, Address[]>;
};
type RequestResult = {
  [chainId: ChainId]: {
    [assetId: AssetId]: {
      [address: Address]: boolean;
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

  let assetIdx = 0;
  params.forEach(({ api, assetsMap }) => {
    const chainId = api.genesisHash.toHex();

    Array.from(assetsMap.entries()).forEach(([asset, addresses]) => {
      result[chainId][asset.assetId] = {};

      addresses.forEach((address, addressIdx) => {
        result[chainId][asset.assetId][address] = assetsBalances[assetIdx][addressIdx].isZero();
      });
      assetIdx += 1;
    });
  });

  return result;
});

sample({
  clock: giftSaved,
  target: saveGiftFx,
});

sample({
  clock: giftsRequested,
  target: retrieveLocalGiftsFx,
});

sample({
  clock: retrieveLocalGiftsFx.doneData,
  source: $giftsMap,
  fn: (oldGiftsMap, newGiftsMap) => {
    const mergedGiftsMap = oldGiftsMap;

    // Add only new gifts to existing ones
    for (const [chainId, gifts] of Object.entries(newGiftsMap)) {
      const typedChainId = chainId as ChainId;
      if (mergedGiftsMap[typedChainId]) {
        const giftsDiff = gifts.slice(mergedGiftsMap[typedChainId].length);
        mergedGiftsMap[typedChainId].push(...giftsDiff);
      } else {
        mergedGiftsMap[typedChainId] = gifts;
      }
    }

    return { newGiftsMap: mergedGiftsMap, event: mergedGiftsMap };
  },
  target: spread({
    newGiftsMap: $giftsMap,
    event: claimsRequested,
  }),
});

// Connections are ready, gifts come in
sample({
  clock: claimsRequested,
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
        if (gift.status === 'Claimed') continue;

        const asset = assets[typedChainId][gift.asset.assetId];
        assetsMap.set(asset, [...(assetsMap.get(asset) || []), gift.address]);
      }

      if (assetsMap.size > 0) {
        result.push({ api: connections[typedChainId].api!, assetsMap });
      }
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
      if (gift.status === 'Claimed') continue;

      const asset = assets[chainId][gift.asset.assetId];
      assetsMap.set(asset, [...(assetsMap.get(asset) || []), gift.address]);
    }

    return assetsMap.size > 0 ? [{ api: connections[chainId].api!, assetsMap }] : [];
  },
  target: requestClaimedAssetsFx,
});

sample({
  clock: requestClaimedAssetsFx.doneData,
  source: $giftsMap,
  filter: giftsMap => !isEmpty(giftsMap),
  fn: (giftsMap, claimed) => {
    const claimedGifts: Record<ChainId, Gift[]> = {};

    Object.entries(claimed).forEach(([chainId, assets]) => {
      const typedChainId = chainId as ChainId;

      claimedGifts[typedChainId] = giftsMap[typedChainId].map(gift =>
        assets[gift.asset.assetId][gift.address] ? { ...gift, status: 'Claimed' } : gift,
      );
    });

    return { ...giftsMap, ...claimedGifts };
  },
  target: $giftsMap,
});

export const giftsModel = {
  $claimedGifts: readonly($claimedGifts),
  $unclaimedGifts: readonly($unclaimedGifts),

  // Flag for loading gift claims
  $isPending: inFlight([requestClaimedAssetsFx]).map(count => count > 0),

  input: {
    giftsRequested,
    giftSaved,
  },

  _internal: {
    $giftsMap,
    claimsRequested,
  },
};
