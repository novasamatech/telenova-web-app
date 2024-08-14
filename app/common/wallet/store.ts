import secureLocalStorage from 'react-secure-storage';

import { type WebApp } from '@twa-dev/types';
import CryptoJS from 'crypto-js';
import scryptJS from 'scrypt-js';

import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import {
  encodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  randomAsHex,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto';

import { telegramApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE, PUBLIC_KEY_STORE } from '@/shared/helpers';
import { type Wallet } from '@/types/substrate';

import { type GiftWallet } from './types';

const keyring = new Keyring({ type: 'sr25519' });

const SALT_SIZE_BYTES = 16;

export function getScryptKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  try {
    const passwordBytes = new TextEncoder().encode(password.normalize('NFKC'));
    const buffer = new Uint8Array(salt.words);
    const key = scryptJS.syncScrypt(passwordBytes, buffer, 16384, 8, 1, 32);

    return CryptoJS.lib.WordArray.create(key);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function encryptMnemonic(mnemonic: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(SALT_SIZE_BYTES);
  const derivedKey = getScryptKey(password, salt);

  const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, derivedKey, {
    mode: CryptoJS.mode.CBC,
    iv: salt,
  });

  const saltHex = CryptoJS.enc.Hex.stringify(salt);
  const mnemonicHex = encryptedMnemonic.toString(CryptoJS.format.Hex);

  return saltHex + mnemonicHex;
}

export function decryptMnemonic(encryptedMnemonicWithSalt: string, password: string): string {
  const salt = CryptoJS.enc.Hex.parse(encryptedMnemonicWithSalt.slice(0, SALT_SIZE_BYTES * 2));
  const encryptedHexMnemonic = encryptedMnemonicWithSalt.slice(SALT_SIZE_BYTES * 2);
  const derivedKey = getScryptKey(password, salt);

  return CryptoJS.AES.decrypt(encryptedHexMnemonic, derivedKey, {
    format: CryptoJS.format.Hex,
    mode: CryptoJS.mode.CBC,
    iv: salt,
  }).toString(CryptoJS.enc.Utf8);
}

export const generateWalletMnemonic = (): string => {
  return mnemonicGenerate();
};

export const createWallet = (webApp: WebApp, mnemonic: string | null): Wallet | null => {
  if (!mnemonic) return null;

  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);
  const publicKey = u8aToHex(keypair.publicKey);

  localStorage.setItem(telegramApi.getStoreName(webApp, PUBLIC_KEY_STORE), publicKey);
  secureLocalStorage.setItem(telegramApi.getStoreName(webApp, MNEMONIC_STORE), mnemonic);

  return { publicKey };
};

export const backupMnemonic = (webApp: WebApp, mnemonic: string, password: string) => {
  const encryptedMnemonicWithSalt = encryptMnemonic(mnemonic, password);
  const date = Date.now().toString();

  webApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonicWithSalt);
  webApp.CloudStorage.setItem(BACKUP_DATE, date);
  localStorage.setItem(telegramApi.getStoreName(webApp, BACKUP_DATE), date);
};

export const getMnemonic = (webApp: WebApp): string | null => {
  return (secureLocalStorage.getItem(telegramApi.getStoreName(webApp, MNEMONIC_STORE)) as string) || null;
};

/**
 * Returns decrypted keyring pair for user's wallet
 * Make sure to call lock() after pair was used to clean up secret!
 */
export const getKeyringPair = (webApp: WebApp): KeyringPair | undefined => {
  try {
    const mnemonic = getMnemonic(webApp);
    if (mnemonic === null) return undefined;

    return getKeyringPairFromSeed(mnemonic);
  } catch (e) {
    console.warn(e);

    return undefined;
  }
};

export const getKeyringPairFromSeed = (seed: string): KeyringPair => {
  return keyring.createFromUri(seed);
};

export const resetWallet = (clearLocal: boolean = false) => {
  localStorage.clear();
  secureLocalStorage.clear();

  if (!clearLocal) {
    window.Telegram?.WebApp.CloudStorage.removeItems([MNEMONIC_STORE, BACKUP_DATE]);
  }
};

export const initializeWalletFromCloud = (password: string, encryptedMnemonic?: string): string | null => {
  if (!encryptedMnemonic) return null;

  try {
    return decryptMnemonic(encryptedMnemonic, password) || null;
  } catch {
    return null;
  }
};

export const createGiftWallet = (addressPrefix: number): GiftWallet => {
  const seed = randomAsHex(10).slice(2);
  const keyringPair = getKeyringPairFromSeed(seed);

  return {
    address: encodeAddress(keyringPair.publicKey, addressPrefix),
    secret: seed,
  };
};
