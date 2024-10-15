export {};
// TODO: Cannot load metadata and produce descriptors for ORML chains
// Status -> https://github.com/polkadot-api/compliant-RPCs/tree/main

// import { type PolkadotClient } from 'polkadot-api';
//
// import { type Hash } from '@polkadot/types/interfaces';
// import { type BN, BN_ZERO } from '@polkadot/util';
//
// import { extrinsicApi } from '../extrinsic/extrinsic-api';
// import { type GenericApi } from '../types';
//
// import { FAKE_ACCOUNT_ID, assetUtils } from '@/shared/helpers';
// import { type OrmlAsset } from '@/types/substrate';
//
// import { type FeeParams, type ITransfer, type SendTransferParams } from './types';
//
// import { dot } from '@polkadot-api/descriptors';
//
// type ClientApi = GenericApi;
//
// export class OrmlTransferService implements ITransfer {
//   readonly #client: ClientApi;
//   readonly #asset: OrmlAsset;
//
//   constructor(client: PolkadotClient, asset: OrmlAsset) {
//     this.#client = this.#getTypedClientApi(client);
//     this.#asset = asset;
//   }
//
//   #getTypedClientApi(client: PolkadotClient): ClientApi {
//     return { type: 'generic', api: client.getTypedApi(dot) };
//   }
//
//   sendTransfer({ signer, destination, amount }: SendTransferParams): Promise<Hash> {
//     return extrinsicApi.submitExtrinsic({
//       keyringPair,
//       api: this.#client.api,
//       signOptions: { nonce: -1 },
//       transaction: {
//         type: 'TRANSFER_ORML',
//         args: {
//           dest: destination,
//           value: amount,
//           asset: assetUtils.getAssetId(this.#asset),
//         },
//       },
//     });
//   }
//
//   getTransferFee({ amount }: FeeParams): Promise<BN> {
//     return extrinsicApi.getEstimatedFee({
//       api: this.#client.api,
//       transaction: {
//         type: 'TRANSFER_ORML',
//         args: {
//           dest: FAKE_ACCOUNT_ID,
//           value: amount,
//           asset: assetUtils.getAssetId(this.#asset),
//         },
//       },
//     });
//   }
//
//   async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
//     const giftAccountFee = await this.getTransferFee({ ...rest, amount });
//     const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });
//     const totalFee = giftAccountFee.add(clientAccountFee);
//
//     return giftAccountFee.add(totalFee);
//   }
// }
