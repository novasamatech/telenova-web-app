import { type ApiPromise } from '@polkadot/api';
import { type SignerOptions, type SubmittableExtrinsic } from '@polkadot/api/types';
import { type KeyringPair } from '@polkadot/keyring/types';
import { type Hash } from '@polkadot/types/interfaces';
import { type BN } from '@polkadot/util';

import { type TransactionType } from '../types';

import { FAKE_ACCOUNT_ID } from '@/shared/helpers';

import { ExtrinsicBuilder } from './builder';
import { SUBMITTABLE_EXTRINSICS } from './constants';
import { type ExtrinsicBuildingOptions } from './types';

export const extrinsicApi = {
  estimateFee,
  submitExtrinsic,
};

type EstimateFeeParams = {
  api: ApiPromise;
  transaction: ExtrinsicTransaction;
  signOptions?: Partial<SignerOptions>;
  options?: Partial<ExtrinsicBuildingOptions>;
};

async function estimateFee({ api, transaction, signOptions, options }: EstimateFeeParams): Promise<BN> {
  const extrinsic = prepareExtrinsic(api, transaction, options);
  const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID, signOptions);

  return paymentInfo.partialFee.toBn();
}

type SubmitExtrinsicParams = {
  api: ApiPromise;
  transaction: ExtrinsicTransaction;
  keyringPair: KeyringPair;
  options?: Partial<ExtrinsicBuildingOptions>;
  signOptions?: Partial<SignerOptions>;
};

async function submitExtrinsic({
  api,
  transaction,
  keyringPair,
  options,
  signOptions,
}: SubmitExtrinsicParams): Promise<Hash> {
  const extrinsic = prepareExtrinsic(api, transaction, options);

  await extrinsic.signAsync(keyringPair, signOptions);
  keyringPair.lock();

  return extrinsic.send();
}

type ExtrinsicTransaction = {
  args: Record<string, unknown>;
  type: TransactionType;
};

function prepareExtrinsic(
  api: ApiPromise,
  transaction: ExtrinsicTransaction,
  options?: Partial<ExtrinsicBuildingOptions>,
): SubmittableExtrinsic<'promise'> {
  const extrinsicBuilder = new ExtrinsicBuilder(api);

  extrinsicBuilder.addCall(SUBMITTABLE_EXTRINSICS[transaction.type](transaction.args, api));

  return extrinsicBuilder.build(options);
}
