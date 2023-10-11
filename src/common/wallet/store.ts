import { Wallet } from './types'
import { HexString, unwrapHexString } from '@common/types'

const {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  sr25519PairFromSeed
} = require('@polkadot/util-crypto');

const {
	u8aToHex
} = require('@polkadot/util')

const AES = require('crypto-js/aes')

import secureLocalStorage  from  "react-secure-storage";

const PUBLIC_KEY_STORE = "publicKey";
const MNEMONIC_STORE = "mnemonic";
const TEST_PIN = "1111";

export const getWallet = (): Wallet | null => {
	const publicKey = localStorage.getItem(PUBLIC_KEY_STORE);

	if (publicKey) {
		return { publicKey: unwrapHexString(publicKey) };
	} else {
		return null;
	}
}

export const generateWalletMnemonic = (): string => {
	return mnemonicGenerate();
}

export const createTestWallet = (mnemonic: string): Wallet | null => {
	return createWallet(mnemonic, TEST_PIN);
}

export const createWallet = (mnemonic: string, password: string): Wallet | null => {
	const seed = mnemonicToMiniSecret(mnemonic);
	const keypair = sr25519PairFromSeed(seed);

	const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();
	
	const publicKey: HexString = u8aToHex(keypair.publicKey);

	secureLocalStorage.setItem(MNEMONIC_STORE, encryptedMnemonic);
	localStorage.setItem(PUBLIC_KEY_STORE, publicKey);

	return { publicKey: publicKey };
}

export const getMnemonic = (password: string): string | null => {
	const encryptedMnemonic = secureLocalStorage.getItem(MNEMONIC_STORE);

	if (encryptedMnemonic) {
		const mnemonic = AES.decrypt(encryptedMnemonic, password);

		return mnemonic
	} else {
		return null;
	}
}

export const resetWallet = () => {
	localStorage.removeItem(PUBLIC_KEY_STORE);
	secureLocalStorage.removeItem(MNEMONIC_STORE);
}