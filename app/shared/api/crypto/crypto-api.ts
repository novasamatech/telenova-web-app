import { generateMnemonic as getFreshMnemonic } from '@polkadot-labs/hdkd-helpers';
import CryptoJS from 'crypto-js';
import scryptJS from 'scrypt-js';

export const cryptoApi = {
  generateMnemonic,
  getEncryptedMnemonic,
  getDecryptedMnemonic,
};

const SALT_SIZE_BYTES = 16;

function generateMnemonic(): string {
  return getFreshMnemonic();
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
