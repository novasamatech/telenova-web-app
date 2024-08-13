import { type ApiPromise } from '@polkadot/api';
import { type SignerOptions } from '@polkadot/api/types';
import { type SubmittableExtrinsic } from '@polkadot/api-base/types';
import { type KeyringPair } from '@polkadot/keyring/types';

export interface ExtrinsicBuilder {
  api: ApiPromise;
  addCall: (call: SubmittableExtrinsic<any>) => void;
  build: (options?: Partial<ExtrinsicBuildingOptions>) => SubmittableExtrinsic<'promise'>;
}

export type ExtrinsicTransaction = {
  args: Record<string, unknown>;
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
   *
   * @returns Ready-to-use newly initialized ExtrinsicBuilder or undefined in
   *   case there is no relevant chain or connection
   */
  forChain(chainId: ChainId): Promise<ExtrinsicBuilder>;
}

export type EstimateFeeParams = {
  chainId: ChainId;
  transaction: ExtrinsicTransaction;
  signOptions?: Partial<SignerOptions>;
  options?: Partial<ExtrinsicBuildingOptions>;
};

export type SubmitExtrinsicParams = {
  chainId: ChainId;
  transaction: ExtrinsicTransaction;
  keyringPair: KeyringPair;
  options?: Partial<ExtrinsicBuildingOptions>;
  signOptions?: Partial<SignerOptions>;
};

export const enum TransactionType {
  TRANSFER = 'transfer',
  TRANSFER_ALL = 'transferAll',
  TRANSFER_STATEMINE = 'transferStatemine',
  TRANSFER_ORML = 'transferOrml',
}
