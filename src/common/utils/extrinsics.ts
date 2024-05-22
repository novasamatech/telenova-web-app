import { decodeAddress } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { Balance } from '@polkadot/types/interfaces';

import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../extrinsicService/types';
import { formatAmount } from './balance';
import { Address, ChainId, TrasferAsset } from '../types';
import { ASSET_STATEMINE, FAKE_ACCOUNT_ID } from './constants';
import { ChainAsset } from '../chainRegistry/types';

const getAssetIdSignOption = (assetId: number) => ({
  assetId: {
    parents: 0,
    interior: {
      X2: [{ PalletInstance: 50 }, { GeneralIndex: assetId }],
    },
  },
});

const transferExtrinsic = async (
  submitExtrinsic: SubmitExtrinsic,
  destinationAddress: string,
  chainId: ChainId,
  transferAmmount: string,
  transferAll: boolean,
) => {
  const address = decodeAddress(destinationAddress);

  return await submitExtrinsic({
    chainId: chainId,
    building: (builder) => {
      const transferFunction = transferAll
        ? builder.api.tx.balances.transferAll(address, false)
        : builder.api.tx.balances.transferKeepAlive(address, transferAmmount);

      builder.addCall(transferFunction);
    },
  }).then((hash) => {
    if (!hash) throw Error('Something went wrong');
    console.log('Success, Hash:', hash?.toString());
  });
};

const transferExtrinsicStatemine = async (
  submitExtrinsic: SubmitExtrinsic,
  destinationAddress: string,
  chainId: ChainId,
  transferAmmount: string,
  assetId: number,
  giftKeyringPair?: KeyringPair,
) => {
  const address = decodeAddress(destinationAddress);

  // trasferAll does not exist on statemine
  return await submitExtrinsic({
    chainId: chainId,
    building: (builder) => {
      builder.addCall(builder.api.tx.assets.transfer(assetId, address, transferAmmount));
    },
    signOptions: getAssetIdSignOption(assetId),
    giftKeyringPair,
  }).then((hash) => {
    if (!hash) throw Error('Something went wrong');
    console.log('Success, Hash:', hash?.toString());
  });
};

export async function handleSend(
  submitExtrinsic: SubmitExtrinsic,
  { destinationAddress, chainId, amount, transferAll, asset }: TrasferAsset,
) {
  const transferAmmount = formatAmount(amount!, asset?.precision as number);

  if (asset?.type === ASSET_STATEMINE) {
    return await transferExtrinsicStatemine(
      submitExtrinsic,
      destinationAddress!,
      chainId,
      transferAmmount,
      Number(asset?.typeExtras?.assetId),
    );
  }

  return await transferExtrinsic(
    submitExtrinsic,
    destinationAddress as string,
    chainId,
    transferAmmount,
    transferAll as boolean,
  );
}

export async function handleSendGift(
  submitExtrinsic: SubmitExtrinsic,
  estimateFee: EstimateFee,
  { chainId, amount, transferAll, asset, fee }: TrasferAsset,
  giftTransferAddress: string,
) {
  const transferAmmount = formatAmount(amount as string, asset?.precision as number);
  if (asset?.type === ASSET_STATEMINE) {
    // Fee is 2x the transfer fee - we add 1 fee to the transfer amount
    const giftAmount = Math.ceil(+transferAmmount + fee! / 2).toString();

    return await transferExtrinsicStatemine(
      submitExtrinsic,
      giftTransferAddress!,
      chainId,
      giftAmount,
      Number(asset?.typeExtras?.assetId),
    );
  }

  const trasferAllFee = await handleFeeTrasferAll(estimateFee, chainId);
  const giftAmount = (+transferAmmount + trasferAllFee).toString();

  return await transferExtrinsic(
    submitExtrinsic,
    giftTransferAddress as string,
    chainId,
    giftAmount,
    transferAll as boolean,
  );
}

export async function handleFee(
  estimateFee: EstimateFee,
  chainId: ChainId,
  amount: string,
  isGift?: boolean,
): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferKeepAlive(decodeAddress(FAKE_ACCOUNT_ID), amount)),
  ).then((fee: Balance) => {
    const finalFee = isGift ? Number(fee) * 2 : fee;

    return Number(finalFee);
  });
}

export async function handleFeeStatemine(
  estimateFee: EstimateFee,
  chainId: ChainId,
  assetId: string,
  amount: string,
): Promise<number> {
  return await estimateFee(
    chainId,
    (builder: ExtrinsicBuilder) =>
      builder.addCall(builder.api.tx.assets.transfer(Number(assetId), decodeAddress(FAKE_ACCOUNT_ID), amount)),
    getAssetIdSignOption(+assetId),
  ).then((fee: Balance) => {
    return Number(fee);
  });
}

export async function handleFeeTrasferAll(estimateFee: EstimateFee, chainId: ChainId): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(FAKE_ACCOUNT_ID), false)),
  ).then((fee: Balance) => {
    return Number(fee);
  });
}

export async function claimGift(
  keyring: KeyringPair,
  address: Address,
  chain: ChainAsset,
  submitExtrinsic: SubmitExtrinsic,
  amount?: string,
): Promise<void> {
  if (chain.asset.type === ASSET_STATEMINE) {
    if (!amount || !chain.asset.typeExtras?.assetId) throw Error('Amount is required');
    const transferAmmount = formatAmount(amount, chain.asset.precision);

    return await transferExtrinsicStatemine(
      submitExtrinsic,
      address,
      chain.chain.chainId,
      transferAmmount,
      +chain.asset.typeExtras?.assetId,
      keyring,
    );
  }

  return await submitExtrinsic({
    chainId: chain.chain.chainId,
    building: (builder) => {
      builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(address), false));
    },
    giftKeyringPair: keyring,
  }).then((hash) => {
    if (!hash) throw Error('Something went wrong');
    console.log('Success, Hash:', hash?.toString());
  });
}
