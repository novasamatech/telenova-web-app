import { type SignerOptions } from '@polkadot/api/types';

// CloudStorage / LocalStorage keys
export const PUBLIC_KEY_STORE = 'publicKey';
export const MNEMONIC_STORE = 'mnemonic';
export const GIFT_STORE = 'gifts';
export const CONNECTIONS_STORE = 'connections';
export const BACKUP_DATE = 'backupDate';

export const FAKE_ACCOUNT_ID = '0x' + '1'.repeat(64);
export const ZERO_BALANCE = '0';

export const DEFAULT_CHAINS: Record<string, ChainId> = {
  POLKADOT: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  KUSAMA: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  DOT_ASSET_HUB: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
  WESTEND: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
};

// TODO: take json from nova-utils
export const ASSET_LOCATION: Record<string, SignerOptions> = {
  1984: {
    // @ts-expect-error type error
    parents: 0,
    interior: {
      X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }],
    },
  },
  0: {
    // @ts-expect-error type error
    parents: 1,
    interior: {
      Here: '',
    },
  },
};
