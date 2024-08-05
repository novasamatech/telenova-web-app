import { type KeyringPair } from '@polkadot/keyring/types';
import { decodeAddress } from '@polkadot/util-crypto';

import { ASSET_LOCATION, FAKE_ACCOUNT_ID, assetUtils, formatAmount } from '../utils';

import { TransactionType, useExtrinsicProvider } from '@/common/extrinsicService';
import { type Asset } from '@/types/substrate';

type SendTransaction = {
  destinationAddress: string;
  chainId: ChainId;
  asset: Asset;
  transferAmount?: string;
  transferAll?: boolean;
  keyring?: KeyringPair;
};

const getAssetIdSignOption = (assetId: string) => ({
  assetId: ASSET_LOCATION[assetId],
});

export const useExtrinsic = () => {
  const { submitExtrinsic, estimateFee } = useExtrinsicProvider();

  async function sendTransfer({
    chainId,
    asset,
    keyring,
    destinationAddress,
    transferAmount,
    transferAll,
  }: SendTransaction) {
    const address = decodeAddress(destinationAddress);
    const assetId = assetUtils.getAssetId(asset);
    let signOptions;
    let transactionType = TransactionType.TRANSFER;

    if (transferAll) {
      transactionType = TransactionType.TRANSFER_ALL;
    }
    if (assetUtils.isStatemineAsset(asset)) {
      transactionType = TransactionType.TRANSFER_STATEMINE;
      signOptions = getAssetIdSignOption(assetId);
    }

    return submitExtrinsic({
      chainId,
      signOptions,
      keyring,
      transaction: {
        type: transactionType,
        args: {
          dest: address,
          value: transferAmount,
          asset: assetId,
        },
      },
    }).then(hash => {
      if (!hash) throw Error('Something went wrong');

      console.log('Success, Hash:', hash?.toString());
    });
  }

  type GiftParams = {
    chainId: ChainId;
    amount: string;
    fee?: number;
    asset: Asset;
    transferAll?: boolean;
  };
  async function sendGift(
    transferAddress: Address,
    { chainId, asset, amount, fee, transferAll }: GiftParams,
  ): Promise<void> {
    const transferAmount = formatAmount(amount!, asset.precision);

    if (assetUtils.isStatemineAsset(asset)) {
      const giftAmount = Math.ceil(+transferAmount + fee! / 2).toString();

      return sendTransfer({
        chainId,
        asset,
        destinationAddress: transferAddress,
        transferAmount: giftAmount,
      });
    }

    const transferAllFee = await getTransactionFee(chainId, TransactionType.TRANSFER_ALL);
    const giftAmount = (+transferAmount + transferAllFee).toString();

    return sendTransfer({
      chainId,
      asset,
      transferAll,
      destinationAddress: transferAddress,
      transferAmount: giftAmount,
    });
  }

  async function getTransactionFee(
    chainId: ChainId,
    transactionType = TransactionType.TRANSFER,
    amount?: string,
    assetId?: string,
  ): Promise<number> {
    const fee = await estimateFee({
      chainId,
      signOptions: assetId ? getAssetIdSignOption(assetId) : undefined,
      transaction: {
        type: transactionType,
        args: {
          dest: decodeAddress(FAKE_ACCOUNT_ID),
          value: amount,
          asset: assetId,
        },
      },
    });

    return fee.toNumber();
  }

  return { getTransactionFee, sendTransfer, sendGift };
};
