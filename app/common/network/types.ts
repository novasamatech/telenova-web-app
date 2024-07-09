import type { ApiPromise } from '@polkadot/api';
import { type ProviderInterface } from '@polkadot/rpc-provider/types';

export interface ProviderWithMetadata extends ProviderInterface {
  updateMetadata: (metadata: HexString) => void;
}

export type Connection = {
  provider?: ProviderWithMetadata;
  api?: ApiPromise;
  status: ConnectionStatus;
};

export const enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}
