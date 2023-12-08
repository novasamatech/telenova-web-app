import { Chain } from './types';

export const polkadot: Chain = {
  chainId: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  name: 'Polkadot',
  assets: [
    {
      assetId: 0,
      symbol: 'DOT',
      precision: 10,
    },
  ],
  nodes: [
    {
      url: 'wss://polkadot-rpc.dwellir.com',
      name: 'Dwellir node',
    },
    {
      url: 'wss://rpc.polkadot.io',
      name: 'Parity node',
    },
  ],
  addressPrefix: 0,
};

export const kusama: Chain = {
  chainId: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  name: 'Kusama',
  assets: [
    {
      assetId: 0,
      symbol: 'KSM',
      precision: 12,
    },
  ],
  nodes: [
    {
      url: 'wss://rpc.ibp.network/kusama',
      name: 'IBP network node',
    },
    {
      url: 'wss://1rpc.io/ksm',
      name: 'Automata 1RPC node',
    },
  ],
  addressPrefix: 2,
};

export const westend: Chain = {
  chainId: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  name: 'Westend',
  assets: [
    {
      assetId: 0,
      symbol: 'WND',
      precision: 12,
    },
  ],
  nodes: [
    {
      url: 'wss://rpc.ibp.network/westend',
      name: 'IBP network node',
    },
    {
      url: 'wss://rpc.dotters.network/westend',
      name: 'Dotters Net node',
    },
  ],
  addressPrefix: 42,
};
