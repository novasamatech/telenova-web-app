import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { getPolkadotSigner } from '@polkadot-api/signer';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { type Hex, type KeyPair, mnemonicToEntropy, mnemonicToMiniSecret } from '@polkadot-labs/hdkd-helpers';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { type PolkadotSigner } from 'polkadot-api';

import { u8aToHex } from '@polkadot/util';

import { isEvmChain } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

type SupportedPairs = 'sr25519' | 'ecdsa';

export const keyringApi = {
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

function getNormalizedMnemonic(mnemonic: Mnemonic): Record<SupportedPairs, () => Uint8Array> {
  if (mnemonic.length === 20) {
    const normalizedMnemonic = new TextEncoder().encode(mnemonic.padEnd(32));

    return {
      sr25519: () => normalizedMnemonic,
      ecdsa: () => normalizedMnemonic,
    };
  }

  return {
    sr25519: () => mnemonicToMiniSecret(mnemonic),
    ecdsa: () => mnemonicToSeedSync(mnemonic),
  };
}

function getSubstrateKeyPair(mnemonic: Mnemonic): KeyPair {
  const seed = getNormalizedMnemonic(mnemonic).sr25519();

  return sr25519CreateDerive(seed)('');
}

function getEvmKeyPair(mnemonic: Mnemonic): KeyPair {
  const seed = getNormalizedMnemonic(mnemonic).ecdsa();

  const keyPair = HDKey.fromMasterSeed(seed).derive("m/44'/60'/0'/0/0");
  const publicKey = keccak_256(secp256k1.getPublicKey(keyPair.privateKey!, false).slice(1)).slice(-20);

  const sign = (data: Hex): Uint8Array => {
    const signature = secp256k1.sign(keccak_256(data), keyPair.privateKey!);
    const signedBytes = signature.toCompactRawBytes();
    const len = signedBytes.length;
    const result = new Uint8Array(len + 1);
    result.set(signedBytes);
    result[len] = signature.recovery;

    return result;
  };

  return { publicKey, sign };
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
