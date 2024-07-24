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

export type PersistentGift = {
  timestamp: number;
  address: string;
  secret: string;
  balance: string;
  chainId: ChainId;
  status: GiftStatus;
  assetId: string;
};

export type Gift = PersistentGift & {
  chainAsset?: Asset;
};
