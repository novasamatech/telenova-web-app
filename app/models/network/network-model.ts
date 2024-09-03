import { combine, createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { isEmpty, keyBy, orderBy } from 'lodash-es';
import { combineEvents, readonly, spread } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { chainsApi, metadataApi } from '@/shared/api';
import { type ProviderWithMetadata, providerApi } from '@/shared/api/network/provider-api';
import { CONNECTIONS_STORE, nonNullable } from '@/shared/helpers';
import { DEFAULT_CHAINS_ORDER, DEFAULT_CONNECTED_CHAINS } from '@/shared/helpers/chains';
import { type Asset, type AssetsMap, type Chain, type ChainMetadata, type ChainsMap } from '@/types/substrate';

import { type Connection } from './types';

const networkStarted = createEvent<'chains_dev' | 'chains_prod'>();
const chainConnected = createEvent<ChainId>();
const chainDisconnected = createEvent<ChainId>();

const assetInitialized = createEvent<{ chainId: ChainId; assetId: AssetId }>();

const assetConnected = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const assetDisconnected = createEvent<{ chainId: ChainId; assetId: AssetId }>();

const assetChanged = createEvent<{ chainId: ChainId; assetId: AssetId; status: 'on' | 'off' }>();
const connectionChanged = createEvent<{ chainId: ChainId; status: Connection['status'] }>();

const connected = createEvent<ChainId>();
const disconnected = createEvent<ChainId>();
const failed = createEvent<ChainId>();

const $chains = createStore<ChainsMap>({});
const $assets = createStore<AssetsMap>({});

const $connections = createStore<Record<ChainId, Connection>>({});

const $metadata = createStore<ChainMetadata[]>([]);
const $metadataSubscriptions = createStore<Record<ChainId, VoidFunction>>({});

const initConnectionsFx = createEffect((chainsMap: Record<ChainId, AssetId[]>) => {
  Object.entries(chainsMap).forEach(([chainId, assetIds]) => {
    assetIds.forEach(assetId => assetInitialized({ chainId: chainId as ChainId, assetId }));
  });
});

const requestChainsFx = createEffect(async (file: 'chains_dev' | 'chains_prod'): Promise<Record<ChainId, Chain>> => {
  const chains = await chainsApi.getChainsData({ file, sort: true });

  return keyBy(chains, 'chainId');
});

const getConnectedAssetsFx = createEffect((): Promise<Record<ChainIndex, AssetId[]>> => {
  const webApp = window.Telegram?.WebApp;

  if (!webApp) return Promise.resolve({});

  return new Promise(resolve => {
    // connections format is chainIndex_assetId1,...,assetIdn;
    webApp.CloudStorage.getItem(CONNECTIONS_STORE, (error, connections) => {
      if (error || !connections) resolve({});

      const result: Record<ChainIndex, AssetId[]> = {};
      const entries = connections!.split(';').filter(item => item.trim() !== '');

      entries.forEach(entry => {
        const [key, values] = entry.split('_');
        result[Number(key)] = values.split(',').map(Number);
      });

      resolve(result);
    });
  });
});

const updateAssetsInCloudFx = createEffect((assets: Record<ChainIndex, AssetId[]>) => {
  const webApp = window.Telegram?.WebApp;

  if (!webApp) return;

  const joinedAssets = Object.entries(assets).reduce((acc, [chainIndex, assetIds]) => {
    return acc + `${chainIndex}_${assetIds.join(',')};`;
  }, '');

  webApp.CloudStorage.setItem(CONNECTIONS_STORE, joinedAssets);
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

    console.info('⚫️ Connecting to ==> ', params.name);

    return providerApi.createConnector(
      params.chainId,
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
// ================= Computed section ==================
// =====================================================

const $sortedAssets = combine($assets, assets => {
  if (isEmpty(assets)) return [];

  // Predefined array with empty elements for the first coming assets
  const preSortedAssets: ([ChainId, Asset] | null)[] = Object.values(DEFAULT_CHAINS_ORDER).flatMap(assetTuples => {
    return Array.from({ length: Object.keys(assetTuples).length }, () => null);
  });

  const assetsToSort: [ChainId, Asset][] = [];

  for (const [chainId, assetMap] of Object.entries(assets)) {
    const typedChainId = chainId as ChainId;
    const isChainToPresort = DEFAULT_CHAINS_ORDER[typedChainId];

    for (const asset of Object.values(assetMap)) {
      if (!isChainToPresort || !(asset.assetId in DEFAULT_CHAINS_ORDER[typedChainId])) {
        assetsToSort.push([typedChainId, asset]);
      } else {
        const index = DEFAULT_CHAINS_ORDER[typedChainId][asset.assetId];
        preSortedAssets[index] = [typedChainId, asset];
      }
    }
  }

  // DOT KSM USDT ... rest alphabetically
  return preSortedAssets.filter(nonNullable).concat(orderBy(assetsToSort, ([_, asset]) => asset.symbol, 'asc'));
});

// =====================================================
// ================= Network section ===================
// =====================================================

sample({
  clock: networkStarted,
  target: [requestChainsFx, getConnectedAssetsFx],
});

sample({
  clock: requestChainsFx.doneData,
  target: $chains,
});

sample({
  clock: requestChainsFx.doneData,
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
  clock: requestChainsFx.doneData,
  fn: chains => {
    const chainsMap: Record<ChainId, AssetId[]> = {};

    for (const chain of Object.values(chains)) {
      if (!DEFAULT_CONNECTED_CHAINS[chain.chainId]) continue;

      chainsMap[chain.chainId] = DEFAULT_CONNECTED_CHAINS[chain.chainId];
    }

    return chainsMap;
  },
  target: initConnectionsFx,
});

sample({
  clock: combineEvents([requestChainsFx.doneData, getConnectedAssetsFx.doneData]),
  fn: ([chains, assetsMap]) => {
    const chainsMap: Record<ChainId, AssetId[]> = {};

    for (const chain of Object.values(chains)) {
      if (!assetsMap[chain.chainIndex]) continue;

      chainsMap[chain.chainId] = assetsMap[chain.chainIndex];
    }

    return chainsMap;
  },
  target: initConnectionsFx,
});

sample({
  clock: [assetInitialized, assetConnected],
  source: {
    chains: $chains,
    assets: $assets,
    connections: $connections,
  },
  filter: ({ assets }, { chainId, assetId }) => {
    return !assets[chainId]?.[assetId];
  },
  fn: ({ chains, connections, assets }, { chainId, assetId }) => {
    const isDisconnected = connections[chainId].status === 'disconnected';
    const asset = chains[chainId].assets.find(a => a.assetId === assetId);
    const newAssets = { ...assets, [chainId]: { ...assets[chainId], [assetId]: asset! } };

    // If chain is disconnected then connect, notify with new asset, $assets is updated anyway
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
  filter: ({ assets, connections }, { chainId }) => {
    const isDisconnected = connections[chainId]?.status === 'disconnected';
    const isAssetExist = Boolean(assets[chainId]);

    return !isDisconnected && isAssetExist;
  },
  fn: ({ connections, assets }, { chainId, assetId }) => {
    const isConnected = connections[chainId].status !== 'disconnected';
    const isLastAsset = Object.values(assets[chainId]!).filter(isActive => isActive).length === 1;

    const { [chainId]: _c, ...restChains } = assets;
    const { [assetId]: _a, ...restAssets } = assets[chainId]!;
    const newAssets = isLastAsset ? restChains : { ...assets, [chainId]: restAssets };

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

sample({
  clock: [assetConnected, assetDisconnected],
  source: {
    chains: $chains,
    assets: $assets,
  },
  fn: ({ chains, assets }) => {
    const result: Record<ChainIndex, AssetId[]> = {};

    for (const chainId of Object.keys(assets)) {
      const typedChainId = chainId as ChainId;
      const chain = chains[typedChainId];

      if (!chain || !assets[typedChainId]) continue;

      const assetToExclude = DEFAULT_CONNECTED_CHAINS[typedChainId];

      // Exclude assets that appear in DEFAULT_CONNECTED_CHAINS
      const assetsToSave = Object.keys(assets[typedChainId])
        .filter(assetId => !assetToExclude || !assetToExclude.includes(Number(assetId)))
        .map(Number);

      if (assetsToSave.length === 0) continue;

      result[chain.chainIndex] = assetsToSave;
    }

    return result;
  },
  target: updateAssetsInCloudFx,
});

sample({
  clock: chainConnected,
  source: $connections,
  fn: (connections, chainId) => ({
    ...connections,
    [chainId]: { ...connections[chainId], status: 'connecting' },
  }),
  target: $connections,
});

sample({
  clock: chainConnected,
  source: {
    chains: $chains,
    metadata: $metadata,
  },
  fn: ({ chains, metadata }, chainId) => {
    const name = chains[chainId].name;
    const nodes = chains[chainId].nodes.map(node => node.url);

    const newMetadata: Record<ChainId, ChainMetadata> = {};
    for (const data of metadata) {
      if (data.version < (newMetadata[data.chainId]?.version || -1)) continue;

      newMetadata[data.chainId] = data;
    }

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
    const event = { chainId, status: 'connected' as const };
    const data = { ...connections, [chainId]: { provider, api, status: 'connected' as const } };

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
  filter: (connections, chainId) => {
    // We don't rely on connected event when start chain for the first time
    // createProviderFx.doneData is responsible for that
    return connections[chainId].status !== 'connecting';
  },
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
  // All available chains
  $chains: readonly($chains),

  // Selected assets
  $assets: readonly($assets),

  // ChainId/Asset tuple sorted by asset symbol
  $sortedAssets: readonly($sortedAssets),

  // All available chains with connection statuses
  $connections: readonly($connections),

  // Flag for loading chains
  isChainsLoading: requestChainsFx.pending,

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

    requestChainsFx,
    getConnectedAssetsFx,
    createProviderFx,
    disconnectFx,
    subscribeMetadataFx,
    requestMetadataFx,
  },
};
