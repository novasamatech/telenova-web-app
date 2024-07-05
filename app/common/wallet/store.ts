import secureLocalStorage from 'react-secure-storage';

import CryptoJS from 'crypto-js';
import scryptJS from 'scrypt-js';

import Keyring from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import {
  encodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  randomAsHex,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto';

import { type HexString } from '@/common/types';
import { BACKUP_DATE, MNEMONIC_STORE, PUBLIC_KEY_STORE } from '@/common/utils';

import { type GiftWallet, type Wallet } from './types';

const keyring = new Keyring({ type: 'sr25519' });

const SALT_SIZE_BYTES = 16;

export const getStoreName = (key: string) => {
  if (!window) {
    return '';
  }
  const userId = window.Telegram?.WebApp.initDataUnsafe?.user?.id;
  if (!userId) {
    return '';
  }

  return `${userId}_${key}`;
};

function unwrapHexString(string: string): HexString {
  return u8aToHex(hexToU8a(string));
}

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

export const getCloudStorageItem = (store: string): Promise<string | undefined> => {
  const cloudStorage = window.Telegram?.WebApp?.CloudStorage;
  if (!cloudStorage) return Promise.resolve('CloudStorage is not available');

  return new Promise((resolve, reject) => {
    cloudStorage.getItem(store, (err, value) => {
      if (err) reject(err);

      resolve(value);
    });
  });
};

export const getWallet = async (): Promise<Wallet | null> => {
  const publicKey = localStorage.getItem(getStoreName(PUBLIC_KEY_STORE));
  const backupLocalDate = localStorage.getItem(getStoreName(BACKUP_DATE));
  try {
    const backupCloudDate = await getCloudStorageItem(BACKUP_DATE);
    const compareBackupDate = Boolean(backupCloudDate) && backupCloudDate === backupLocalDate;

    return publicKey && compareBackupDate ? { publicKey: unwrapHexString(publicKey) } : null;
  } catch (err) {
    throw Error(`Something went wrong in the Telegram CloudStorage: ${err}`);
  }
};

export const generateWalletMnemonic = (): string => {
  return mnemonicGenerate();
};

export const createWallet = (mnemonic: string | null): Wallet | null => {
  if (!mnemonic) {
    return null;
  }
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);
  const publicKey: HexString = u8aToHex(keypair.publicKey);

  localStorage.setItem(getStoreName(PUBLIC_KEY_STORE), publicKey);
  secureLocalStorage.setItem(getStoreName(MNEMONIC_STORE), mnemonic);

  return { publicKey };
};

export const backupMnemonic = (mnemonic: string, password: string) => {
  const encryptedMnemonicWithSalt = encryptMnemonic(mnemonic, password);
  const date = Date.now().toString();
  window.Telegram?.WebApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonicWithSalt);
  window.Telegram?.WebApp.CloudStorage.setItem(BACKUP_DATE, date);
  localStorage.setItem(getStoreName(BACKUP_DATE), date);
};

export const getMnemonic = (): string | null => {
  return (secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE)) as string) || null;
};

/**
 * Returns decrypted keyring pair for user's wallet
 * Make sure to call lock() after pair was used to clean up secret!
 */
export const getKeyringPair = (): KeyringPair | undefined => {
  try {
    const mnemonic = getMnemonic();
    if (mnemonic === null) return;

    return keyring.createFromUri(mnemonic);
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
  if (!encryptedMnemonic) {
    return null;
  }
  let mnemonic;
  try {
    mnemonic = decryptMnemonic(encryptedMnemonic, password);
  } catch {
    return null;
  }

  return mnemonic || null;
};

const generateGiftSecret = () => {
  return randomAsHex(10).slice(2);
};

export const createGiftWallet = (addressPrefix: number): GiftWallet => {
  const seed = generateGiftSecret();
  const account = getKeyringPairFromSeed(seed);

  return {
    address: encodeAddress(account.publicKey, addressPrefix),
    secret: seed,
  };
};
