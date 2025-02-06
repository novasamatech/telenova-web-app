import { type HexString, type PolkadotSigner } from 'polkadot-api';

import type { BN } from '@polkadot/util';

export interface ITransfer {
  sendTransfer: (params: SendTransferParams) => Promise<HexString>;
  getTransferFee: (params: FeeParams) => Promise<BN>;
  getGiftTransferFee: (params: FeeParams) => Promise<BN>;
}

export type SendTransferParams = {
  signer: PolkadotSigner;
  destination: Address;
  amount: BN;
  transferAll?: boolean;
};

export type FeeParams = {
  amount?: BN;
  transferAll?: boolean;
};
