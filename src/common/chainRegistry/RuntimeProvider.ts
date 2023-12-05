import { ApiPromise } from '@polkadot/api';
import { UnsubscribePromise } from '@polkadot/api/types';

import { IRuntimeProviderService, RuntimeMetadata } from './types';
import { useRepository } from '@common/repository/Repository';
import { ChainId } from '@common/types';

export const useRuntimeProvider = (): IRuntimeProviderService => {
  const metadataStorage = useRepository<ChainId, RuntimeMetadata>();

  const getMetadata = async (chainId: ChainId): Promise<RuntimeMetadata | undefined> => {
    return await metadataStorage.fetch(chainId);
  };

  const subscribeMetadata = (api: ApiPromise): UnsubscribePromise => {
    return api.rpc.state.subscribeRuntimeVersion(async (version) => {
      const chainId = api.genesisHash.toHex();
      const oldMetadata = await getMetadata(chainId);

      if (!oldMetadata || version.specVersion.toNumber() > oldMetadata.version) {
        await metadataStorage.save(
          {
            version: version.specVersion.toNumber(),
          },
          chainId,
        );

        syncMetadata(api);
      }
    });
  };

  const syncMetadata = async (api: ApiPromise): Promise<RuntimeMetadata> => {
    const [metadata, version] = await Promise.all([api.rpc.state.getMetadata(), api.rpc.state.getRuntimeVersion()]);

    const newMetadata: RuntimeMetadata = {
      metadata: metadata.toHex(),
      version: version.specVersion.toNumber(),
    };

    const chainId = api.genesisHash.toHex();

    await metadataStorage.save(metadata, chainId);

    console.info(`🟢 Synced metadata v${newMetadata.version} ==> ${chainId}`);

    return newMetadata;
  };

  return {
    getMetadata,
    subscribeMetadata,
  };
};
