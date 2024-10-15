import { type PolkadotSigner } from 'polkadot-api';

import { u8aToHex } from '@polkadot/util';

import { keyringApi } from '@/shared/api';
import { isEvmChain, toAddress } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export class Wallet {
  readonly #sr25519PublicKey: PublicKey;
  readonly #ed25519PublicKey: PublicKey;

  readonly #sr25519Signer: PolkadotSigner;
  readonly #ed25519Signer: PolkadotSigner;

  constructor(mnemonic: Mnemonic) {
    const keyringPairs = keyringApi.getKeyPairsFromSeed(mnemonic);
    const signers = keyringApi.getSignersFromSeed(mnemonic);

    this.#sr25519PublicKey = u8aToHex(keyringPairs.sr25519.publicKey);
    this.#ed25519PublicKey = u8aToHex(keyringPairs.ed25519.publicKey);

    this.#sr25519Signer = signers.sr25519;
    this.#ed25519Signer = signers.ed25519;
  }

  getPublicKey(chain?: Chain): PublicKey {
    return chain && isEvmChain(chain) ? this.#ed25519PublicKey : this.#sr25519PublicKey;
  }

  toAddress(chain: Chain): Address {
    return toAddress(this.getPublicKey(chain), { chain });
  }

  getSigner(chain: Chain): PolkadotSigner {
    return isEvmChain(chain) ? this.#ed25519Signer : this.#sr25519Signer;
  }
}
