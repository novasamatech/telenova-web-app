import { getPolkadotSigner } from '@polkadot-api/signer';
import { ed25519CreateDerive, sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { type KeyPair, entropyToMiniSecret, mnemonicToEntropy } from '@polkadot-labs/hdkd-helpers';
import { type PolkadotSigner } from 'polkadot-api';

import { u8aToHex } from '@polkadot/util';

import { isEvmChain } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

type SupportedPairs = 'sr25519' | 'ed25519';

export const keyringApi = {
  getKeyPairFromSeed,
  getKeyPairsFromSeed,

  getSignersFromSeed,
  getSignerFromSeed,

  getMnemonicEntropy,
};

// KeyPair
function getKeyPairsFromSeed(mnemonic: Mnemonic): Record<SupportedPairs, KeyPair> {
  return {
    sr25519: getSubstrateKeyPair(mnemonic),
    ed25519: getEvmKeyPair(mnemonic),
  };
}

function getKeyPairFromSeed(mnemonic: Mnemonic, chain: Chain): KeyPair {
  const type = isEvmChain(chain) ? 'ed25519' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (mnemonic: Mnemonic) => KeyPair> = {
    sr25519: getSubstrateKeyPair,
    ed25519: getEvmKeyPair,
  };

  return KEYPAIR_TYPES[type](mnemonic);
}

function getSubstrateKeyPair(mnemonic: Mnemonic): KeyPair {
  const entropy = mnemonicToEntropy(mnemonic);
  const miniSecret = entropyToMiniSecret(entropy);

  return sr25519CreateDerive(miniSecret)('');
}

function getEvmKeyPair(mnemonic: Mnemonic): KeyPair {
  const entropy = mnemonicToEntropy(mnemonic);
  const miniSecret = entropyToMiniSecret(entropy);

  return ed25519CreateDerive(miniSecret)("m/44'/60'/0'/0/0");
}

// Signer
function getSignersFromSeed(mnemonic: Mnemonic): Record<SupportedPairs, PolkadotSigner> {
  return {
    sr25519: getSubstrateSigner(mnemonic),
    ed25519: getEvmSigner(mnemonic),
  };
}

function getSignerFromSeed(mnemonic: Mnemonic, chain: Chain): PolkadotSigner {
  const type = isEvmChain(chain) ? 'ed25519' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (mnemonic: Mnemonic) => PolkadotSigner> = {
    sr25519: getSubstrateSigner,
    ed25519: getEvmSigner,
  };

  return KEYPAIR_TYPES[type](mnemonic);
}

function getSubstrateSigner(mnemonic: Mnemonic): PolkadotSigner {
  const { publicKey, sign } = getSubstrateKeyPair(mnemonic);

  return getPolkadotSigner(publicKey, 'Sr25519', sign);
}

function getEvmSigner(mnemonic: Mnemonic): PolkadotSigner {
  const { publicKey, sign } = getEvmKeyPair(mnemonic);

  return getPolkadotSigner(publicKey, 'Ed25519', sign);
}

// Mnemonic
function getMnemonicEntropy(mnemonic: Mnemonic): string {
  return u8aToHex(mnemonicToEntropy(mnemonic)).slice(2);
}
