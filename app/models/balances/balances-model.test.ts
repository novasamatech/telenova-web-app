import { allSettled, fork } from 'effector';
import noop from 'lodash/noop';
import { describe, expect, test, vi } from 'vitest';

import { BN_TEN } from '@polkadot/util';

import { networkModel } from '../network';
import { Wallet, walletModel } from '../wallet';

import { balancesFactory } from '@/shared/api';
import { type ChainsMap } from '@/types/substrate';

import { balancesModel } from './balances-model';

vi.mock('../wallet', async () => {
  return {
    ...(await vi.importActual('../wallet')),

    Wallet: vi.fn().mockImplementation((value: string) => ({
      getPublicKey: vi.fn().mockReturnValue(value),
      toAddress: vi.fn().mockReturnValue(value),
    })),
  };
});

describe('models/balances/balances-model', () => {
  const mockedChains = {
    '0x001': { name: 'Polkadot', chainId: '0x001', assets: [{ assetId: 0 }] },
    '0x002': { name: 'Kusama', chainId: '0x002', assets: [{ assetId: 1 }] },
    '0x003': { name: 'Karura', chainId: '0x003', assets: [{ assetId: 0 }, { assetId: 1 }, { assetId: 2 }] },
  } as unknown as ChainsMap;

  test('should update $balance on balanceUpdated', async () => {
    const defaultBalance = {
      chainId: '0x002',
      address: '123',
      balance: { total: BN_TEN, transferable: BN_TEN },
    };

    const scope = fork({
      values: [[balancesModel._internal.$balances, { '0x002': { 0: { ...defaultBalance, assetId: 0 } } }]],
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

  test('should update $subscriptions on assetToUnsubSet', async () => {
    const mockedSubscriptions = { '0x001': { 0: Promise.resolve(noop), 1: Promise.resolve(noop) } };

    const scope = fork({
      values: [[balancesModel._internal.$subscriptions, mockedSubscriptions]],
    });

    await allSettled(balancesModel.input.assetToUnsubSet, { scope, params: { chainId: '0x001', assetId: 1 } });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': { 0: Promise.resolve(noop) } });
  });

  test('should unsub all $subscriptions for chainId if assetId is absent', async () => {
    const mockedSubscriptions = { '0x001': { 0: Promise.resolve(noop), 1: Promise.resolve(noop) } };
    const fakeUnsubscribeFx = vi.fn().mockReturnValue({ '0x001': undefined });

    const scope = fork({
      values: [[balancesModel._internal.$subscriptions, mockedSubscriptions]],
      handlers: [[balancesModel._internal.unsubscribeChainAssetsFx, fakeUnsubscribeFx]],
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
      values: [[balancesModel._internal.$subscriptions, mockedSubscriptions]],
      handlers: [[balancesModel._internal.subscribeChainsAssetsFx, fakeSubscribeFx]],
    });

    await allSettled(balancesModel._internal.subscribeChainsAssetsFx, {
      scope,
      params: { apis: {}, chains: [], assets: [], wallet: new Wallet('123') },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({ '0x001': { 1: Promise.resolve(noop) } });
  });

  test('should update $subscriptions on assetToUnsubSet', async () => {
    const spyUnsub = vi.fn();

    const scope = fork({
      values: [
        [networkModel._internal.$assets, { '0x001': { 0: {} } }],
        [balancesModel._internal.$subscriptions, { '0x001': { 0: Promise.resolve(spyUnsub) } }],
      ],
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
    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn().mockResolvedValue(noop),
      getFreeBalance: vi.fn(),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [networkModel._internal.$assets, { '0x003': { 0: {} } }],
        [balancesModel._internal.$subscriptions, { '0x003': { 0: unsubPromise } }],
        [walletModel._internal.$wallet, new Wallet('123')],
        [networkModel._internal.$chains, mockedChains],
        [networkModel._internal.$connections, { '0x003': { api: {}, status: 'connected' } }],
      ],
    });

    await allSettled(balancesModel.input.assetToSubSet, {
      scope,
      params: { chainId: '0x003', assetId: 1 },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });

  test('should subscribe $assets for chainId on networkModel.output.connectionChanged', async () => {
    const unsubPromise = Promise.resolve(noop);
    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn().mockResolvedValue(noop),
      getFreeBalance: vi.fn(),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [walletModel._internal.$wallet, new Wallet('123')],
        [networkModel._internal.$assets, { '0x001': { 1: {} }, '0x003': { 0: {}, 1: {} } }],
        [networkModel._internal.$chains, mockedChains],
        [
          networkModel._internal.$connections,
          {
            '0x001': { status: 'disconnected' },
            '0x003': { api: {}, status: 'connected' },
          },
        ],
      ],
    });

    await allSettled(networkModel.output.connectionChanged, {
      scope,
      params: { chainId: '0x003', status: 'connected' },
    });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });

  test('should unsubscribe $assets for chainId on networkModel.output.connectionChanged', async () => {
    const spyUnsub = vi.fn();
    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn().mockResolvedValue(spyUnsub),
      getFreeBalance: vi.fn(),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [networkModel._internal.$assets, { '0x001': { 1: {} }, '0x003': { 0: {}, 1: {} } }],
        [walletModel._internal.$wallet, new Wallet('123')],
        [networkModel._internal.$chains, mockedChains],
        [
          balancesModel._internal.$subscriptions,
          {
            '0x001': { 1: Promise.resolve(spyUnsub) },
            '0x003': { 0: Promise.resolve(spyUnsub), 1: Promise.resolve(spyUnsub) },
          },
        ],
      ],
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

  test('should update $subscriptions when walletModel.$wallet updates', async () => {
    const unsubPromise = Promise.resolve(noop);
    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn().mockResolvedValue(noop),
      getFreeBalance: vi.fn(),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [networkModel._internal.$assets, { '0x001': { 0: {} }, '0x003': { 0: {}, 1: {} } }],
        [networkModel._internal.$chains, mockedChains],
        [
          networkModel._internal.$connections,
          {
            '0x001': { api: {}, status: 'connected' },
            '0x003': { api: {}, status: 'connected' },
          },
        ],
      ],
    });

    await allSettled(walletModel._internal.$wallet, { scope, params: new Wallet('123') });

    expect(scope.getState(balancesModel._internal.$subscriptions)).toEqual({
      '0x001': { 0: unsubPromise },
      '0x003': { 0: unsubPromise, 1: unsubPromise },
    });
  });
});
