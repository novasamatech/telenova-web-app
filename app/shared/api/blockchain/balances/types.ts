import { type BN } from '@polkadot/util';

import type { AssetBalance } from '@/types/substrate';

export interface IBalance {
  subscribeBalance: (address: Address, callback: (newBalance: AssetBalance) => void) => VoidFunction;
  getFreeBalance: (address: Address) => Promise<BN>;
  getFreeBalances: (addresses: Address[]) => Promise<BN[]>;
  getExistentialDeposit: () => Promise<BN>;
}
