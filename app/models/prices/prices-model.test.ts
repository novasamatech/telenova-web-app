import { type Scope, allSettled, fork } from 'effector';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { networkModel } from '../network/network-model';

import { coingekoApi, localStorageApi } from '@/shared/api';
import type { AssetPrices, ChainsMap } from '@/types/substrate';

import { PRICES_STORE, pricesModel } from './prices-model';

const mockedChains = {
  '0x001': { name: 'Polkadot', chainId: '0x001', assets: [{ priceId: 'dot' }] },
  '0x002': { name: 'Kusama', chainId: '0x002', assets: [{ priceId: 'ksm' }] },
} as unknown as ChainsMap;

const mockedPrices = {
  dot: { price: 1, change: 2 },
  ksm: { price: 3, change: 4 },
} as AssetPrices;

describe('models/prices/prices-model', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const setupScope = async (): Promise<Scope> => {
    const scope = fork();

    allSettled(networkModel._internal.$chains, { scope, params: mockedChains });
    await vi.runOnlyPendingTimersAsync();

    return scope;
  };

  test('should load prices from storage', async () => {
    vi.spyOn(localStorageApi, 'getFromStorage').mockResolvedValue(mockedPrices);
    vi.spyOn(coingekoApi, 'getPrice').mockResolvedValue(null);

    const scope = await setupScope();

    expect(scope.getState(pricesModel.$prices)).toEqual(mockedPrices);
  });

  test('should override prices from storage with coingeko', async () => {
    const freshMockedPrices = Object.assign(mockedPrices, { kar: { price: 5, change: 6 } });

    vi.spyOn(localStorageApi, 'getFromStorage').mockResolvedValue(mockedPrices);
    vi.spyOn(coingekoApi, 'getPrice').mockResolvedValue(freshMockedPrices);

    const scope = await setupScope();

    expect(scope.getState(pricesModel.$prices)).toEqual(freshMockedPrices);
  });

  test('should request prices from coingeko on $chains change', async () => {
    const spyCoingeko = vi.spyOn(coingekoApi, 'getPrice').mockResolvedValue(mockedPrices);

    const scope = await setupScope();

    // 2 times: on event & after timeout
    expect(spyCoingeko).toHaveBeenCalledTimes(2);
    expect(scope.getState(pricesModel.$prices)).toEqual(mockedPrices);
  });

  test('should save prices to storage after request', async () => {
    vi.spyOn(coingekoApi, 'getPrice').mockResolvedValue(mockedPrices);
    vi.spyOn(localStorageApi, 'getFromStorage').mockResolvedValue(null);
    const spySave = vi.spyOn(localStorageApi, 'saveToStorage').mockResolvedValue(mockedPrices);

    await setupScope();

    expect(spySave).toHaveBeenCalledOnce();
    expect(spySave).toHaveBeenCalledWith(PRICES_STORE, mockedPrices);
  });
});
