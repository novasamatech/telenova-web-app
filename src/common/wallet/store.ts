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
import { syncScrypt } from 'scrypt-js';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import secureLocalStorage from 'react-secure-storage';

import { BACKUP_DATE, MNEMONIC_STORE, PUBLIC_KEY_STORE } from '../utils/constants';
import { HexString } from '@common/types';
import { GiftWallet, Wallet } from './types';

const keyring = new Keyring({ type: 'sr25519' });

const SALT_SIZE_BYTES = 16;

export const getStoreName = (key: string) => {
  if (!window) return '';
  const userId = window.Telegram?.WebApp.initDataUnsafe?.user?.id;
  if (!userId) return '';

  return `${userId}_${key}`;
};

function unwrapHexString(string: string): HexString {
  return u8aToHex(hexToU8a(string));
}

export function getScryptKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  const passwordBytes = new TextEncoder().encode(password.normalize('NFKC'));
  const buffer = Buffer.from(salt.words);
  const key = syncScrypt(passwordBytes, buffer, 16384, 8, 1, 32);

  return CryptoJS.lib.WordArray.create(key);
}

export function encryptMnemonic(mnemonic: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(SALT_SIZE_BYTES);
  const derivedKey = getScryptKey(password, salt);

  const encryptedMnemonic = AES.encrypt(mnemonic, derivedKey, {
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

  return AES.decrypt(encryptedHexMnemonic, derivedKey, {
    format: CryptoJS.format.Hex,
    mode: CryptoJS.mode.CBC,
    iv: salt,
  }).toString(CryptoJS.enc.Utf8);
}

export const getWallet = (): Wallet | null => {
  const publicKey = localStorage.getItem(getStoreName(PUBLIC_KEY_STORE));

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

  localStorage.setItem(getStoreName(PUBLIC_KEY_STORE), publicKey);
  secureLocalStorage.setItem(getStoreName(MNEMONIC_STORE), mnemonic);

  return { publicKey };
};

export const backupMnemonic = (mnemonic: string, password: string): void => {
  const encryptedMnemonicWithSalt = encryptMnemonic(mnemonic, password);

  window.Telegram.WebApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonicWithSalt);
  window.Telegram.WebApp.CloudStorage.setItem(BACKUP_DATE, Date.now().toString());
};

export const getMnemonic = (): string | null => {
  return (secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE)) as string) || null;
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

export const getKeyringPairFromSeed = (seed: string): KeyringPair => {
  return keyring.createFromUri(seed);
};

export const resetWallet = (clearLocal: boolean = false) => {
  localStorage.removeItem(getStoreName(PUBLIC_KEY_STORE));
  secureLocalStorage.removeItem(getStoreName(MNEMONIC_STORE));
  if (!clearLocal) {
    window.Telegram.WebApp.CloudStorage.removeItem(MNEMONIC_STORE);
  }
};

export const initializeWalletFromCloud = (password: string, encryptedMnemonic?: string): string | null => {
  if (!encryptedMnemonic) return null;
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

  return { address: encodeAddress(account.publicKey, addressPrefix), secret: seed };
};
