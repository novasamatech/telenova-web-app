import { allSettled, fork } from 'effector';
import { keyBy } from 'lodash-es';
import { describe, expect, test, vi } from 'vitest';

import { type ApiPromise } from '@polkadot/api';

import { ConnectionStatus, type ProviderWithMetadata } from '@/common/network/types.ts';
import { type Chain } from '@/types/substrate';

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

  test('should populate $chains on networkStarted event', async () => {
    const fakePopulateFx = vi.fn().mockResolvedValue(mockedChainsMap);

    const scope = fork();
    networkModel._effects.populateChainsFx.use(fakePopulateFx);

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });
    expect(fakePopulateFx).toHaveBeenCalledOnce();
    expect(scope.getState(networkModel.$chains)).toEqual(mockedChainsMap);
  });

  test('should connect to default_chains on networkStarted event', async () => {
    const scope = fork();

    networkModel._effects.populateChainsFx.use(() => mockedChainsMap);
    networkModel._effects.getConnectedChainIndicesFx.use(() => Promise.resolve([]));
    networkModel._effects.createProviderFx.use(({ chainId }) => {
      const mockedProvider = {} as ProviderWithMetadata;
      const mockedApi = { genesisHash: { toHex: () => chainId } } as ApiPromise;

      return Promise.resolve({ provider: mockedProvider, api: mockedApi });
    });

    await allSettled(networkModel.input.networkStarted, { scope, params: 'chains_dev' });

    const connection = { provider: expect.any(Object), api: expect.any(Object) };
    expect(scope.getState(networkModel.$connections)).toEqual({
      [mockedChains[0].chainId]: { ...connection, status: ConnectionStatus.CONNECTED }, // Polkadot
      [mockedChains[1].chainId]: { ...connection, status: ConnectionStatus.CONNECTED }, // Kusama
      [mockedChains[2].chainId]: { status: ConnectionStatus.DISCONNECTED }, // Karura
    });
  });

  // test('should connect to specific chain on chainConnected event', () => {
  //   expect(1).toEqual(1);
  // });
  //
  // test('should disconnect from a specific chain on chainDisconnected event', () => {
  //   expect(1).toEqual(1);
  // });
});
//   const mockChainMap = {
//     '0x01': {
//       name: 'Polkadot',
//       chainId: '0x01',
//     } as unknown as Chain,
//   };
//
//   const mockConnection: Connection = {
//     id: 1,
//     chainId: '0x01',
//     customNodes: [],
//     connectionType: ConnectionType.RPC_NODE,
//     activeNode: { name: 'My node', url: 'http://localhost:8080' },
//   };
//
//   const mockMetadata: ChainMetadata = {
//     id: 1,
//     version: 1,
//     chainId: '0x01',
//     metadata: '0x123',
//   };
//
//   type StorageParams = {
//     chains?: Record<ChainId, Chain>;
//     connections?: Connection[];
//     metadata?: ChainMetadata[];
//   };
//   const mockStorage = ({ chains, connections, metadata }: StorageParams) => {
//     jest.spyOn(chainsService, 'getChainsMap').mockReturnValue(chains || {});
//     jest.spyOn(storageService.connections, 'readAll').mockResolvedValue(connections || []);
//     jest.spyOn(storageService.connections, 'update').mockResolvedValue(1);
//     jest.spyOn(storageService.metadata, 'readAll').mockResolvedValue(metadata || []);
//   };
//
//   beforeEach(() => {
//     jest.restoreAllMocks();
//   });
//
//   test('should populate $chains on networkStarted', async () => {
//     mockStorage({ chains: mockChainMap });
//     const scope = fork();
//
//     await allSettled(networkModel.events.networkStarted, { scope });
//     expect(scope.getState(networkModel.$chains)).toEqual(mockChainMap);
//   });
//
//   test('should set default $connectionStatuses on networkStarted', async () => {
//     mockStorage({ chains: mockChainMap });
//     const scope = fork();
//
//     await allSettled(networkModel.events.networkStarted, { scope });
//     expect(scope.getState(networkModel.$connectionStatuses)).toEqual({ '0x01': ConnectionStatus.DISCONNECTED });
//   });
//
//   test('should set $connections on networkStarted', async () => {
//     mockStorage({ chains: mockChainMap, connections: [mockConnection] });
//
//     const scope = fork();
//
//     await allSettled(networkModel.events.networkStarted, { scope });
//     expect(scope.getState(networkModel.$connections)).toEqual({ '0x01': mockConnection });
//   });
//
//   test('should set $providers on networkStarted', async () => {
//     mockStorage({
//       chains: mockChainMap,
//       connections: [mockConnection],
//       metadata: [mockMetadata],
//     });
//
//     const scope = fork();
//
//     const spyCreateProvider = jest
//       .spyOn(providerService, 'createProvider')
//       .mockReturnValue({ isConnected: true } as ProviderWithMetadata);
//
//     await allSettled(networkModel.events.networkStarted, { scope });
//
//     expect(spyCreateProvider).toHaveBeenCalledWith(
//       mockChainMap['0x01'].chainId,
//       ProviderType.WEB_SOCKET,
//       { metadata: mockMetadata.metadata, nodes: ['http://localhost:8080'] },
//       { onConnected: expect.any(Function), onDisconnected: expect.any(Function), onError: expect.any(Function) },
//     );
//     expect(scope.getState(networkModel._$providers)).toEqual({
//       '0x01': { isConnected: true },
//     });
//   });
//
//   test('should set Light Client in $providers on networkStarted', async () => {
//     mockStorage({
//       chains: mockChainMap,
//       connections: [
//         {
//           ...mockConnection,
//           connectionType: ConnectionType.LIGHT_CLIENT,
//           activeNode: undefined,
//         },
//       ],
//       metadata: [mockMetadata],
//     });
//
//     const scope = fork();
//
//     const connectMock = jest.fn();
//     const spyCreateProvider = jest
//       .spyOn(providerService, 'createProvider')
//       .mockReturnValue({ connect: connectMock, isConnected: true } as unknown as ProviderWithMetadata);
//
//     await allSettled(networkModel.events.networkStarted, { scope });
//
//     expect(connectMock).toHaveBeenCalled();
//     expect(spyCreateProvider).toHaveBeenCalledWith(
//       mockChainMap['0x01'].chainId,
//       ProviderType.LIGHT_CLIENT,
//       { metadata: mockMetadata.metadata, nodes: [''] },
//       { onConnected: expect.any(Function), onDisconnected: expect.any(Function), onError: expect.any(Function) },
//     );
//     expect(scope.getState(networkModel._$providers)).toEqual({
//       '0x01': { connect: connectMock, isConnected: true },
//     });
//   });
// });
