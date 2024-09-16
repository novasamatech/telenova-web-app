import { type WebApp } from '@twa-dev/types';

import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { type KeypairType } from '@polkadot/util-crypto/types';

import { chainsApi } from '../blockchain/network/chain-api';

import { type Chain } from '@/types/substrate';

import { cryptoApi } from './crypto-api';

export const keyringApi = {
  getKeyringPair,
  getKeyringPairFromSeed,
};

function getKeyringPairFromSeed(seed: string, chain: Chain): KeyringPair {
  const type = chainsApi.isEvmChain(chain) ? 'sr25519' : 'ethereum';

  const KEYPAIR_TYPES: Record<Extract<KeypairType, 'sr25519' | 'ethereum'>, (seed: string) => KeyringPair> = {
    sr25519: getSubstrateKeyringPair,
    ethereum: getEvmKeyringPair,
  };

  return KEYPAIR_TYPES[type](seed);
}

function getSubstrateKeyringPair(seed: string): KeyringPair {
  return new Keyring({ type: 'sr25519' }).createFromUri(seed);
}

function getEvmKeyringPair(seed: string): KeyringPair {
  // 0x431621580885a1d9cf257Aaf0628D26Df3e9c591 - верным
  // 0x02c10463c2defc4f0b112381292461d6683538b9 - неверным

  const keyring = new Keyring({ type: 'ethereum' });

  // Define index of the derivation path and the derivation path
  const index = 0;
  const ethDerPath = "m/44'/60'/0'/0/" + index;

  const alice = keyring.addFromUri(`${seed}/${ethDerPath}`);
  console.log(`Derived Ethereum Address from Mnemonic: ${alice.address} & ${alice.publicKey.toString()}`);

  return alice;
}

/**
 * Returns decrypted keyring pair for user's wallet Make sure to call lock()
 * after pair was used to clean up secret!
 */
function getKeyringPair(webApp: WebApp, chain: Chain): KeyringPair | undefined {
  try {
    const mnemonic = cryptoApi.getMnemonic(webApp);
    if (mnemonic === null) return undefined;

    return getKeyringPairFromSeed(mnemonic, chain);
  } catch (error) {
    console.warn('Error while getting KeyringPair from seed', error);

    return undefined;
  }
}
