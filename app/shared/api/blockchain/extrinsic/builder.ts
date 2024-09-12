import { type ApiPromise } from '@polkadot/api';
import { type SubmittableExtrinsic, type SubmittableExtrinsicFunction } from '@polkadot/api-base/types';

import { type BatchMode } from '../types';

import { type ExtrinsicBuildingOptions } from './types';

export class ExtrinsicBuilder {
  readonly #api: ApiPromise;
  readonly #calls: Array<SubmittableExtrinsic<'promise'>> = [];

  constructor(api: ApiPromise) {
    this.#api = api;
  }

  addCall(call: SubmittableExtrinsic<'promise'>) {
    this.#calls.push(call);
  }

  build(options?: Partial<ExtrinsicBuildingOptions>): SubmittableExtrinsic<'promise'> {
    if (this.#calls.length === 0) {
      throw Error('Empty extrinsic');
    }

    if (this.#calls.length === 1) return this.#calls[0];

    return this.#getBatchCall(this.#api, this.#optionsOrDefault(options).batchMode)(this.#calls);
  }

  #optionsOrDefault(options?: Partial<ExtrinsicBuildingOptions>): ExtrinsicBuildingOptions {
    return {
      batchMode: options?.batchMode || 'BATCH',
    };
  }

  #getBatchCall(api: ApiPromise, mode: BatchMode): SubmittableExtrinsicFunction<'promise'> {
    const BATCH_MAP: Record<BatchMode, SubmittableExtrinsicFunction<'promise'>> = {
      BATCH: api.tx.utility.batch,
      BATCH_ALL: api.tx.utility.batchAll,
      FORCE_BATCH: api.tx.utility.forceBatch,
    };

    return BATCH_MAP[mode];
  }
}
