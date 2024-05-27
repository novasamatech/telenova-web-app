import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { SignerOptions } from '@polkadot/api/types';
import { Balance, Hash } from '@polkadot/types/interfaces';
import { KeyringPair } from '@polkadot/keyring/types';
import { ChainId } from '@common/types';

export interface ExtrinsicBuilder {
  api: ApiPromise;

  addCall(call: SubmittableExtrinsic<any>): void;

  build(options?: Partial<ExtrinsicBuildingOptions>): SubmittableExtrinsic<'promise'>;
}

export type ExtrinsicTransaction = {
  args: Record<string, any>;
  type: TransactionType;
};

export interface ExtrinsicBuildingOptions {
  batchMode: BatchMode;
}

export enum BatchMode {
  BATCH,
  BATCH_ALL,
  FORCE_BATCH,
}

export interface ExtrinsicBuilderFactory {
  /**
   * @param chainId
   * @returns ready-to-use newly initialized ExtrinsicBuilder
   * or undefined in case there is no relevant chain or connection
   */
  forChain(chainId: ChainId): Promise<ExtrinsicBuilder>;
}

export type EstimateFeeParams = {
  chainId: ChainId;
  transaction: ExtrinsicTransaction;
  signOptions?: Partial<SignerOptions>;
  options?: Partial<ExtrinsicBuildingOptions>;
};

export type EstimateFee = (params: EstimateFeeParams) => Promise<Balance>;

export type SubmitExtrinsicParams = {
  chainId: ChainId;
  transaction: ExtrinsicTransaction;
  keyring?: KeyringPair;
  options?: Partial<ExtrinsicBuildingOptions>;
  signOptions?: Partial<SignerOptions>;
};

export type SubmitExtrinsic = (params: SubmitExtrinsicParams) => Promise<Hash | undefined>;

export const enum TransactionType {
  TRANSFER = 'transfer',
  TRANSFER_ALL = 'transferAll',
  TRANSFER_STATEMINE = 'transferStatemine',
}
