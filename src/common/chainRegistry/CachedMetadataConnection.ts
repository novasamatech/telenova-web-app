import { ProviderInterface } from '@polkadot/rpc-provider/types';

import { RuntimeMetadata } from './types';
import { ChainId } from '@common/types';

export const GET_METADATA_METHOD = 'state_getMetadata';

export const createCachedProvider = (
  Provider: new (...args: any[]) => ProviderInterface,
  chainId: ChainId,
  getMetadata?: (chainId: ChainId) => Promise<RuntimeMetadata | undefined>,
) => {
  class CachedProvider extends Provider {
    async send(method: string, params: unknown[], ...args: any[]): Promise<any> {
      if (method === GET_METADATA_METHOD && params.length === 0 && getMetadata) {
        const metadata = await getMetadata(chainId);

        if (metadata?.metadata) return metadata.metadata;
      }

      return super.send(method, params, ...args);
    }
  }

  return CachedProvider;
};
