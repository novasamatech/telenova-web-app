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

export interface IChainConnectionService {

}

export interface IRuntimeProviderService {
  getMetadata: (chainId: HexString) => Promise<RuntimeMetadata | undefined>;
  syncMetadata: (api: ApiPromise) => Promise<RuntimeMetadata>;
  subscribeMetadata: (api: ApiPromise) => UnsubscribePromise;
}

export interface IChainRegistryService {
  
}