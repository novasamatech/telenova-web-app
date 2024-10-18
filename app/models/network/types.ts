import { type PolkadotClient } from 'polkadot-api';

export type Connection = {
  client?: PolkadotClient;
  status: 'connecting' | 'connected' | 'error' | 'disconnected' | 'closed';
};
