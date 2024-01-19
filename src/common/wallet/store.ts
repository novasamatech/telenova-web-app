/* eslint-disable @typescript-eslint/no-var-requires */
import { hexToU8a, u8aToHex } from '@polkadot/util';
import {
  encodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  randomAsHex,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto';
import CryptoJS, { AES } from 'crypto-js';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import secureLocalStorage from 'react-secure-storage';

import { BACKUP_DATE, MNEMONIC_STORE, PUBLIC_KEY_STORE } from '../utils/constants';
import { HexString } from '@common/types';
import { GiftWallet, Wallet } from './types';

const keyring = new Keyring({ type: 'sr25519' });

function unwrapHexString(string: string): HexString {
  return u8aToHex(hexToU8a(string));
}

export const getWallet = (): Wallet | null => {
  const publicKey = localStorage.getItem(PUBLIC_KEY_STORE);

  return publicKey ? { publicKey: unwrapHexString(publicKey) } : null;
};

export const generateWalletMnemonic = (): string => {
  return mnemonicGenerate();
};

export const createWallet = (mnemonic: string | null): Wallet | null => {
  if (!mnemonic) return null;
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);
  const publicKey: HexString = u8aToHex(keypair.publicKey);

  localStorage.setItem(PUBLIC_KEY_STORE, publicKey);
  secureLocalStorage.setItem(MNEMONIC_STORE, mnemonic);

  return { publicKey };
};

export const backupMnemonic = (mnemonic: string, password: string): void => {
  const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();

  window.Telegram.WebApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonic);
  window.Telegram.WebApp.CloudStorage.setItem(BACKUP_DATE, Date.now().toString());
};

export const getMnemonic = (): string | null => {
  return (secureLocalStorage.getItem(MNEMONIC_STORE) as string) || null;
};

/**
 * Returns decrypted keyring pair for user's wallet
 * Make sure to call lock() after pair was used to clean up secret!
 * @param password
 */
export const getKeyringPair = (): KeyringPair | undefined => {
  try {
    const mnemonic = getMnemonic();

    if (mnemonic === null) return;

    return keyring.createFromUri(mnemonic);
  } catch (e) {
    console.warn(e);
  }
};

export const getKeyringPairFromSeed = (seed: string): KeyringPair | undefined => {
  try {
    return keyring.createFromUri(seed);
  } catch (e) {
    console.warn(e);
  }
};

export const resetWallet = (clearLocal: boolean = false) => {
  localStorage.removeItem(PUBLIC_KEY_STORE);
  secureLocalStorage.removeItem(MNEMONIC_STORE);
  if (!clearLocal) {
    window.Telegram.WebApp.CloudStorage.removeItem(MNEMONIC_STORE);
  }
};

export const initializeWalletFromCloud = (password: string, encryptedMnemonic?: string): string | null => {
  const mnemonic = AES.decrypt(encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);

  return mnemonic || null;
};

const generateGiftSecret = () => {
  return randomAsHex(10).slice(2);
};

export const createGiftWallet = (addressPrefix: number): GiftWallet => {
  const seed = generateGiftSecret();
  const account = keyring.createFromUri(seed);

  return { address: encodeAddress(account.publicKey, addressPrefix), secret: seed };
};
