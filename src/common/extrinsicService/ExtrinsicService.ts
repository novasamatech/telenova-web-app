import { ChainId } from '@common/types';
import { ExtrinsicBuilding, ExtrinsicBuildingOptions } from '@common/extrinsicService/types';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { useExtrinsicBuilderFactory } from '@common/extrinsicService/ExtrinsicBuilder';
import { ApiTypes } from '@polkadot/api-base/types/base';

interface ExtrinsicService {
  prepareExtrinsic<ApiType extends ApiTypes>(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<SubmittableExtrinsic<ApiType>>;
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

  return {
    prepareExtrinsic,
  };
}
