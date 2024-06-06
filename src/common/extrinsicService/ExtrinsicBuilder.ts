import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import '@polkadot/api-augment';
import { ApiPromise } from '@polkadot/api';

import { useChainRegistry } from '@common/chainRegistry';
import { ChainId } from '@common/types';
import { BatchMode, ExtrinsicBuilder, ExtrinsicBuilderFactory, ExtrinsicBuildingOptions } from './types';

export function useExtrinsicBuilderFactory(): ExtrinsicBuilderFactory {
  const { getConnection } = useChainRegistry();

  async function forChain(chainId: ChainId): Promise<ExtrinsicBuilder> {
    const connection = await getConnection(chainId);

    return createExtrinsicBuilder(connection.api);
  }

  return {
    forChain,
  };
}

function createExtrinsicBuilder(api: ApiPromise): ExtrinsicBuilder {
  const calls: Array<SubmittableExtrinsic<any>> = [];

  const addCall = (call: SubmittableExtrinsic<'promise'>) => {
    calls.push(call);
  };

  const build = (options?: Partial<ExtrinsicBuildingOptions>) => {
    const optionsWithDefaults = optionsOrDefault(options);

    switch (calls.length) {
      // while empty extrinsic is still a valid extrinsic, we consider it to be a logic error
      case 0:
        throw Error('Empty extrinsic');
      case 1:
        return calls[0];
      default: {
        const batchCall = getBatchCall(api, optionsWithDefaults.batchMode);

        return batchCall(calls);
      }
    }
  };

  return {
    api,
    addCall,
    build,
  };
}

function getBatchCall(api: ApiPromise, mode: BatchMode): SubmittableExtrinsicFunction<any> {
  switch (mode) {
    case BatchMode.BATCH:
      return api.tx.utility.batch;
    case BatchMode.BATCH_ALL:
      return api.tx.utility.batchAll;
    case BatchMode.FORCE_BATCH:
      return api.tx.utility.forceBatch;
  }
}

function optionsOrDefault(options?: Partial<ExtrinsicBuildingOptions>): ExtrinsicBuildingOptions {
  return {
    batchMode: options?.batchMode ?? BatchMode.BATCH,
  };
}
