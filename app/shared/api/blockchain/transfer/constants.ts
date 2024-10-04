import type { SignerOptions } from '@polkadot/api/types';

export const ASSET_LOCATION: Record<string, SignerOptions> = {
  // USDC MultiLocation
  1337: {
    // @ts-expect-error type error
    parents: 0,
    interior: {
      X2: [{ PalletInstance: 50 }, { GeneralIndex: 1337 }],
    },
  },
  // USDT MultiLocation
  1984: {
    // @ts-expect-error type error
    parents: 0,
    interior: {
      X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }],
    },
  },
  // DOT MultiLocation
  0: {
    // @ts-expect-error type error
    parents: 1,
    interior: {
      Here: '',
    },
  },
};
