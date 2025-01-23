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
    interior: Enum('X2', [Enum('PalletInstance', 50), Enum('GeneralIndex', 1337n)]),
  },
  1984: {
    parents: 0,
    interior: Enum('X2', [Enum('PalletInstance', 50), Enum('GeneralIndex', 1984n)]),
  },
};
