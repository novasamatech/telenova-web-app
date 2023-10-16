import { ChainId } from '@common/types';

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