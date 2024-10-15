export {};
// TODO: Cannot load metadata and produce descriptors for ORML chains
// Status -> https://github.com/polkadot-api/compliant-RPCs/tree/main

// import { Enum, type PolkadotClient } from 'polkadot-api';
//
// import { BN, BN_ZERO } from '@polkadot/util';
//
// import { type GenericApi } from '../types';
//
// import { type AssetBalance, type OrmlAsset } from '@/types/substrate';
//
// import { type IBalance } from './types';
//
// import { kar } from '@polkadot-api/descriptors';
//
// type ClientApi = GenericApi<typeof kar>;
//
// export class OrmlBalanceService implements IBalance {
//   readonly #client: ClientApi;
//   readonly #chainId: ChainId;
//   readonly #asset: OrmlAsset;
//
//   constructor(chainId: ChainId, client: PolkadotClient, asset: OrmlAsset) {
//     this.#asset = asset;
//     this.#chainId = chainId;
//     this.#client = this.#getTypedClientApi(client);
//   }
//
//   #getTypedClientApi(client: PolkadotClient): ClientApi {
//     return { type: 'generic', api: client.getTypedApi(kar) };
//   }
//
//   subscribeBalance(address: Address, callback: (newBalance: AssetBalance) => void): VoidFunction {
//     return this.#subscribeGenericApi(this.#client.api, address, callback);
//   }
//
//   #subscribeGenericApi(
//     api: GenericApi<typeof kar>['api'],
//     address: Address,
//     callback: (newBalance: AssetBalance) => void,
//   ): VoidFunction {
//     // const assetId = Number(assetUtils.getAssetId(this.#asset));
//
//     //  TODO: think subtracting ED from balance
//     // const existentialDeposit = await this.getExistentialDeposit();
//     // const untouchable = max(data.frozen, EXISTENTIAL_DEPOSIT);
//
//     const asset = Enum('Token', Enum(this.#asset.symbol.toUpperCase()));
//
//     return api.query.Tokens.Accounts.watchValue(address, asset).subscribe(data => {
//       const free = new BN(data.free.toString());
//
//       callback({
//         address,
//         chainId: this.#chainId,
//         assetId: this.#asset.assetId,
//         balance: {
//           free,
//           frozen: BN_ZERO,
//           reserved: BN_ZERO,
//
//           total: free,
//           transferable: free,
//         },
//       });
//     }).unsubscribe;
//   }
//
//   getFreeBalance(address: Address): Promise<BN> {
//     const asset = Enum('Token', Enum(this.#asset.symbol.toUpperCase()));
//
//     return this.#client.api.query.Tokens.Accounts.getValue(address, asset).then(data => {
//       return new BN(data.free.toString());
//     });
//   }
//
//   getExistentialDeposit(): Promise<BN> {
//     // existentialDeposit includes asset precision
//     return Promise.resolve(new BN(this.#asset.typeExtras.existentialDeposit));
//   }
// }
