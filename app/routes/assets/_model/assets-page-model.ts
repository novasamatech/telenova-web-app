import { combine, createEvent, createStore, restore, sample, split } from 'effector';
import { isEmpty, orderBy } from 'lodash-es';
import { readonly } from 'patronum';

import { nonNullable } from '@/common/utils';
import { DEFAULT_CONNECTED_CHAINS } from '@/common/utils/chains';
import { networkModel } from '@/models';
import { type Asset } from '@/types/substrate';

const pageMounted = createEvent();
const queryChanged = createEvent<string>();
const assetToggled = createEvent<{ chainId: ChainId; assetId: AssetId; selected: boolean }>();

const $query = restore(queryChanged, '');
const $filteredAssets = createStore<[ChainId, Asset, boolean][]>([]);

const $sortedAssets = combine(networkModel.$chains, chains => {
  if (isEmpty(chains)) return [];

  const assets = Object.values(chains).flatMap(chain => {
    const assetsToSkip: AssetId[] | undefined = DEFAULT_CONNECTED_CHAINS[chain.chainId];

    return chain.assets
      .map(asset => (assetsToSkip?.includes(asset.assetId) ? undefined : [chain.chainId, asset]))
      .filter(nonNullable);
  });

  return orderBy(assets, ([_, asset]) => (asset as Asset).symbol, 'asc');
});

split({
  source: assetToggled,
  match: ({ selected }) => (selected ? 'connect' : 'disconnect'),
  cases: {
    connect: networkModel.input.assetConnected,
    disconnect: networkModel.input.assetDisconnected,
  },
});

// Active first, inactive last when query is changed
sample({
  clock: [pageMounted, queryChanged],
  source: {
    assets: $sortedAssets,
    activeAssets: networkModel.$assets,
  },
  fn: ({ assets, activeAssets }, query) => {
    const active: [ChainId, Asset, boolean][] = [];
    const inactive: [ChainId, Asset, boolean][] = [];

    for (const tuple of assets) {
      const [chainId, asset] = tuple as [ChainId, Asset];

      if (query && !asset.symbol.toLowerCase().includes(query)) continue;

      const isActive = Boolean(activeAssets[chainId]?.[asset.assetId]);
      const collection = isActive ? active : inactive;
      collection.push([chainId, asset, isActive]);
    }

    return [...active, ...inactive];
  },
  target: $filteredAssets,
});

// Don't shuffle active/inactive assets on active asset appear or disappear
sample({
  clock: networkModel.output.assetChanged,
  source: $filteredAssets,
  fn: (filteredAssets, event) => {
    return filteredAssets.map(tuple => {
      const [chainId, asset] = tuple;

      if (chainId !== event.chainId || asset.assetId !== event.assetId) return tuple;

      return [chainId, asset, event.status === 'on'] as [ChainId, Asset, boolean];
    });
  },
  target: $filteredAssets,
});

export const assetsPageModel = {
  $assets: readonly($filteredAssets),
  $query: readonly($query),

  inputs: {
    pageMounted,
    queryChanged,
    assetToggled,
  },

  /* Internal API (tests only) */
  _internal: {
    $sortedAssets,
    $query,
    $filteredAssets,
  },
};
