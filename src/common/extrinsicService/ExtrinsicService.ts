import {ChainId} from "@common/types";
import {ExtrinsicBuilding, ExtrinsicBuildingOptions} from "@common/extrinsicService/types";
import {SubmittableExtrinsic} from "@polkadot/api-base/types";
import {useExtrinsicBuilderFactory} from "@common/extrinsicService/ExtrinsicBuilder";
import {ApiTypes} from "@polkadot/api-base/types/base";

interface ExtrinsicService {

  prepareExtrinsic<ApiType extends ApiTypes>(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): SubmittableExtrinsic<ApiType>
}


export function useExtrinsicService(): ExtrinsicService {
  const extrinsicBuilderFactory = useExtrinsicBuilderFactory()

  const prepareExtrinsic = (
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): SubmittableExtrinsic<any> => {
    const extrinsicBuilder = extrinsicBuilderFactory.forChain(chainId)
    if (extrinsicBuilder === undefined) {
      // TODO this might happen if there is no connection at the call point, I am not sure if we should gracefully handle it
      throw Error("Failed to create extrinsic builder")
    }

    building(extrinsicBuilder)

    return extrinsicBuilder.build(options)
  }

  return {
    prepareExtrinsic
  }
}
