export {};
// TODO: Right now Builder is paused, because of Polkadot-api integration

// import { type PolkadotClient, type Transaction, type TxCallData } from 'polkadot-api';
//
// import { type BatchMode, type GenericApi } from '../types';
//
// import { type ExtrinsicBuildingOptions } from './types';
//
// import { dot } from '@polkadot-api/descriptors';
//
// type ClientApi = GenericApi;
// type TxCall<Arg extends object | undefined, Pallet extends string, Name extends string, Asset> = Transaction<
//   Arg,
//   Pallet,
//   Name,
//   Asset
// >;
//
// export class ExtrinsicBuilder {
//   readonly #client: ClientApi;
//   readonly #calls: TxCall[] = [];
//
//   constructor(client: PolkadotClient) {
//     this.#client = this.#getTypedClientApi(client);
//   }
//
//   #getTypedClientApi(client: PolkadotClient): ClientApi {
//     return { type: 'generic', api: client.getTypedApi(dot) };
//   }
//
//   addCall<Arg extends object | undefined, Pallet extends string, Name extends string, Asset>(
//     call: Transaction<Arg, Pallet, Name, Asset>,
//   ) {
//     this.#calls.push(call);
//   }
//
//   build(options?: Partial<ExtrinsicBuildingOptions>): TxCall {
//     if (this.#calls.length === 0) throw Error('Empty extrinsic');
//
//     if (this.#calls.length === 1) return this.#calls[0];
//
//     return this.#getBatchCall(this.#optionsOrDefault(options).batchMode)({ calls: this.#calls });
//   }
//
//   #optionsOrDefault(options?: Partial<ExtrinsicBuildingOptions>): ExtrinsicBuildingOptions {
//     return {
//       batchMode: options?.batchMode || 'BATCH',
//     };
//   }
//
//   #getBatchCall(mode: BatchMode) {
//     const BATCH_MAP: Record<BatchMode, (data: { calls: TxCallData[] }) => TxCall> = {
//       BATCH: this.#client.api.tx.Utility.batch,
//       BATCH_ALL: this.#client.api.tx.Utility.batch_all,
//       FORCE_BATCH: this.#client.api.tx.Utility.force_batch,
//     };
//
//     return BATCH_MAP[mode];
//   }
// }
