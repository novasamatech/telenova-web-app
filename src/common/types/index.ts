import { Asset } from './../chainRegistry/types/index';
export type HexString = `0x${string}`;

import { u8aToHex, hexToU8a } from '@polkadot/util';

export function unwrapHexString(string: string): HexString {
  return u8aToHex(hexToU8a(string));
}

export type ChainId = HexString;
export type AssetId = number;
export type Address = string;
export type AccountId = HexString;
export type PublicKey = HexString;

export type ChainAssetId = {
  chainId: ChainId;
  assetId: AssetId;
};

export type ChainAssetAccount = {
  chainId: ChainId;
  assetId: AssetId;
  publicKey: PublicKey;
  symbol: string;
  name: string;
  precision: number;
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
};

export type Gift = PersistentGift & {
  chainAsset?: Asset;
};

export function chainAssetIdToString(value: ChainAssetId): string {
  return `${value.chainId} - ${value.assetId}`;
}

export function chainAssetAccountIdToString(value: ChainAssetAccount): string {
  const partial = chainAssetIdToString({ chainId: value.chainId, assetId: value.assetId });

  return `${partial} - ${value.publicKey}`;
}
