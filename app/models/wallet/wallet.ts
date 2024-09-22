import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';

import { keyringApi } from '@/shared/api';
import { isEvmChain, toAddress } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export class Wallet {
  readonly #substrateKeyringPair: KeyringPair;
  readonly #evmKeyringPair: KeyringPair;

  constructor(mnemonic: Mnemonic) {
    const keyringPairs = keyringApi.getKeyringPairsFromSeed(mnemonic);

    this.#substrateKeyringPair = keyringPairs.sr25519;
    this.#evmKeyringPair = keyringPairs.ethereum;
  }

  getPublicKey(chain?: Chain): PublicKey {
    return u8aToHex(this.getKeyringPair(chain).publicKey);
  }

  getKeyringPair(chain?: Chain): KeyringPair {
    return chain && isEvmChain(chain) ? this.#evmKeyringPair : this.#substrateKeyringPair;
  }

  toAddress(chain: Chain): Address {
    return toAddress(this.getPublicKey(chain), { chain });
  }
}
