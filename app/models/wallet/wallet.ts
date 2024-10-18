import { type PolkadotSigner } from 'polkadot-api';

import { u8aToHex } from '@polkadot/util';

import { keyringApi } from '@/shared/api';
import { isEvmChain, toAddress } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export class Wallet {
  readonly #sr25519PublicKey: PublicKey;
  readonly #ecdsaPublicKey: PublicKey;

  readonly #sr25519Signer: PolkadotSigner;
  readonly #ecdsaSigner: PolkadotSigner;

  constructor(mnemonic: Mnemonic) {
    const keyringPairs = keyringApi.getKeyPairsFromSeed(mnemonic);
    const signers = keyringApi.getSignersFromSeed(mnemonic);

    this.#sr25519PublicKey = u8aToHex(keyringPairs.sr25519.publicKey);
    this.#ecdsaPublicKey = u8aToHex(keyringPairs.ecdsa.publicKey);

    this.#sr25519Signer = signers.sr25519;
    this.#ecdsaSigner = signers.ecdsa;
  }

  getPublicKey(chain?: Chain): PublicKey {
    return chain && isEvmChain(chain) ? this.#ecdsaPublicKey : this.#sr25519PublicKey;
  }

  toAddress(chain: Chain): Address {
    return toAddress(this.getPublicKey(chain), { chain });
  }

  getSigner(chain: Chain): PolkadotSigner {
    return isEvmChain(chain) ? this.#ecdsaSigner : this.#sr25519Signer;
  }
}
