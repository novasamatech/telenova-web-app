import { Wallet } from './types';
import { HexString, unwrapHexString } from '@common/types';

const { mnemonicGenerate, mnemonicToMiniSecret, sr25519PairFromSeed } = require('@polkadot/util-crypto');

const { u8aToHex } = require('@polkadot/util');

const AES = require('crypto-js/aes');
const CryptoJS = require('crypto-js');

import secureLocalStorage from 'react-secure-storage';

const PUBLIC_KEY_STORE = 'publicKey';
const MNEMONIC_STORE = 'mnemonic';
const TEST_PIN = '1111';

import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

const keyring = new Keyring({ type: 'sr25519' });

export const getWallet = (): Wallet | null => {
  const publicKey = localStorage.getItem(PUBLIC_KEY_STORE);

  return publicKey ? { publicKey: unwrapHexString(publicKey) } : null;
};

export const generateWalletMnemonic = (): string => {
  return mnemonicGenerate();
};

export const createTestWallet = (mnemonic: string): Wallet | null => {
  return createWallet(mnemonic, TEST_PIN);
};

export const createWallet = (mnemonic: string, password: string): Wallet | null => {
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);

  const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();

  const publicKey: HexString = u8aToHex(keypair.publicKey);

  secureLocalStorage.setItem(MNEMONIC_STORE, encryptedMnemonic);
  localStorage.setItem(PUBLIC_KEY_STORE, publicKey);

  // what shoud we keep in the CloudStorage?
  window.Telegram.WebApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonic);
  window.Telegram.WebApp.CloudStorage.setItem(PUBLIC_KEY_STORE, publicKey);

  return { publicKey: publicKey };
};

// localstorage or cloud if restor wallet
export const getMnemonic = (password: string): string | null => {
  const encryptedMnemonic = secureLocalStorage.getItem(MNEMONIC_STORE);

  if (encryptedMnemonic) {
    const mnemonic = AES.decrypt(encryptedMnemonic, password);

    return mnemonic.toString(CryptoJS.enc.Utf8);
  } else {
    return null;
  }
};

/**
 * Returns decrypted keyring pair for user's wallet
 * Make sure to call lock() after pair was used to clean up secret!
 * @param password
 */
export const getKeyringPair = (password: string): KeyringPair | undefined => {
  try {
    const mnemonic = getMnemonic(password);
    if (mnemonic === null) return undefined;

    return keyring.createFromUri(mnemonic);
  } catch (e) {
    return undefined;
  }
};

export const resetWallet = () => {
  localStorage.removeItem(PUBLIC_KEY_STORE);
  secureLocalStorage.removeItem(MNEMONIC_STORE);
  window.Telegram.WebApp.CloudStorage.removeItems([MNEMONIC_STORE, PUBLIC_KEY_STORE]);
};
