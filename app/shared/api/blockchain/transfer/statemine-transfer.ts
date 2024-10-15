import { Enum, type HexString, type PolkadotClient } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi } from '../types';

import { FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
import { type StatemineAsset } from '@/types/substrate';

import { ASSET_LOCATION } from './constants';
import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

import { dotAh } from '@polkadot-api/descriptors';

type ClientApi = GenericApi<typeof dotAh>;

export class StatemineTransferService implements ITransfer {
  readonly #client: ClientApi;
  readonly #asset: StatemineAsset;

  constructor(client: PolkadotClient, asset: StatemineAsset) {
    this.#asset = asset;
    this.#client = this.#getTypedClientApi(client);
  }

  #getTypedClientApi(client: PolkadotClient): ClientApi {
    return { type: 'generic', api: client.getTypedApi(dotAh) };
  }

  sendTransfer({ signer, destination, amount }: SendTransferParams): Promise<HexString> {
    const assetId = assetUtils.getAssetId(this.#asset);

    const tx = this.#client.api.tx.Assets.transfer_keep_alive({
      id: Number(assetUtils.getAssetId(this.#asset)),
      amount: BigInt(amount.toString()),
      target: Enum('Id', destination),
    });

    return tx.signAndSubmit(signer, { asset: ASSET_LOCATION[assetId] }).then(({ txHash }) => txHash);
  }

  async getTransferFee({ amount = BN_ZERO }: FeeParams): Promise<BN> {
    const tx = this.#client.api.tx.Assets.transfer_keep_alive({
      id: Number(assetUtils.getAssetId(this.#asset)),
      amount: BigInt(amount.toString()),
      target: Enum('Id', FAKE_ACCOUNT_ID),
    });

    const assetId = assetUtils.getAssetId(this.#asset);
    const fee = await tx.getEstimatedFees(FAKE_ACCOUNT_ID, { asset: ASSET_LOCATION[assetId] });
    const bnFee = new BN(fee.toString());

    return this.#assetConversion(bnFee.muln(this.#asset.feeBuffer));
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ ...rest, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });

    // Fee includes conversion
    return giftAccountFee.add(clientAccountFee);
  }

  // Right now it's AssetHub only USD(T|C)/DOT
  #assetConversion(amount: BN): Promise<BN> {
    const assetId = assetUtils.getAssetId(this.#asset);

    return this.#client.api.apis.AssetConversionApi.quote_price_tokens_for_exact_tokens(
      ASSET_LOCATION[assetId],
      ASSET_LOCATION['0'],
      BigInt(amount.toString()),
      true,
    ).then(fee => (fee ? new BN(fee.toString()) : BN_ZERO));
  }
}
