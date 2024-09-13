import { type ApiPromise } from '@polkadot/api';
import type { UnsubscribePromise } from '@polkadot/api/types';
import { type BN, BN_ZERO } from '@polkadot/util';

import { assetUtils, toAddress } from '@/shared/helpers';
import { type AssetBalance, type Chain, type StatemineAsset } from '@/types/substrate';

import { type IBalance } from './types';

export class StatemineBalanceService implements IBalance {
  readonly #api: ApiPromise;
  readonly #asset: StatemineAsset;

  constructor(api: ApiPromise, asset: StatemineAsset) {
    this.#api = api;
    this.#asset = asset;
  }

  async subscribeBalance(
    chain: Chain,
    publicKey: PublicKey,
    callback: (newBalance: AssetBalance) => void,
  ): UnsubscribePromise {
    const address = toAddress(publicKey, { prefix: chain.addressPrefix });

    return this.#api.query.assets.account(assetUtils.getAssetId(this.#asset), address, accountInfo => {
      const free = accountInfo.isNone ? BN_ZERO : accountInfo.unwrap().balance.toBn();

      callback({
        publicKey,
        chainId: chain.chainId,
        assetId: this.#asset.assetId,
        balance: {
          free,
          frozen: BN_ZERO,
          reserved: BN_ZERO,

          total: free,
          transferable: free,
        },
      });
    });
  }

  getFreeBalance(address: Address): Promise<BN> {
    return this.#api.query.assets.account(assetUtils.getAssetId(this.#asset), address).then(balance => {
      return balance.isNone ? BN_ZERO : balance.unwrap().balance.toBn();
    });
  }

  getExistentialDeposit(): Promise<BN> {
    const assetId = assetUtils.getAssetId(this.#asset);

    return this.#api.query.assets.asset(assetId).then(balance => balance.value.minBalance.toBn());
  }
}
