import { decodeAddress } from '@polkadot/util-crypto';

import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../extrinsicService/types';
import { Address, ChainId, TrasferAsset } from '../types';
import { FAKE_ACCOUNT_ID } from './constants';
import { Balance } from '@polkadot/types/interfaces';
import { formatAmount, formatBalance } from './balance';
import { getKeyringPairFromSeed } from '../wallet';

export async function handleSend(
  submitExtrinsic: SubmitExtrinsic,
  { destinationAddress, chainId, amount, transferAll, asset }: TrasferAsset,
  giftTransfer?: string,
) {
  const decodedAddress = decodeAddress(destinationAddress || giftTransfer);

  return await submitExtrinsic(chainId, (builder) => {
    const transferFunction = transferAll
      ? builder.api.tx.balances.transferAll(decodedAddress, false)
      : builder.api.tx.balances.transferKeepAlive(decodedAddress, formatAmount(amount as string, asset.precision));

    builder.addCall(transferFunction);
  }).then((hash) => {
    console.log('Success, Hash:', hash?.toString());
  });
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
  seed: string,
  address: Address,
  chainId: ChainId,
  submitExtrinsic: SubmitExtrinsic,
): Promise<void> {
  const keyring = getKeyringPairFromSeed(seed);

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
