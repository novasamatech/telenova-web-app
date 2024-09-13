import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import type { UnsubscribePromise } from '@polkadot/api/types';
import { type Balance } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO, hexToU8a } from '@polkadot/util';

import { assetUtils, toAddress } from '@/shared/helpers';
import { type AssetBalance, type Chain, type OrmlAsset } from '@/types/substrate';

import { type IBalance } from './types';

type OrmlAccountData = {
  free: Balance;
  reserved: Balance;
  frozen: Balance;
};

export class OrmlBalanceService implements IBalance {
  readonly #api: ApiPromise;
  readonly #asset: OrmlAsset;

  constructor(api: ApiPromise, asset: OrmlAsset) {
    this.#api = api;
    this.#asset = asset;
  }

  async subscribeBalance(
    chain: Chain,
    publicKey: PublicKey,
    callback: (newBalance: AssetBalance) => void,
  ): UnsubscribePromise {
    const method = this.#api.query['tokens']?.['accounts'] as any;

    if (!method) return Promise.resolve(noop);

    const ormlAssetId = assetUtils.getAssetId(this.#asset);
    const currencyIdType = this.#asset.typeExtras.currencyIdType;
    const assetId = this.#api.createType(currencyIdType, hexToU8a(ormlAssetId));

    const address = toAddress(publicKey, { prefix: chain.addressPrefix });

    return method(address, assetId, (accountInfo: OrmlAccountData) => {
      const free = accountInfo.free.toBn();

      callback({
        publicKey,
        chainId: chain.chainId,
        assetId: this.#asset.assetId,
        balance: {
          free,
          frozen: accountInfo.frozen.toBn(),
          reserved: accountInfo.reserved.toBn(),

          total: free,
          transferable: free,
        },
      });
    });
  }

  async getFreeBalance(address: Address): Promise<BN> {
    const method = this.#api.query['tokens']?.['accounts'] as any;
    if (!method) return BN_ZERO;

    const ormlAssetId = assetUtils.getAssetId(this.#asset);
    const currencyIdType = this.#asset.typeExtras.currencyIdType;
    const assetId = this.#api.createType(currencyIdType, hexToU8a(ormlAssetId));

    const balance = await method(address, assetId);

    return (balance as OrmlAccountData).free.toBn();
  }
}
