import { type Asset, type Chain } from '@/types/substrate';

// TODO: seems odd, remove in future
export type ChainAsset = {
  chain: Chain;
  asset: Asset;
};

export type ChainAssetId = {
  chainId: ChainId;
  assetId: AssetId;
};

export type PriceItem = {
  price: number;
  change?: number;
};
export type AssetPrice = Record<Currency, PriceItem>;

export type ChainAssetAccount = {
  chainId: ChainId;
  publicKey: PublicKey;
  chainName: string;
  asset: Asset;
  addressPrefix: number;
};

export type AssetAccount = ChainAssetAccount & {
  address: Address;
  totalBalance?: string;
  transferableBalance?: string;
};

export type TransferAsset = AssetAccount & {
  destinationAddress?: string;
  amount?: string;
  fee?: number;
  transferAll?: boolean;
  isGift?: boolean;
  operationType?: 'buy' | 'sell';
};
export type StateResolution<T> = { resolve: (value: T) => void; reject: () => void };

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

export const enum AssetType {
  STATEMINE = 'statemine',
}
