import { ApiPromise, WsProvider } from '@polkadot/api';
import { type ProviderInterface, type ProviderInterfaceEmitCb } from '@polkadot/rpc-provider/types';

export interface ProviderWithMetadata extends ProviderInterface {
  updateMetadata: (metadata: HexString) => void;
}

const GET_METADATA_METHOD = 'state_getMetadata';
const RETRY_DELAY = 2000;

export const providerApi = {
  createConnector,
};

async function createConnector(
  params: ProviderParams,
  listeners: ProviderListeners,
): Promise<{ provider: ProviderWithMetadata; api: ApiPromise }> {
  const provider = createProvider(params, listeners);
  const api = await createApi(provider);

  return { provider, api };
}

function createApi(provider: ProviderInterface): Promise<ApiPromise> {
  return ApiPromise.create({ provider, throwOnConnect: true, throwOnUnknown: true });
}

type ProviderParams = {
  nodes?: string[];
  metadata?: HexString;
};
type ProviderListeners = {
  onConnected: ProviderInterfaceEmitCb;
  onDisconnected: ProviderInterfaceEmitCb;
  onError: ProviderInterfaceEmitCb;
};
function createProvider(params: ProviderParams, listeners: ProviderListeners): ProviderWithMetadata | never {
  const provider = createWebsocketProvider(params);

  provider.on('connected', listeners.onConnected);
  provider.on('disconnected', listeners.onDisconnected);
  provider.on('error', listeners.onError);

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
