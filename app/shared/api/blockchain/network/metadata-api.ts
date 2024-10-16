import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';

import { type ChainMetadata } from '@/types/substrate';

export const metadataApi = {
  requestMetadata,
  subscribeMetadata,
};

async function requestMetadata(api: ApiPromise): Promise<ChainMetadata> {
  const [metadata, version] = await Promise.all([api.rpc.state.getMetadata(), api.rpc.state.getRuntimeVersion()]);

  return {
    metadata: metadata.toHex(),
    version: version.specVersion.toNumber(),
    chainId: api.genesisHash.toHex(),
  };
}

function subscribeMetadata(api: ApiPromise, callback: (api: ApiPromise) => void): UnsubscribePromise {
  return api.rpc.state.subscribeRuntimeVersion(() => callback(api));
}
