import { allSettled, fork } from 'effector';
import { keyBy } from 'lodash-es';
import { describe, expect, test, vi } from 'vitest';

import { type ApiPromise } from '@polkadot/api';

import { chainsApi } from '@/shared/api';
import { CONNECTIONS_STORE, KUSAMA, POLKADOT, POLKADOT_ASSET_HUB } from '@/shared/helpers';
import { type AssetsMap, type Chain, type ChainMetadata } from '@/types/substrate';

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

describe('@/common/network/network-model', () => {
  const effectMocks = {
    createPolkadotClientFx: {
      fx: networkModel._internal.createPolkadotClientFx,
      data: () =>
        vi.fn().mockImplementation(({ chainId }: any) => ({
          provider: {},
          api: { genesisHash: { toHex: () => chainId } },
        })),
    },
    getConnectedAssetsFx: {
      fx: networkModel._internal.getConnectedAssetsFx,
      data: () => vi.fn().mockResolvedValue({}),
    },
    requestChainsFx: {
      fx: networkModel._internal.requestChainsFx,
      data: () => vi.fn().mockResolvedValue(mockedChainsMap),
    },
  };

  test('should populate $chains on networkStarted event', async () => {
    const fakeRequestFx = effectMocks.requestChainsFx.data();
    const scope = fork({
      handlers: [
        [effectMocks.requestChainsFx.fx, fakeRequestFx],
        [effectMocks.createPolkadotClientFx.fx, effectMocks.createPolkadotClientFx.data()],
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
        [effectMocks.requestChainsFx.fx, effectMocks.requestChainsFx.data()],
        [effectMocks.getConnectedAssetsFx.fx, effectMocks.getConnectedAssetsFx.data()],
        [effectMocks.createPolkadotClientFx.fx, effectMocks.createPolkadotClientFx.data()],
      ],
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
      [mockedChains[3].chainId]: { 1: { assetId: 1 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { status: 'disconnected' }, // Karura
      [mockedChains[3].chainId]: { ...connection, status: 'connected' }, // Polkadot Asset Hub
      [mockedChains[4].chainId]: { status: 'disconnected' }, // Westend
    });
  });

  test('should connect to default_chains + Karura from CloudStorage on networkStarted event', async () => {
    vi.spyOn(chainsApi, 'getChainsData').mockResolvedValue(mockedChains);

    // Karura (index 2) and chain (index 19) that's missing in chains.json
    const getItem = (_: string, cb: (_: null, result: string) => void) => cb(null, '2_0,2;19_0,2,3;');

    window.Telegram = { WebApp: { CloudStorage: { getItem } } } as any;

    const scope = fork({
      handlers: [[effectMocks.createPolkadotClientFx.fx, effectMocks.createPolkadotClientFx.data()]],
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    expect(scope.getState(networkModel.$assets)).toEqual({
      [mockedChains[0].chainId]: { 0: { assetId: 0 } },
      [mockedChains[1].chainId]: { 0: { assetId: 0 } },
      [mockedChains[2].chainId]: { 0: { assetId: 0 }, 2: { assetId: 2 } },
      [mockedChains[3].chainId]: { 1: { assetId: 1 } },
    });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: 'connected' }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: 'connected' }, // Kusama
      [mockedChains[2].chainId]: { ...connection, status: 'connected' }, // Karura
      [mockedChains[3].chainId]: { ...connection, status: 'connected' }, // Polkadot Asset Hub
      [mockedChains[4].chainId]: { status: 'disconnected' }, // Westend
    });
  });

  test('should connect to Karura on assetConnected event', async () => {
    const scope = fork({
      values: [
        [networkModel._internal.$chains, mockedChainsMap],
        [networkModel._internal.$connections, { [mockedChains[2].chainId]: { status: 'disconnected' } }], // Karura
      ],
      handlers: [
        [effectMocks.getConnectedAssetsFx.fx, effectMocks.getConnectedAssetsFx.data()],
        [effectMocks.createPolkadotClientFx.fx, effectMocks.createPolkadotClientFx.data()],
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
        [networkModel._internal.$assets, { [mockedChains[0].chainId]: { 0: true } }],
        [
          networkModel._internal.$connections,
          {
            [mockedChains[0].chainId]: { status: 'connected' },
            [mockedChains[2].chainId]: { status: 'disconnected' },
          },
        ],
      ],
      handlers: [[effectMocks.createPolkadotClientFx.fx, effectMocks.createPolkadotClientFx.data()]],
    });

    await allSettled(networkModel.input.assetConnected, {
      scope,
      params: { chainId: mockedChains[2].chainId, assetId: 1 },
    });

    // Polkadot asset_0 should not appear
    expect(setItemSpy).toHaveBeenCalledWith(CONNECTIONS_STORE, '2_1;');
  });

  test('should sort assets with presorted chains', async () => {
    const mockedAssetsMap = {
      '0x001': { 0: { assetId: 0, symbol: 'WND' } },
      '0x002': { 0: { assetId: 0, symbol: 'KAR' } },
      '0x003': { 0: { assetId: 0, symbol: 'GLMR' } },
      [POLKADOT]: { 0: { assetId: 0, symbol: 'DOT' } },
      [KUSAMA]: { 0: { assetId: 0, symbol: 'KSM' } },
      [POLKADOT_ASSET_HUB]: { 1: { assetId: 1, symbol: 'USDT' }, 2: { assetId: 2, symbol: 'USDC' } },
    } as unknown as AssetsMap;

    const scope = fork();

    await allSettled(networkModel._internal.$assets, { scope, params: mockedAssetsMap });

    expect(scope.getState(networkModel.$sortedAssets)).toEqual([
      [POLKADOT, mockedAssetsMap[POLKADOT]['0']],
      [KUSAMA, mockedAssetsMap[KUSAMA]['0']],
      [POLKADOT_ASSET_HUB, mockedAssetsMap[POLKADOT_ASSET_HUB]['1']],
      ['0x003', mockedAssetsMap['0x003']['0']],
      ['0x002', mockedAssetsMap['0x002']['0']],
      [POLKADOT_ASSET_HUB, mockedAssetsMap[POLKADOT_ASSET_HUB]['2']],
      ['0x001', mockedAssetsMap['0x001']['0']],
    ]);
  });
});
