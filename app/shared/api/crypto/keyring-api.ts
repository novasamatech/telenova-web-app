import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import { mnemonicToEntropy } from '@polkadot/util-crypto';
import { type KeypairType } from '@polkadot/util-crypto/types';

import { isEvmChain } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

type SupportedPairs = Extract<KeypairType, 'sr25519' | 'ethereum'>;

export const keyringApi = {
  getKeyringPairFromSeed,
  getKeyringPairsFromSeed,
  getMnemonicEntropy,
};

function getKeyringPairsFromSeed(mnemonic: Mnemonic): Record<SupportedPairs, KeyringPair> {
  return {
    sr25519: getSubstrateKeyringPair(mnemonic),
    ethereum: getEvmKeyringPair(mnemonic),
  };
}

function getKeyringPairFromSeed(mnemonic: Mnemonic, chain: Chain): KeyringPair {
  const type = isEvmChain(chain) ? 'ethereum' : 'sr25519';

  const KEYPAIR_TYPES: Record<SupportedPairs, (mnemonic: Mnemonic) => KeyringPair> = {
    sr25519: getSubstrateKeyringPair,
    ethereum: getEvmKeyringPair,
  };

  return KEYPAIR_TYPES[type](mnemonic);
}

function getSubstrateKeyringPair(mnemonic: Mnemonic): KeyringPair {
  return new Keyring({ type: 'sr25519' }).addFromUri(mnemonic);
}

function getEvmKeyringPair(mnemonic: Mnemonic): KeyringPair {
  const keyring = new Keyring({ type: 'ethereum' });

  const index = 0;
  const ethDerivationPath = "m/44'/60'/0'/0/" + index;

  return keyring.addFromUri(`${mnemonic}/${ethDerivationPath}`);
}

function getMnemonicEntropy(mnemonic: Mnemonic): string {
  return u8aToHex(mnemonicToEntropy(mnemonic)).slice(2);
}
