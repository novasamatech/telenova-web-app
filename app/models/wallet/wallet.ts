import { u8aToHex } from '@polkadot/util';

import { chainsApi, keyringApi } from '@/shared/api';
import { toAddress } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export class Wallet {
  readonly #substratePublicKey: PublicKey;
  readonly #evmPublicKey: PublicKey;

  constructor(mnemonic: Mnemonic) {
    const keyringPairs = keyringApi.getKeyringPairsFromSeed(mnemonic);

    this.#substratePublicKey = u8aToHex(keyringPairs.sr25519.publicKey);
    this.#evmPublicKey = u8aToHex(keyringPairs.ethereum.publicKey);
  }

  getPublicKey(chain?: Chain): PublicKey {
    return chain && chainsApi.isEvmChain(chain) ? this.#evmPublicKey : this.#substratePublicKey;
  }

  toAddress(chain: Chain): Address {
    return toAddress(this.getPublicKey(chain), { prefix: chain.addressPrefix });
  }
}
