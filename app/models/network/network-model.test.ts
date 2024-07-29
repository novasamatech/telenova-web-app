import { allSettled, fork } from 'effector';
import { keyBy } from 'lodash-es';
import { describe, expect, test, vi } from 'vitest';

import { type ApiPromise } from '@polkadot/api';

import { CONNECTIONS_STORE } from '@/common/utils';
import { chainsApi } from '@/shared/api';
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
    chainIndex: '2',
    chainId: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
    assets: [{ assetId: 0 }, { assetId: 1 }, { assetId: 2 }],
    nodes: [],
  },
  {
    name: 'Polkadot Asset Hub',
    chainIndex: '3',
    chainId: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assets: [{ assetId: 1 }],
    nodes: [],
  },
  {
    name: 'Westend',
    chainIndex: '4',
    chainId: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
    assets: [{ assetId: 0 }],
    nodes: [],
  },
] as unknown as Chain[];

const mockedChainsMap = keyBy(mockedChains, 'chainId');

describe('@/common/network/network-_model', () => {
  const effectMocks = {
    createProviderFx: {
      fx: networkModel._internal.createProviderFx,
      mock: ({ chainId }: any) => ({
        provider: {},
        api: { genesisHash: { toHex: () => chainId } },
      }),
    },
    getConnectedAssetsFx: {
      fx: networkModel._internal.getConnectedAssetsFx,
      mock: vi.fn().mockResolvedValue({}),
    },
  };

  test('should populate $chains on networkStarted event', async () => {
    const fakeRequestFx = vi.fn().mockResolvedValue(mockedChainsMap);
    const scope = fork({
      handlers: [
        [networkModel._internal.requestChainsFx, fakeRequestFx],
        [effectMocks.createProviderFx.fx, effectMocks.createProviderFx.mock],
      ],
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });
    expect(fakeRequestFx).toHaveBeenCalledOnce();
    expect(scope.getState(networkModel._internal.$chains)).toEqual(mockedChainsMap);
  });

  test('should update $metadata after requestMetadataFx effect', async () => {
    const chain = mockedChains[0];
    const mockMetadata: ChainMetadata = { chainId: chain.chainId, version: 1, metadata: '0x0000' };
    const scope = fork({
      values: [[networkModel._internal.$chains, chain]],
      handlers: [[networkModel._internal.requestMetadataFx, () => mockMetadata]],
    });

    await allSettled(networkModel._internal.requestMetadataFx, { scope, params: {} as ApiPromise });

    expect(scope.getState(networkModel._internal.$metadata)).toEqual([mockMetadata]);
  });

  test('should connect to default_chains on networkStarted event', async () => {
    vi.spyOn(chainsApi, 'getChainsData').mockResolvedValue(mockedChains);

    const scope = fork({
      handlers: [
        [effectMocks.getConnectedAssetsFx.fx, effectMocks.getConnectedAssetsFx.mock],
        [effectMocks.createProviderFx.fx, effectMocks.createProviderFx.mock],
      ],
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
      [mockedChains[3].chainId]: { 1: { assetId: 1 } },
      [mockedChains[4].chainId]: { 0: { assetId: 0 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { status: 'disconnected' }, // Karura
      [mockedChains[3].chainId]: { ...connection, status: 'connected' }, // Polkadot Asset Hub
      [mockedChains[4].chainId]: { ...connection, status: 'connected' }, // Westend
    });
  });

  test('should connect to default_chains + Karura from CloudStorage on networkStarted event', async () => {
    vi.spyOn(chainsApi, 'getChainsData').mockResolvedValue(mockedChains);

    // Karura (index 2) and chain (index 19) that's missing in chains.json
    const getItem = (_: string, cb: (_: null, result: string) => void) => cb(null, '2_0,2;19_0,2,3;');

    window.Telegram = { WebApp: { CloudStorage: { getItem } } } as any;

    const scope = fork({
      handlers: [[effectMocks.createProviderFx.fx, effectMocks.createProviderFx.mock]],
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
      [mockedChains[2].chainId]: { 0: { assetId: 0 }, 2: { assetId: 2 } },
      [mockedChains[3].chainId]: { 1: { assetId: 1 } },
      [mockedChains[4].chainId]: { 0: { assetId: 0 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { ...connection, status: 'connected' }, // Karura
      [mockedChains[3].chainId]: { ...connection, status: 'connected' }, // Polkadot Asset Hub
      [mockedChains[4].chainId]: { ...connection, status: 'connected' }, // Westend
    });
  });

  test('should connect to Karura on assetConnected event', async () => {
    const scope = fork({
      values: [
        [networkModel._internal.$chains, mockedChainsMap],
        [networkModel._internal.$connections, { [mockedChains[2].chainId]: { status: 'disconnected' } }], // Karura
      ],
      handlers: [
        [effectMocks.getConnectedAssetsFx.fx, effectMocks.getConnectedAssetsFx.mock],
        [effectMocks.createProviderFx.fx, effectMocks.createProviderFx.mock],
      ],
    });

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
      values: [
        [networkModel._internal.$chains, mockedChainsMap],
        [networkModel._internal.$assets, { [mockedChains[0].chainId]: { 0: true } }],
        [
          networkModel._internal.$connections,
          { [mockedChains[0].chainId]: { provider: {}, api: {}, status: 'connected' } }, // Polkadot
        ],
      ],
      handlers: [[networkModel._internal.disconnectFx, () => mockedChains[0].chainId]],
    });

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
      values: [
        [networkModel._internal.$chains, mockedChainsMap],
        [networkModel._internal.$assets, { [mockedChains[2].chainId]: { 0: true, 1: true } }],
        [networkModel._internal.$connections, { [mockedChains[2].chainId]: connection }], // Karura
      ],
      handlers: [[networkModel._internal.disconnectFx, () => mockedChains[2].chainId]],
    });

    await allSettled(networkModel.input.assetDisconnected, {
      scope,
      params: { chainId: mockedChains[2].chainId, assetId: 1 },
    });

    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[2].chainId]: connection, // Karura
    });
  });

  test('should update CloudStorage on assetConnected event', async () => {
    const setItemSpy = vi.fn();
    window.Telegram = { WebApp: { CloudStorage: { setItem: setItemSpy } } } as any;

    const scope = fork({
      values: [
        [networkModel._internal.$chains, mockedChainsMap],
        [networkModel._internal.$assets, { [mockedChains[0].chainId]: { 0: true, 1: true } }],
        [
          networkModel._internal.$connections,
          {
            [mockedChains[0].chainId]: { status: 'connected' },
            [mockedChains[2].chainId]: { status: 'disconnected' },
          },
        ],
      ],
      handlers: [[effectMocks.createProviderFx.fx, effectMocks.createProviderFx.mock]],
    });

    await allSettled(networkModel.input.assetConnected, {
      scope,
      params: { chainId: mockedChains[2].chainId, assetId: 1 },
    });

    expect(setItemSpy).toHaveBeenCalledWith(CONNECTIONS_STORE, '0_0,1;2_1;');
  });
});
