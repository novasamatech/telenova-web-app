import { createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { keyBy } from 'lodash-es';
import { combineEvents, readonly, spread } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { DEFAULT_CONNECTED_CHAINS } from '@/common/utils/chains.ts';
import { chainsApi, metadataApi } from '@/shared/api';
import { type ProviderWithMetadata, providerApi } from '@/shared/api/network/provider-api';
import { type Chain, type ChainMetadata } from '@/types/substrate';

import { type Connection } from './types';

const networkStarted = createEvent<'chains_dev' | 'chains_prod'>();
const chainConnected = createEvent<ChainId>();
const chainDisconnected = createEvent<ChainId>();

const assetConnected = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const assetDisconnected = createEvent<{ chainId: ChainId; assetId: AssetId }>();

const assetChanged = createEvent<{ chainId: ChainId; assetId: AssetId; status: 'on' | 'off' }>();
const connectionChanged = createEvent<{ chainId: ChainId; status: Connection['status'] }>();

const connected = createEvent<ChainId>();
const disconnected = createEvent<ChainId>();
const failed = createEvent<ChainId>();

const $chains = createStore<Record<ChainId, Chain>>({});
const $assets = createStore<Record<ChainId, Record<AssetId, boolean>>>({});
const $connections = createStore<Record<ChainId, Connection>>({});

const $metadata = createStore<ChainMetadata[]>([]);
const $metadataSubscriptions = createStore<Record<ChainId, VoidFunction>>({});

const populateChainsFx = createEffect(async (file: 'chains_dev' | 'chains_prod'): Promise<Record<ChainId, Chain>> => {
  const chains = await chainsApi.getChainsData({ file, sort: true });

  return keyBy(chains, 'chainId');
});

const getConnectedAssetsFx = createEffect((): Promise<Record<ChainIndex, AssetId[]>> => {
  const cloud = '3_0,2,3;19_0,2,3;'; // Karura & unknown chain

  const result: Record<ChainIndex, AssetId[]> = {};
  const entries = cloud.split(';').filter(item => item.trim() !== '');

  entries.forEach(entry => {
    const [key, values] = entry.split('_');
    result[key] = values.split(',').map(Number);
  });

  return Promise.resolve(result);

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
  const unsubscribe = await metadataApi.subscribeMetadata(api, requestMetadataFx);

  return { chainId: api.genesisHash.toHex(), unsubscribe };
});

const requestMetadataFx = createEffect((api: ApiPromise): Promise<ChainMetadata> => {
  return metadataApi.requestMetadata(api);
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

const initConnectionsFx = createEffect((chainsMap: Record<ChainId, AssetId[]>) => {
  Object.entries(chainsMap).forEach(([chainId, values]) => {
    values.forEach(assetId => assetConnected({ chainId: chainId as ChainId, assetId }));
  });
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

    return providerApi.createConnector(
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
  target: [populateChainsFx, getConnectedAssetsFx],
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
      connections[chainId as ChainId] = { status: 'disconnected' };
    }

    return connections;
  },
  target: $connections,
});

sample({
  clock: combineEvents([populateChainsFx.doneData, getConnectedAssetsFx.doneData]),
  fn: ([chains, assetsMap]) => {
    const chainsMap: Record<ChainId, AssetId[]> = {};

    for (const chain of Object.values(chains)) {
      if (DEFAULT_CONNECTED_CHAINS[chain.chainId]) {
        chainsMap[chain.chainId] = [chain.assets[0].assetId];
      } else if (assetsMap[chain.chainIndex]) {
        chainsMap[chain.chainId] = assetsMap[chain.chainIndex];
      }
    }

    return chainsMap;
  },
  target: initConnectionsFx,
});

sample({
  clock: assetConnected,
  source: {
    assets: $assets,
    connections: $connections,
  },
  fn: ({ connections, assets }, { chainId, assetId }) => {
    const isDisconnected = connections[chainId].status === 'disconnected';
    const newAssets = { ...assets, [chainId]: { ...assets[chainId], [assetId]: true } };

    // If chain is disconnected then connect, notify with new asset, assets is updated anyway
    return {
      assets: newAssets,
      notify: { chainId, assetId, status: 'on' as const },
      ...(isDisconnected && { connect: chainId }),
    };
  },
  target: spread({
    assets: $assets,
    notify: assetChanged,
    connect: chainConnected,
  }),
});

sample({
  clock: assetDisconnected,
  source: {
    assets: $assets,
    connections: $connections,
  },
  fn: ({ connections, assets }, { chainId, assetId }) => {
    const isConnected = connections[chainId].status !== 'disconnected';
    const isLastAsset = Object.values(assets[chainId]).filter(isActive => isActive).length === 1;
    const newAssets = { ...assets, [chainId]: { ...assets[chainId], [assetId]: false } };

    // If chain is not disconnected then disconnect, notify with asset, assets is updated anyway
    return {
      assets: newAssets,
      notify: { chainId, assetId, status: 'off' as const },
      ...(isConnected && isLastAsset && { disconnect: chainId }),
    };
  },
  target: spread({
    assets: $assets,
    notify: assetChanged,
    disconnect: chainDisconnected,
  }),
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
    const newMetadata = metadata.reduce<Record<ChainId, ChainMetadata>>((acc, data) => {
      if (data.version >= (acc[data.chainId]?.version || -1)) {
        acc[data.chainId] = data;
      }

      return acc;
    }, {});

    return { name, chainId, nodes, metadata: newMetadata[chainId] };
  },
  target: createProviderFx,
});

// Updates connection provider, api, status
sample({
  clock: createProviderFx.doneData,
  source: $connections,
  fn: (connections, { provider, api }) => {
    const chainId = api.genesisHash.toHex();
    const event = { chainId, status: 'connecting' as const };
    const data = { ...connections, [chainId]: { provider, api, status: 'connecting' as const } };

    return { event, data };
  },
  target: spread({
    data: $connections,
    event: connectionChanged,
  }),
});

// Updates connection status, provider and api are the same
sample({
  clock: connected,
  source: $connections,
  fn: (connections, chainId) => {
    const event = { chainId, status: 'connected' as const };
    const data = { ...connections, [chainId]: { ...connections[chainId], status: 'connected' as const } };

    return { event, data };
  },
  target: spread({
    data: $connections,
    event: connectionChanged,
  }),
});

sample({
  clock: chainDisconnected,
  source: $connections,
  filter: (connections, chainId) => {
    return (
      Boolean(connections[chainId].provider) &&
      Boolean(connections[chainId].api) &&
      connections[chainId].status !== 'disconnected'
    );
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
    [chainId]: { status: 'disconnected' },
  }),
  target: $connections,
});

sample({
  clock: disconnected,
  fn: chainId => ({ chainId, status: 'disconnected' as const }),
  target: connectionChanged,
});

sample({
  clock: failed,
  fn: chainId => ({ chainId, status: 'error' as const }),
  target: connectionChanged,
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
  $chains: readonly($chains),
  $assets: readonly($assets),
  $connections: readonly($connections),

  input: {
    networkStarted,
    assetConnected,
    assetDisconnected,
  },

  output: {
    assetChanged,
    connectionChanged,
  },

  /* Internal API (tests only) */
  _internal: {
    $chains,
    $assets,
    $connections,

    $metadata,
    $metadataSubscriptions,

    populateChainsFx,
    getConnectedAssetsFx,
    createProviderFx,
    disconnectFx,
    subscribeMetadataFx,
    requestMetadataFx,
  },
};
