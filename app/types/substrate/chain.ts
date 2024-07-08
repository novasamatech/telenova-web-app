import { type Asset } from './asset.ts';

export type Chain = {
  chainId: ChainId;
  parentId?: HexString;
  specName: string;
  name: string;
  assets: Asset[];
  nodes: RpcNode[];
  icon: string;
  addressPrefix: number;
};

export type RpcNode = {
  url: string;
  name: string;
};

export type ChainMetadata = {
  chainId: ChainId;
  version: number;
  metadata: Metadata;
};
