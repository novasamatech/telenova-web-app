import { createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { keyBy } from 'lodash';
import { spread } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { dictionary } from '@/common/utils';
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

const $providers = createStore<Record<ChainId, ProviderWithMetadata>>({});
const $apis = createStore<Record<ChainId, ApiPromise>>({});

const $connections = createStore<Record<ChainId, Connection>>({});
const $connectionStatuses = createStore<Record<ChainId, ConnectionStatus>>({});

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

const getDefaultStatusesFx = createEffect((chains: Record<ChainId, Chain>): Record<ChainId, ConnectionStatus> => {
  return Object.values(chains).reduce<Record<ChainId, ConnectionStatus>>((acc, chain) => {
    acc[chain.chainId] = ConnectionStatus.DISCONNECTED;

    return acc;
  }, {});
});

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

const disconnectProviderFx = createEffect((provider: ProviderWithMetadata): Promise<void> => {
  return provider.disconnect();
});

type CreateApiParams = {
  chainId: ChainId;
  providers: Record<ChainId, ProviderWithMetadata>;
};
const createApiFx = createEffect(({ chainId, providers }: CreateApiParams): Promise<ApiPromise> => {
  return networkService.createApi(providers[chainId]);
});

const disconnectApiFx = createEffect(async (api: ApiPromise): Promise<ChainId> => {
  const chainId = api.genesisHash.toHex();
  await api.disconnect();

  return chainId;
});

sample({
  clock: networkStarted,
  target: [populateChainsFx, populateConnectionsFx],
});

sample({
  clock: populateChainsFx.doneData,
  target: [$chains, getDefaultStatusesFx],
});

sample({
  clock: getDefaultStatusesFx.doneData,
  target: $connectionStatuses,
});

sample({
  clock: populateConnectionsFx.doneData,
  source: $chains,
  fn: (chains, connections) => {
    const connectionsMap = dictionary(connections, 'chainId');

    return Object.keys(chains).reduce<Record<ChainId, Connection>>((acc, key) => {
      const chainId = key as ChainId;
      acc[chainId] = connectionsMap[chainId] || { chainId, connectionType: 'enabled' };

      return acc;
    }, {});
  },
  target: $connections,
});

sample({
  clock: populateConnectionsFx.doneData,
  source: $chains,
  target: initConnectionsFx,
});

sample({
  clock: chainConnected,
  source: {
    chains: $chains,
    connections: $connections,
    metadata: $metadata,
  },
  filter: ({ connections }, chainId) => {
    return !connections[chainId] || networkUtils.isEnabledConnection(connections[chainId]);
  },
  fn: (store, chainId) => {
    const nodes = store.chains[chainId]?.nodes.map(node => node.url);

    const metadata = networkUtils.getNewestMetadata(store.metadata)[chainId];

    return { chainId, nodes, metadata };
  },
  target: createProviderFx,
});

sample({
  clock: createProviderFx.done,
  source: $providers,
  fn: (providers, { params, result: provider }) => ({
    ...providers,
    [params.chainId]: provider,
  }),
  target: $providers,
});

sample({
  clock: createProviderFx.done,
  source: $connectionStatuses,
  fn: (statuses, { params }) => ({
    ...statuses,
    [params.chainId]: ConnectionStatus.CONNECTING,
  }),
  target: $connectionStatuses,
});

sample({
  clock: connected,
  source: $providers,
  fn: (providers, chainId) => ({ chainId, providers }),
  target: createApiFx,
});

sample({
  clock: createApiFx.done,
  source: $apis,
  fn: (apis, { result, params }) => {
    return { ...apis, [params.chainId]: result };
  },
  target: $apis,
});

sample({
  clock: createApiFx.done,
  source: $connectionStatuses,
  fn: (statuses, { params }) => ({
    newStatuses: { ...statuses, [params.chainId]: ConnectionStatus.CONNECTED },
    event: { chainId: params.chainId, status: ConnectionStatus.CONNECTED },
  }),
  target: spread({
    newStatuses: $connectionStatuses,
    event: connectionStatusChanged,
  }),
});

sample({
  clock: disconnected,
  source: $connectionStatuses,
  fn: (statuses, chainId) => ({
    newStatuses: { ...statuses, [chainId]: ConnectionStatus.DISCONNECTED },
    event: { chainId, status: ConnectionStatus.DISCONNECTED },
  }),
  target: spread({
    newStatuses: $connectionStatuses,
    event: connectionStatusChanged,
  }),
});

sample({
  clock: failed,
  source: $connectionStatuses,
  fn: (statuses, chainId) => ({
    newStatuses: { ...statuses, [chainId]: ConnectionStatus.ERROR },
    event: { chainId, status: ConnectionStatus.ERROR },
  }),
  target: spread({
    newStatuses: $connectionStatuses,
    event: connectionStatusChanged,
  }),
});

sample({
  clock: [disconnected, failed],
  source: $apis,
  fn: (apis, chainId) => apis[chainId],
  target: disconnectApiFx,
});

sample({
  clock: disconnectApiFx.doneData,
  source: $apis,
  fn: (apis, chainId) => {
    const { [chainId]: _, ...rest } = apis;

    return rest;
  },
  target: $apis,
});

sample({
  clock: chainDisconnected,
  source: $providers,
  filter: (providers, chainId) => Boolean(providers[chainId]),
  fn: (providers, chainId) => providers[chainId],
  target: disconnectProviderFx,
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
  clock: disconnectApiFx.doneData,
  source: $metadataSubscriptions,
  fn: (metadataSubscriptions, chainId) => metadataSubscriptions[chainId],
  target: unsubscribeMetadataFx,
});

sample({
  clock: disconnectApiFx.doneData,
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
    providers: $providers,
    metadata: $metadata,
  },
  filter: ({ metadata }, newMetadata) => {
    return metadata.every(({ chainId, version }) => {
      return chainId !== newMetadata.chainId || version !== newMetadata.version;
    });
  },
  fn: ({ providers }, newMetadata) => ({
    provider: providers[newMetadata.chainId],
    metadata: newMetadata.metadata,
  }),
  target: updateProviderMetadataFx,
});

export const networkModel = {
  $chains,
  $apis,
  $connectionStatuses,
  $connections,

  events: {
    networkStarted,
    chainConnected,
    chainDisconnected,
  },

  output: {
    connectionStatusChanged,
  },

  /* Internal API (tests only) */
  _$providers: $providers,
};
