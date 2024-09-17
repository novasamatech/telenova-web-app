import { type ApiPromise } from '@polkadot/api';
import type { UnsubscribePromise } from '@polkadot/api/types';
import { type AccountData } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';

import { toAddress } from '@/shared/helpers';
import { type AssetBalance, type Chain, type NativeAsset } from '@/types/substrate';

import { type IBalance } from './types';

export class NativeBalanceService implements IBalance {
  readonly #api: ApiPromise;
  readonly #asset: NativeAsset;

  constructor(api: ApiPromise, asset: NativeAsset) {
    this.#api = api;
    this.#asset = asset;
  }

  async subscribeBalance(
    chain: Chain,
    publicKey: PublicKey,
    callback: (newBalance: AssetBalance) => void,
  ): UnsubscribePromise {
    const address = toAddress(publicKey, { prefix: chain.addressPrefix });

    return this.#api.query.system.account(address, frameAccountInfo => {
      let frozen = frameAccountInfo.data.frozen?.toBn();
      const free = frameAccountInfo.data.free.toBn();
      const reserved = frameAccountInfo.data.reserved.toBn();

      // Some chains still use "feeFrozen" or "miscFrozen" (HKO, PARA, XRT, ZTG, SUB)
      const accountData = frameAccountInfo.data as unknown as AccountData;
      if (accountData.feeFrozen || accountData.miscFrozen) {
        frozen = accountData.miscFrozen.gt(accountData.feeFrozen)
          ? accountData.miscFrozen.toBn()
          : accountData.feeFrozen.toBn();
      }

      callback({
        publicKey,
        chainId: chain.chainId,
        assetId: this.#asset.assetId,
        balance: {
          free,
          frozen,
          reserved,

          total: free.add(reserved),
          transferable: free.gt(frozen) ? free.sub(frozen) : BN_ZERO,
        },
      });
    });
  }

  getFreeBalance(address: Address): Promise<BN> {
    return this.#api.query.system.account(address).then(balance => balance.data.free.toBn());
  }

  getExistentialDeposit(): Promise<BN> {
    return Promise.resolve(this.#api.consts.balances.existentialDeposit.toBn());
  }
}
