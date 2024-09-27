import { type UnsubscribePromise } from '@polkadot/api/types';
import { type BN } from '@polkadot/util';

import type { AssetBalance } from '@/types/substrate';

export interface IBalance {
  subscribeBalance: (
    chainId: ChainId,
    address: Address,
    callback: (newBalance: AssetBalance) => void,
  ) => UnsubscribePromise;
  getFreeBalance: (address: Address) => Promise<BN>;
  getFreeBalances: (addresses: Address[]) => Promise<BN[]>;
  getExistentialDeposit: () => Promise<BN>;
}
