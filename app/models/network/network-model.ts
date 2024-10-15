import { combine, createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { isEmpty, keyBy, orderBy } from 'lodash-es';
import { combineEvents, readonly, spread } from 'patronum';
import { type PolkadotClient, createClient } from 'polkadot-api';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

import { TelegramApi, chainsApi } from '@/shared/api';
import { CONNECTIONS_STORE, DEFAULT_CHAINS_ORDER, DEFAULT_CONNECTED_CHAINS, nonNullable } from '@/shared/helpers';
import { type Asset, type AssetsMap, type Chain, type ChainsMap } from '@/types/substrate';

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

const requestChainsFx = createEffect(async (file: 'chains_dev' | 'chains_prod'): Promise<Record<ChainId, Chain>> => {
  const chains = await chainsApi.getChainsData({ file, sort: true });

  return keyBy(chains, 'chainId');
});

const initConnectionsFx = createEffect((chainsMap: Record<ChainId, AssetId[]>) => {
  Object.entries(chainsMap).forEach(([chainId, assetIds]) => {
    assetIds.forEach(assetId => assetInitialized({ chainId: chainId as ChainId, assetId }));
  });
});

const getConnectedAssetsFx = createEffect(async (): Promise<Record<ChainIndex, AssetId[]>> => {
  const connections = await TelegramApi.getItem(CONNECTIONS_STORE);

  const result: Record<ChainIndex, AssetId[]> = {};
  const entries = connections.split(';').filter(item => item.trim() !== '');

  for (const entry of entries) {
    const [key, values] = entry.split('_');
    result[Number(key)] = values.split(',').map(Number);
  }

  return result;
});

const updateAssetsInCloudFx = createEffect((assets: Record<ChainIndex, AssetId[]>) => {
  const webApp = window.Telegram?.WebApp;

  if (!webApp) return;

  const joinedAssets = Object.entries(assets).reduce((acc, [chainIndex, assetIds]) => {
    return acc + `${chainIndex}_${assetIds.join(',')};`;
  }, '');

  webApp.CloudStorage.setItem(CONNECTIONS_STORE, joinedAssets);
});

type CreateClientParams = {
  name: string;
  chainId: ChainId;
  nodes: string[];
};
const createPolkadotClientFx = createEffect((params: CreateClientParams): PolkadotClient => {
  const boundConnected = scopeBind(connected, { safe: true });
  const boundDisconnected = scopeBind(disconnected, { safe: true });
  const boundFailed = scopeBind(failed, { safe: true });

  // To support old Polkadot-SDK 1.1.0 <= x < 1.11.0
  // More => https://papi.how/requirements#polkadot-sdk-110--x--1110
  return createClient(
    withPolkadotSdkCompat(
      getWsProvider(params.nodes, status => {
        switch (status.type) {
          // Connecting
          case 0:
            console.info('⚫️ Connecting to ==> ', params.name);
            break;
          // Connected
          case 1:
            console.info('🟢 Provider connecting ==> ', params.name);
            boundConnected(params.chainId);
            break;
          // Error
          case 2:
            console.info('🔴 Provider error ==> ', params.name);
            boundFailed(params.chainId);
            break;
          // Close
          case 3:
            console.info('🟠 Provider disconnected ==> ', params.name);
            boundDisconnected(params.chainId);
            break;
        }
      }),
    ),
  );
});

const disconnectFx = createEffect(async (client: PolkadotClient): Promise<ChainId> => {
  const chainSpecData = await client.getChainSpecData();
  client.destroy();

  return chainSpecData.genesisHash as ChainId;
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
  source: $chains,
  fn: (chains, chainId) => ({
    chainId,
    name: chains[chainId].name,
    nodes: chains[chainId].nodes.map(node => node.url),
  }),
  target: createPolkadotClientFx,
});

// Updates chain's connection client & status
sample({
  clock: createPolkadotClientFx.done,
  source: $connections,
  fn: (connections, { result, params }) => ({
    ...connections,
    [params.chainId]: { client: result, status: 'connecting' },
  }),
  target: $connections,
});

sample({
  clock: chainDisconnected,
  source: $connections,
  filter: (connections, chainId) => {
    return connections[chainId].status !== 'disconnected';
  },
  fn: (connections, chainId) => {
    return connections[chainId].client!;
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
  clock: connected,
  source: $connections,
  // filter: (connections, chainId) => {
  //   // We don't rely on connected event when start chain for the first time
  //   // createProviderFx.doneData is responsible for that
  //   return connections[chainId].status !== 'connecting';
  // },
  fn: (connections, chainId) => ({
    data: {
      ...connections,
      [chainId]: { ...connections[chainId], status: 'connected' },
    },
    event: {
      chainId,
      status: 'connected' as const,
    },
  }),
  target: spread({
    data: $connections,
    event: connectionChanged,
  }),
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

sample({
  clock: failed,
  source: $connections,
  fn: (connections, chainId) => ({
    data: {
      ...connections,
      [chainId]: { status: 'disconnected' as const },
    },
    event: {
      chainId,
      status: 'disconnected' as const,
    },
  }),
  target: spread({
    data: $connections,
    event: connectionChanged,
  }),
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

    requestChainsFx,
    getConnectedAssetsFx,
    createPolkadotClientFx,
    disconnectFx,
  },
};
