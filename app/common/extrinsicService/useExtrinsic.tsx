import type { SignerOptions } from '@polkadot/api/types';
import { type KeyringPair } from '@polkadot/keyring/types';
import { type BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { TransactionType, useExtrinsicProvider } from '@/common/extrinsicService';
import { ASSET_LOCATION, FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
import { type Asset } from '@/types/substrate';

type SendTransaction = {
  chainId: ChainId;
  asset: Asset;
  keyringPair: KeyringPair;
  destinationAddress: string;
  transferAll?: boolean;
  transferAmount?: BN;
};

const getAssetIdSignOption = (assetId: string): Pick<SignerOptions, 'assetId'> => ({
  assetId: ASSET_LOCATION[assetId],
});

export const useExtrinsic = () => {
  const { submitExtrinsic, estimateFee } = useExtrinsicProvider();

  async function sendTransfer({
    chainId,
    asset,
    keyringPair,
    destinationAddress,
    transferAmount,
    transferAll,
  }: SendTransaction) {
    const assetId = assetUtils.getAssetId(asset);
    let signOptions;
    let transactionType = TransactionType.TRANSFER;

    // TODO: currently only for USDT
    if (assetUtils.isStatemineAsset(asset)) {
      transactionType = TransactionType.TRANSFER_STATEMINE;
      signOptions = getAssetIdSignOption(assetId);
    } else if (assetUtils.isOrmlAsset(asset)) {
      transactionType = TransactionType.TRANSFER_ORML;
    } else if (transferAll) {
      transactionType = TransactionType.TRANSFER_ALL;
    }

    // nonce: -1 makes polkadot.js use next nonce
    // https://github.com/polkadot-js/api/blob/dac94c51964a90f9b26bc88d5a63f1e1b2038281/packages/api-derive/src/tx/signingInfo.ts#L93
    return submitExtrinsic({
      chainId,
      keyringPair,
      signOptions: { ...signOptions, nonce: -1 },
      transaction: {
        type: transactionType,
        args: {
          dest: decodeAddress(destinationAddress),
          value: transferAmount,
          ...(!assetUtils.isNativeAsset() && { asset: assetUtils.getAssetId(asset) }),
        },
      },
    }).then(hash => {
      if (!hash) throw Error('Something went wrong');

      console.log('Success, Hash:', hash.toString());
    });
  }

  type GiftParams = {
    chainId: ChainId;
    asset: Asset;
    amount: BN;
    fee: BN;
    transferAll?: boolean;
  };
  async function sendGift(
    keyringPair: KeyringPair,
    transferAddress: Address,
    { chainId, asset, amount, fee, transferAll }: GiftParams,
  ): Promise<void> {
    if (assetUtils.isNativeAsset(asset)) {
      const transferAllFee = await getTransactionFee(chainId, TransactionType.TRANSFER_ALL);

      return sendTransfer({
        chainId,
        asset,
        keyringPair,
        transferAll,
        destinationAddress: transferAddress,
        transferAmount: amount.add(transferAllFee),
      });
    }

    return sendTransfer({
      chainId,
      asset,
      keyringPair,
      destinationAddress: transferAddress,
      transferAmount: fee.divn(2).add(amount),
    });
  }

  function getTransactionFee(
    chainId: ChainId,
    transactionType = TransactionType.TRANSFER,
    amount?: BN,
    assetId?: string,
  ): Promise<BN> {
    return estimateFee({
      chainId,
      signOptions: assetId ? { assetId: ASSET_LOCATION[assetId] } : undefined,
      transaction: {
        type: transactionType,
        args: {
          dest: decodeAddress(FAKE_ACCOUNT_ID),
          value: amount,
          asset: assetId,
        },
      },
    });
  }

  return { getTransactionFee, sendTransfer, sendGift };
};
