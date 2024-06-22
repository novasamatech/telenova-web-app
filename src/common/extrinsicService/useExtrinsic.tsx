import { type KeyringPair } from '@polkadot/keyring/types';
import { type Balance } from '@polkadot/types/interfaces';
import { decodeAddress } from '@polkadot/util-crypto';

import { type Asset } from '../chainRegistry';
import { ASSET_LOCATION, FAKE_ACCOUNT_ID, formatAmount, getAssetId, isStatemineAsset } from '../utils';

import { TransactionType, useExtrinsicProvider } from '@/common/extrinsicService';
import { AssetType, type ChainId, type TrasferAsset } from '@/common/types';

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

export function useExtrinsic() {
  const { submitExtrinsic, estimateFee } = useExtrinsicProvider();

  async function sendTransaction({
    destinationAddress,
    chainId,
    transferAmount,
    asset,
    transferAll,
    keyring,
  }: SendTransaction) {
    const address = decodeAddress(destinationAddress);
    const assetId = getAssetId(asset);
    const args = {
      dest: address,
      value: transferAmount,
      asset: assetId,
    };
    let signOptions;
    let transactionType = TransactionType.TRANSFER;

    if (transferAll) {
      transactionType = TransactionType.TRANSFER_ALL;
    }
    if (asset?.type === AssetType.STATEMINE) {
      transactionType = TransactionType.TRANSFER_STATEMINE;
      signOptions = getAssetIdSignOption(assetId);
    }

    return await submitExtrinsic({
      chainId: chainId,
      transaction: {
        type: transactionType,
        args,
      },
      signOptions,
      keyring,
    }).then(hash => {
      if (!hash) {
        throw Error('Something went wrong');
      }
      console.log('Success, Hash:', hash?.toString());
    });
  }

  async function handleSendGift(
    { chainId, amount, transferAll, asset, fee }: TrasferAsset,
    giftTransferAddress: string,
  ) {
    const transferAmmount = formatAmount(amount as string, asset.precision);

    if (isStatemineAsset(asset?.type)) {
      // Fee is 2x the transfer fee - we add 1 fee to the transfer amount
      const giftAmount = Math.ceil(+transferAmmount + fee! / 2).toString();

      return await sendTransaction({
        destinationAddress: giftTransferAddress,
        chainId,
        transferAmount: giftAmount,
        asset,
      });
    }

    const trasferAllFee = await handleFee(chainId, TransactionType.TRANSFER_ALL);
    const giftAmount = (+transferAmmount + trasferAllFee).toString();

    return await sendTransaction({
      destinationAddress: giftTransferAddress,
      chainId,
      transferAmount: giftAmount,
      transferAll,
      asset,
    });
  }

  async function handleFee(
    chainId: ChainId,
    transactionType: TransactionType = TransactionType.TRANSFER,
    amount?: string,
    assetId?: string,
  ): Promise<number> {
    const args = {
      dest: decodeAddress(FAKE_ACCOUNT_ID),
      value: amount,
      asset: assetId,
    };

    return await estimateFee({
      chainId,
      transaction: {
        type: transactionType,
        args,
      },
      signOptions: assetId ? getAssetIdSignOption(assetId) : undefined,
    }).then((fee: Balance) => {
      return Number(fee);
    });
  }

  return { sendTransaction, handleFee, handleSendGift };
}
