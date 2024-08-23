import { type SignerOptions } from '@polkadot/api/types';

// CloudStorage / LocalStorage keys
export const PUBLIC_KEY_STORE = 'publicKey';
export const MNEMONIC_STORE = 'mnemonic';
export const GIFT_STORE = 'gifts';
export const CONNECTIONS_STORE = 'connections';
export const BACKUP_DATE = 'backupDate';

export const FAKE_ACCOUNT_ID = '0x' + '1'.repeat(64);

export const SS58_DEFAULT_PREFIX = 42;

export const DUAL_SYMBOLS = ['BNC', 'LIT', 'PHA'];

// TODO: take json from nova-helpers
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
