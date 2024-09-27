// Old gifts don't have chainIndex
import { type Asset } from '@/types/substrate';

export type Gift = Omit<PersistentGift, 'assetId'> & {
  asset: Asset;
  status: 'Claimed' | 'Unclaimed';
};

export type PersistentGift = {
  chainId: ChainId;
  chainIndex?: ChainIndex;
  assetId: AssetId;
  address: Address;
  balance: string;
  secret: string;
  timestamp: number;
};
