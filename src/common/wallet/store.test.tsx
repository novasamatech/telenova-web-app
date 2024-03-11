import CryptoJS from 'crypto-js';
import { encryptMnemonic, decryptMnemonic, getScryptKey } from './store';

describe('Encryption Utility Functions', () => {
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
});
