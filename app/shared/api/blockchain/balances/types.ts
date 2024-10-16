import { type TypedApi } from 'polkadot-api';

import { type BN } from '@polkadot/util';

import type { AssetBalance } from '@/types/substrate';

import { type ztg } from '@polkadot-api/descriptors';

export interface IBalance {
  subscribeBalance: (address: Address, callback: (newBalance: AssetBalance) => void) => VoidFunction;
  getFreeBalance: (address: Address) => Promise<BN>;
  getFreeBalances: (addresses: Address[]) => Promise<BN[]>;
  getExistentialDeposit: () => Promise<BN>;
}

// HKO/PARA/SUB use miscFrozen, feeFrozen
export type ParaApi = {
  type: 'para';
  api: TypedApi<typeof ztg>; // TODO: change to HKO/PARA/SUB
};
