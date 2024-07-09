export {};

declare global {
  export type HexString = `0x${string}`;

  export type ChainId = HexString;
  export type ChainIndex = string;
  export type AssetId = number;

  export type Address = string;
  export type AccountId = HexString;
  export type PublicKey = HexString;

  export type CallData = HexString;
  export type CallHash = HexString;
  export type Metadata = HexString;

  export type Currency = string;
}
