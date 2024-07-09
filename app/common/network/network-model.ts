import { createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { keyBy } from 'lodash';

import { type ApiPromise } from '@polkadot/api';

import { chainsService, metadataService } from '@/services';
import { networkService } from '@/services/network/network-service';
import { type Chain, type ChainMetadata } from '@/types/substrate';

import { networkUtils } from './network-utils';
import { type Connection, ConnectionStatus, type ProviderWithMetadata } from './types';

const networkStarted = createEvent();
const chainConnected = createEvent<ChainId>();
const chainDisconnected = createEvent<ChainId>();
const connectionStatusChanged = createEvent<{ chainId: ChainId; status: ConnectionStatus }>();

const connected = createEvent<ChainId>();
const disconnected = createEvent<ChainId>();
const failed = createEvent<ChainId>();

const $chains = createStore<Record<ChainId, Chain>>({});
const $connections = createStore<Record<ChainId, Connection>>({});

const $metadata = createStore<ChainMetadata[]>([]);
const $metadataSubscriptions = createStore<Record<ChainId, VoidFunction>>({});

const populateChainsFx = createEffect((): Record<ChainId, Chain> => {
  const chains = chainsService.getChainsData({ sort: true });

  return keyBy(chains, 'chainId');
});

const populateConnectionsFx = createEffect((): Promise<Connection[]> => {
  // Read from CloudStorage
  return Promise.resolve([]);
  // return storageService.connections.readAll();
});

// const getDefaultStatusesFx = createEffect((chains: Record<ChainId, Chain>): Record<ChainId, ConnectionStatus> => {
//   return Object.values(chains).reduce<Record<ChainId, ConnectionStatus>>((acc, chain) => {
//     acc[chain.chainId] = ConnectionStatus.DISCONNECTED;
//
//     return acc;
//   }, {});
// });

type MetadataSubResult = {
  chainId: ChainId;
  unsubscribe: VoidFunction;
};
const subscribeMetadataFx = createEffect(async (api: ApiPromise): Promise<MetadataSubResult> => {
  const unsubscribe = await metadataService.subscribeMetadata(api, requestMetadataFx);

  return { chainId: api.genesisHash.toHex(), unsubscribe };
});

const requestMetadataFx = createEffect((api: ApiPromise): Promise<ChainMetadata> => {
  return metadataService.requestMetadata(api);
});

const unsubscribeMetadataFx = createEffect((unsubscribe: VoidFunction) => {
  unsubscribe();
});

type ProviderMetadataParams = {
  provider: ProviderWithMetadata;
  metadata: Metadata;
};
const updateProviderMetadataFx = createEffect(({ provider, metadata }: ProviderMetadataParams) => {
  provider.updateMetadata(metadata);
});

const initConnectionsFx = createEffect((chains: Record<ChainId, Chain>) => {
  Object.keys(chains).forEach(chainId => chainConnected(chainId as ChainId));
});

type CreateProviderParams = {
  chainId: ChainId;
  nodes: string[];
  metadata?: ChainMetadata;
};
const createProviderFx = createEffect(({ chainId, nodes, metadata }: CreateProviderParams): ProviderWithMetadata => {
  const boundConnected = scopeBind(connected, { safe: true });
  const boundDisconnected = scopeBind(disconnected, { safe: true });
  const boundFailed = scopeBind(failed, { safe: true });

  return networkService.createProvider(
    { nodes, metadata: metadata?.metadata },
    {
      onConnected: () => {
        console.info('🟢 Provider connected ==> ', chainId);
        boundConnected(chainId);
      },
      onDisconnected: () => {
        console.info('🟠 Provider disconnected ==> ', chainId);
        boundDisconnected(chainId);
      },
      onError: () => {
        console.info('🔴 Provider error ==> ', chainId);
        boundFailed(chainId);
      },
    },
  );
});

const createApiFx = createEffect((provider: ProviderWithMetadata): Promise<ApiPromise> => {
  return networkService.createApi(provider);
});

type DisconnectParams = {
  provider: ProviderWithMetadata;
  api: ApiPromise;
};
const disconnectFx = createEffect(async ({ provider, api }: DisconnectParams): Promise<ChainId> => {
  const chainId = api.genesisHash.toHex();
  await api.disconnect();
  await provider.disconnect();

  return chainId;
});

// =====================================================
// ================= Network section ===================
// =====================================================

sample({
  clock: networkStarted,
  target: [populateChainsFx, populateConnectionsFx],
});

sample({
  clock: populateChainsFx.doneData,
  target: $chains,
});

sample({
  clock: populateChainsFx.doneData,
  fn: chains => {
    const connections: Record<ChainId, Connection> = {};

    for (const chainId of Object.keys(chains)) {
      connections[chainId as ChainId] = { provider: undefined, api: undefined, status: ConnectionStatus.DISCONNECTED };
    }

    return connections;
  },
  target: $connections,
});

// sample({
//   clock: getDefaultStatusesFx.doneData,
//   target: $statuses,
// });

// sample({
//   clock: populateConnectionsFx.doneData,
//   source: $chains,
//   fn: (chains, connections) => {
//     const connectionsMap = dictionary(connections, 'chainId');
//
//     return Object.keys(chains).reduce<Record<ChainId, Connection>>((acc, key) => {
//       const chainId = key as ChainId;
//       acc[chainId] = connectionsMap[chainId] || { chainId, connectionType: 'disabled' };
//
//       return acc;
//     }, {});
//   },
//   target: $connections,
// });

// TODO: start only DOT KSM AH_usdt WND (dev) and CloudStorage chains
sample({
  clock: populateConnectionsFx.doneData,
  source: $chains,
  target: initConnectionsFx,
});

// TODO: save new connection in CloudStorage
sample({
  clock: chainConnected,
  source: {
    chains: $chains,
    metadata: $metadata,
  },
  fn: ({ chains, metadata }, chainId) => {
    const nodes = chains[chainId].nodes.map(node => node.url);
    const newMetadata = networkUtils.getNewestMetadata(metadata)[chainId];

    return { chainId, nodes, metadata: newMetadata };
  },
  target: createProviderFx,
});

sample({
  clock: createProviderFx.done,
  source: $connections,
  fn: (connections, { params, result: provider }) => ({
    ...connections,
    [params.chainId]: { provider, api: undefined, status: ConnectionStatus.DISCONNECTED },
  }),
  target: $connections,
});

sample({
  clock: connected,
  source: $connections,
  filter: (connections, chainId) => Boolean(connections[chainId].provider),
  fn: (connections, chainId) => connections[chainId].provider!,
  target: createApiFx,
});

sample({
  clock: createApiFx.doneData,
  source: $connections,
  fn: (connections, api) => {
    const chainId = api.genesisHash.toHex();

    return {
      ...connections,
      [chainId]: { ...connections[chainId], api, status: ConnectionStatus.CONNECTED },
    };
  },
  target: $connections,
});

sample({
  clock: createApiFx.doneData,
  fn: api => ({
    chainId: api.genesisHash.toHex(),
    status: ConnectionStatus.CONNECTED,
  }),
  target: connectionStatusChanged,
});

sample({
  clock: disconnected,
  fn: chainId => ({ chainId, status: ConnectionStatus.CONNECTED }),
  target: connectionStatusChanged,
});

sample({
  clock: failed,
  fn: chainId => ({ chainId, status: ConnectionStatus.ERROR }),
  target: connectionStatusChanged,
});

sample({
  clock: chainDisconnected,
  source: $connections,
  filter: (connections, chainId) => {
    return Boolean(connections[chainId].provider) && Boolean(connections[chainId].api);
  },
  fn: (connections, chainId) => {
    const { api, provider } = connections[chainId];

    return { api: api!, provider: provider! };
  },
  target: disconnectFx,
});

sample({
  clock: disconnectFx.doneData,
  source: $connections,
  fn: (connections, chainId) => {
    return {
      ...connections,
      [chainId]: { provider: undefined, api: undefined, status: ConnectionStatus.DISCONNECTED },
    };
  },
  target: $connections,
});

// =====================================================
// ================ Metadata section ===================
// =====================================================

sample({
  clock: createApiFx.doneData,
  target: subscribeMetadataFx,
});

sample({
  clock: subscribeMetadataFx.doneData,
  source: $metadataSubscriptions,
  fn: (subscriptions, { chainId, unsubscribe }) => ({
    ...subscriptions,
    [chainId]: unsubscribe,
  }),
  target: $metadataSubscriptions,
});

sample({
  clock: disconnectFx.doneData,
  source: $metadataSubscriptions,
  fn: (metadataSubscriptions, chainId) => metadataSubscriptions[chainId],
  target: unsubscribeMetadataFx,
});

sample({
  clock: disconnectFx.doneData,
  source: $metadataSubscriptions,
  fn: (subscriptions, chainId) => {
    const { [chainId]: _, ...rest } = subscriptions;

    return rest;
  },
  target: $metadataSubscriptions,
});

sample({
  clock: requestMetadataFx.doneData,
  source: $metadata,
  filter: (metadata, newMetadata) => {
    return metadata.every(({ chainId, version }) => {
      return chainId !== newMetadata.chainId || version !== newMetadata.version;
    });
  },
  fn: (metadata, newMetadata) => metadata.concat(newMetadata),
  target: $metadata,
});

sample({
  clock: requestMetadataFx.doneData,
  source: {
    connections: $connections,
    metadata: $metadata,
  },
  filter: ({ metadata }, newMetadata) => {
    return metadata.every(({ chainId, version }) => {
      return chainId !== newMetadata.chainId || version !== newMetadata.version;
    });
  },
  fn: ({ connections }, newMetadata) => {
    const chainId = newMetadata.chainId;

    return {
      provider: connections[chainId].provider!,
      metadata: newMetadata.metadata,
    };
  },
  target: updateProviderMetadataFx,
});

export const networkModel = {
  $chains,
  $connections,

  input: {
    networkStarted,
    chainConnected,
    chainDisconnected,
  },

  output: {
    connectionStatusChanged,
  },
};
