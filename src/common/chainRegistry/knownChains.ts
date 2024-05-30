import { Chain } from './types';

export const polkadot: Chain = {
  chainId: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  name: 'Polkadot',
  assets: [
    {
      assetId: 0,
      symbol: 'DOT',
      precision: 10,
      priceId: 'polkadot',
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
    {
      url: 'wss://polkadot.public.curie.radiumblock.co/ws',
      name: 'Radium node',
    },
    {
      url: 'wss://dot-rpc.stakeworld.io',
      name: 'Stakeworld node',
    },
    {
      url: 'wss://1rpc.io/dot',
      name: 'Automata 1RPC node',
    },
    {
      url: 'wss://rpc-polkadot.luckyfriday.io',
      name: 'LuckyFriday node',
    },
    {
      url: 'wss://rpc.ibp.network/polkadot',
      name: 'IBP network node',
    },
    {
      url: 'wss://rpc.dotters.network/polkadot',
      name: 'Dotters Net node',
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
      priceId: 'kusama',
    },
  ],
  nodes: [
    {
      url: 'wss://kusama-rpc.dwellir.com',
      name: 'Dwellir node',
    },
    {
      url: 'wss://rpc-kusama.luckyfriday.io',
      name: 'LuckyFriday node',
    },
    {
      url: 'wss://1rpc.io/ksm',
      name: 'Automata 1RPC node',
    },
    {
      url: 'wss://rpc.ibp.network/kusama',
      name: 'IBP network node',
    },
    {
      url: 'wss://rpc.dotters.network/kusama',
      name: 'Dotters Net node',
    },
    {
      url: 'wss://kusama.public.curie.radiumblock.co/ws',
      name: 'Radium node',
    },
    {
      url: 'wss://kusama.api.onfinality.io/public-ws',
      name: 'OnFinality node',
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
    // {
    //   url: 'wss://westend-rpc.dwellir.com',
    //   name: 'Dwellir node',
    // },
    {
      url: 'wss://westend-rpc.blockops.network/ws',
      name: 'Blockops node',
    },
    {
      url: 'wss://rpc.dotters.network/westend',
      name: 'Dotters Net node',
    },
    {
      url: 'wss://westend.api.onfinality.io/public-ws',
      name: 'OnFinality node',
    },
    // {
    //   url: 'wss://rpc.ibp.network/westend',
    //   name: 'IBP network node',
    // },
  ],
  addressPrefix: 42,
};

export const assetHub: Chain = {
  name: 'Polkadot Asset Hub',
  addressPrefix: 0,
  chainId: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
  assets: [
    {
      assetId: 1,
      symbol: 'USDT',
      precision: 6,
      type: 'statemine',
      priceId: 'tether',
      typeExtras: {
        assetId: '1984',
      },
      name: 'USD Tether',
    },
  ],
  nodes: [
    {
      url: 'wss://asset-hub-polkadot-rpc.dwellir.com',
      name: 'Dwellir node',
    },
    {
      url: 'wss://sys.ibp.network/statemint',
      name: 'IBP network node',
    },
    {
      url: 'wss://sys.dotters.network/statemint',
      name: 'Dotters Net node',
    },
    {
      url: 'wss://statemint.api.onfinality.io/public-ws',
      name: 'OnFinality node',
    },
  ],
};

// export const westmint = {
//   name: 'Westmint',
//   addressPrefix: 42,
//   chainId: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
//   nodes: [
//     {
//       url: 'wss://westmint-rpc.dwellir.com',
//       name: 'Dwellir node',
//     },
//     {
//       url: 'wss://wnd-rpc.stakeworld.io/assethub',
//       name: 'Stakeworld node',
//     },
//   ],
//   assets: [
//     {
//       assetId: 1,
//       symbol: 'SIRI',
//       precision: 10,
//       type: 'statemine',
//       typeExtras: {
//         assetId: '81',
//       },
//       name: 'Siri',
//     },
//   ],
// };
