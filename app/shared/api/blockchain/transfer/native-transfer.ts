import { type ApiPromise } from '@polkadot/api';
import { type Hash } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';

import { extrinsicApi } from '../extrinsic/extrinsic-api';

import { FAKE_ACCOUNT_ID } from '@/shared/helpers';

import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

export class BalanceTransferService implements ITransfer {
  readonly #api: ApiPromise;

  constructor(api: ApiPromise) {
    this.#api = api;
  }

  async sendTransfer({ keyringPair, destination, amount, transferAll }: SendTransferParams): Promise<Hash> {
    return extrinsicApi.submitExtrinsic({
      keyringPair,
      api: this.#api,
      signOptions: { nonce: -1 },
      transaction: {
        type: transferAll ? 'TRANSFER_ALL' : 'TRANSFER',
        args: {
          dest: destination,
          value: amount,
        },
      },
    });
  }

  getTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    return extrinsicApi.estimateFee({
      api: this.#api,
      transaction: {
        type: transferAll ? 'TRANSFER_ALL' : 'TRANSFER',
        args: {
          dest: FAKE_ACCOUNT_ID,
          value: amount,
        },
      },
    });
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ transferAll: true, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });

    return giftAccountFee.add(clientAccountFee);
  }
}
