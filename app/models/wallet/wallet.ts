import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';

import { keyringApi } from '@/shared/api';
import { isEvmChain, toAddress } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export class Wallet {
  readonly #substratePublicKey: PublicKey;
  readonly #evmPublicKey: PublicKey;

  constructor(mnemonic: Mnemonic) {
    const keyringPairs = keyringApi.getKeyringPairsFromSeed(mnemonic);

    this.#substratePublicKey = u8aToHex(keyringPairs.sr25519.publicKey);
    this.#evmPublicKey = u8aToHex(keyringPairs.ethereum.publicKey);

    keyringPairs.sr25519.lock();
    keyringPairs.ethereum.lock();
  }

  getPublicKey(chain?: Chain): PublicKey {
    return chain && isEvmChain(chain) ? this.#evmPublicKey : this.#substratePublicKey;
  }

  getKeyringPair(mnemonic: Mnemonic, chain: Chain): KeyringPair {
    return keyringApi.getKeyringPairFromSeed(mnemonic, chain);
  }

  toAddress(chain: Chain): Address {
    return toAddress(this.getPublicKey(chain), { chain });
  }
}
