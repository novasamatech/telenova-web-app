import { type HexString, type PolkadotClient } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi } from '../types';

// import { FAKE_ACCOUNT_ID } from '@/shared/helpers';

import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

import { glmr } from '@polkadot-api/descriptors';

type ClientApi = GenericApi<typeof glmr>;

export class NativeTransferService implements ITransfer {
  readonly #client: ClientApi;

  constructor(client: PolkadotClient) {
    this.#client = this.#getTypedClientApi(client);
  }

  #getTypedClientApi(client: PolkadotClient): ClientApi {
    return { type: 'generic', api: client.getTypedApi(glmr) };
  }

  sendTransfer({ amount, destination, signer, transferAll }: SendTransferParams): Promise<HexString> {
    const tx = transferAll ? this.#getTransferAllTx(destination) : this.#getTransferKeepAliveTx(destination, amount);

    return tx.signAndSubmit(signer).then(({ txHash }) => txHash);
  }

  #getTransferKeepAliveTx(destination: Address, amount: BN) {
    return this.#client.api.tx.Balances.transfer_keep_alive({
      value: BigInt(amount.toString()),
      dest: destination, // EVM only
      // dest: Enum('Id', destination),
    });
  }

  #getTransferAllTx(destination: Address) {
    return this.#client.api.tx.Balances.transfer_all({
      keep_alive: false,
      dest: destination, // EVM only
      // dest: Enum('Id', destination),
    });
  }

  getTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    const tx = transferAll
      ? this.#getTransferAllTx('0x431621580885a1d9cf257Aaf0628D26Df3e9c591')
      : this.#getTransferKeepAliveTx('0x431621580885a1d9cf257Aaf0628D26Df3e9c591', amount);

    return tx.getEstimatedFees('0x431621580885a1d9cf257Aaf0628D26Df3e9c591').then(fee => new BN(fee.toString()));
    // return tx.getEstimatedFees(stringToU8a(FAKE_ACCOUNT_ID)).then(fee => new BN(fee.toString()));
  }

  async getGiftTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ transferAll: true, amount });
    const clientAccountFee = await this.getTransferFee({ transferAll, amount: amount.add(giftAccountFee) });

    return giftAccountFee.add(clientAccountFee);
  }
}
