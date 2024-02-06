import { decodeAddress } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { Balance } from '@polkadot/types/interfaces';

import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../extrinsicService/types';
import { formatAmount } from './balance';
import { Address, ChainId, TrasferAsset } from '../types';
import { FAKE_ACCOUNT_ID } from './constants';

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
      : builder.api.tx.balances.transferKeepAlive(destinationAddress, transferAmmount);

    builder.addCall(transferFunction);
  }).then((hash) => {
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
  { chainId, amount, transferAll, asset, fee }: TrasferAsset,
  giftTransferAddress: string,
) {
  const transferAmmount = formatAmount(amount as string, asset?.precision as number);
  const giftAmount = (+transferAmmount + (fee as number) / 2).toString();

  return await transferExtrinsic(
    submitExtrinsic,
    giftTransferAddress as string,
    chainId,
    giftAmount,
    transferAll as boolean,
  );
}

export async function handleFee(estimateFee: EstimateFee, chainId: ChainId, isGift?: boolean): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(FAKE_ACCOUNT_ID), false)),
  ).then((fee: Balance) => {
    const finalFee = isGift ? Number(fee) * 2 : fee;

    return Number(finalFee);
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
    console.log('Success, Hash:', hash?.toString());
  });
}
