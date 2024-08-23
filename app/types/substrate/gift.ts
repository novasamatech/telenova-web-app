import { type Asset } from './asset';

// Old gifts don't have chainIndex
export type PersistentGift = {
  status: 'Claimed' | 'Unclaimed';
  chainId: ChainId;
  chainIndex?: ChainIndex;
  assetId: string;
  address: string;
  balance: string;
  secret: string;
  timestamp: number;
};

export type Gift = PersistentGift & {
  chainAsset?: Asset;
};
