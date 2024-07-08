import { type ProviderInterface } from '@polkadot/rpc-provider/types';

import { type ChainId } from '@/common/types';

import { type RuntimeMetadata } from './types';

export const GET_METADATA_METHOD = 'state_getMetadata';

export const createCachedProvider = (
  Provider: new (...args: any[]) => ProviderInterface,
  chainId: ChainId,
  getMetadata?: (chainId: ChainId) => Promise<RuntimeMetadata | undefined>,
) => {
  class CachedProvider extends Provider {
    override async send(method: string, params: unknown[], ...args: any[]): Promise<any> {
      if (method === GET_METADATA_METHOD && params.length === 0 && getMetadata) {
        const metadata = await getMetadata(chainId);

        if (metadata?.metadata) {
          return metadata.metadata;
        }
      }

      return super.send(method, params, ...args);
    }
  }

  return CachedProvider;
};
