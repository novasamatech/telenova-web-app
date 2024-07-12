import { allSettled, fork } from 'effector';
import { keyBy, noop } from 'lodash-es';
import { describe, expect, test, vi } from 'vitest';

import { type ApiPromise } from '@polkadot/api';

import { ConnectionStatus, type ProviderWithMetadata } from '@/common/network/types.ts';
import { type Chain, type ChainMetadata } from '@/types/substrate';

import { networkModel } from './network-model';

describe('@/common/network/network-model', () => {
  const mockedChains = [
    {
      name: 'Polkadot',
      chainIndex: '0',
      chainId: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      nodes: [],
    },
    {
      name: 'Kusama',
      chainIndex: '1',
      chainId: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      nodes: [],
    },
    {
      name: 'Karura',
      chainIndex: '3',
      chainId: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
      nodes: [],
    },
  ] as unknown as Chain[];
  const mockedChainsMap = keyBy(mockedChains, 'chainId');

  const mockProvider = () => {
    networkModel._internal.getConnectedChainIndicesFx.use(() => Promise.resolve([]));
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
    expect(scope.getState(networkModel.$chains)).toEqual(mockedChainsMap);
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
      values: new Map().set(networkModel.$chains, chain),
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

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: ConnectionStatus.CONNECTED }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: ConnectionStatus.CONNECTED }, // Kusama
      [mockedChains[2].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Karura
    });
  });

  test('should connect to Karura on chainConnected event', async () => {
    const scope = fork({
      values: new Map().set(networkModel.$chains, mockedChainsMap).set(networkModel.$connections, {
        [mockedChains[0].chainId]: { status: ConnectionStatus.CONNECTED }, // Polkadot
        [mockedChains[1].chainId]: { status: ConnectionStatus.CONNECTED }, // Kusama
        [mockedChains[2].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Karura
      }),
    });

    mockProvider();

    await allSettled(networkModel.input.chainConnected, { scope, params: mockedChains[2].chainId });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { status: ConnectionStatus.CONNECTED }, // Polkadot
      [mockedChains[1].chainId]: { status: ConnectionStatus.CONNECTED }, // Kusama
      [mockedChains[2].chainId]: { ...connection, status: ConnectionStatus.CONNECTED }, // Karura
    });
  });

  test('should disconnect from Polkadot on chainDisconnected event', async () => {
    const scope = fork({
      values: new Map().set(networkModel.$chains, mockedChainsMap).set(networkModel.$connections, {
        [mockedChains[0].chainId]: { provider: {}, api: {}, status: ConnectionStatus.CONNECTED }, // Polkadot
        [mockedChains[1].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Kusama
      }),
    });

    networkModel._internal.disconnectFx.use(() => Promise.resolve(mockedChains[0].chainId));

    await allSettled(networkModel.input.chainDisconnected, { scope, params: mockedChains[0].chainId });

    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Polkadot
      [mockedChains[1].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Kusama
    });
  });
});
