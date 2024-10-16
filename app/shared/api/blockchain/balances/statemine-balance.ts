import { type PolkadotClient, type SS58String } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi } from '../types';

import { assetUtils } from '@/shared/helpers';
import { type AssetBalance, type StatemineAsset } from '@/types/substrate';

import { type IBalance } from './types';

import { dotAh } from '@polkadot-api/descriptors';

type ClientApi = GenericApi<typeof dotAh>;

export class StatemineBalanceService implements IBalance {
  readonly #client: ClientApi;
  readonly #chainId: ChainId;
  readonly #asset: StatemineAsset;

  constructor(chainId: ChainId, client: PolkadotClient, asset: StatemineAsset) {
    this.#asset = asset;
    this.#chainId = chainId;
    this.#client = this.#getTypedClientApi(client);
  }

  #getTypedClientApi(client: PolkadotClient): ClientApi {
    return { type: 'generic', api: client.getTypedApi(dotAh) };
  }

  subscribeBalance(address: Address, callback: (newBalance: AssetBalance) => void): VoidFunction {
    return this.#subscribeGenericApi(this.#client.api, address, callback);
  }

  #subscribeGenericApi(
    api: GenericApi<typeof dotAh>['api'],
    address: Address,
    callback: (newBalance: AssetBalance) => void,
  ): VoidFunction {
    const assetId = Number(assetUtils.getAssetId(this.#asset));

    return api.query.Assets.Account.watchValue(assetId, address).subscribe(accountInfo => {
      const free = accountInfo ? new BN(accountInfo.balance.toString()) : BN_ZERO;

      callback({
        address,
        chainId: this.#chainId,
        assetId: this.#asset.assetId,
        balance: {
          free,
          frozen: BN_ZERO,
          reserved: BN_ZERO,

          total: free,
          transferable: free,
        },
      });
    }).unsubscribe;
  }

  getFreeBalance(address: Address): Promise<BN> {
    return this.#client.api.query.System.Account.getValue(address).then(
      balance => new BN(balance.data.free.toString()),
    );
  }

  getFreeBalances(addresses: Address[]): Promise<BN[]> {
    const addressTuples = addresses.map(address => {
      return [Number(assetUtils.getAssetId(this.#asset)), address] as [number, SS58String];
    });

    return this.#client.api.query.Assets.Account.getValues(addressTuples).then(balances => {
      return balances.map(balance => (balance ? new BN(balance.balance.toString()) : BN_ZERO));
    });
  }

  getExistentialDeposit(): Promise<BN> {
    const assetId = Number(assetUtils.getAssetId(this.#asset));

    return this.#client.api.query.Assets.Asset.getValue(assetId).then(balance =>
      balance ? new BN(balance.min_balance.toString()) : BN_ZERO,
    );
  }
}
