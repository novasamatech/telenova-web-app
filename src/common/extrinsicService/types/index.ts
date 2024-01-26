import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ChainId } from '@common/types';
import { Balance, Hash } from '@polkadot/types/interfaces';
import { KeyringPair } from '@polkadot/keyring/types';

export interface ExtrinsicBuilder {
  api: ApiPromise;

  addCall(call: SubmittableExtrinsic<any>): void;

  build(options?: Partial<ExtrinsicBuildingOptions>): SubmittableExtrinsic<'promise'>;
}

export type ExtrinsicBuilding = (builder: ExtrinsicBuilder) => void;

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

export type EstimateFee = (
  chainId: ChainId,
  building: ExtrinsicBuilding,
  options?: Partial<ExtrinsicBuildingOptions>,
) => Promise<Balance>;

export type SubmitExtrinsic = (
  chainId: ChainId,
  building: ExtrinsicBuilding,
  giftKeyringPair?: KeyringPair,
  options?: Partial<ExtrinsicBuildingOptions>,
) => Promise<Hash | undefined>;

export type GetExistentialDeposit = (chainId: ChainId) => Promise<string | undefined>;
