import { type PolkadotClient, type SS58String } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi, type ParaApi } from '../types';

import { type AssetBalance, type NativeAsset } from '@/types/substrate';

import { type IBalance } from './types';

import { dot, kilt, ztg } from '@polkadot-api/descriptors';

type ParachainsApi = ParaApi<'kilt', typeof kilt> | ParaApi<'ztg', typeof ztg>;
type ClientApi = GenericApi<typeof dot> | ParachainsApi;

export class NativeBalanceService implements IBalance {
  readonly #client: ClientApi;
  readonly #chainId: ChainId;
  readonly #asset: NativeAsset;

  constructor(chainId: ChainId, client: PolkadotClient, asset: NativeAsset) {
    this.#asset = asset;
    this.#chainId = chainId;
    this.#client = this.#getTypedClientApi(chainId, client);
  }

  #getTypedClientApi(chainId: ChainId, client: PolkadotClient): ClientApi {
    const config: Record<ChainId, (client: PolkadotClient) => ParachainsApi> = {
      // KILT
      '0x411f057b9107718c9624d6aa4a3f23c1653898297f3d4d529d9bb6511a39dd21': client => ({
        type: 'kilt',
        api: client.getTypedApi(kilt),
      }),
      // ZTG
      '0x1bf2a2ecb4a868de66ea8610f2ce7c8c43706561b6476031315f6640fe38e060': client => ({
        type: 'ztg',
        api: client.getTypedApi(ztg),
      }),
    };

    return config[chainId]?.(client) || { type: 'generic', api: client.getTypedApi(dot) };
  }

  subscribeBalance(address: Address, callback: (newBalance: AssetBalance) => void): VoidFunction {
    const handler = (data: { free: bigint; reserved: bigint; frozen: bigint; flags: bigint }) => {
      const frozen = new BN(data.frozen.toString());
      const free = new BN(data.free.toString());
      const reserved = new BN(data.reserved.toString());

      callback({
        address,
        chainId: this.#chainId,
        assetId: this.#asset.assetId,
        balance: {
          free,
          frozen,
          reserved,

          total: free.add(reserved),
          transferable: free.gt(frozen) ? free.sub(frozen) : BN_ZERO,
        },
      });
    };

    switch (this.#client.type) {
      case 'ztg':
      case 'kilt':
        return this.#client.api.query.System.Account.watchValue(address, 'best').subscribe(({ data }) => {
          handler(data);
        }).unsubscribe;
      default:
        return this.#client.api.query.System.Account.watchValue(address, 'best').subscribe(({ data }) => {
          handler(data);
        }).unsubscribe;
    }
  }

  getFreeBalance(address: Address): Promise<BN> {
    return this.#client.api.query.System.Account.getValue(address, { at: 'best' }).then(
      balance => new BN(balance.data.free.toString()),
    );
  }

  getFreeBalances(addresses: Address[]): Promise<BN[]> {
    const addressTuples = addresses.map(address => [address] as [SS58String]);

    return this.#client.api.query.System.Account.getValues(addressTuples, { at: 'best' }).then(balances => {
      return balances.map(balance => new BN(balance.data.free.toString()));
    });
  }

  getExistentialDeposit(): Promise<BN> {
    return this.#client.api.constants.Balances.ExistentialDeposit().then(ed => new BN(ed.toString()));
  }
}
