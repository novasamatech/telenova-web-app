import { describe, expect, test } from 'vitest';

import { cryptoApi } from './crypto-api';

describe('Encryption functions', () => {
  test('encryptMnemonic and decryptMnemonic work correctly', () => {
    const mnemonic = 'yourMnemonic';
    const password = 'yourPassword';
    const encryptedMnemonicWithSalt = cryptoApi.getEncryptedMnemonic(mnemonic, password);
    expect(encryptedMnemonicWithSalt).toBeDefined();

    const decryptedMnemonic = cryptoApi.getDecryptedMnemonic(encryptedMnemonicWithSalt, password);
    expect(decryptedMnemonic).toEqual(mnemonic);
  });

  test('should return different encrypted keys for the same password', () => {
    const mnemonic = 'yourMnemonic';
    const password = 'yourPassword';
    const key1 = cryptoApi.getEncryptedMnemonic(mnemonic, password);
    const key2 = cryptoApi.getEncryptedMnemonic(mnemonic, password);

    expect(key1).not.toEqual(key2);
  });
});
