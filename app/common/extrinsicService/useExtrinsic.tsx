import { type KeyringPair } from '@polkadot/keyring/types';
import { decodeAddress } from '@polkadot/util-crypto';

import { ASSET_LOCATION, FAKE_ACCOUNT_ID, formatAmount, getAssetId, isStatemineAsset } from '../utils';

import { TransactionType, useExtrinsicProvider } from '@/common/extrinsicService';
import { AssetType, type TransferAsset } from '@/common/types';
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
    const assetId = getAssetId(asset);
    let signOptions;
    let transactionType = TransactionType.TRANSFER;

    if (transferAll) {
      transactionType = TransactionType.TRANSFER_ALL;
    }
    if (asset.type === AssetType.STATEMINE) {
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

  async function sendGift(
    { chainId, amount, transferAll, asset, fee }: TransferAsset,
    giftTransferAddress: string,
  ): Promise<void> {
    const transferAmount = formatAmount(amount!, asset.precision);

    if (isStatemineAsset(asset?.type)) {
      const giftAmount = Math.ceil(+transferAmount + fee! / 2).toString();

      return sendTransfer({
        chainId,
        asset,
        destinationAddress: giftTransferAddress,
        transferAmount: giftAmount,
      });
    }

    const transferAllFee = await getTransactionFee(chainId, TransactionType.TRANSFER_ALL);
    const giftAmount = (+transferAmount + transferAllFee).toString();

    return sendTransfer({
      chainId,
      asset,
      transferAll,
      destinationAddress: giftTransferAddress,
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
