import { ApiPromise } from '@polkadot/api';
import { ApiTypes } from '@polkadot/api-base/types/base';
import { ChainId } from '@common/types';
import { ExtrinsicBuilding, ExtrinsicBuildingOptions } from '@common/extrinsicService/types';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { useExtrinsicBuilderFactory } from '@common/extrinsicService/ExtrinsicBuilder';

interface ExtrinsicService {
  prepareExtrinsic<ApiType extends ApiTypes>(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<SubmittableExtrinsic<ApiType>>;
  prepareApi(chainId: ChainId): Promise<ApiPromise>;
}

export function useExtrinsicService(): ExtrinsicService {
  const extrinsicBuilderFactory = useExtrinsicBuilderFactory();

  const prepareExtrinsic = async (
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<SubmittableExtrinsic<any>> => {
    const extrinsicBuilder = await extrinsicBuilderFactory.forChain(chainId);

    building(extrinsicBuilder);

    return extrinsicBuilder.build(options);
  };

  const prepareApi = async (chainId: ChainId): Promise<ApiPromise> => {
    const extrinsicBuilder = await extrinsicBuilderFactory.forChain(chainId);

    return extrinsicBuilder.api;
  };

  return {
    prepareExtrinsic,
    prepareApi,
  };
}
