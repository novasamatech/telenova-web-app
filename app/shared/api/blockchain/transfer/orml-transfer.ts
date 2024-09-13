import { type ApiPromise } from '@polkadot/api';
import { type Hash } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { extrinsicApi } from '../extrinsic/extrinsic-api';

import { FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
import { type OrmlAsset } from '@/types/substrate';

import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

export class OrmlTransferService implements ITransfer {
  readonly #api: ApiPromise;
  readonly #asset: OrmlAsset;

  constructor(api: ApiPromise, asset: OrmlAsset) {
    this.#api = api;
    this.#asset = asset;
  }

  sendTransfer({ keyringPair, destination, amount }: SendTransferParams): Promise<Hash> {
    return extrinsicApi.submitExtrinsic({
      keyringPair,
      api: this.#api,
      signOptions: { nonce: -1 },
      transaction: {
        type: 'TRANSFER_ORML',
        args: {
          dest: decodeAddress(destination),
          value: amount,
          asset: assetUtils.getAssetId(this.#asset),
        },
      },
    });
  }

  getTransferFee({ amount }: FeeParams): Promise<BN> {
    return extrinsicApi.estimateFee({
      api: this.#api,
      transaction: {
        type: 'TRANSFER_ORML',
        args: {
          dest: decodeAddress(FAKE_ACCOUNT_ID),
          value: amount,
          asset: assetUtils.getAssetId(this.#asset),
        },
      },
    });
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ ...rest, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });

    return giftAccountFee.add(clientAccountFee);
  }
}
