import { Enum } from 'polkadot-api';

import { type XcmV3Junctions } from '@polkadot-api/descriptors';

export const ASSET_LOCATION: Record<
  string,
  {
    parents: number;
    interior: XcmV3Junctions;
  }
> = {
  0: {
    parents: 1,
    interior: Enum('Here'),
  },
  1337: {
    parents: 0,
    interior: Enum('X2', [Enum('PalletInstance', 50), Enum('GeneralIndex', BigInt(1337))]),
  },
  1984: {
    parents: 0,
    interior: Enum('X2', [Enum('PalletInstance', 50), Enum('GeneralIndex', BigInt(1984))]),
  },
};

// export const ASSET_LOCATION: Record<string, SignerOptions> = {
//   // USDC MultiLocation
//   1337: {
//     // @ts-expect-error type error
//     parents: 0,
//     interior: {
//       X2: [{ PalletInstance: 50 }, { GeneralIndex: 1337 }],
//     },
//   },
//   // USDT MultiLocation
//   1984: {
//     // @ts-expect-error type error
//     parents: 0,
//     interior: {
//       X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }],
//     },
//   },
//   // DOT MultiLocation
//   0: {
//     // @ts-expect-error type error
//     parents: 1,
//     interior: {
//       Here: '',
//     },
//   },
// };
