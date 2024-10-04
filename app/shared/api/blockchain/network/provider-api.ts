import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { type ProviderInterface } from '@polkadot/rpc-provider/types';

import { EXTENSIONS } from '@/shared/config/extensions';

export interface ProviderWithMetadata extends ProviderInterface {
  updateMetadata: (metadata: HexString) => void;
}

const GET_METADATA_METHOD = 'state_getMetadata';
const RETRY_DELAY = 2000;

export const providerApi = {
  createConnector,
};

async function createConnector(
  chainId: ChainId,
  params: ProviderParams,
  listeners: ProviderListeners,
): Promise<{ provider: ProviderWithMetadata; api: ApiPromise }> {
  const provider = createProvider(params, listeners);

  try {
    const api = await createApi(chainId, provider);

    return { provider, api };
  } catch (error) {
    // API does not support the chain being connected to - https://polkadot.js.org/docs/api/start/create#failures
    console.error(`ApiPromise error for chain ${chainId}`, error);

    throw error;
  }
}

function createApi(chainId: ChainId, provider: ProviderInterface): Promise<ApiPromise> {
  const api = new ApiPromise({
    provider,
    throwOnConnect: true,
    throwOnUnknown: true,
    ...EXTENSIONS[chainId],
  });

  return api.isReady;
}

type ProviderParams = {
  nodes?: string[];
  metadata?: HexString;
};
type ProviderListeners = {
  onConnected: (provider: ProviderWithMetadata) => void;
  onDisconnected: (provider: ProviderWithMetadata) => void;
  onError: (provider: ProviderWithMetadata) => void;
};

function createProvider(params: ProviderParams, listeners: ProviderListeners): ProviderWithMetadata | never {
  const provider = createWebsocketProvider(params);

  // API can fail connecting and loop itself with disconnected > error status
  // Send provider through every callback to be able to disconnect if needed
  provider.on('connected', () => listeners.onConnected(provider));
  provider.on('disconnected', () => listeners.onDisconnected(provider));
  provider.on('error', () => listeners.onError(provider));

  return provider;
}

function createWebsocketProvider({ nodes, metadata }: ProviderParams): ProviderWithMetadata {
  const CachedWsProvider = createCachedProvider(WsProvider, metadata);

  return new CachedWsProvider(nodes, RETRY_DELAY);
}

function createCachedProvider(Provider: new (...args: any[]) => ProviderInterface, metadata?: HexString) {
  class CachedProvider extends Provider implements ProviderWithMetadata {
    private metadata: HexString | undefined = metadata;

    updateMetadata(metadata: HexString) {
      this.metadata = metadata;
    }

    override async send(method: string, params: unknown[], ...args: any[]): Promise<any> {
      const hasMetadata = Boolean(this.metadata);
      const isMetadataMethod = method === GET_METADATA_METHOD;
      const hasParams = params.length > 0;

      return hasMetadata && isMetadataMethod && !hasParams ? this.metadata : super.send(method, params, ...args);
    }
  }

  return CachedProvider;
}
