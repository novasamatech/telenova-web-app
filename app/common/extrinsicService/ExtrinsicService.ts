import { type ApiPromise } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api-base/types';
import { type ApiTypes } from '@polkadot/api-base/types/base';

import { useExtrinsicBuilderFactory } from './ExtrinsicBuilder';
import { type ExtrinsicBuildingOptions, type ExtrinsicTransaction, TransactionType } from './types';

interface ExtrinsicService {
  prepareExtrinsic<ApiType extends ApiTypes>(
    chainId: ChainId,
    transaction: ExtrinsicTransaction,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<SubmittableExtrinsic<ApiType>>;
}

export function useExtrinsicService(): ExtrinsicService {
  const extrinsicBuilderFactory = useExtrinsicBuilderFactory();

  const getExtrinsic: Record<
    TransactionType,
    (args: Record<string, any>, api: ApiPromise) => SubmittableExtrinsic<'promise'>
  > = {
    [TransactionType.TRANSFER]: ({ dest, value }, api) =>
      api.tx.balances['transferKeepAlive']
        ? api.tx.balances['transferKeepAlive'](dest, value)
        : api.tx.balances['transfer'](dest, value),
    [TransactionType.TRANSFER_ALL]: ({ dest }, api) => api.tx.balances.transferAll(dest, false),
    [TransactionType.TRANSFER_STATEMINE]: ({ dest, value, asset }, api) => api.tx.assets.transfer(asset, dest, value),
  };

  const prepareExtrinsic = async (
    chainId: ChainId,
    transaction: ExtrinsicTransaction,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<SubmittableExtrinsic<any>> => {
    const extrinsicBuilder = await extrinsicBuilderFactory.forChain(chainId);

    extrinsicBuilder.addCall(getExtrinsic[transaction.type](transaction.args, extrinsicBuilder.api));

    return extrinsicBuilder.build(options);
  };

  return { prepareExtrinsic };
}
