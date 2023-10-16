export type HexString = `0x${string}`

const {
	u8aToHex,
	hexToU8a
} = require('@polkadot/util')

export function unwrapHexString(string: string): HexString {
	return u8aToHex(hexToU8a(string))
}

export type ChainId = HexString;
export type Address = string;
export type AccountId = HexString;