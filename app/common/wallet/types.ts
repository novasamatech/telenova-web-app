export type Wallet = {
  publicKey: HexString;
};

export type GiftWallet = {
  address: Address;
  secret: string;
};

declare global {
  interface Window {
    mercuryoWidget?: any;
  }
}
