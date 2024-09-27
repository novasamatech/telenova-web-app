import { createEffect, createEvent, createStore, sample } from 'effector';
import { groupBy } from 'lodash-es';
import { combineEvents, readonly } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { networkModel } from '../network';

import { TelegramApi, balancesFactory, localStorageApi } from '@/shared/api';
import { GIFT_STORE } from '@/shared/helpers';
import type { Asset, Gift, PersistentGift } from '@/types/substrate';

const giftsRequested = createEvent();
// const giftsSaved = createEvent();

const $giftsMap = createStore<Record<ChainId, Gift[]>>({});

const $unclaimedGifts = $giftsMap.map(giftsMap => {
  const result: Gift[] = [];
  for (const gifts of Object.values(giftsMap)) {
    const unclaimed = gifts.filter(gift => gift.status === 'Unclaimed');
    result.push(...unclaimed);
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
});

const $claimedGifts = $giftsMap.map(giftsMap => {
  const result: Gift[] = [];
  for (const gifts of Object.values(giftsMap)) {
    const claimed = gifts.filter(gift => gift.status === 'Claimed');
    result.push(...claimed);
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
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
  chainId: ChainId;
  [assetId: AssetId]: {
    [address: Address]: true;
  };
};
const requestClaimedAssetsFx = createEffect(async ({ api, assetsMap }: RequestParams): Promise<RequestResult> => {
  const requests = [];
  for (const [asset, addresses] of assetsMap) {
    requests.push(balancesFactory.createService(api, asset).getFreeBalances(addresses));
  }

  const assetsBalances = await Promise.all(requests);
  const result: RequestResult = { chainId: api.genesisHash.toHex() };

  for (const [idxMap, [asset, addresses]] of Array.from(assetsMap.entries()).entries()) {
    result[asset.assetId] = {};

    for (const [idxAddress, address] of addresses.entries()) {
      if (!assetsBalances[idxMap][idxAddress].isZero()) continue;
      result[asset.assetId][address] = true;
    }
  }

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
  clock: combineEvents([retrieveLocalGiftsFx.doneData, networkModel.$chains.updates]),
  fn: ([giftsMap, chains]) => {
    const assetsMap = Object.values(chains).reduce<Record<ChainId, Record<AssetId, Asset>>>((acc, chain) => {
      acc[chain.chainId] = {};
      chain.assets.forEach(asset => (acc[chain.chainId][asset.assetId] = asset));

      return acc;
    }, {});

    const result: Record<ChainId, Gift[]> = {};
    for (const [chainId, gifts] of Object.entries(giftsMap)) {
      result[chainId as ChainId] = gifts.map(({ assetId, ...rest }) => ({
        ...rest,
        status: 'Unclaimed',
        asset: assetsMap[rest.chainId][Number(assetId)],
      }));
    }

    return result;
  },
  target: $giftsMap,
});

// TODO: get balances for all connected chains
// sample({
//   clock: networkModel.output.connectionChanged,
//   source: networkModel.$connections,
//   filter: (_, { status }) => status === 'connected',
//   fn: (connections, { chainId }) => connections[chainId].api!,
//   target: requestGiftsFx,
// });

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

    return { api: connections[chainId].api!, assetsMap };
  },
  target: requestClaimedAssetsFx,
});

sample({
  clock: requestClaimedAssetsFx.doneData,
  source: $giftsMap,
  fn: (giftsMap, claimed) => {
    const { [claimed.chainId]: chainGifts, ...rest } = giftsMap;

    const modifiedChainGifts = chainGifts.map(gift =>
      claimed[gift.asset.assetId][gift.address] ? { ...gift, status: 'Claimed' } : gift,
    );

    return { [claimed.chainId]: modifiedChainGifts, ...rest };
  },
  target: $giftsMap,
});

export const giftsModel = {
  $claimedGifts: readonly($claimedGifts),
  $unclaimedGifts: readonly($unclaimedGifts),

  input: {
    giftsRequested,
  },
};
