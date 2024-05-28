import { ApiPromise } from '@polkadot/api';
import { UnsubscribePromise } from '@polkadot/api/types';

import { ChainId, HexString } from '@common/types';

export type Asset = {
  assetId: number;
  symbol: string;
  precision: number;
  priceId?: string;
  type?: string;
  typeExtras?: {
    assetId: string;
  };
  name?: string;
};

export type Chain = {
  chainId: ChainId;
  name: string;
  assets: Asset[];
  nodes: RpcNode[];
  addressPrefix: number;
};

export type ChainAsset = {
  chain: Chain;
  asset: Asset;
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
};

export const enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}

export type Connection = {
  api: ApiPromise;
};

export type ConnectionRequest = {
  chain: Chain;
  onConnected: (chainId: ChainId, connection: Connection) => void;
  onDisconnected: (chainId: ChainId) => void;
  getMetadata: (chainId: ChainId) => Promise<RuntimeMetadata | undefined>;
};

export interface IChainProviderService {
  getAllChains: () => Promise<Chain[]>;
  getAssetBySymbol: (symbol: string) => Promise<ChainAsset>;
  getAssetByChainId: (assetId: string, chainId: ChainId) => Asset | undefined;
  getChain: (chainId: ChainId) => Promise<Chain | undefined>;
}

export interface IChainConnectionService {
  connectionStates: Record<ChainId, ConnectionState>;
  getConnection: (chainId: ChainId) => Promise<Connection>;
  createConnections: (requests: ConnectionRequest[]) => void;
}

export interface IRuntimeProviderService {
  getMetadata: (chainId: ChainId) => Promise<RuntimeMetadata | undefined>;
  subscribeMetadata: (api: ApiPromise) => UnsubscribePromise;
}
