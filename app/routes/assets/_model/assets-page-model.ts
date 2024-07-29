import { combine, createEvent, restore, split } from 'effector';
import { isEmpty, orderBy } from 'lodash-es';
import { readonly } from 'patronum';

import { networkModel } from '@/models';
import { type Asset } from '@/types/substrate';

const queryChanged = createEvent<string>();
const assetToggled = createEvent<{ chainId: ChainId; assetId: AssetId; checked: boolean }>();

const $query = restore(queryChanged, '');

// TODO: active first
const $assets = combine(networkModel.$chains, chains => {
  if (isEmpty(chains)) return [];

  const assets = Object.values(chains).flatMap(chain => {
    return chain.assets.map(asset => [chain.chainId, asset]);
  });

  return orderBy(assets, ([_, asset]) => (asset as Asset).symbol, 'asc');
});

split({
  source: assetToggled,
  match: ({ checked }) => (checked ? 'connect' : 'disconnect'),
  cases: {
    connect: networkModel.input.assetConnected,
    disconnect: networkModel.input.assetDisconnected,
  },
});

// TODO: filtered assets

export const assetsPageModel = {
  $assets: readonly($assets),
  $query: readonly($query),

  inputs: {
    queryChanged,
    assetToggled,
  },
};
