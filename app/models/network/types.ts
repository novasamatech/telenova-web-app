import type { ApiPromise } from '@polkadot/api';

import { type ProviderWithMetadata } from '@/shared/api/network/provider-api';

export type Connection = {
  provider?: ProviderWithMetadata;
  api?: ApiPromise;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
};
