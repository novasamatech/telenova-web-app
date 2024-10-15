import { Enum, type HexString, type PolkadotClient } from 'polkadot-api';

import { BN, BN_ZERO } from '@polkadot/util';

import { type GenericApi } from '../types';

import { FAKE_ACCOUNT_ID } from '@/shared/helpers';

import { type FeeParams, type ITransfer, type SendTransferParams } from './types';

import { dot } from '@polkadot-api/descriptors';

type ClientApi = GenericApi;

export class NativeTransferService implements ITransfer {
  readonly #client: ClientApi;

  constructor(client: PolkadotClient) {
    this.#client = this.#getTypedClientApi(client);
  }

  #getTypedClientApi(client: PolkadotClient): ClientApi {
    return { type: 'generic', api: client.getTypedApi(dot) };
  }

  sendTransfer({ amount, destination, signer, transferAll }: SendTransferParams): Promise<HexString> {
    const tx = transferAll ? this.#getTransferAllTx(destination) : this.#getTransferKeepAliveTx(destination, amount);

    return tx.signAndSubmit(signer).then(({ txHash }) => txHash);
  }

  #getTransferKeepAliveTx(destination: Address, amount: BN) {
    return this.#client.api.tx.Balances.transfer_keep_alive({
      value: BigInt(amount.toString()),
      dest: Enum('Id', destination),
    });
  }

  #getTransferAllTx(destination: Address) {
    return this.#client.api.tx.Balances.transfer_all({
      keep_alive: false,
      dest: Enum('Id', destination),
    });
  }

  async getTransferFee({ amount = BN_ZERO, transferAll }: FeeParams): Promise<BN> {
    const tx = transferAll
      ? this.#getTransferAllTx(FAKE_ACCOUNT_ID)
      : this.#getTransferKeepAliveTx(FAKE_ACCOUNT_ID, amount);

    const fee = await tx.getEstimatedFees(FAKE_ACCOUNT_ID);

    return new BN(fee.toString());
  }

  async getGiftTransferFee({ amount = BN_ZERO, ...rest }: FeeParams): Promise<BN> {
    const giftAccountFee = await this.getTransferFee({ transferAll: true, amount });
    const clientAccountFee = await this.getTransferFee({ ...rest, amount: amount.add(giftAccountFee) });

    return giftAccountFee.add(clientAccountFee);
  }
}
