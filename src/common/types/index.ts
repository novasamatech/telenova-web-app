export type HexString = `0x${string}`

const {
	u8aToHex,
	hexToU8a
} = require('@polkadot/util')

export function unwrapHexString(string: string): HexString {
	return u8aToHex(hexToU8a(string))
}

export type ChainId = HexString;
export type AssetId = number;
export type Address = string;
export type AccountId = HexString;

export type ChainAssetId = {
	chainId: ChainId;
    assetId: AssetId;
};

export type ChainAssetAddress = {
	chainId: ChainId;
    assetId: AssetId;
    address: Address;
};

export function chainAssetIdToString(value: ChainAssetId): string {
	return `${value.chainId} - ${value.assetId}`;
}

export  function chainAssetAccountIdToString(value: ChainAssetAddress): string {
	const partial = chainAssetIdToString({chainId: value.chainId, assetId: value.assetId});

	return `${partial} - ${value.address}`;
}
