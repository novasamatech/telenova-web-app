import { createEffect, createEvent, createStore, sample } from 'effector';
import { isEmpty } from 'lodash-es';
import { interval, once, readonly } from 'patronum';

import { networkModel } from '@/models/network';
import { coingekoApi, localStorageApi } from '@/shared/api';
import { type Asset, type AssetPrices } from '@/types/substrate';

export const PRICES_STORE = 'prices';

const pricesRefused = createEvent();

const $prices = createStore<AssetPrices | null>(null);

const getFromStorageFx = createEffect((): AssetPrices | null => {
  return localStorageApi.getFromStorage<AssetPrices | null>(PRICES_STORE, null);
});

const saveToStorageFx = createEffect((prices: AssetPrices) => {
  localStorageApi.saveToStorage(PRICES_STORE, prices);
});

type PricesParams = {
  priceIds: Asset['priceId'][];
  currency?: string;
  includeRateChange?: boolean;
};
const requestPricesFx = createEffect(
  ({ priceIds, currency, includeRateChange }: PricesParams): Promise<AssetPrices | null> => {
    return coingekoApi.getPrice(priceIds, currency, includeRateChange);
  },
);

const { tick: requestTick } = interval({
  leading: true,
  timeout: 60 * 1000, // 1 minute
  start: networkModel.$chains.updates,
  stop: pricesRefused,
});

sample({
  clock: once(requestTick),
  target: getFromStorageFx,
});

sample({
  clock: requestTick,
  source: networkModel.$chains,
  filter: chains => {
    return !isEmpty(chains);
  },
  fn: chains => {
    const priceIds = Object.values(chains).flatMap(chain => chain.assets.map(a => a.priceId));

    return { priceIds };
  },
  target: requestPricesFx,
});

sample({
  clock: [getFromStorageFx.doneData, requestPricesFx.doneData],
  filter: (prices): prices is AssetPrices => !isEmpty(prices),
  target: $prices,
});

sample({
  source: $prices,
  filter: (prices): prices is AssetPrices => !isEmpty(prices),
  target: saveToStorageFx,
});

export const pricesModel = {
  $prices: readonly($prices),

  input: {
    pricesRefused,
  },

  /* Internal API (tests only) */
  _internal: {
    requestPricesFx,
  },
};
