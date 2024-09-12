import type { KeyringPair } from '@polkadot/keyring/types';
import { type Hash } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

export interface ITransfer {
  sendTransfer: (params: SendTransferParams) => Promise<Hash>;
  getTransferFee: (params: FeeParams) => Promise<BN>;
  getGiftTransferFee: (params: FeeParams) => Promise<BN>;
  getExistentialDeposit: () => Promise<BN>;
}

export type SendTransferParams = {
  keyringPair: KeyringPair;
  destination: Address;
  amount: BN;
  transferAll?: boolean;
};

export type FeeParams = {
  amount?: BN;
  transferAll?: boolean;
};
