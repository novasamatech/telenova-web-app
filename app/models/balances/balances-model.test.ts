import { allSettled, fork } from 'effector';
import noop from 'lodash/noop';
import { describe, expect, test, vi } from 'vitest';

import { networkModel } from '../network/network-model';
import { walletModel } from '../wallet/wallet-model';

import { balancesApi } from '@/shared/api';
import { type ChainsMap } from '@/types/substrate';

import { balancesModel } from './balances-model';

describe('models/balances/balances-model', () => {
  const mockedChains = {
    '0x001': { name: 'Polkadot', chainId: '0x001', assets: [{ assetId: 0 }] },
    '0x002': { name: 'Kusama', chainId: '0x002', assets: [{ assetId: 1 }] },
    '0x003': { name: 'Karura', chainId: '0x003', assets: [{ assetId: 0 }, { assetId: 1 }, { assetId: 2 }] },
  } as unknown as ChainsMap;

  test('should update $balance on balanceUpdated', async () => {
    const defaultBalance = {
      chainId: '0x002',
      accountId: '0x999',
      balance: { total: '10', transferable: '10' },
    };

    const scope = fork({
      values: new Map().set(balancesModel._internal.$balances, {
        '0x002': {
          0: { ...defaultBalance, assetId: 0 },
        },
      }),
    });

    await allSettled(balancesModel._internal.balanceUpdated, {
      scope,
      params: { ...defaultBalance, assetId: 1 },
    });

    expect(scope.getState(balancesModel.$balances)).toEqual({
      '0x002': {
        0: { ...defaultBalance, assetId: 0 },
        1: { ...defaultBalance, assetId: 1 },
      },
    });
  });

  test('should update $activeAssets on assetToUnsubSet', async () => {
    const scope = fork({
      values: new Map().set(balancesModel._internal.$activeAssets, { '0x001': { 0: true } }),
    });

    await allSettled(balancesModel.input.assetToUnsubSet, {
      scope,
      params: { chainId: '0x001', assetId: 0 },
    });

    expect(scope.getState(balancesModel._internal.$activeAssets)).toEqual({ '0x001': undefined });
  });

  test('should update $subscriptions on assetToUnsubSet', async () => {
    const mockedSubscriptions = { '0x001': { 0: Promise.resolve(noop), 1: Promise.resolve(noop) } };

    const scope = fork({
      values: new Map().set(balancesModel._internal.$subscriptions, mockedSubscriptions),
    });

    await allSettled(balancesModel.input.assetToUnsubSet, { scope, params: { chainId: '0x001', assetId: 1 } });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': { 0: Promise.resolve(noop) } });
  });

  test('should remove asset from $activeAssets on networkModel.output.assetChanged', async () => {
    const scope = fork({
      values: new Map().set(balancesModel._internal.$activeAssets, { '0x001': { 0: true } }),
    });

    await allSettled(networkModel.output.assetChanged, {
      scope,
      params: { chainId: '0x001', assetId: 0, status: 'off' },
    });

    expect(scope.getState(balancesModel._internal.$activeAssets)).toEqual({ '0x001': undefined });
  });

  test('should update $activeAssets on assetToSubSet', async () => {
    const scope = fork({
      values: new Map().set(balancesModel._internal.$activeAssets, { '0x001': { 0: true } }),
    });

    await allSettled(balancesModel.input.assetToSubSet, {
      scope,
      params: { chainId: '0x001', assetId: 1 },
    });

    expect(scope.getState(balancesModel._internal.$activeAssets)).toEqual({
      '0x001': { 0: true, 1: true },
    });
  });

  test('should add asset to $activeAssets on networkModel.output.assetChanged', async () => {
    const scope = fork({
      values: new Map().set(balancesModel._internal.$activeAssets, { '0x001': { 0: true } }),
    });

    await allSettled(networkModel.output.assetChanged, {
      scope,
      params: { chainId: '0x001', assetId: 1, status: 'on' },
    });

    expect(scope.getState(balancesModel._internal.$activeAssets)).toEqual({
      '0x001': { 0: true, 1: true },
    });
  });

  test('should unsub all $subscriptions for chainId if assetId is absent', async () => {
    const mockedSubscriptions = { '0x001': { 0: Promise.resolve(noop), 1: Promise.resolve(noop) } };
    const fakeUnsubscribeFx = vi.fn().mockReturnValue({ '0x001': undefined });

    const scope = fork({
      values: new Map().set(balancesModel._internal.$subscriptions, mockedSubscriptions),
      handlers: new Map().set(balancesModel._internal.unsubscribeChainAssetsFx, fakeUnsubscribeFx),
    });

    await allSettled(balancesModel._internal.unsubscribeChainAssetsFx, {
      scope,
      params: { chainId: '0x001', assetId: 1, subscriptions: mockedSubscriptions },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': undefined });
  });

  test('should update $subscriptions on subscribeChainsAssetsFx', async () => {
    const mockedSubscriptions = { '0x001': undefined };
    const fakeSubscribeFx = vi.fn().mockReturnValue({ '0x001': { 1: Promise.resolve(noop) } });

    const scope = fork({
      values: new Map().set(balancesModel._internal.$subscriptions, mockedSubscriptions),
      handlers: new Map().set(balancesModel._internal.subscribeChainsAssetsFx, fakeSubscribeFx),
    });

    await allSettled(balancesModel._internal.subscribeChainsAssetsFx, {
      scope,
      params: { apis: {}, chains: [], assets: [], accountId: '0x999' },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': { 1: Promise.resolve(noop) } });
  });

  test('should update $subscriptions on assetToUnsubSet', async () => {
    const spyUnsub = vi.fn();

    const scope = fork({
      values: new Map()
        .set(balancesModel._internal.$activeAssets, { '0x001': { 0: true } })
        .set(balancesModel._internal.$subscriptions, { '0x001': { 0: Promise.resolve(spyUnsub) } }),
    });

    await allSettled(balancesModel.input.assetToUnsubSet, {
      scope,
      params: { chainId: '0x001', assetId: 0 },
    });

    expect(spyUnsub).toHaveBeenCalledOnce();
    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': undefined });
  });

  test('should update $subscriptions on assetToSubSet', async () => {
    const unsubPromise = Promise.resolve(noop);
    vi.spyOn(balancesApi, 'subscribeBalance').mockReturnValue(unsubPromise);

    const scope = fork({
      values: new Map()
        .set(balancesModel._internal.$activeAssets, { '0x003': { 0: true } })
        .set(balancesModel._internal.$subscriptions, { '0x003': { 0: unsubPromise } })
        .set(walletModel._internal.$account, '0x999')
        .set(networkModel._internal.$chains, mockedChains)
        .set(networkModel._internal.$connections, { '0x003': { api: {}, status: 'connected' } }),
    });

    await allSettled(balancesModel.input.assetToSubSet, {
      scope,
      params: { chainId: '0x003', assetId: 1 },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });

  test('should subscribe $activeAssets for chainId on networkModel.output.connectionChanged', async () => {
    const unsubPromise = Promise.resolve(noop);
    vi.spyOn(balancesApi, 'subscribeBalance').mockReturnValue(unsubPromise);

    const scope = fork({
      values: new Map()
        .set(balancesModel._internal.$activeAssets, { '0x001': { 1: true }, '0x003': { 0: true, 1: true } })
        .set(walletModel._internal.$account, '0x999')
        .set(networkModel._internal.$chains, mockedChains)
        .set(networkModel._internal.$connections, {
          '0x001': { status: 'disconnected' },
          '0x003': { api: {}, status: 'connected' },
        }),
    });

    await allSettled(networkModel.output.connectionChanged, {
      scope,
      params: { chainId: '0x003', status: 'connected' },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });

  test('should unsubscribe $activeAssets for chainId on networkModel.output.connectionChanged', async () => {
    const spyUnsub = vi.fn();
    vi.spyOn(balancesApi, 'subscribeBalance').mockReturnValue(Promise.resolve(spyUnsub));

    const scope = fork({
      values: new Map()
        .set(balancesModel._internal.$activeAssets, { '0x001': { 1: true }, '0x003': { 0: true, 1: true } })
        .set(balancesModel._internal.$subscriptions, {
          '0x001': { 1: Promise.resolve(spyUnsub) },
          '0x003': { 0: Promise.resolve(spyUnsub), 1: Promise.resolve(spyUnsub) },
        })
        .set(walletModel._internal.$account, '0x999')
        .set(networkModel._internal.$chains, mockedChains),
    });

    await allSettled(networkModel.output.connectionChanged, {
      scope,
      params: { chainId: '0x003', status: 'disconnected' },
    });

    expect(spyUnsub).toHaveBeenCalledTimes(2);
    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x001': { 1: Promise.resolve(spyUnsub) },
      '0x003': undefined,
    });
  });

  test('should update $subscriptions when walletModel.$account updates', async () => {
    const unsubPromise = Promise.resolve(noop);
    vi.spyOn(balancesApi, 'subscribeBalance').mockReturnValue(unsubPromise);

    const scope = fork({
      values: new Map()
        .set(balancesModel._internal.$activeAssets, { '0x001': { 0: true }, '0x003': { 0: true, 1: true } })
        .set(networkModel._internal.$chains, mockedChains)
        .set(networkModel._internal.$connections, {
          '0x001': { api: {}, status: 'connected' },
          '0x003': { api: {}, status: 'connected' },
        }),
    });

    await allSettled(walletModel._internal.$account, { scope, params: '0x999' });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x001': { 0: unsubPromise },
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });
});
