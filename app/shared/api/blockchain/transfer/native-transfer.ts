import { Enum, type HexString, type PolkadotClient } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi, type ParaApi } from '../types';

import { EXTENSIONS } from '@/shared/config/extensions';
import { FAKE_ADDRESS_EVM, FAKE_ADDRESS_SUBSTRATE } from '@/shared/helpers';

import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

import { bsx, dot, glmr, hdx, movr, myth } from '@polkadot-api/descriptors';

type ParachainsApi =
  | ParaApi<'glmr', typeof glmr>
  | ParaApi<'movr', typeof movr>
  | ParaApi<'myth', typeof myth>
  | ParaApi<'hdx', typeof hdx>
  | ParaApi<'bsx', typeof bsx>;

type ClientApi = GenericApi<typeof dot> | ParachainsApi;

export class NativeTransferService implements ITransfer {
  readonly #chainId: ChainId;
  readonly #client: ClientApi;

  constructor(chainId: ChainId, client: PolkadotClient) {
    this.#chainId = chainId;
    this.#client = this.#getTypedClientApi(chainId, client);
  }

  #getTypedClientApi(chainId: ChainId, client: PolkadotClient): ClientApi {
    const config: Record<ChainId, (client: PolkadotClient) => ParachainsApi> = {
      // GLMR
      '0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d': client => ({
        type: 'glmr',
        api: client.getTypedApi(glmr),
      }),
      // MOVR
      '0x401a1f9dca3da46f5c4091016c8a2f26dcea05865116b286f60f668207d1474b': client => ({
        type: 'movr',
        api: client.getTypedApi(movr),
      }),
      // MYTH
      '0xf6ee56e9c5277df5b4ce6ae9983ee88f3cbed27d31beeb98f9f84f997a1ab0b9': client => ({
        type: 'myth',
        api: client.getTypedApi(myth),
      }),
      // BSX
      '0xa85cfb9b9fd4d622a5b28289a02347af987d8f73fa3108450e2b4a11c1ce5755': client => ({
        type: 'bsx',
        api: client.getTypedApi(bsx),
      }),
      // HDX
      '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d': client => ({
        type: 'hdx',
        api: client.getTypedApi(hdx),
      }),
    };

    return config[chainId]?.(client) || { type: 'generic', api: client.getTypedApi(dot) };
  }

  sendTransfer({ amount, destination, signer, transferAll }: SendTransferParams): Promise<HexString> {
    const tx = transferAll ? this.#getTransferAllTx(destination) : this.#getTransferKeepAliveTx(destination, amount);

    return new Promise(resolve => {
      const extension = EXTENSIONS[this.#chainId]?.signedExtensions;
      const txOptions = extension ? { customSignedExtensions: extension } : undefined;

      tx.signSubmitAndWatch(signer, txOptions).subscribe(event => {
        if (event.type !== 'broadcasted') return;

        resolve(event.txHash);
      });
    });
  }

  #getTransferKeepAliveTx(destination: Address, amount: BN) {
    switch (this.#client.type) {
      case 'myth':
      case 'glmr':
      case 'movr':
      case 'bsx':
      case 'hdx':
        return this.#client.api.tx.Balances.transfer_keep_alive({
          value: BigInt(amount.toString()),
          dest: destination,
        });
      default:
        return this.#client.api.tx.Balances.transfer_keep_alive({
          value: BigInt(amount.toString()),
          dest: Enum('Id', destination),
        });
    }
  }

  #getTransferAllTx(destination: Address) {
    switch (this.#client.type) {
      case 'myth':
      case 'glmr':
      case 'movr':
      case 'bsx':
      case 'hdx':
        return this.#client.api.tx.Balances.transfer_all({
          keep_alive: false,
          dest: destination,
        });
      default:
        return this.#client.api.tx.Balances.transfer_all({
          keep_alive: false,
          dest: Enum('Id', destination),
        });
    }
  }

  getTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    const fakeAddress = ['glmr', 'movr', 'myth'].includes(this.#client.type)
      ? FAKE_ADDRESS_EVM
      : FAKE_ADDRESS_SUBSTRATE;

    const tx = transferAll ? this.#getTransferAllTx(fakeAddress) : this.#getTransferKeepAliveTx(fakeAddress, amount);
    const extension = EXTENSIONS[this.#chainId]?.signedExtensions;
    const txOptions = extension ? { customSignedExtensions: extension } : undefined;

    return tx.getEstimatedFees(fakeAddress, txOptions).then(fee => new BN(fee.toString()));
  }

  async getGiftTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ transferAll: true, amount });
    const clientAccountFee = await this.getTransferFee({ transferAll, amount: amount.add(giftAccountFee) });

    return giftAccountFee.add(clientAccountFee);
  }
}
