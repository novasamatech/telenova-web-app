import { decodeAddress } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';

import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../extrinsicService/types';
import { Address, ChainId, TrasferAsset } from '../types';
import { FAKE_ACCOUNT_ID } from './constants';
import { Balance } from '@polkadot/types/interfaces';
import { formatAmount, formatBalance } from './balance';

const transferExtrinsic = async (
  submitExtrinsic: SubmitExtrinsic,
  destinationAddress: string,
  chainId: ChainId,
  amount: string,
  transferAll: boolean,
  precision: number,
) => {
  const address = decodeAddress(destinationAddress);
  const transferAmmount = formatAmount(amount as string, precision);

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
  return await transferExtrinsic(
    submitExtrinsic,
    destinationAddress as string,
    chainId,
    amount as string,
    transferAll as boolean,
    asset?.precision as number,
  );
}

export async function handleSendGift(
  submitExtrinsic: SubmitExtrinsic,
  { chainId, amount, transferAll, asset, fee }: TrasferAsset,
  giftTransferAddress: string,
) {
  const giftAmount = (+(amount as string) + (fee as number) / 2).toString();

  return await transferExtrinsic(
    submitExtrinsic,
    giftTransferAddress as string,
    chainId,
    giftAmount,
    transferAll as boolean,
    asset?.precision as number,
  );
}

export async function handleFee(
  estimateFee: EstimateFee,
  chainId: ChainId,
  precision: number,
  isGift?: boolean,
): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(FAKE_ACCOUNT_ID), false)),
  ).then((fee: Balance) => {
    const finalFee = isGift ? Number(fee) * 2 : fee;
    const { formattedValue } = formatBalance(finalFee.toString(), precision);

    return Number(formattedValue);
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
