export type HexString = `0x${string}`;

import { u8aToHex, hexToU8a } from '@polkadot/util';

export function unwrapHexString(string: string): HexString {
  return u8aToHex(hexToU8a(string));
}

export type ChainId = HexString;
export type AssetId = number;
export type Address = string;
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
};

export type AssetAccount = ChainAssetAccount & {
  address: Address;
  totalBalance?: string;
  transferableBalance?: string;
};

export type TrasferAsset = AssetAccount & {
  destination?: string;
  amount?: string;
};
export type StateResolution<T> = { resolve: (value: T) => void; reject: () => void };

export function chainAssetIdToString(value: ChainAssetId): string {
  return `${value.chainId} - ${value.assetId}`;
}

export function chainAssetAccountIdToString(value: ChainAssetAccount): string {
  const partial = chainAssetIdToString({ chainId: value.chainId, assetId: value.assetId });

  return `${partial} - ${value.publicKey}`;
}
