import { Asset } from './../chainRegistry/types/index';
export type HexString = `0x${string}`;

export type ChainId = HexString;
export type AssetId = number;
export type Address = string;
export type AccountId = HexString;
export type PublicKey = HexString;
export type Currency = string;

export type ChainAssetId = {
  chainId: ChainId;
  assetId: AssetId;
};

export type PriceItem = {
  price: number;
  change?: number;
};
export type AssetPrice = Record<Currency, PriceItem>;
export type PriceObject = Record<string, AssetPrice>;

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

export type TrasferAsset = AssetAccount & {
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
