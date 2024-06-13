import CryptoJS from 'crypto-js';
import { describe, expect, test } from 'vitest';

import { decryptMnemonic, encryptMnemonic, getScryptKey } from './store';

describe('Encryption functions', () => {
  test('getScryptKey returns a valid key', () => {
    const password = 'yourPassword';
    const salt = CryptoJS.lib.WordArray.random(16);
    const key = getScryptKey(password, salt);
    expect(key).toBeDefined();
    expect(key.words.length).toBe(8);
  });

  test('encryptMnemonic and decryptMnemonic work correctly', () => {
    const mnemonic = 'yourMnemonic';
    const password = 'yourPassword';
    const encryptedMnemonicWithSalt = encryptMnemonic(mnemonic, password);
    expect(encryptedMnemonicWithSalt).toBeDefined();

    const decryptedMnemonic = decryptMnemonic(encryptedMnemonicWithSalt, password);
    expect(decryptedMnemonic).toBe(mnemonic);
  });

  test('should return different keys for the same password', () => {
    const password = 'password';
    const salt = CryptoJS.lib.WordArray.random(16);
    const salt2 = CryptoJS.lib.WordArray.random(16);
    const key1 = getScryptKey(password, salt);
    const key2 = getScryptKey(password, salt2);

    expect(key1.toString()).not.toEqual(key2.toString());
  });
});
