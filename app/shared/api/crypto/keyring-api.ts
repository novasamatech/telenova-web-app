import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
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
  const x = new Keyring({ type: 'sr25519' }).addFromUri(seed);
  console.log(`=== Substrate Address from Mnemonic: ${x.address} & ${u8aToHex(x.publicKey)}`);

  return new Keyring({ type: 'sr25519' }).addFromUri(seed);
}

function getEvmKeyringPair(seed: string): KeyringPair {
  // 0x431621580885a1d9cf257Aaf0628D26Df3e9c591 - верным
  // 0x02c10463c2defc4f0b112381292461d6683538b9 - неверным

  const keyring = new Keyring({ type: 'ethereum' });

  // Define index of the derivation path and the derivation path
  const index = 0;
  const ethDerPath = "m/44'/60'/0'/0/" + index;

  const alice = keyring.addFromUri(`${seed}/${ethDerPath}`);
  console.log(`=== Ethereum Address from Mnemonic: ${alice.address} & ${u8aToHex(alice.publicKey)}`);

  return alice;
}
