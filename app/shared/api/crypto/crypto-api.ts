import type { WebApp } from '@twa-dev/types';

import secureLocalStorage from 'react-secure-storage';

import CryptoJS from 'crypto-js';
import scryptJS from 'scrypt-js';

import { mnemonicGenerate } from '@polkadot/util-crypto';

import { telegramApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/shared/helpers';

export const cryptoApi = {
  generateMnemonic,
  getEncryptedMnemonic,
  getDecryptedMnemonic,

  backupMnemonic,
  getMnemonic,
};

const SALT_SIZE_BYTES = 16;

function generateMnemonic(): string {
  return mnemonicGenerate();
}

function getEncryptedMnemonic(mnemonic: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(SALT_SIZE_BYTES);
  const derivedKey = getScryptKey(password, salt);

  const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, derivedKey, {
    mode: CryptoJS.mode.CBC,
    iv: salt,
  });

  const saltHex = CryptoJS.enc.Hex.stringify(salt);
  const mnemonicHex = encryptedMnemonic.toString(CryptoJS.format.Hex);

  return `${saltHex}${mnemonicHex}`;
}

function getDecryptedMnemonic(encryptedMnemonicWithSalt: string, password: string): string {
  const salt = CryptoJS.enc.Hex.parse(encryptedMnemonicWithSalt.slice(0, SALT_SIZE_BYTES * 2));
  const encryptedHexMnemonic = encryptedMnemonicWithSalt.slice(SALT_SIZE_BYTES * 2);
  const derivedKey = getScryptKey(password, salt);

  return CryptoJS.AES.decrypt(encryptedHexMnemonic, derivedKey, {
    format: CryptoJS.format.Hex,
    mode: CryptoJS.mode.CBC,
    iv: salt,
  }).toString(CryptoJS.enc.Utf8);
}

function getScryptKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  const passwordBytes = new TextEncoder().encode(password.normalize('NFKC'));
  const buffer = new Uint8Array(salt.words);
  const key = scryptJS.syncScrypt(passwordBytes, buffer, 16384, 8, 1, 32);

  return CryptoJS.lib.WordArray.create(key);
}

// TODO: Move to effector model
function backupMnemonic(webApp: WebApp, mnemonic: string, password: string) {
  const encryptedMnemonicWithSalt = getEncryptedMnemonic(mnemonic, password);
  const date = Date.now().toString();

  webApp.CloudStorage.setItem(MNEMONIC_STORE, encryptedMnemonicWithSalt);
  webApp.CloudStorage.setItem(BACKUP_DATE, date);
  localStorage.setItem(telegramApi.getStoreName(webApp, BACKUP_DATE), date);
}

// TODO: Move to effector model
function getMnemonic(webApp: WebApp): string | null {
  const tgStoreName = telegramApi.getStoreName(webApp, MNEMONIC_STORE);

  return secureLocalStorage.getItem(tgStoreName) as string | null;
}
