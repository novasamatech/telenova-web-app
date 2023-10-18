import { ApiPromise } from '@polkadot/api';
import { UnsubscribePromise } from '@polkadot/api/types';

import { ChainId, HexString } from '@common/types';

export type Asset = {
  assetId: number;
  symbol: string;
  precision: number;
};

export type Chain = {
  chainId: ChainId;
  name: string;
  assets: Asset[];
  nodes: RpcNode[];
  addressPrefix: number;
};

export type RpcNode = {
  url: string;
  name: string;
};

export type RuntimeMetadata = {
  version: number;
  metadata?: HexString;
};

export type ConnectionState = {
  chainId: ChainId;
  connectionStatus: ConnectionStatus;
  allNodes: RpcNode[];
  actionNodeIndex?: number;
  timeoutId?: any;
  connection?: Connection;
};

export const enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR'
}

export type Connection = {
  api: ApiPromise
}

export type ConnectionRequest = {
  chain: Chain,
  onConnected: (chainId: HexString, connection: Connection) => void,
  onDisconnected: (chainId: HexString) => void,
  getMetadata: (chainId: ChainId) => Promise<RuntimeMetadata | undefined>
}

export interface IChainConnectionService {
  getConnection: (chainId: HexString) => Connection | undefined;
  createConnections: (requests: ConnectionRequest[]) => void;
}

export interface IRuntimeProviderService {
  getMetadata: (chainId: HexString) => Promise<RuntimeMetadata | undefined>;
  syncMetadata: (api: ApiPromise) => Promise<RuntimeMetadata>;
  subscribeMetadata: (api: ApiPromise) => UnsubscribePromise;
}

export interface IChainRegistryService {
  
}