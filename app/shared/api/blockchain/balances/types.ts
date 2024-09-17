import { type UnsubscribePromise } from '@polkadot/api/types';
import { type BN } from '@polkadot/util';

import type { AssetBalance, Chain } from '@/types/substrate';

export interface IBalance {
  subscribeBalance: (
    chain: Chain,
    address: Address,
    callback: (newBalance: AssetBalance) => void,
  ) => UnsubscribePromise;
  getFreeBalance: (address: Address) => Promise<BN>;
  getExistentialDeposit: () => Promise<BN>;
}
