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
    return sortedAssets.filter(([, asset]) => {
      return asset.symbol
        .toLowerCase()
        .split('')
        .some(char => char.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0);
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
