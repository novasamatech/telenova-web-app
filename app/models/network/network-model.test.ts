import { allSettled, fork } from 'effector';
import { keyBy, noop } from 'lodash-es';
import { describe, expect, test, vi } from 'vitest';

import { type ApiPromise } from '@polkadot/api';

import { type ProviderWithMetadata } from '@/shared/api/network/provider-api';
import { type Chain, type ChainMetadata } from '@/types/substrate';

import { networkModel } from './network-model';

const mockedChains = [
  {
    name: 'Polkadot',
    chainIndex: '0',
    chainId: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    assets: [{ assetId: 0 }],
    nodes: [],
  },
  {
    name: 'Kusama',
    chainIndex: '1',
    chainId: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    assets: [{ assetId: 0 }],
    nodes: [],
  },
  {
    name: 'Karura',
    chainIndex: '3',
    chainId: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
    assets: [{ assetId: 0 }, { assetId: 1 }, { assetId: 2 }],
    nodes: [],
  },
] as unknown as Chain[];

describe('@/common/network/network-model', () => {
  const mockedChainsMap = keyBy(mockedChains, 'chainId');

  const mockProvider = () => {
    networkModel._internal.getConnectedAssetsFx.use(() => Promise.resolve({}));
    networkModel._internal.createProviderFx.use(({ chainId }) => {
      const mockedProvider = {} as ProviderWithMetadata;
      const mockedApi = { genesisHash: { toHex: () => chainId } } as ApiPromise;

      return Promise.resolve({ provider: mockedProvider, api: mockedApi });
    });
  };

  test('should populate $chains on networkStarted event', async () => {
    const fakePopulateFx = vi.fn().mockResolvedValue(mockedChainsMap);
    const scope = fork();

    networkModel._internal.populateChainsFx.use(fakePopulateFx);

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });
    expect(fakePopulateFx).toHaveBeenCalledOnce();
    expect(scope.getState(networkModel._internal.$chains)).toEqual(mockedChainsMap);
  });

  test('should add metadata subscription after createProviderFx effect', async () => {
    const chain = mockedChains[0];
    const scope = fork();

    mockProvider();
    networkModel._internal.populateChainsFx.use(() => {
      return Promise.resolve({ [chain.chainId]: chain });
    });
    networkModel._internal.subscribeMetadataFx.use(() => {
      return Promise.resolve({ chainId: chain.chainId, unsubscribe: noop });
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: mockedChains[0].chainId });

    expect(scope.getState(networkModel._internal.$metadataSubscriptions)).toEqual({ [chain.chainId]: noop });
  });

  test('should update $metadata after requestMetadataFx effect', async () => {
    const chain = mockedChains[0];
    const mockMetadata: ChainMetadata = { chainId: chain.chainId, version: 1, metadata: '0x0000' };
    const scope = fork({
      values: new Map().set(networkModel._internal.$chains, chain),
    });

    networkModel._internal.requestMetadataFx.use(() => Promise.resolve(mockMetadata));

    await allSettled(networkModel._internal.requestMetadataFx, { scope, params: {} as ApiPromise });

    expect(scope.getState(networkModel._internal.$metadata)).toEqual([mockMetadata]);
  });

  test('should connect to default_chains on networkStarted event', async () => {
    const scope = fork();

    mockProvider();
    networkModel._internal.populateChainsFx.use(() => mockedChainsMap);

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { status: 'disconnected' }, // Karura
    });
  });

  test('should connect to default_chains + Karura from CloudStorage on networkStarted event', async () => {
    const scope = fork();

    mockProvider();
    networkModel._internal.getConnectedAssetsFx.use(() => Promise.resolve({ 3: [1, 2] }));
    networkModel._internal.populateChainsFx.use(() => mockedChainsMap);

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
      [mockedChains[2].chainId]: { 1: { assetId: 1 }, 2: { assetId: 2 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { ...connection, status: 'connected' }, // Karura
    });
  });

  test('should connect to Karura on assetConnected event', async () => {
    const scope = fork({
      values: new Map().set(networkModel._internal.$chains, mockedChainsMap).set(networkModel._internal.$connections, {
        [mockedChains[2].chainId]: { status: 'disconnected' }, // Karura
      }),
    });

    mockProvider();

    await allSettled(networkModel.input.assetConnected, {
      scope,
      params: { chainId: mockedChains[2].chainId, assetId: 0 },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[2].chainId]: { ...connection, status: 'connected' }, // Karura
    });
  });

  test('should disconnect from Polkadot on assetDisconnected event', async () => {
    const scope = fork({
      values: new Map()
        .set(networkModel._internal.$chains, mockedChainsMap)
        .set(networkModel._internal.$assets, { [mockedChains[0].chainId]: { 0: true } })
        .set(networkModel._internal.$connections, {
          [mockedChains[0].chainId]: { provider: {}, api: {}, status: 'connected' }, // Polkadot
        }),
    });

    networkModel._internal.disconnectFx.use(() => Promise.resolve(mockedChains[0].chainId));

    await allSettled(networkModel.input.assetDisconnected, {
      scope,
      params: { chainId: mockedChains[0].chainId, assetId: 0 },
    });

    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { status: 'disconnected' }, // Polkadot
    });
  });

  test('should stay connected to Karura on assetDisconnected event', async () => {
    const connection = { provider: {}, api: {}, status: 'connected' };

    const scope = fork({
      values: new Map()
        .set(networkModel._internal.$chains, mockedChainsMap)
        .set(networkModel._internal.$assets, { [mockedChains[2].chainId]: { 0: true, 1: true } })
        .set(networkModel._internal.$connections, {
          [mockedChains[2].chainId]: connection, // Karura
        }),
    });

    networkModel._internal.disconnectFx.use(() => Promise.resolve(mockedChains[2].chainId));

    await allSettled(networkModel.input.assetDisconnected, {
      scope,
      params: { chainId: mockedChains[2].chainId, assetId: 1 },
    });

    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[2].chainId]: connection, // Karura
    });
  });
});
