import { type ApiPromise } from '@polkadot/api';
import { type Hash } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';

import { extrinsicApi } from '../extrinsic/extrinsic-api';

import { FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
import { type StatemineAsset } from '@/types/substrate';

import { ASSET_LOCATION } from './constants';
import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

export class StatemineTransferService implements ITransfer {
  readonly #api: ApiPromise;
  readonly #asset: StatemineAsset;

  constructor(api: ApiPromise, asset: StatemineAsset) {
    this.#api = api;
    this.#asset = asset;
  }

  sendTransfer({ keyringPair, destination, amount }: SendTransferParams): Promise<Hash> {
    const assetId = assetUtils.getAssetId(this.#asset);

    return extrinsicApi.submitExtrinsic({
      keyringPair,
      api: this.#api,
      signOptions: { assetId: ASSET_LOCATION[assetId], nonce: -1 },
      transaction: {
        type: 'TRANSFER_STATEMINE',
        args: {
          dest: destination,
          value: amount,
          asset: assetId,
        },
      },
    });
  }

  async getTransferFee({ amount }: FeeParams): Promise<BN> {
    const assetId = assetUtils.getAssetId(this.#asset);

    const fee = await extrinsicApi.estimateFee({
      api: this.#api,
      signOptions: { assetId: ASSET_LOCATION[assetId] },
      transaction: {
        type: 'TRANSFER_STATEMINE',
        args: {
          dest: FAKE_ACCOUNT_ID,
          value: amount,
          asset: assetId,
        },
      },
    });

    return this.#assetConversion(fee.muln(this.#asset.feeBuffer));
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ ...rest, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });
    const totalFee = giftAccountFee.add(clientAccountFee).muln(this.#asset.feeBuffer);

    return this.#assetConversion(totalFee);
  }

  // Right now it's AssetHub only USD(T|C)/DOT
  async #assetConversion(amount: BN): Promise<BN> {
    const assetId = assetUtils.getAssetId(this.#asset);

    const convertedFee = await this.#api.call.assetConversionApi.quotePriceTokensForExactTokens(
      // @ts-expect-error type error
      ASSET_LOCATION[assetId],
      ASSET_LOCATION['0'],
      amount,
      true,
    );

    return convertedFee.isNone ? BN_ZERO : convertedFee.unwrap().toBn();
  }
}
