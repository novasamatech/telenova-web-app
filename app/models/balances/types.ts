import { type UnsubscribePromise } from '@polkadot/api/types';

export type Subscriptions = {
  [chainId: ChainId]: Record<AssetId, UnsubscribePromise> | undefined;
};
