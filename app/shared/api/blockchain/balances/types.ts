import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { type Balance } from '@polkadot/types/interfaces';
import { type BN } from '@polkadot/util';

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
  publicKey: PublicKey,
  callback: (newBalance: AssetBalance) => void,
) => UnsubscribePromise;

export type IFreeBalance<T extends Asset> = (api: ApiPromise, address: Address, asset: T) => Promise<BN>;
