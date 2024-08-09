import { type Asset, type Chain } from '@/types/substrate';

// TODO: seems odd, remove in future
export type ChainAsset = {
  chain: Chain;
  asset: Asset;
};

export const enum GiftStatus {
  CLAIMED = 'Claimed',
  UNCLAIMED = 'Unclaimed',
}

// HINT: old gifts don't have chainIndex
export type PersistentGift = {
  timestamp: number;
  address: string;
  secret: string;
  balance: string;
  chainId: ChainId;
  chainIndex?: ChainIndex;
  status: GiftStatus;
  assetId: string;
};

export type Gift = PersistentGift & {
  chainAsset?: Asset;
};
