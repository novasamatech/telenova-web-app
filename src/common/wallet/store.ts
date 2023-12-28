/* eslint-disable @typescript-eslint/no-var-requires */
import { u8aToHex } from '@polkadot/util';
import { encodeAddress, mnemonicGenerate, mnemonicToMiniSecret, sr25519PairFromSeed } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import secureLocalStorage from 'react-secure-storage';

const AES = require('crypto-js/aes');
const CryptoJS = require('crypto-js');

import { MNEMONIC_STORE, PUBLIC_KEY_STORE } from '../utils/constants';
import { HexString, unwrapHexString } from '@common/types';
import { GiftWallet, Wallet } from './types';

const keyring = new Keyring({ type: 'sr25519' });

export const getWallet = (): Wallet | null => {
  const publicKey = localStorage.getItem(PUBLIC_KEY_STORE);

  return publicKey ? { publicKey: unwrapHexString(publicKey) } : null;
};

export const generateWalletMnemonic = (): string => {
  return mnemonicGenerate();
};

export const createWallet = (mnemonic: string): Wallet => {
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

export const resetWallet = (clearLocal: boolean = false) => {
  localStorage.removeItem(PUBLIC_KEY_STORE);
  secureLocalStorage.removeItem(MNEMONIC_STORE);
  if (!clearLocal) {
    window.Telegram.WebApp.CloudStorage.removeItem(MNEMONIC_STORE);
  }
};

export const initializeWalletFromCloud = (password: string, encryptedMnemonic: string): Wallet | null => {
  const mnemonic = AES.decrypt(encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);
  if (!mnemonic) return null;

  return createWallet(mnemonic);
};

export const createGiftWallet = (addressPrefix: number): GiftWallet => {
  const mnemonic = mnemonicGenerate();
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);
  const publicKey: HexString = u8aToHex(keypair.publicKey);
  const address = encodeAddress(publicKey, addressPrefix);

  return { address, mnemonic };
};
