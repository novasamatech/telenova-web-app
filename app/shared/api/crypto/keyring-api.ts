import { getPolkadotSigner } from '@polkadot-api/signer';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { type Hex, type KeyPair, mnemonicToEntropy, mnemonicToMiniSecret } from '@polkadot-labs/hdkd-helpers';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { type PolkadotSigner } from 'polkadot-api';

import { stringToU8a, u8aToHex } from '@polkadot/util';

import { isEvmChain } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

type SupportedPairs = 'sr25519' | 'ecdsa';

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
    ecdsa: getEvmKeyPair(mnemonic),
  };
}

function getKeyPairFromSeed(mnemonic: Mnemonic, chain: Chain): KeyPair {
  const type = isEvmChain(chain) ? 'ecdsa' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (mnemonic: Mnemonic) => KeyPair> = {
    sr25519: getSubstrateKeyPair,
    ecdsa: getEvmKeyPair,
  };

  return KEYPAIR_TYPES[type](mnemonic);
}

function getSubstrateKeyPair(mnemonic: Mnemonic): KeyPair {
  const seed = mnemonicToMiniSecret(mnemonic);

  return sr25519CreateDerive(seed)('');
}

function getEvmKeyPair(mnemonic: Mnemonic): KeyPair {
  const seed = mnemonicToSeedSync(mnemonic);
  const keyPair = HDKey.fromMasterSeed(seed).derive("m/44'/60'/0'/0/0");

  return {
    publicKey: keyPair.publicKey!,
    sign: (message: Hex) => (typeof message === 'string' ? keyPair.sign(stringToU8a(message)) : keyPair.sign(message)),
  };
}

// Signer
function getSignersFromSeed(mnemonic: Mnemonic): Record<SupportedPairs, PolkadotSigner> {
  return {
    sr25519: getSubstrateSigner(mnemonic),
    ecdsa: getEvmSigner(mnemonic),
  };
}

function getSignerFromSeed(mnemonic: Mnemonic, chain: Chain): PolkadotSigner {
  const type = isEvmChain(chain) ? 'ecdsa' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (mnemonic: Mnemonic) => PolkadotSigner> = {
    sr25519: getSubstrateSigner,
    ecdsa: getEvmSigner,
  };

  return KEYPAIR_TYPES[type](mnemonic);
}

function getSubstrateSigner(mnemonic: Mnemonic): PolkadotSigner {
  const { publicKey, sign } = getSubstrateKeyPair(mnemonic);

  return getPolkadotSigner(publicKey, 'Sr25519', sign);
}

function getEvmSigner(mnemonic: Mnemonic): PolkadotSigner {
  const { publicKey, sign } = getEvmKeyPair(mnemonic);

  return getPolkadotSigner(publicKey, 'Ecdsa', sign);
}

// Mnemonic
function getMnemonicEntropy(mnemonic: Mnemonic): string {
  return u8aToHex(mnemonicToEntropy(mnemonic)).slice(2);
}
