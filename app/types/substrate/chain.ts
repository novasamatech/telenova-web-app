import { type Asset } from './asset';

export type Chain = {
  chainId: ChainId;
  chainIndex: ChainIndex;
  parentId?: ChainId;
  specName: string;
  name: string;
  assets: Asset[];
  nodes: RpcNode[];
  options?: ChainOptions[];
  icon: string;
  addressPrefix: number;
};
type ChainOptions = 'evm';

export type RpcNode = {
  url: string;
  name: string;
};

export type ChainMetadata = {
  chainId: ChainId;
  version: number;
  metadata: Metadata;
};

export type ChainsMap = Record<ChainId, Chain>;
