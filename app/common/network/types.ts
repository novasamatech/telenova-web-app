import { type ProviderInterface } from '@polkadot/rpc-provider/types';

export interface ProviderWithMetadata extends ProviderInterface {
  updateMetadata: (metadata: HexString) => void;
}

export const enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}

export type Connection = {
  chainId: ChainId;
  connectionType: 'enabled' | 'disabled';
};
