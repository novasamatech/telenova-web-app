import { type BN } from '@polkadot/util';

export type AccountBalance = {
  chainId: ChainId;
  accountId: AccountId;
  assetId: string;
  balance: Balance;
};

export type Balance = {
  free?: BN;
  reserved?: BN;
  frozen?: BN;
  total: BN;
  transferable: BN;
};