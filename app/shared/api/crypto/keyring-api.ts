import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { type KeypairType } from '@polkadot/util-crypto/types';

import { isEvmChain } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

type SupportedPairs = Extract<KeypairType, 'sr25519' | 'ethereum'>;

export const keyringApi = {
  getKeyringPairFromSeed,
  getKeyringPairsFromSeed,
};

function getKeyringPairsFromSeed(seed: string): Record<SupportedPairs, KeyringPair> {
  return {
    sr25519: getSubstrateKeyringPair(seed),
    ethereum: getEvmKeyringPair(seed),
  };
}

function getKeyringPairFromSeed(seed: string, chain: Chain): KeyringPair {
  const type = isEvmChain(chain) ? 'ethereum' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (seed: string) => KeyringPair> = {
    sr25519: getSubstrateKeyringPair,
    ethereum: getEvmKeyringPair,
  };

  return KEYPAIR_TYPES[type](seed);
}

function getSubstrateKeyringPair(seed: string): KeyringPair {
  return new Keyring({ type: 'sr25519' }).addFromUri(seed);
}

function getEvmKeyringPair(seed: string): KeyringPair {
  const keyring = new Keyring({ type: 'ethereum' });

  const index = 0;
  const ethDerivationPath = "m/44'/60'/0'/0/" + index;

  return keyring.addFromUri(`${seed}/${ethDerivationPath}`);
}
