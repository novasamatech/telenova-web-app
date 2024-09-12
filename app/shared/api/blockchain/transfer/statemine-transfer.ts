import { type ApiPromise } from '@polkadot/api';
import { type Hash } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { extrinsicApi } from '../extrinsic/extrinsic-api';

import { ASSET_LOCATION, FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
import { type StatemineAsset } from '@/types/substrate';

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
          dest: decodeAddress(destination),
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
          dest: decodeAddress(FAKE_ACCOUNT_ID),
          value: amount,
          asset: assetId,
        },
      },
    });

    return this.#assetConversion(fee);
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ ...rest, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });

    return this.#assetConversion(clientAccountFee);
  }

  getExistentialDeposit(): Promise<BN> {
    const assetId = assetUtils.getAssetId(this.#asset);

    return this.#api.query.assets.asset(assetId).then(balance => balance.value.minBalance.toBn());
  }

  // Right now it's AssetHub only USDT/DOT
  async #assetConversion(amount: BN): Promise<BN> {
    const convertedFee = await this.#api!.call.assetConversionApi.quotePriceTokensForExactTokens(
      ASSET_LOCATION['1984'],
      ASSET_LOCATION['0'],
      amount,
      true,
    );

    return convertedFee.isNone ? BN_ZERO : convertedFee.unwrap().toBn();
  }
}
