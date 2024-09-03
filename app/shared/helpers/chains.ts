import type { Asset, Chain, ChainsMap } from '@/types/substrate';

export const POLKADOT = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
export const KUSAMA = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';
export const POLKADOT_ASSET_HUB = '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f';

export const DUAL_SYMBOLS = ['BNC', 'LIT', 'PHA'];

export const DEFAULT_CONNECTED_CHAINS: Record<ChainId, AssetId[]> = {
  [POLKADOT]: [0],
  [KUSAMA]: [0],
  [POLKADOT_ASSET_HUB]: [1],
};

export const DEFAULT_CHAINS_ORDER: Record<ChainId, Record<AssetId, number>> = {
  [POLKADOT]: {
    0: 0, // DOT - index_0
  },
  [KUSAMA]: {
    0: 1, // KSM - index_1
  },
  [POLKADOT_ASSET_HUB]: {
    1: 2, // USDT - index_2
  },
};

export const getParentChain = (chains: ChainsMap, chainId: ChainId, asset: Asset): Chain | undefined => {
  if (!DUAL_SYMBOLS.includes(asset.symbol)) return;

  const parentChainId = chains[chainId].parentId;
  if (!parentChainId) return;

  return chains[parentChainId];
};
