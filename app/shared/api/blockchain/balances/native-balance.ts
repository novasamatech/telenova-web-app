import { type PolkadotClient } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi } from '../types';

import { type AssetBalance, type NativeAsset } from '@/types/substrate';

import { type IBalance, type ParaApi } from './types';

import { dot, ztg } from '@polkadot-api/descriptors';

type ClientApi = GenericApi | ParaApi;

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
    const config: Record<ChainId, (client: PolkadotClient) => ClientApi> = {
      // HKO
      '0x64a1c658a48b2e70a7fb1ad4c39eea35022568c20fc44a6e2e3d0a57aee6053b': client => ({
        type: 'para',
        api: client.getTypedApi(ztg),
      }),
      // PARA
      '0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97': client => ({
        type: 'para',
        api: client.getTypedApi(ztg),
      }),
      // SUB
      '0x4a12be580bb959937a1c7a61d5cf24428ed67fa571974b4007645d1886e7c89f': client => ({
        type: 'para',
        api: client.getTypedApi(ztg),
      }),
    };

    return config[chainId]?.(client) || { type: 'generic', api: client.getTypedApi(dot) };
  }

  subscribeBalance(address: Address, callback: (newBalance: AssetBalance) => void): VoidFunction {
    if (this.#client.type === 'para') {
      return this.#subscribeParaApi(this.#client.api, address, callback);
    }

    return this.#subscribeGenericApi(this.#client.api, address, callback);
  }

  #subscribeGenericApi(
    api: GenericApi['api'],
    address: Address,
    callback: (newBalance: AssetBalance) => void,
  ): VoidFunction {
    return api.query.System.Account.watchValue(address).subscribe(({ data }) => {
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
    }).unsubscribe;
  }

  #subscribeParaApi(api: ParaApi['api'], address: Address, callback: (newBalance: AssetBalance) => void): VoidFunction {
    return api.query.System.Account.watchValue(address).subscribe(({ data }) => {
      // @ts-expect-error could not parse metadata for HKO PARA SUB (14.10.2024)
      const useFrozen = data.miscFrozen > data.feeFrozen;
      // @ts-expect-error convert to BN values
      const frozen = useFrozen ? new BN(data.miscFrozen.toString()) : new BN(data.feeFrozen.toString());
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
    }).unsubscribe;
  }

  getFreeBalance(address: Address): Promise<BN> {
    return this.#client.api.query.System.Account.getValue(address).then(
      balance => new BN(balance.data.free.toString()),
    );
  }

  getExistentialDeposit(): Promise<BN> {
    const existentialDeposit = this.#client.api.constants.Balances.ExistentialDeposit;

    return Promise.resolve(new BN(existentialDeposit.toString()));
  }
}
