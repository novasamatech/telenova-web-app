export const POLKADOT = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
export const KUSAMA = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';
export const POLKADOT_ASSET_HUB = '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f';
export const WESTEND = '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e';

export const DEFAULT_CONNECTED_CHAINS: Record<ChainId, AssetId[]> = {
  [POLKADOT]: [0],
  [KUSAMA]: [0],
  [POLKADOT_ASSET_HUB]: [1],
  [WESTEND]: [0],
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
