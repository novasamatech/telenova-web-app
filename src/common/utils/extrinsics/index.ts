import { decodeAddress } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { Balance } from '@polkadot/types/interfaces';

import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../../extrinsicService/types';
import { formatAmount } from '../balance';
import { Address, ChainId, TrasferAsset } from '../../types';
import { FAKE_ACCOUNT_ID } from '../constants';

const transferExtrinsic = async (
  submitExtrinsic: SubmitExtrinsic,
  destinationAddress: string,
  chainId: ChainId,
  transferAmmount: string,
  transferAll: boolean,
) => {
  const address = decodeAddress(destinationAddress);

  return await submitExtrinsic(chainId, (builder) => {
    const transferFunction = transferAll
      ? builder.api.tx.balances.transferAll(address, false)
      : builder.api.tx.balances.transferKeepAlive(address, transferAmmount);

    builder.addCall(transferFunction);
  }).then((hash) => {
    if (!hash) throw Error('Something went wrong');
    console.log('Success, Hash:', hash?.toString());
  });
};

export async function handleSend(
  submitExtrinsic: SubmitExtrinsic,
  { destinationAddress, chainId, amount, transferAll, asset }: TrasferAsset,
) {
  const transferAmmount = formatAmount(amount as string, asset?.precision as number);

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
  { chainId, amount, transferAll, asset }: TrasferAsset,
  giftTransferAddress: string,
) {
  const fee = await handleFeeTrasferAll(estimateFee, chainId);
  const transferAmmount = formatAmount(amount as string, asset?.precision as number);
  const giftAmount = (+transferAmmount + fee).toString();

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
  chainId: ChainId,
  submitExtrinsic: SubmitExtrinsic,
): Promise<void> {
  return await submitExtrinsic(
    chainId,
    (builder) => {
      builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(address), false));
    },
    keyring,
  ).then((hash) => {
    if (!hash) throw Error('Something went wrong');
    console.log('Success, Hash:', hash?.toString());
  });
}
