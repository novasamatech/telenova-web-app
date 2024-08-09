import type { ApiPromise } from '@polkadot/api';
import type { UnsubscribePromise } from '@polkadot/api/types';
import { type Balance } from '@polkadot/types/interfaces';

import type { Asset, AssetBalance, Chain } from '@/types/substrate';

export type OrmlAccountData = {
  free: Balance;
  reserved: Balance;
  frozen: Balance;
};

export type ISubscribeBalance<T extends Asset> = (
  api: ApiPromise,
  chain: Chain,
  asset: T,
  accountId: AccountId,
  callback: (newBalance: AssetBalance) => void,
) => UnsubscribePromise;
