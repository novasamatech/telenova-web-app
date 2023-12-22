import { Address, HexString } from '@common/types';

export type Wallet = {
  publicKey: HexString;
};

export type GiftWallet = {
  address: Address;
  mnemonic: string | null;
};
