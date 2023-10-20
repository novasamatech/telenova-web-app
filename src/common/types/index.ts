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

export type ChainAssetAccountId = {
	chainId: ChainId;
    assetId: AssetId;
    accountId: AccountId;	
};

export function chainAssetIdToString(value: ChainAssetId): string {
	return `${value.chainId} - ${value.assetId}`;
}

export  function chainAssetAccountIdToString(value: ChainAssetAccountId): string {
	const partial = chainAssetIdToString({chainId: value.chainId, assetId: value.assetId});

	return `${partial} - ${value.accountId}`;
}
