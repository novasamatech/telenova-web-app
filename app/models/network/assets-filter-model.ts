import { combine, createEvent, restore } from 'effector';
import { readonly } from 'patronum';

import { networkModel } from './network-model';

const pageMounted = createEvent();
const queryChanged = createEvent<string>();

const $query = restore(queryChanged, '').reset(pageMounted);

const $filteredAssets = combine(
  {
    query: $query,
    sortedAssets: networkModel.$sortedAssets,
  },
  ({ query, sortedAssets }) => {
    return sortedAssets.filter(([_, asset]) => {
      return asset.symbol.toLowerCase().includes(query.toLowerCase());
    });
  },
);

export const assetsFilterModel = {
  // Search query
  $query: readonly($query),

  // Assets sorted by symbol and filtered by query
  $assets: readonly($filteredAssets),

  input: {
    pageMounted,
    queryChanged,
  },
};
