import { type KeyringPair } from '@polkadot/keyring/types';
import { type BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { ASSET_LOCATION, FAKE_ACCOUNT_ID, assetUtils } from '../../shared/helpers';

import { TransactionType, useExtrinsicProvider } from '@/common/extrinsicService';
import { type Asset } from '@/types/substrate';

type SendTransaction = {
  destinationAddress: string;
  chainId: ChainId;
  asset: Asset;
  transferAmount?: BN;
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
    const assetId = assetUtils.getAssetId(asset);
    let signOptions;
    let transactionType = TransactionType.TRANSFER;

    if (transferAll) {
      transactionType = TransactionType.TRANSFER_ALL;
    }
    // TODO: currently only for USDT
    if (assetUtils.isStatemineAsset(asset)) {
      transactionType = TransactionType.TRANSFER_STATEMINE;
      signOptions = getAssetIdSignOption(assetId);
    }
    if (assetUtils.isOrmlAsset(asset)) {
      transactionType = TransactionType.TRANSFER_ORML;
    }

    return submitExtrinsic({
      chainId,
      signOptions,
      keyring,
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
    transferAddress: Address,
    { chainId, asset, amount, fee, transferAll }: GiftParams,
  ): Promise<void> {
    // const transferAmount = toPrecisedBalance(amount!, asset.precision);

    if (assetUtils.isStatemineAsset(asset)) {
      return sendTransfer({
        chainId,
        asset,
        destinationAddress: transferAddress,
        transferAmount: fee.divn(2).add(amount), // TODO: math.ceil ???
      });
    }

    const transferAllFee = await getTransactionFee(chainId, TransactionType.TRANSFER_ALL);

    return sendTransfer({
      chainId,
      asset,
      transferAll,
      destinationAddress: transferAddress,
      transferAmount: amount.add(transferAllFee),
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
