import { createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { keyBy } from 'lodash-es';
import { combineEvents, spread } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { DEFAULT_CHAINS } from '@/common/utils/chains';
import { chainsService, metadataService } from '@/services';
import { providerService } from '@/services/network/provider-service';
import { type Chain, type ChainMetadata } from '@/types/substrate';

import { networkUtils } from './network-utils';
import { type Connection, ConnectionStatus, type ProviderWithMetadata } from './types';

const networkStarted = createEvent<'chains_dev' | 'chains_prod'>();
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

const populateChainsFx = createEffect(async (file: 'chains_dev' | 'chains_prod'): Promise<Record<ChainId, Chain>> => {
  const chains = await chainsService.getChainsData({ file, sort: true });

  return keyBy(chains, 'chainId');
});

const getConnectedChainIndicesFx = createEffect((): Promise<ChainIndex[]> => {
  const cloud = '3_0,2,3;19_0,2,3;'; // Karura & unknown chain
  const chainIndices = cloud.match(/(\d+)_/g)?.map(match => match[0]);

  return Promise.resolve(chainIndices || []);

  // TODO: uncomment during task - https://app.clickup.com/t/869502m30
  // const webApp = window.Telegram?.WebApp;
  //
  // if (!webApp) return Promise.resolve([]);
  //
  // return new Promise(resolve => {
  //   // connections format is chainIndex_assetId1,...,assetIdn;
  //   webApp.CloudStorage.getItem(CONNECTIONS_STORE, (error, connections) => {
  //     if (error || !connections) resolve([]);
  //
  //     const chainIndices = (connections as string).match(/(\d)_/g)?.map(match => match[0]);
  //     resolve(chainIndices || []);
  //   });
  // });
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

const initConnectionsFx = createEffect((chainIds: ChainId[]) => {
  chainIds.forEach(chainConnected);
});

type CreateProviderParams = {
  name: string;
  chainId: ChainId;
  nodes: string[];
  metadata?: ChainMetadata;
};
const createProviderFx = createEffect(
  (params: CreateProviderParams): Promise<{ provider: ProviderWithMetadata; api: ApiPromise }> => {
    const boundConnected = scopeBind(connected, { safe: true });
    const boundDisconnected = scopeBind(disconnected, { safe: true });
    const boundFailed = scopeBind(failed, { safe: true });

    return providerService.createConnector(
      { nodes: params.nodes, metadata: params.metadata?.metadata },
      {
        onConnected: () => {
          console.info('🟢 Provider connected ==> ', params.name);
          boundConnected(params.chainId);
        },
        onDisconnected: () => {
          console.info('🟠 Provider disconnected ==> ', params.name);
          boundDisconnected(params.chainId);
        },
        onError: () => {
          console.info('🔴 Provider error ==> ', params.name);
          boundFailed(params.chainId);
        },
      },
    );
  },
);

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
  target: [populateChainsFx, getConnectedChainIndicesFx],
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
      connections[chainId as ChainId] = { status: ConnectionStatus.DISCONNECTED };
    }

    return connections;
  },
  target: $connections,
});

sample({
  clock: combineEvents([populateChainsFx.doneData, getConnectedChainIndicesFx.doneData]),
  fn: ([chains, chainIndices]) => {
    const mapper = <T extends string, K extends Record<T, true>>(acc: K, value: T) => ({ ...acc, [value]: true });

    const defaultChainsMap = Object.values(DEFAULT_CHAINS).reduce<Record<ChainId, true>>(mapper, {});
    const activeChainIndices = chainIndices.reduce<Record<ChainIndex, true>>(mapper, {});

    return Object.values(chains)
      .filter(({ chainId, chainIndex }) => defaultChainsMap[chainId] || activeChainIndices[chainIndex])
      .map(chain => chain.chainId);
  },
  target: initConnectionsFx,
});

// TODO: save new connection in CloudStorage - https://app.clickup.com/t/869502m30
sample({
  clock: chainConnected,
  source: {
    chains: $chains,
    metadata: $metadata,
  },
  fn: ({ chains, metadata }, chainId) => {
    const name = chains[chainId].name;
    const nodes = chains[chainId].nodes.map(node => node.url);
    const newMetadata = networkUtils.getNewestMetadata(metadata)[chainId];

    return { name, chainId, nodes, metadata: newMetadata };
  },
  target: createProviderFx,
});

// Updates connection provider, api, status
sample({
  clock: createProviderFx.doneData,
  source: $connections,
  fn: (connections, { provider, api }) => {
    const chainId = api.genesisHash.toHex();
    const event = { chainId, status: ConnectionStatus.CONNECTED };
    const data = { ...connections, [chainId]: { provider, api, status: ConnectionStatus.CONNECTED } };

    return { event, data };
  },
  target: spread({
    data: $connections,
    event: connectionStatusChanged,
  }),
});

// Updates connection status, provider and api are the same
sample({
  clock: connected,
  source: $connections,
  filter: (connections, chainId) => {
    return Boolean(connections[chainId].api) && connections[chainId].status !== ConnectionStatus.CONNECTED;
  },
  fn: (connections, chainId) => {
    const event = { chainId, status: ConnectionStatus.CONNECTED };
    const data = { ...connections, [chainId]: { ...connections[chainId], status: ConnectionStatus.CONNECTED } };

    return { event, data };
  },
  target: spread({
    data: $connections,
    event: connectionStatusChanged,
  }),
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
  fn: (connections, chainId) => ({
    ...connections,
    [chainId]: { status: ConnectionStatus.DISCONNECTED },
  }),
  target: $connections,
});

sample({
  clock: disconnected,
  fn: chainId => ({ chainId, status: ConnectionStatus.DISCONNECTED }),
  target: connectionStatusChanged,
});

sample({
  clock: failed,
  fn: chainId => ({ chainId, status: ConnectionStatus.ERROR }),
  target: connectionStatusChanged,
});

// =====================================================
// ================ Metadata section ===================
// =====================================================

sample({
  clock: createProviderFx.doneData,
  fn: ({ api }) => api,
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

  /* Internal API (tests only) */
  _effects: {
    populateChainsFx,
    getConnectedChainIndicesFx,
    createProviderFx,
  },
};
